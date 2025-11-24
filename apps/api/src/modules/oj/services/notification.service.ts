import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Investor } from '../entities/investor.entity';

export enum NotificationType {
  DEPOSIT_RECEIVED = 'DEPOSIT_RECEIVED',
  DEPOSIT_CONFIRMED = 'DEPOSIT_CONFIRMED',
  WITHDRAWAL_PROCESSED = 'WITHDRAWAL_PROCESSED',
  INVESTMENT_CONFIRMED = 'INVESTMENT_CONFIRMED',
  RETURN_RECEIVED = 'RETURN_RECEIVED',
  KYC_APPROVED = 'KYC_APPROVED',
  KYC_REJECTED = 'KYC_REJECTED',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  PROJECT_COMPLETED = 'PROJECT_COMPLETED',
  INVESTMENT_MATURED = 'INVESTMENT_MATURED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

export interface OjNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

@WebSocketGateway({
  namespace: '/oj',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class OjNotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OjNotificationGateway.name);
  private connectedClients: Map<string, Set<string>> = new Map(); // investorId -> Set<socketId>

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(Investor)
    private investorRepository: Repository<Investor>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (payload.type !== 'investor') {
        client.disconnect();
        return;
      }

      const investorId = payload.sub;
      client.data.investorId = investorId;

      // Add to connected clients
      if (!this.connectedClients.has(investorId)) {
        this.connectedClients.set(investorId, new Set());
      }
      this.connectedClients.get(investorId)!.add(client.id);

      // Join investor's room
      client.join(`investor:${investorId}`);

      this.logger.log(`Client connected: ${client.id} for investor ${investorId}`);

      // Send connection confirmation
      client.emit('connected', { investorId, timestamp: new Date() });
    } catch (error) {
      this.logger.error(`Connection failed: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const investorId = client.data.investorId;
    if (investorId && this.connectedClients.has(investorId)) {
      this.connectedClients.get(investorId)!.delete(client.id);
      if (this.connectedClients.get(investorId)!.size === 0) {
        this.connectedClients.delete(investorId);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channels: string[] },
  ) {
    data.channels.forEach((channel) => {
      client.join(channel);
    });
    return { subscribed: data.channels };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channels: string[] },
  ) {
    data.channels.forEach((channel) => {
      client.leave(channel);
    });
    return { unsubscribed: data.channels };
  }

  // Methods to send notifications

  sendToInvestor(investorId: string, notification: OjNotification) {
    this.server.to(`investor:${investorId}`).emit('notification', notification);
  }

  sendToAll(notification: OjNotification) {
    this.server.emit('notification', notification);
  }

  sendToAdmins(notification: OjNotification) {
    this.server.to('admins').emit('admin:notification', notification);
  }

  sendToBanks(notification: OjNotification) {
    this.server.to('banks').emit('bank:notification', notification);
  }

  // Specific notification methods

  notifyDepositReceived(investorId: string, amount: number, reference: string) {
    this.sendToInvestor(investorId, {
      id: `notif-${Date.now()}`,
      type: NotificationType.DEPOSIT_RECEIVED,
      title: 'Dépôt reçu',
      message: `Votre dépôt de ${amount} EUR a été reçu et est en cours de traitement.`,
      data: { amount, reference },
      read: false,
      createdAt: new Date(),
    });

    // Also notify banks
    this.sendToBanks({
      id: `notif-${Date.now()}`,
      type: NotificationType.DEPOSIT_RECEIVED,
      title: 'Nouveau dépôt à valider',
      message: `Un dépôt de ${amount} EUR est en attente de validation.`,
      data: { amount, reference, investorId },
      read: false,
      createdAt: new Date(),
    });
  }

  notifyDepositConfirmed(investorId: string, amount: number) {
    this.sendToInvestor(investorId, {
      id: `notif-${Date.now()}`,
      type: NotificationType.DEPOSIT_CONFIRMED,
      title: 'Dépôt confirmé',
      message: `Votre dépôt de ${amount} EUR a été confirmé et ajouté à votre portefeuille.`,
      data: { amount },
      read: false,
      createdAt: new Date(),
    });
  }

  notifyWithdrawalProcessed(investorId: string, amount: number, approved: boolean) {
    this.sendToInvestor(investorId, {
      id: `notif-${Date.now()}`,
      type: NotificationType.WITHDRAWAL_PROCESSED,
      title: approved ? 'Retrait approuvé' : 'Retrait refusé',
      message: approved
        ? `Votre retrait de ${amount} EUR a été approuvé et sera traité sous 24-48h.`
        : `Votre demande de retrait de ${amount} EUR a été refusée.`,
      data: { amount, approved },
      read: false,
      createdAt: new Date(),
    });
  }

  notifyInvestmentConfirmed(investorId: string, projectName: string, amount: number) {
    this.sendToInvestor(investorId, {
      id: `notif-${Date.now()}`,
      type: NotificationType.INVESTMENT_CONFIRMED,
      title: 'Investissement confirmé',
      message: `Votre investissement de ${amount} EUR dans "${projectName}" a été confirmé.`,
      data: { projectName, amount },
      read: false,
      createdAt: new Date(),
    });
  }

  notifyReturnReceived(investorId: string, projectName: string, amount: number) {
    this.sendToInvestor(investorId, {
      id: `notif-${Date.now()}`,
      type: NotificationType.RETURN_RECEIVED,
      title: 'Rendement reçu',
      message: `Vous avez reçu un rendement de ${amount} EUR de "${projectName}".`,
      data: { projectName, amount },
      read: false,
      createdAt: new Date(),
    });
  }

  notifyKycApproved(investorId: string) {
    this.sendToInvestor(investorId, {
      id: `notif-${Date.now()}`,
      type: NotificationType.KYC_APPROVED,
      title: 'Identité vérifiée',
      message: 'Votre vérification KYC a été approuvée. Vous pouvez maintenant investir.',
      read: false,
      createdAt: new Date(),
    });
  }

  notifyKycRejected(investorId: string, reason: string) {
    this.sendToInvestor(investorId, {
      id: `notif-${Date.now()}`,
      type: NotificationType.KYC_REJECTED,
      title: 'Vérification refusée',
      message: `Votre vérification KYC a été refusée: ${reason}`,
      data: { reason },
      read: false,
      createdAt: new Date(),
    });
  }

  notifyProjectUpdate(projectId: string, projectName: string, update: string) {
    this.server.to(`project:${projectId}`).emit('notification', {
      id: `notif-${Date.now()}`,
      type: NotificationType.PROJECT_UPDATE,
      title: `Mise à jour: ${projectName}`,
      message: update,
      data: { projectId, projectName },
      read: false,
      createdAt: new Date(),
    });
  }

  notifyProjectCompleted(projectId: string, projectName: string) {
    this.server.to(`project:${projectId}`).emit('notification', {
      id: `notif-${Date.now()}`,
      type: NotificationType.PROJECT_COMPLETED,
      title: 'Projet terminé',
      message: `Le projet "${projectName}" est maintenant terminé.`,
      data: { projectId, projectName },
      read: false,
      createdAt: new Date(),
    });
  }

  notifyInvestmentMatured(investorId: string, projectName: string, amount: number) {
    this.sendToInvestor(investorId, {
      id: `notif-${Date.now()}`,
      type: NotificationType.INVESTMENT_MATURED,
      title: 'Investissement arrivé à terme',
      message: `Votre investissement dans "${projectName}" est arrivé à terme. ${amount} EUR ont été crédités sur votre compte.`,
      data: { projectName, amount },
      read: false,
      createdAt: new Date(),
    });
  }

  // Admin can join admin room
  @SubscribeMessage('join:admin')
  handleJoinAdmin(@ConnectedSocket() client: Socket) {
    client.join('admins');
    return { joined: 'admins' };
  }

  // Bank can join bank room
  @SubscribeMessage('join:bank')
  handleJoinBank(@ConnectedSocket() client: Socket) {
    client.join('banks');
    return { joined: 'banks' };
  }

  // Subscribe to project updates
  @SubscribeMessage('subscribe:project')
  handleSubscribeProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    client.join(`project:${data.projectId}`);
    return { subscribed: `project:${data.projectId}` };
  }
}
