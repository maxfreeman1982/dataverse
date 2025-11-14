import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { MobileAppService } from './mobile-app.service';
import { MobileApp } from './entities/mobile-app.entity';
import { MobileAppBuild } from './entities/mobile-app-build.entity';
import { MobilePushNotification } from './entities/mobile-push-notification.entity';
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

@Resolver(() => MobileApp)
@UseGuards(GqlAuthGuard)
export class MobileAppResolver {
  constructor(private mobileAppService: MobileAppService) {}

  // ========== MOBILE APPS ==========

  @Mutation(() => MobileApp)
  async createMobileApp(
    @Args('input') input: CreateMobileAppInput,
    @CurrentUser() user: User,
  ): Promise<MobileApp> {
    return this.mobileAppService.createApp(input, user.id);
  }

  @Query(() => MobileApp)
  async mobileApp(@Args('id', { type: () => ID }) id: string): Promise<MobileApp> {
    return this.mobileAppService.getAppById(id);
  }

  @Query(() => [MobileApp])
  async mobileApps(
    @Args('input', { nullable: true }) input?: GetMobileAppsInput,
  ): Promise<MobileApp[]> {
    return this.mobileAppService.getApps(input || {});
  }

  @Mutation(() => MobileApp)
  async updateMobileApp(
    @Args('input') input: UpdateMobileAppInput,
    @CurrentUser() user: User,
  ): Promise<MobileApp> {
    return this.mobileAppService.updateApp(input, user.id);
  }

  @Mutation(() => Boolean)
  async deleteMobileApp(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.mobileAppService.deleteApp(id, user.id);
  }

  @Mutation(() => MobileApp)
  async publishMobileApp(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<MobileApp> {
    return this.mobileAppService.publishApp(id, user.id);
  }

  // ========== BUILDS ==========

  @Mutation(() => MobileAppBuild)
  async createBuild(
    @Args('input') input: CreateBuildInput,
    @CurrentUser() user: User,
  ): Promise<MobileAppBuild> {
    return this.mobileAppService.createBuild(input, user.id);
  }

  @Query(() => MobileAppBuild)
  async build(@Args('id', { type: () => ID }) id: string): Promise<MobileAppBuild> {
    return this.mobileAppService.getBuildById(id);
  }

  @Query(() => [MobileAppBuild])
  async builds(@Args('input') input: GetBuildsInput): Promise<MobileAppBuild[]> {
    return this.mobileAppService.getBuilds(input);
  }

  @Mutation(() => MobileAppBuild)
  async updateBuild(@Args('input') input: UpdateBuildInput): Promise<MobileAppBuild> {
    return this.mobileAppService.updateBuild(input);
  }

  @Mutation(() => MobileAppBuild)
  async publishBuild(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<MobileAppBuild> {
    return this.mobileAppService.publishBuild(id, user.id);
  }

  // ========== PUSH NOTIFICATIONS ==========

  @Mutation(() => MobilePushNotification)
  async createPushNotification(
    @Args('input') input: CreatePushNotificationInput,
    @CurrentUser() user: User,
  ): Promise<MobilePushNotification> {
    return this.mobileAppService.createPushNotification(input, user.id);
  }

  @Query(() => MobilePushNotification)
  async pushNotification(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MobilePushNotification> {
    return this.mobileAppService.getNotificationById(id);
  }

  @Query(() => [MobilePushNotification])
  async pushNotifications(
    @Args('input') input: GetPushNotificationsInput,
  ): Promise<MobilePushNotification[]> {
    return this.mobileAppService.getNotifications(input);
  }

  @Mutation(() => MobilePushNotification)
  async updatePushNotification(
    @Args('input') input: UpdatePushNotificationInput,
  ): Promise<MobilePushNotification> {
    return this.mobileAppService.updatePushNotification(input);
  }

  @Mutation(() => MobilePushNotification)
  async sendPushNotification(
    @Args('input') input: SendPushNotificationInput,
    @CurrentUser() user: User,
  ): Promise<MobilePushNotification> {
    return this.mobileAppService.sendPushNotification(input, user.id);
  }

  @Mutation(() => Boolean)
  async deletePushNotification(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.mobileAppService.deletePushNotification(id, user.id);
  }

  // ========== SEED ==========

  @Mutation(() => Boolean)
  async seedMobileApps(@CurrentUser() user: User): Promise<boolean> {
    await this.mobileAppService.seedMobileApps(user.id);
    return true;
  }
}
