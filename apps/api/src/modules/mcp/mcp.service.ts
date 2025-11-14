import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MCPServer, MCPServerStatus } from './entities/mcp-server.entity';
import { MCPTool } from './entities/mcp-tool.entity';
import {
  CreateMCPServerInput,
  UpdateMCPServerInput,
  ExecuteToolInput,
} from './dto/mcp.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import axios from 'axios';

@Injectable()
export class MCPService {
  constructor(
    @InjectRepository(MCPServer)
    private serverRepository: Repository<MCPServer>,
    @InjectRepository(MCPTool)
    private toolRepository: Repository<MCPTool>,
    private websocketGateway: WebsocketGateway,
  ) {}

  async createServer(
    input: CreateMCPServerInput,
    userId: string,
  ): Promise<MCPServer> {
    const server = this.serverRepository.create({
      ...input,
      createdById: userId,
      status: MCPServerStatus.DISCONNECTED,
    });

    const saved = await this.serverRepository.save(server);

    // Try to connect and discover tools
    this.connectAndDiscoverTools(saved.id);

    const full = await this.getServerById(saved.id);

    this.websocketGateway.emitToUser(userId, 'mcp:server-created', {
      server: full,
    });

    return full;
  }

  async getServerById(id: string): Promise<MCPServer> {
    const server = await this.serverRepository.findOne({
      where: { id },
      relations: ['createdBy', 'tools'],
    });

    if (!server) {
      throw new NotFoundException('MCP Server not found');
    }

    return server;
  }

