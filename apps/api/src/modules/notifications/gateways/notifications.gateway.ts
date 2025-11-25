import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * WebSocket Gateway for real-time notifications
 */
@WebSocketGateway({
  cors: {
    origin: '*', // Configure this properly in production
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers: Map<string, string[]> = new Map(); // userId -> socketIds[]

  constructor(private jwtService: JwtService) {}

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(client: Socket) {
    try {
      // Extract and verify JWT token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided`);
        client.disconnect();
        return;
      }

      // Verify token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub || payload.id;

      // Store user connection
      client.data.userId = userId;

      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, []);
      }
      this.connectedUsers.get(userId).push(client.id);

      // Join user to their personal room
      client.join(`user:${userId}`);

      this.logger.log(
        `Client connected: ${client.id} (User: ${userId}) - Total users online: ${this.connectedUsers.size}`,
      );

      // Send welcome message
      client.emit('connected', {
        message: 'Successfully connected to notifications service',
        userId,
      });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId && this.connectedUsers.has(userId)) {
      const sockets = this.connectedUsers.get(userId);
      const index = sockets.indexOf(client.id);
      if (index > -1) {
        sockets.splice(index, 1);
      }

      if (sockets.length === 0) {
        this.connectedUsers.delete(userId);
      }
    }

    this.logger.log(
      `Client disconnected: ${client.id} (User: ${userId}) - Total users online: ${this.connectedUsers.size}`,
    );
  }

  /**
   * Subscribe to project updates
   */
  @SubscribeMessage('subscribe:project')
  handleSubscribeToProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    client.join(`project:${data.projectId}`);
    this.logger.log(
      `User ${client.data.userId} subscribed to project ${data.projectId}`,
    );
    return { success: true, message: 'Subscribed to project updates' };
  }

  /**
   * Unsubscribe from project updates
   */
  @SubscribeMessage('unsubscribe:project')
  handleUnsubscribeFromProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    client.leave(`project:${data.projectId}`);
    this.logger.log(
      `User ${client.data.userId} unsubscribed from project ${data.projectId}`,
    );
    return { success: true, message: 'Unsubscribed from project updates' };
  }

  /**
   * Get online status
   */
  @SubscribeMessage('get:online_users')
  handleGetOnlineUsers() {
    return {
      count: this.connectedUsers.size,
      users: Array.from(this.connectedUsers.keys()),
    };
  }

  /**
   * Send notification to a specific user
   */
  sendToUser(userId: string, event: string, data: any): void {
    this.server.to(`user:${userId}`).emit(event, data);
    this.logger.debug(`Sent ${event} to user ${userId}`);
  }

  /**
   * Send notification to multiple users
   */
  sendToUsers(userIds: string[], event: string, data: any): void {
    userIds.forEach((userId) => {
      this.sendToUser(userId, event, data);
    });
  }

  /**
   * Broadcast to all users subscribed to a project
   */
  sendToProject(projectId: string, event: string, data: any): void {
    this.server.to(`project:${projectId}`).emit(event, data);
    this.logger.debug(`Sent ${event} to project ${projectId}`);
  }

  /**
   * Broadcast to all connected users
   */
  broadcastToAll(event: string, data: any): void {
    this.server.emit(event, data);
    this.logger.debug(`Broadcast ${event} to all users`);
  }

  /**
   * Send investment confirmation notification
   */
  notifyInvestmentCreated(
    userId: string,
    investmentData: {
      projectId: string;
      projectName: string;
      amount: number;
      investmentId: string;
    },
  ): void {
    this.sendToUser(userId, 'investment:created', {
      type: 'investment_created',
      title: 'Investissement confirmé',
      message: `Votre investissement de €${investmentData.amount.toLocaleString()} dans "${investmentData.projectName}" a été confirmé.`,
      data: investmentData,
      timestamp: new Date(),
    });

    // Also notify project subscribers
    this.sendToProject(investmentData.projectId, 'project:new_investment', {
      projectId: investmentData.projectId,
      amount: investmentData.amount,
      timestamp: new Date(),
    });
  }

  /**
   * Send return payment notification
   */
  notifyReturnPayment(
    userId: string,
    returnData: {
      projectName: string;
      amount: number;
      transactionId: string;
    },
  ): void {
    this.sendToUser(userId, 'return:received', {
      type: 'return_received',
      title: 'Rendement reçu',
      message: `Vous avez reçu €${returnData.amount.toLocaleString()} de rendement du projet "${returnData.projectName}".`,
      data: returnData,
      timestamp: new Date(),
    });
  }

  /**
   * Send KYC status notification
   */
  notifyKYCStatus(
    userId: string,
    status: 'approved' | 'rejected',
    reason?: string,
  ): void {
    this.sendToUser(userId, 'kyc:status_updated', {
      type: 'kyc_status',
      title: status === 'approved' ? 'KYC Approuvé' : 'KYC Refusé',
      message:
        status === 'approved'
          ? 'Votre vérification KYC a été approuvée.'
          : `Votre vérification KYC a été refusée. ${reason || ''}`,
      data: { status, reason },
      timestamp: new Date(),
    });
  }

  /**
   * Send project update notification to all investors
   */
  notifyProjectUpdate(
    projectId: string,
    updateData: {
      projectName: string;
      updateType: string;
      message: string;
    },
  ): void {
    this.sendToProject(projectId, 'project:updated', {
      type: 'project_update',
      title: `Mise à jour: ${updateData.projectName}`,
      message: updateData.message,
      data: updateData,
      timestamp: new Date(),
    });
  }

  /**
   * Send withdrawal status notification
   */
  notifyWithdrawalStatus(
    userId: string,
    withdrawalData: {
      amount: number;
      status: 'pending' | 'approved' | 'rejected' | 'completed';
      withdrawalId: string;
    },
  ): void {
    this.sendToUser(userId, 'withdrawal:status_updated', {
      type: 'withdrawal_status',
      title: 'Statut du retrait',
      message: `Votre demande de retrait de €${withdrawalData.amount.toLocaleString()} est ${withdrawalData.status}.`,
      data: withdrawalData,
      timestamp: new Date(),
    });
  }

  /**
   * Send new message notification
   */
  notifyNewMessage(
    userId: string,
    messageData: {
      senderName: string;
      messagePreview: string;
      conversationId: string;
    },
  ): void {
    this.sendToUser(userId, 'message:received', {
      type: 'new_message',
      title: `Message de ${messageData.senderName}`,
      message: messageData.messagePreview,
      data: messageData,
      timestamp: new Date(),
    });
  }

  /**
   * Send system announcement to all users
   */
  sendSystemAnnouncement(announcement: {
    title: string;
    message: string;
    priority: 'low' | 'normal' | 'high';
  }): void {
    this.broadcastToAll('system:announcement', {
      type: 'system_announcement',
      ...announcement,
      timestamp: new Date(),
    });
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get connected users count
   */
  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get all connected socket IDs for a user
   */
  getUserSockets(userId: string): string[] {
    return this.connectedUsers.get(userId) || [];
  }
}
