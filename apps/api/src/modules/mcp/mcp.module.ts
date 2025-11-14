import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MCPServer } from './entities/mcp-server.entity';
import { MCPTool } from './entities/mcp-tool.entity';
import { MCPService } from './mcp.service';
import { MCPResolver } from './mcp.resolver';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MCPServer, MCPTool]),
    WebsocketModule,
  ],
  providers: [MCPService, MCPResolver],
  exports: [MCPService],
})
export class MCPModule {}