  async getServers(userId: string): Promise<MCPServer[]> {
    return this.serverRepository.find({
      where: [{ createdById: userId }, { isPublic: true }],
      relations: ['createdBy', 'tools'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateServer(
    input: UpdateMCPServerInput,
    userId: string,
  ): Promise<MCPServer> {
    const server = await this.serverRepository.findOne({
      where: { id: input.id, createdById: userId },
    });

    if (!server) {
      throw new NotFoundException('MCP Server not found');
    }

    if (input.name !== undefined) server.name = input.name;
    if (input.description !== undefined) server.description = input.description;
    if (input.url !== undefined) server.url = input.url;
    if (input.config !== undefined) server.config = input.config;
    if (input.headers !== undefined) server.headers = input.headers;
    if (input.isEnabled !== undefined) server.isEnabled = input.isEnabled;
    if (input.isPublic !== undefined) server.isPublic = input.isPublic;

    const updated = await this.serverRepository.save(server);

    // Reconnect if URL changed
    if (input.url || input.config || input.headers) {
      this.connectAndDiscoverTools(updated.id);
    }

    const full = await this.getServerById(updated.id);

    this.websocketGateway.emitToUser(userId, 'mcp:server-updated', {
      server: full,
    });

    return full;
  }

  async deleteServer(id: string, userId: string): Promise<boolean> {
    const server = await this.serverRepository.findOne({
      where: { id, createdById: userId },
    });

    if (!server) {
      throw new NotFoundException('MCP Server not found');
    }

    await this.serverRepository.remove(server);

    this.websocketGateway.emitToUser(userId, 'mcp:server-deleted', {
      serverId: id,
    });

    return true;
  }

  async connectServer(id: string, userId: string): Promise<MCPServer> {
    const server = await this.getServerById(id);

    if (server.createdById !== userId) {
      throw new NotFoundException('MCP Server not found');
    }

    await this.connectAndDiscoverTools(id);

    return this.getServerById(id);
  }

  async executeTool(
    input: ExecuteToolInput,
    userId: string,
  ): Promise<any> {
    const tool = await this.toolRepository.findOne({
      where: { id: input.toolId },
      relations: ['server'],
    });

    if (!tool) {
      throw new NotFoundException('Tool not found');
    }

    if (!tool.isEnabled || !tool.server.isEnabled) {
      throw new Error('Tool or server is disabled');
    }

    try {
      // Execute the tool via MCP protocol
      const result = await this.executeToolRequest(
        tool.server,
        tool.name,
        input.parameters,
      );

      // Update usage stats
      tool.usageCount += 1;
      tool.lastUsedAt = new Date();
      await this.toolRepository.save(tool);

      return result;
    } catch (error) {
      throw new Error(`Tool execution failed: ${error.message}`);
    }
  }

  async getTools(serverId?: string): Promise<MCPTool[]> {
    if (serverId) {
      return this.toolRepository.find({
        where: { serverId },
        relations: ['server'],
        order: { name: 'ASC' },
      });
    }

    return this.toolRepository.find({
      relations: ['server'],
      order: { name: 'ASC' },
    });
  }

  // Private helper methods

  private async connectAndDiscoverTools(serverId: string): Promise<void> {
    const server = await this.serverRepository.findOne({
      where: { id: serverId },
    });

    if (!server) return;

    try {
      // Discover tools from the MCP server
      const tools = await this.discoverTools(server);

      // Update server status
      server.status = MCPServerStatus.CONNECTED;
      server.lastConnectedAt = new Date();
      server.lastError = null;
      await this.serverRepository.save(server);

      // Save discovered tools
      for (const toolData of tools) {
        const existingTool = await this.toolRepository.findOne({
          where: { serverId: server.id, name: toolData.name },
        });

        if (existingTool) {
          existingTool.description = toolData.description;
          existingTool.schema = toolData.schema;
          existingTool.examples = toolData.examples;
          await this.toolRepository.save(existingTool);
        } else {
          const tool = this.toolRepository.create({
            serverId: server.id,
            ...toolData,
          });
          await this.toolRepository.save(tool);
        }
      }

      this.websocketGateway.emitToAll('mcp:server-connected', {
        serverId: server.id,
        toolsCount: tools.length,
      });
    } catch (error) {
      server.status = MCPServerStatus.ERROR;
      server.lastError = error.message;
      await this.serverRepository.save(server);

      console.error(`MCP server connection failed: ${error.message}`);
    }
  }

  private async discoverTools(server: MCPServer): Promise<any[]> {
    // Mock implementation - in production this would use actual MCP protocol
    // For HTTP servers, make a request to discover available tools

    if (server.type === 'http') {
      try {
        const response = await axios.get(`${server.url}/tools`, {
          headers: server.headers || {},
          timeout: 5000,
        });

        return response.data.tools || [];
      } catch (error) {
        // Return mock tools for demonstration
        return this.getMockTools();
      }
    }

    // For other types, return mock data
    return this.getMockTools();
  }

  private getMockTools(): any[] {
    return [
      {
        name: 'web_search',
        description: 'Search the web for information',
        schema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            limit: { type: 'number', description: 'Number of results', default: 5 },
          },
          required: ['query'],
        },
        tags: ['search', 'web'],
      },
      {
        name: 'code_interpreter',
        description: 'Execute Python code and return results',
        schema: {
          type: 'object',
          properties: {
            code: { type: 'string', description: 'Python code to execute' },
          },
          required: ['code'],
        },
        tags: ['code', 'python'],
      },
      {
        name: 'image_generator',
        description: 'Generate images from text descriptions',
        schema: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'Image description' },
            size: { type: 'string', enum: ['256x256', '512x512', '1024x1024'], default: '512x512' },
          },
          required: ['prompt'],
        },
        tags: ['image', 'generation'],
      },
      {
        name: 'file_reader',
        description: 'Read and analyze file contents',
        schema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path' },
            format: { type: 'string', enum: ['text', 'json', 'csv'], default: 'text' },
          },
          required: ['path'],
        },
        tags: ['file', 'io'],
      },
    ];
  }

  private async executeToolRequest(
    server: MCPServer,
    toolName: string,
    parameters: Record<string, any>,
  ): Promise<any> {
    // Mock implementation - in production this would use actual MCP protocol

    if (server.type === 'http') {
      try {
        const response = await axios.post(
          `${server.url}/execute`,
          {
            tool: toolName,
            parameters,
          },
          {
            headers: server.headers || {},
            timeout: 30000,
          },
        );

        return response.data;
      } catch (error) {
        // Return mock response for demonstration
        return this.getMockToolResponse(toolName, parameters);
      }
    }

    return this.getMockToolResponse(toolName, parameters);
  }

  private getMockToolResponse(toolName: string, parameters: any): any {
    switch (toolName) {
      case 'web_search':
        return {
          results: [
            { title: 'Example Result 1', url: 'https://example.com/1', snippet: 'Mock search result...' },
            { title: 'Example Result 2', url: 'https://example.com/2', snippet: 'Another mock result...' },
          ],
        };
      case 'code_interpreter':
        return {
          output: '42',
          stdout: 'Execution completed successfully',
        };
      case 'image_generator':
        return {
          url: 'https://via.placeholder.com/512x512',
          prompt: parameters.prompt,
        };
      case 'file_reader':
        return {
          content: 'Mock file content...',
          lines: 10,
        };
      default:
        return { success: true, message: 'Tool executed successfully' };
    }
  }
}
