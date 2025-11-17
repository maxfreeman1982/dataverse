import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { MCPService } from './mcp.service';
import { MCPServer } from './entities/mcp-server.entity';
import { MCPTool } from './entities/mcp-tool.entity';
import {
  CreateMCPServerInput,
  UpdateMCPServerInput,
  ExecuteToolInput,
} from './dto/mcp.dto';
import { GraphQLJSONObject } from 'graphql-type-json';

@Resolver(() => MCPServer)
@UseGuards(GqlAuthGuard)
export class MCPResolver {
  constructor(private mcpService: MCPService) {}

  @Mutation(() => MCPServer)
  async createMCPServer(
    @Args('input') input: CreateMCPServerInput,
    @CurrentUser() user: User,
  ): Promise<MCPServer> {
    return this.mcpService.createServer(input, user.id);
  }

  @Query(() => MCPServer)
  async mcpServer(@Args('id', { type: () => ID }) id: string): Promise<MCPServer> {
    return this.mcpService.getServerById(id);
  }

  @Query(() => [MCPServer])
  async mcpServers(@CurrentUser() user: User): Promise<MCPServer[]> {
    return this.mcpService.getServers(user.id);
  }

  @Mutation(() => MCPServer)
  async updateMCPServer(
    @Args('input') input: UpdateMCPServerInput,
    @CurrentUser() user: User,
  ): Promise<MCPServer> {
    return this.mcpService.updateServer(input, user.id);
  }

  @Mutation(() => Boolean)
  async deleteMCPServer(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.mcpService.deleteServer(id, user.id);
  }

  @Mutation(() => MCPServer)
  async connectMCPServer(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<MCPServer> {
    return this.mcpService.connectServer(id, user.id);
  }

  @Query(() => [MCPTool])
  async mcpTools(
    @Args('serverId', { type: () => ID, nullable: true }) serverId?: string,
  ): Promise<MCPTool[]> {
    return this.mcpService.getTools(serverId);
  }

  @Mutation(() => GraphQLJSONObject)
  async executeMCPTool(
    @Args('input') input: ExecuteToolInput,
    @CurrentUser() user: User,
  ): Promise<any> {
    return this.mcpService.executeTool(input, user.id);
  }
}
