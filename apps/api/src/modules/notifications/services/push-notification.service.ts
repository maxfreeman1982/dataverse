import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  action?: string;
}

export interface SendToDeviceOptions {
  userId: string;
  deviceToken: string;
  notification: PushNotificationPayload;
  priority?: 'high' | 'normal';
}

export interface SendToTopicOptions {
  topic: string;
  notification: PushNotificationPayload;
}

/**
 * Push notification service using Firebase Cloud Messaging (FCM)
 */
@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private firebaseApp: admin.app.App;
  private isInitialized = false;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  private initialize(): void {
    try {
      const serviceAccountPath = this.configService.get<string>(
        'FIREBASE_SERVICE_ACCOUNT_PATH',
      );
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');

      if (!serviceAccountPath && !projectId) {
        this.logger.warn(
          'Firebase credentials not configured. Push notifications disabled.',
        );
        return;
      }

      // Initialize with service account file
      if (serviceAccountPath) {
        const serviceAccount = require(serviceAccountPath);
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else if (projectId) {
        // Initialize with application default credentials (for GCP)
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId,
        });
      }

      this.isInitialized = true;
      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error);
    }
  }

  /**
   * Send push notification to a specific device
   */
  async sendToDevice(options: SendToDeviceOptions): Promise<boolean> {
    if (!this.isInitialized) {
      this.logger.warn('Push notification not sent - Firebase not initialized');
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        token: options.deviceToken,
        notification: {
          title: options.notification.title,
          body: options.notification.body,
          imageUrl: options.notification.imageUrl,
        },
        data: options.notification.data || {},
        android: {
          priority: options.priority || 'high',
          notification: {
            sound: 'default',
            clickAction: options.notification.action,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(
        `Push notification sent to user ${options.userId}: ${response}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to user ${options.userId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendToMultipleDevices(
    deviceTokens: string[],
    notification: PushNotificationPayload,
  ): Promise<admin.messaging.BatchResponse> {
    if (!this.isInitialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens: deviceTokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data || {},
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `Batch notification sent: ${response.successCount} successful, ${response.failureCount} failed`,
      );
      return response;
    } catch (error) {
      this.logger.error('Failed to send batch notifications:', error);
      throw error;
    }
  }

  /**
   * Send push notification to a topic (group of users)
   */
  async sendToTopic(options: SendToTopicOptions): Promise<boolean> {
    if (!this.isInitialized) {
      this.logger.warn('Push notification not sent - Firebase not initialized');
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        topic: options.topic,
        notification: {
          title: options.notification.title,
          body: options.notification.body,
          imageUrl: options.notification.imageUrl,
        },
        data: options.notification.data || {},
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Push notification sent to topic ${options.topic}: ${response}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send notification to topic ${options.topic}:`, error);
      return false;
    }
  }

  /**
   * Subscribe device to a topic
   */
  async subscribeToTopic(
    deviceToken: string,
    topic: string,
  ): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      await admin.messaging().subscribeToTopic([deviceToken], topic);
      this.logger.log(`Device subscribed to topic: ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Unsubscribe device from a topic
   */
  async unsubscribeFromTopic(
    deviceToken: string,
    topic: string,
  ): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      await admin.messaging().unsubscribeFromTopic([deviceToken], topic);
      this.logger.log(`Device unsubscribed from topic: ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Send investment confirmation notification
   */
  async sendInvestmentNotification(
    deviceToken: string,
    userId: string,
    projectName: string,
    amount: number,
  ): Promise<boolean> {
    return await this.sendToDevice({
      userId,
      deviceToken,
      notification: {
        title: '✅ Investissement confirmé',
        body: `Votre investissement de €${amount.toLocaleString()} dans "${projectName}" a été confirmé.`,
        data: {
          type: 'investment',
          projectName,
          amount: amount.toString(),
        },
        action: 'INVESTMENT_DETAILS',
      },
      priority: 'high',
    });
  }

  /**
   * Send return payment notification
   */
  async sendReturnNotification(
    deviceToken: string,
    userId: string,
    projectName: string,
    amount: number,
  ): Promise<boolean> {
    return await this.sendToDevice({
      userId,
      deviceToken,
      notification: {
        title: '💰 Rendement reçu',
        body: `Vous avez reçu €${amount.toLocaleString()} de rendement du projet "${projectName}".`,
        data: {
          type: 'return',
          projectName,
          amount: amount.toString(),
        },
        action: 'PORTFOLIO',
      },
      priority: 'high',
    });
  }

  /**
   * Send KYC approval notification
   */
  async sendKYCApprovalNotification(
    deviceToken: string,
    userId: string,
    approved: boolean,
  ): Promise<boolean> {
    return await this.sendToDevice({
      userId,
      deviceToken,
      notification: {
        title: approved ? '🎉 KYC Approuvé' : '❌ KYC Refusé',
        body: approved
          ? 'Votre vérification KYC a été approuvée. Vous pouvez maintenant investir.'
          : 'Votre vérification KYC a été refusée. Veuillez soumettre de nouveaux documents.',
        data: {
          type: 'kyc',
          status: approved ? 'approved' : 'rejected',
        },
        action: 'KYC_STATUS',
      },
      priority: 'high',
    });
  }

  /**
   * Send project update notification
   */
  async sendProjectUpdateNotification(
    deviceToken: string,
    userId: string,
    projectName: string,
    updateMessage: string,
  ): Promise<boolean> {
    return await this.sendToDevice({
      userId,
      deviceToken,
      notification: {
        title: `📢 Mise à jour: ${projectName}`,
        body: updateMessage,
        data: {
          type: 'project_update',
          projectName,
        },
        action: 'PROJECT_DETAILS',
      },
      priority: 'normal',
    });
  }

  /**
   * Send security alert notification
   */
  async sendSecurityAlertNotification(
    deviceToken: string,
    userId: string,
    alertMessage: string,
  ): Promise<boolean> {
    return await this.sendToDevice({
      userId,
      deviceToken,
      notification: {
        title: '🔒 Alerte de sécurité',
        body: alertMessage,
        data: {
          type: 'security',
        },
        action: 'SECURITY_SETTINGS',
      },
      priority: 'high',
    });
  }

  /**
   * Send new message notification
   */
  async sendMessageNotification(
    deviceToken: string,
    userId: string,
    senderName: string,
    messagePreview: string,
  ): Promise<boolean> {
    return await this.sendToDevice({
      userId,
      deviceToken,
      notification: {
        title: `💬 Message de ${senderName}`,
        body: messagePreview,
        data: {
          type: 'message',
          senderName,
        },
        action: 'MESSAGES',
      },
      priority: 'normal',
    });
  }
}
