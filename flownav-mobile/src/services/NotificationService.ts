/**
 * FlowNav - Intelligent Notification Service
 * Smart push notifications for optimal departure times and traffic alerts
 */

import PushNotification, { ReceivedNotification } from 'react-native-push-notification';
import { Platform } from 'react-native';
import type { OptimalDeparture, Alert } from '../types';

export enum NotificationChannel {
  DEPARTURE_REMINDER = 'departure_reminder',
  TRAFFIC_ALERT = 'traffic_alert',
  TRIP_UPDATE = 'trip_update',
  PRIVACY_UPDATE = 'privacy_update',
}

export interface NotificationConfig {
  enabled: boolean;
  departureReminders: boolean;
  trafficAlerts: boolean;
  privacyUpdates: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  advanceNoticeMinutes: number; // How early to notify before t0
}

export class NotificationService {
  private static instance: NotificationService;
  private config: NotificationConfig;
  private scheduledNotifications: Map<string, number> = new Map();

  private constructor() {
    this.config = {
      enabled: true,
      departureReminders: true,
      trafficAlerts: true,
      privacyUpdates: true,
      soundEnabled: true,
      vibrationEnabled: true,
      advanceNoticeMinutes: 5,
    };

    this.initialize();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification system
   */
  private initialize(): void {
    // Configure channels (Android)
    PushNotification.createChannel(
      {
        channelId: NotificationChannel.DEPARTURE_REMINDER,
        channelName: 'Rappels de Départ',
        channelDescription: 'Notifications pour le moment optimal de départ',
        playSound: this.config.soundEnabled,
        soundName: 'default',
        importance: 4, // High
        vibrate: this.config.vibrationEnabled,
      },
      (created) => console.log(`[Notifications] Channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: NotificationChannel.TRAFFIC_ALERT,
        channelName: 'Alertes Trafic',
        channelDescription: 'Alertes sur les conditions de trafic',
        playSound: this.config.soundEnabled,
        soundName: 'default',
        importance: 3, // Default
        vibrate: this.config.vibrationEnabled,
      },
      (created) => console.log(`[Notifications] Channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: NotificationChannel.TRIP_UPDATE,
        channelName: 'Mises à Jour Trajet',
        channelDescription: 'Informations sur votre trajet en cours',
        playSound: false,
        importance: 2, // Low
        vibrate: false,
      },
      (created) => console.log(`[Notifications] Channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: NotificationChannel.PRIVACY_UPDATE,
        channelName: 'Confidentialité',
        channelDescription: 'Mises à jour sur la protection de vos données',
        playSound: false,
        importance: 2, // Low
        vibrate: false,
      },
      (created) => console.log(`[Notifications] Channel created: ${created}`)
    );

    // Handle notification tap
    PushNotification.configure({
      onNotification: (notification: ReceivedNotification) => {
        console.log('[Notifications] Received:', notification);

        // Handle notification tap
        if (notification.userInteraction) {
          this.handleNotificationTap(notification);
        }
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  }

  /**
   * Request notification permissions
   */
  public async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.requestPermissions().then((permissions) => {
        const granted = permissions.alert || permissions.badge || permissions.sound;
        console.log('[Notifications] Permissions granted:', granted);
        resolve(granted);
      });
    });
  }

  /**
   * Schedule optimal departure notification
   */
  public scheduleDepartureNotification(
    optimal: OptimalDeparture,
    routeId: string
  ): void {
    if (!this.config.enabled || !this.config.departureReminders) {
      return;
    }

    // Cancel any existing notification for this route
    this.cancelNotification(routeId);

    const waitMinutes = Math.floor((optimal.t0 - Date.now()) / 60000);
    const notifyAt = optimal.t0 - this.config.advanceNoticeMinutes * 60 * 1000;

    // Don't schedule if time has passed
    if (notifyAt <= Date.now()) {
      return;
    }

    const notificationId = this.generateNotificationId();

    PushNotification.localNotificationSchedule({
      id: notificationId,
      channelId: NotificationChannel.DEPARTURE_REMINDER,
      title: '🚗 C\'est le moment de partir !',
      message: `Partez maintenant pour arriver à l'heure. Gain estimé : ${Math.round(optimal.gainMinutes)} min.`,
      date: new Date(notifyAt),
      playSound: this.config.soundEnabled,
      soundName: 'default',
      vibrate: this.config.vibrationEnabled,
      vibration: 300,
      priority: 'high',
      importance: 'high',
      allowWhileIdle: true,
      userInfo: {
        routeId,
        type: 'departure_reminder',
        t0: optimal.t0,
        gain: optimal.gainMinutes,
      },
      actions: ['Démarrer Navigation', 'Snooze 5 min'],
    });

    this.scheduledNotifications.set(routeId, notificationId);

    console.log(
      `[Notifications] Scheduled departure reminder for ${routeId} at ${new Date(notifyAt).toLocaleTimeString()}`
    );

    // Also schedule a "last chance" notification 2 minutes before
    if (waitMinutes > 5) {
      const lastChanceId = this.generateNotificationId();
      const lastChanceAt = optimal.t0 - 2 * 60 * 1000;

      PushNotification.localNotificationSchedule({
        id: lastChanceId,
        channelId: NotificationChannel.DEPARTURE_REMINDER,
        title: '⏰ Dernière chance !',
        message: `Partez dans 2 minutes pour le départ optimal.`,
        date: new Date(lastChanceAt),
        playSound: true,
        soundName: 'default',
        vibrate: true,
        vibration: 500,
        priority: 'high',
        importance: 'high',
        userInfo: {
          routeId,
          type: 'last_chance',
        },
      });
    }
  }

  /**
   * Send traffic alert notification
   */
  public sendTrafficAlert(alert: Alert): void {
    if (!this.config.enabled || !this.config.trafficAlerts) {
      return;
    }

    const severityEmoji = {
      low: '🟡',
      medium: '🟠',
      high: '🔴',
    };

    const title = `${severityEmoji[alert.severity]} ${alert.type === 'shockwave_detected' ? 'Onde de Congestion' :
                   alert.type === 'accident' ? 'Accident Signalé' :
                   alert.type === 'congestion' ? 'Embouteillage' : 'Alerte Trafic'}`;

    PushNotification.localNotification({
      channelId: NotificationChannel.TRAFFIC_ALERT,
      title,
      message: alert.message,
      playSound: alert.severity === 'high',
      soundName: 'default',
      vibrate: alert.severity === 'high',
      vibration: alert.severity === 'high' ? 500 : 0,
      priority: alert.severity === 'high' ? 'high' : 'default',
      importance: alert.severity === 'high' ? 'high' : 'default',
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      userInfo: {
        type: 'traffic_alert',
        alert: alert,
      },
      actions: alert.severity === 'high' ? ['Voir Itinéraire Alternatif'] : undefined,
    });

    console.log(`[Notifications] Sent traffic alert: ${alert.type} (${alert.severity})`);
  }

  /**
   * Send trip update notification
   */
  public sendTripUpdate(
    title: string,
    message: string,
    data?: any
  ): void {
    if (!this.config.enabled) {
      return;
    }

    PushNotification.localNotification({
      channelId: NotificationChannel.TRIP_UPDATE,
      title,
      message,
      playSound: false,
      vibrate: false,
      priority: 'low',
      importance: 'low',
      userInfo: {
        type: 'trip_update',
        data,
      },
    });
  }

  /**
   * Send privacy update notification
   */
  public sendPrivacyUpdate(message: string): void {
    if (!this.config.enabled || !this.config.privacyUpdates) {
      return;
    }

    PushNotification.localNotification({
      channelId: NotificationChannel.PRIVACY_UPDATE,
      title: '🔒 FlowNav Privacy',
      message,
      playSound: false,
      vibrate: false,
      priority: 'low',
      importance: 'low',
      userInfo: {
        type: 'privacy_update',
      },
    });
  }

  /**
   * Send ID rotation reminder
   */
  public sendIdRotationNotification(): void {
    this.sendPrivacyUpdate(
      'Votre identifiant éphémère a été automatiquement renouvelé pour protéger votre vie privée.'
    );
  }

  /**
   * Send data purge confirmation
   */
  public sendDataPurgeConfirmation(): void {
    this.sendPrivacyUpdate(
      'Vos données locales ont été purgées avec succès. Aucune donnée personnelle conservée.'
    );
  }

  /**
   * Cancel specific notification
   */
  public cancelNotification(routeId: string): void {
    const notificationId = this.scheduledNotifications.get(routeId);
    if (notificationId) {
      PushNotification.cancelLocalNotification(notificationId.toString());
      this.scheduledNotifications.delete(routeId);
      console.log(`[Notifications] Cancelled notification for ${routeId}`);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  public cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
    this.scheduledNotifications.clear();
    console.log('[Notifications] Cancelled all notifications');
  }

  /**
   * Get pending notifications count
   */
  public getPendingCount(): Promise<number> {
    return new Promise((resolve) => {
      PushNotification.getScheduledLocalNotifications((notifications) => {
        resolve(notifications.length);
      });
    });
  }

  /**
   * Update notification configuration
   */
  public updateConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[Notifications] Config updated:', this.config);

    // Re-initialize channels if settings changed
    if ('soundEnabled' in config || 'vibrationEnabled' in config) {
      this.initialize();
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): NotificationConfig {
    return { ...this.config };
  }

  /**
   * Handle notification tap
   */
  private handleNotificationTap(notification: ReceivedNotification): void {
    console.log('[Notifications] User tapped notification:', notification.userInfo);

    const userInfo = notification.userInfo as any;

    switch (userInfo?.type) {
      case 'departure_reminder':
        // Navigate to navigation screen
        // NavigationService.navigate('Navigation', { routeId: userInfo.routeId });
        break;

      case 'traffic_alert':
        // Show alert details
        // NavigationService.navigate('AlertDetails', { alert: userInfo.alert });
        break;

      case 'last_chance':
        // Open app with urgency
        // NavigationService.navigate('Home');
        break;

      default:
        break;
    }
  }

  /**
   * Generate unique notification ID
   */
  private generateNotificationId(): number {
    return Date.now() % 2147483647; // Max int for Android
  }

  /**
   * Test notification (development only)
   */
  public sendTestNotification(): void {
    PushNotification.localNotification({
      channelId: NotificationChannel.DEPARTURE_REMINDER,
      title: '🧪 Test Notification',
      message: 'Ceci est une notification de test FlowNav.',
      playSound: true,
      soundName: 'default',
      vibrate: true,
    });
  }
}

export default NotificationService;
