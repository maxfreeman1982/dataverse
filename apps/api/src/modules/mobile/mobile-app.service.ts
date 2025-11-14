import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileApp, AppStatus } from './entities/mobile-app.entity';
import { MobileAppBuild, BuildStatus } from './entities/mobile-app-build.entity';
import { MobilePushNotification, NotificationStatus } from './entities/mobile-push-notification.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import {
  CreateMobileAppInput,
  UpdateMobileAppInput,
  GetMobileAppsInput,
  CreateBuildInput,
  UpdateBuildInput,
  GetBuildsInput,
  CreatePushNotificationInput,
  UpdatePushNotificationInput,
  SendPushNotificationInput,
  GetPushNotificationsInput,
} from './dto/mobile-app.dto';

@Injectable()
export class MobileAppService {
  constructor(
    @InjectRepository(MobileApp)
    private mobileAppRepository: Repository<MobileApp>,
    @InjectRepository(MobileAppBuild)
    private buildRepository: Repository<MobileAppBuild>,
    @InjectRepository(MobilePushNotification)
    private notificationRepository: Repository<MobilePushNotification>,
    private websocketGateway: WebsocketGateway,
  ) {}

  // ========== MOBILE APP CRUD ==========

  async createApp(input: CreateMobileAppInput, userId: string): Promise<MobileApp> {
    // Check if slug already exists
    const existing = await this.mobileAppRepository.findOne({
      where: { slug: input.slug },
    });

    if (existing) {
      throw new BadRequestException('App with this slug already exists');
    }

    const app = this.mobileAppRepository.create({
      ...input,
      ownerId: userId,
    });

    const saved = await this.mobileAppRepository.save(app);

    this.websocketGateway.emitToAll('mobile-app-created', {
      appId: saved.id,
      name: saved.name,
    });

    return this.getAppById(saved.id);
  }

  async getAppById(id: string): Promise<MobileApp> {
    const app = await this.mobileAppRepository.findOne({
      where: { id },
      relations: ['owner', 'builds'],
    });

    if (!app) {
      throw new NotFoundException('Mobile app not found');
    }

    return app;
  }

  async getApps(input: GetMobileAppsInput): Promise<MobileApp[]> {
    const query = this.mobileAppRepository
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.owner', 'owner')
      .leftJoinAndSelect('app.builds', 'builds')
      .orderBy('app.createdAt', 'DESC');

    if (input.platform) {
      query.andWhere('app.platform = :platform', { platform: input.platform });
    }

    if (input.status) {
      query.andWhere('app.status = :status', { status: input.status });
    }

    if (input.category) {
      query.andWhere('app.category = :category', { category: input.category });
    }

    if (input.isPublished !== undefined) {
      query.andWhere('app.isPublished = :isPublished', { isPublished: input.isPublished });
    }

    if (input.search) {
      query.andWhere('(app.name ILIKE :search OR app.description ILIKE :search)', {
        search: `%${input.search}%`,
      });
    }

    return query.getMany();
  }

  async updateApp(input: UpdateMobileAppInput, userId: string): Promise<MobileApp> {
    const app = await this.getAppById(input.id);

    if (app.ownerId !== userId) {
      throw new BadRequestException('You do not own this app');
    }

    await this.mobileAppRepository.update(input.id, input);

    this.websocketGateway.emitToAll('mobile-app-updated', {
      appId: app.id,
      name: app.name,
    });

    return this.getAppById(input.id);
  }

  async deleteApp(id: string, userId: string): Promise<boolean> {
    const app = await this.getAppById(id);

    if (app.ownerId !== userId) {
      throw new BadRequestException('You do not own this app');
    }

    await this.mobileAppRepository.delete(id);

    this.websocketGateway.emitToAll('mobile-app-deleted', { appId: id });

    return true;
  }

  async publishApp(id: string, userId: string): Promise<MobileApp> {
    const app = await this.getAppById(id);

    if (app.ownerId !== userId) {
      throw new BadRequestException('You do not own this app');
    }

    app.isPublished = true;
    app.publishedAt = new Date();
    app.status = AppStatus.PRODUCTION;

    await this.mobileAppRepository.save(app);

    this.websocketGateway.emitToAll('mobile-app-published', {
      appId: app.id,
      name: app.name,
    });

    return this.getAppById(id);
  }

  // ========== BUILD MANAGEMENT ==========

