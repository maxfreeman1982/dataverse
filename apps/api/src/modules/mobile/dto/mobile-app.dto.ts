import { InputType, Field, ID, Int, PartialType } from '@nestjs/graphql';
import {
  MobilePlatform,
  AppStatus,
  AppCategory,
} from '../entities/mobile-app.entity';
import {
  BuildStatus,
  BuildType,
} from '../entities/mobile-app-build.entity';
import {
  NotificationStatus,
  NotificationPriority,
  NotificationTarget,
} from '../entities/mobile-push-notification.entity';

// ========== MOBILE APP ==========

@InputType()
export class CreateMobileAppInput {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => MobilePlatform)
  platform: MobilePlatform;

  @Field(() => AppCategory)
  category: AppCategory;

  @Field({ nullable: true })
  bundleId?: string;

  @Field({ nullable: true })
  packageName?: string;

  @Field({ nullable: true })
  iconUrl?: string;
}

@InputType()
export class UpdateMobileAppInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => AppStatus, { nullable: true })
  status?: AppStatus;

  @Field(() => AppCategory, { nullable: true })
  category?: AppCategory;

  @Field({ nullable: true })
  currentVersion?: string;

  @Field(() => Int, { nullable: true })
  currentBuildNumber?: number;

  @Field({ nullable: true })
  bundleId?: string;

  @Field({ nullable: true })
  packageName?: string;

  @Field({ nullable: true })
  appStoreUrl?: string;

  @Field({ nullable: true })
  playStoreUrl?: string;

  @Field({ nullable: true })
  iconUrl?: string;

  @Field(() => [String], { nullable: true })
  screenshots?: string[];

  @Field({ nullable: true })
  fcmServerKey?: string;

  @Field({ nullable: true })
  apnsCertificate?: string;

  @Field({ nullable: true })
  isPushEnabled?: boolean;

  @Field({ nullable: true })
  isOfflineEnabled?: boolean;
}

@InputType()
export class GetMobileAppsInput {
  @Field(() => MobilePlatform, { nullable: true })
  platform?: MobilePlatform;

  @Field(() => AppStatus, { nullable: true })
  status?: AppStatus;

  @Field(() => AppCategory, { nullable: true })
  category?: AppCategory;

  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  isPublished?: boolean;
}

// ========== MOBILE APP BUILD ==========

@InputType()
export class CreateBuildInput {
  @Field(() => ID)
  appId: string;

  @Field()
  version: string;

  @Field(() => Int)
  buildNumber: number;

  @Field(() => BuildType)
  type: BuildType;

  @Field({ nullable: true })
  releaseNotes?: string;

  @Field({ nullable: true })
  changelog?: string;

  @Field({ nullable: true })
  commitHash?: string;

  @Field({ nullable: true })
  branchName?: string;

  @Field({ nullable: true })
  isMandatoryUpdate?: boolean;

  @Field({ nullable: true })
  isBeta?: boolean;
}

@InputType()
export class UpdateBuildInput {
  @Field(() => ID)
  id: string;

  @Field(() => BuildStatus, { nullable: true })
  status?: BuildStatus;

  @Field({ nullable: true })
  releaseNotes?: string;

  @Field({ nullable: true })
  changelog?: string;

  @Field({ nullable: true })
  iosBuildUrl?: string;

  @Field({ nullable: true })
  androidBuildUrl?: string;

  @Field({ nullable: true })
  buildLogUrl?: string;

  @Field(() => Int, { nullable: true })
  buildDuration?: number;

  @Field({ nullable: true })
  errorMessage?: string;
}

@InputType()
export class GetBuildsInput {
  @Field(() => ID)
  appId: string;

  @Field(() => BuildStatus, { nullable: true })
  status?: BuildStatus;

  @Field(() => BuildType, { nullable: true })
  type?: BuildType;

  @Field({ nullable: true })
  version?: string;
}

// ========== PUSH NOTIFICATION ==========

@InputType()
export class CreatePushNotificationInput {
  @Field(() => ID)
  appId: string;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field(() => NotificationPriority, { nullable: true })
  priority?: NotificationPriority;

  @Field(() => NotificationTarget, { nullable: true })
  target?: NotificationTarget;

  @Field(() => [String], { nullable: true })
  targetUserIds?: string[];

  @Field(() => [String], { nullable: true })
  targetSegments?: string[];

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  deepLink?: string;

  @Field({ nullable: true })
  scheduledAt?: Date;

  @Field({ nullable: true })
  sendToIos?: boolean;

  @Field({ nullable: true })
  sendToAndroid?: boolean;

  @Field({ nullable: true })
  sound?: string;

  @Field({ nullable: true })
  isSilent?: boolean;
}

@InputType()
export class UpdatePushNotificationInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  message?: string;

  @Field(() => NotificationStatus, { nullable: true })
  status?: NotificationStatus;

  @Field(() => NotificationPriority, { nullable: true })
  priority?: NotificationPriority;

  @Field({ nullable: true })
  scheduledAt?: Date;
}

@InputType()
export class SendPushNotificationInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  sendImmediately?: boolean;
}

@InputType()
export class GetPushNotificationsInput {
  @Field(() => ID)
  appId: string;

  @Field(() => NotificationStatus, { nullable: true })
  status?: NotificationStatus;

  @Field(() => NotificationTarget, { nullable: true })
  target?: NotificationTarget;
}
