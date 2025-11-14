import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/ws',
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebsocketGateway');
  private connectedClients = new Map<string, Socket>();
  private userSockets = new Map<string, string[]>(); // userId -> socketIds[]

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);

    // Track user ID if provided in handshake
    const userId = client.handshake.auth?.userId || client.handshake.query?.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId as string) || [];
      sockets.push(client.id);
      this.userSockets.set(userId as string, sockets);
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    }

    this.logger.log(`Client connected: ${client.id}`);
    this.logger.log(`Total clients: ${this.connectedClients.size}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);

    // Remove from user sockets tracking
    const userId = client.handshake.auth?.userId || client.handshake.query?.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId as string) || [];
      const filtered = sockets.filter(id => id !== client.id);
      if (filtered.length > 0) {
        this.userSockets.set(userId as string, filtered);
      } else {
        this.userSockets.delete(userId as string);
      }
    }

    this.logger.log(`Client disconnected: ${client.id}`);
    this.logger.log(`Total clients: ${this.connectedClients.size}`);
  }

  // Emit events to specific rooms (tables)
  emitToTable(tableId: string, event: string, data: any) {
    this.server.to(`table:${tableId}`).emit(event, data);
    this.logger.debug(`Emitted ${event} to table:${tableId}`);
  }

  // Emit global events
  emitGlobal(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.debug(`Emitted global ${event}`);
  }

  // Alias for emitGlobal (used by other modules)
  emitToAll(event: string, data: any) {
    this.emitGlobal(event, data);
  }

  // Emit to specific user (all their connected sockets)
  emitToUser(userId: string, event: string, data: any) {
    const socketIds = this.userSockets.get(userId) || [];
    socketIds.forEach(socketId => {
      const socket = this.connectedClients.get(socketId);
      if (socket) {
        socket.emit(event, data);
      }
    });
    this.logger.debug(`Emitted ${event} to user ${userId} (${socketIds.length} sockets)`);
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