  async createBuild(input: CreateBuildInput, userId: string): Promise<MobileAppBuild> {
    const app = await this.getAppById(input.appId);

    // Check if build number already exists
    const existing = await this.buildRepository.findOne({
      where: {
        appId: input.appId,
        buildNumber: input.buildNumber,
      },
    });

    if (existing) {
      throw new BadRequestException('Build number already exists for this app');
    }

    const build = this.buildRepository.create({
      ...input,
      createdById: userId,
      startedAt: new Date(),
    });

    const saved = await this.buildRepository.save(build);

    // Simulate build process (in real app, this would trigger CI/CD)
    setTimeout(async () => {
      await this.completeBuild(saved.id, BuildStatus.SUCCESS, 120);
    }, 5000);

    this.websocketGateway.emitToAll('build-created', {
      buildId: saved.id,
      appId: app.id,
      version: saved.version,
    });

    return this.getBuildById(saved.id);
  }

  async getBuildById(id: string): Promise<MobileAppBuild> {
    const build = await this.buildRepository.findOne({
      where: { id },
      relations: ['app', 'createdBy'],
    });

    if (!build) {
      throw new NotFoundException('Build not found');
    }

    return build;
  }

  async getBuilds(input: GetBuildsInput): Promise<MobileAppBuild[]> {
    const query = this.buildRepository
      .createQueryBuilder('build')
      .leftJoinAndSelect('build.app', 'app')
      .leftJoinAndSelect('build.createdBy', 'createdBy')
      .where('build.appId = :appId', { appId: input.appId })
      .orderBy('build.createdAt', 'DESC');

    if (input.status) {
      query.andWhere('build.status = :status', { status: input.status });
    }

    if (input.type) {
      query.andWhere('build.type = :type', { type: input.type });
    }

    if (input.version) {
      query.andWhere('build.version = :version', { version: input.version });
    }

    return query.getMany();
  }

  async updateBuild(input: UpdateBuildInput): Promise<MobileAppBuild> {
    const build = await this.getBuildById(input.id);

    await this.buildRepository.update(input.id, input);

    this.websocketGateway.emitToAll('build-updated', {
      buildId: build.id,
      appId: build.appId,
      status: input.status || build.status,
    });

    return this.getBuildById(input.id);
  }

  private async completeBuild(
    buildId: string,
    status: BuildStatus,
    duration: number,
  ): Promise<void> {
    const build = await this.getBuildById(buildId);

    build.status = status;
    build.completedAt = new Date();
    build.buildDuration = duration;

    if (status === BuildStatus.SUCCESS) {
      // Mock build URLs
      build.iosBuildUrl = `https://builds.dataverse.com/${build.appId}/ios/${build.version}-${build.buildNumber}.ipa`;
      build.androidBuildUrl = `https://builds.dataverse.com/${build.appId}/android/${build.version}-${build.buildNumber}.apk`;
      build.buildLogUrl = `https://builds.dataverse.com/${build.appId}/logs/${build.id}.log`;

      // Update app version
      const app = await this.getAppById(build.appId);
      app.currentVersion = build.version;
      app.currentBuildNumber = build.buildNumber;
      await this.mobileAppRepository.save(app);
    }

    await this.buildRepository.save(build);

    this.websocketGateway.emitToAll('build-completed', {
      buildId: build.id,
      appId: build.appId,
      status,
    });
  }

  async publishBuild(id: string, userId: string): Promise<MobileAppBuild> {
    const build = await this.getBuildById(id);
    const app = await this.getAppById(build.appId);

    if (app.ownerId !== userId) {
      throw new BadRequestException('You do not own this app');
    }

    if (build.status !== BuildStatus.SUCCESS && build.status !== BuildStatus.UPLOADED) {
      throw new BadRequestException('Build must be successful before publishing');
    }

    build.status = BuildStatus.PUBLISHED;
    build.publishedAt = new Date();

    await this.buildRepository.save(build);

    this.websocketGateway.emitToAll('build-published', {
      buildId: build.id,
      appId: build.appId,
    });

    return this.getBuildById(id);
  }

  // ========== PUSH NOTIFICATIONS ==========

  async createPushNotification(
    input: CreatePushNotificationInput,
    userId: string,
  ): Promise<MobilePushNotification> {
    const app = await this.getAppById(input.appId);

    if (!app.isPushEnabled) {
      throw new BadRequestException('Push notifications are not enabled for this app');
    }

    const notification = this.notificationRepository.create({
      ...input,
      createdById: userId,
    });

    const saved = await this.notificationRepository.save(notification);

    return this.getNotificationById(saved.id);
  }

