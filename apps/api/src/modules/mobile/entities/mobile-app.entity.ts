import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../../users/user.entity';
import { MobileAppBuild } from './mobile-app-build.entity';

export enum MobilePlatform {
  IOS = 'ios',
  ANDROID = 'android',
  BOTH = 'both',
}

export enum AppStatus {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  PRODUCTION = 'production',
  ARCHIVED = 'archived',
}

export enum AppCategory {
  BUSINESS = 'business',
  PRODUCTIVITY = 'productivity',
  SOCIAL = 'social',
  ENTERTAINMENT = 'entertainment',
  UTILITIES = 'utilities',
  EDUCATION = 'education',
  HEALTH = 'health',
  FINANCE = 'finance',
  OTHER = 'other',
}

registerEnumType(MobilePlatform, {
  name: 'MobilePlatform',
});

registerEnumType(AppStatus, {
  name: 'AppStatus',
});

registerEnumType(AppCategory, {
  name: 'AppCategory',
});

@ObjectType()
@Entity('mobile_apps')
export class MobileApp {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  slug: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => MobilePlatform)
  @Column({
    type: 'simple-enum',
    enum: MobilePlatform,
    default: MobilePlatform.BOTH,
  })
  platform: MobilePlatform;

  @Field(() => AppStatus)
  @Column({
    type: 'simple-enum',
    enum: AppStatus,
    default: AppStatus.DEVELOPMENT,
  })
  status: AppStatus;

  @Field(() => AppCategory)
  @Column({
    type: 'simple-enum',
    enum: AppCategory,
    default: AppCategory.BUSINESS,
  })
  category: AppCategory;

  @Field()
  @Column({ name: 'current_version', default: '1.0.0' })
  currentVersion: string;

  @Field()
  @Column({ name: 'current_build_number', default: 1 })
  currentBuildNumber: number;

  // iOS specific
  @Field({ nullable: true })
  @Column({ nullable: true, name: 'bundle_id' })
  bundleId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'app_store_url' })
  appStoreUrl?: string;

  // Android specific
  @Field({ nullable: true })
  @Column({ nullable: true, name: 'package_name' })
  packageName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'play_store_url' })
  playStoreUrl?: string;

  // App icons and assets
  @Field({ nullable: true })
  @Column({ nullable: true, name: 'icon_url' })
  iconUrl?: string;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  screenshots?: string[];

  // Push notifications
  @Field({ nullable: true })
  @Column({ nullable: true, name: 'fcm_server_key' })
  fcmServerKey?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'apns_certificate' })
  apnsCertificate?: string;

  // Analytics
  @Field()
  @Column({ default: 0, name: 'total_downloads' })
  totalDownloads: number;

  @Field()
  @Column({ default: 0, name: 'active_users' })
  activeUsers: number;

  @Field({ nullable: true })
  @Column({ type: 'float', nullable: true, name: 'average_rating' })
  averageRating?: number;

  @Field()
  @Column({ default: 0, name: 'review_count' })
  reviewCount: number;

  // Configuration
  @Field()
  @Column({ default: true, name: 'is_push_enabled' })
  isPushEnabled: boolean;

  @Field()
  @Column({ default: false, name: 'is_offline_enabled' })
  isOfflineEnabled: boolean;

  @Field()
  @Column({ default: false, name: 'is_published' })
  isPublished: boolean;

  // Relationships
  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @Field(() => [MobileAppBuild], { nullable: true })
  @OneToMany(() => MobileAppBuild, (build) => build.app)
  builds?: MobileAppBuild[];

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true, name: 'published_at' })
  publishedAt?: Date;
}