  async getNotificationById(id: string): Promise<MobilePushNotification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['app', 'createdBy'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async getNotifications(input: GetPushNotificationsInput): Promise<MobilePushNotification[]> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.app', 'app')
      .leftJoinAndSelect('notification.createdBy', 'createdBy')
      .where('notification.appId = :appId', { appId: input.appId })
      .orderBy('notification.createdAt', 'DESC');

    if (input.status) {
      query.andWhere('notification.status = :status', { status: input.status });
    }

    if (input.target) {
      query.andWhere('notification.target = :target', { target: input.target });
    }

    return query.getMany();
  }

  async updatePushNotification(input: UpdatePushNotificationInput): Promise<MobilePushNotification> {
    const notification = await this.getNotificationById(input.id);

    if (notification.status === NotificationStatus.SENT) {
      throw new BadRequestException('Cannot update a sent notification');
    }

    await this.notificationRepository.update(input.id, input);

    return this.getNotificationById(input.id);
  }

  async sendPushNotification(
    input: SendPushNotificationInput,
    userId: string,
  ): Promise<MobilePushNotification> {
    const notification = await this.getNotificationById(input.id);
    const app = await this.getAppById(notification.appId);

    if (app.ownerId !== userId) {
      throw new BadRequestException('You do not own this app');
    }

    if (notification.status === NotificationStatus.SENT) {
      throw new BadRequestException('Notification already sent');
    }

    // Mock sending logic
    notification.status = NotificationStatus.SENDING;
    await this.notificationRepository.save(notification);

    // Simulate sending process
    setTimeout(async () => {
      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();

      // Mock statistics
      notification.totalRecipients = Math.floor(Math.random() * 10000) + 1000;
      notification.deliveredCount = Math.floor(notification.totalRecipients * 0.95);
      notification.openedCount = Math.floor(notification.deliveredCount * 0.4);
      notification.clickedCount = Math.floor(notification.openedCount * 0.6);
      notification.failedCount = notification.totalRecipients - notification.deliveredCount;

      await this.notificationRepository.save(notification);

      this.websocketGateway.emitToAll('push-notification-sent', {
        notificationId: notification.id,
        appId: app.id,
        totalRecipients: notification.totalRecipients,
      });
    }, 3000);

    return this.getNotificationById(input.id);
  }

  async deletePushNotification(id: string, userId: string): Promise<boolean> {
    const notification = await this.getNotificationById(id);
    const app = await this.getAppById(notification.appId);

    if (app.ownerId !== userId) {
      throw new BadRequestException('You do not own this app');
    }

    if (notification.status === NotificationStatus.SENT || notification.status === NotificationStatus.SENDING) {
      throw new BadRequestException('Cannot delete a sent or sending notification');
    }

    await this.notificationRepository.delete(id);

    return true;
  }

  // ========== SEED DATA ==========

  async seedMobileApps(userId: string): Promise<void> {
    const sampleApps = [
      {
        name: 'DataVerse Mobile',
        slug: 'dataverse-mobile',
        description: 'Official DataVerse mobile app for iOS and Android',
        platform: 'both' as any,
        category: 'business' as any,
        bundleId: 'com.dataverse.mobile',
        packageName: 'com.dataverse.mobile',
        iconUrl: 'https://via.placeholder.com/512',
        currentVersion: '2.3.1',
        currentBuildNumber: 42,
        isPushEnabled: true,
        isOfflineEnabled: true,
        isPublished: true,
        totalDownloads: 125000,
        activeUsers: 45000,
        averageRating: 4.7,
        reviewCount: 3420,
      },
      {
        name: 'DataVerse Chat',
        slug: 'dataverse-chat',
        description: 'Standalone chat and messaging app',
        platform: 'both' as any,
        category: 'social' as any,
        bundleId: 'com.dataverse.chat',
        packageName: 'com.dataverse.chat',
        currentVersion: '1.5.0',
        currentBuildNumber: 28,
        isPushEnabled: true,
        isPublished: true,
        totalDownloads: 78000,
        activeUsers: 32000,
        averageRating: 4.5,
        reviewCount: 1890,
      },
    ];

    for (const appData of sampleApps) {
      const existing = await this.mobileAppRepository.findOne({
        where: { slug: appData.slug },
      });

      if (!existing) {
        const app = this.mobileAppRepository.create({
          ...appData,
          ownerId: userId,
          status: 'production' as any,
          publishedAt: new Date(),
        });

        await this.mobileAppRepository.save(app);
      }
    }
  }
}
