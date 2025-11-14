import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { MobileApp } from './mobile-app.entity';
import { User } from '../../auth/entities/user.entity';

export enum NotificationStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

export enum NotificationTarget {
  ALL_USERS = 'all_users',
  SPECIFIC_USERS = 'specific_users',
  SEGMENTS = 'segments',
  TEST_USERS = 'test_users',
}

registerEnumType(NotificationStatus, {
  name: 'NotificationStatus',
});

registerEnumType(NotificationPriority, {
  name: 'NotificationPriority',
});

registerEnumType(NotificationTarget, {
  name: 'NotificationTarget',
});

@ObjectType()
@Entity('mobile_push_notifications')
export class MobilePushNotification {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column({ type: 'text' })
  message: string;

  @Field(() => NotificationStatus)
  @Column({
    type: 'simple-enum',
    enum: NotificationStatus,
    default: NotificationStatus.DRAFT,
  })
  status: NotificationStatus;

  @Field(() => NotificationPriority)
  @Column({
    type: 'simple-enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Field(() => NotificationTarget)
  @Column({
    type: 'simple-enum',
    enum: NotificationTarget,
    default: NotificationTarget.ALL_USERS,
  })
  target: NotificationTarget;

  // Targeting
  @Field(() => [String], { nullable: true })
  @Column({ type: 'jsonb', nullable: true, name: 'target_user_ids' })
  targetUserIds?: string[];

  @Field(() => [String], { nullable: true })
  @Column({ type: 'jsonb', nullable: true, name: 'target_segments' })
  targetSegments?: string[];

  // Content
  @Field({ nullable: true })
  @Column({ nullable: true, name: 'image_url' })
  imageUrl?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'icon_url' })
  iconUrl?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'deep_link' })
  deepLink?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, any>; // Custom data payload

  // Scheduling
  @Field({ nullable: true })
  @Column({ type: 'datetime', nullable: true, name: 'scheduled_at' })
  scheduledAt?: Date;

  @Field({ nullable: true })
  @Column({ type: 'datetime', nullable: true, name: 'sent_at' })
  sentAt?: Date;

  // Statistics
  @Field(() => Int)
  @Column({ default: 0, name: 'total_recipients' })
  totalRecipients: number;

  @Field(() => Int)
  @Column({ default: 0, name: 'delivered_count' })
  deliveredCount: number;

  @Field(() => Int)
  @Column({ default: 0, name: 'opened_count' })
  openedCount: number;

  @Field(() => Int)
  @Column({ default: 0, name: 'clicked_count' })
  clickedCount: number;

  @Field(() => Int)
  @Column({ default: 0, name: 'failed_count' })
  failedCount: number;

  // Platform specific
  @Field()
  @Column({ default: true, name: 'send_to_ios' })
  sendToIos: boolean;

  @Field()
  @Column({ default: true, name: 'send_to_android' })
  sendToAndroid: boolean;

  // Advanced options
  @Field()
  @Column({ default: 3600, name: 'ttl_seconds' })
  ttlSeconds: number; // Time to live

  @Field({ nullable: true })
  @Column({ nullable: true })
  sound?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  badge?: string;

  @Field()
  @Column({ default: false, name: 'is_silent' })
  isSilent: boolean;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage?: string;

  // Relationships
  @Field(() => MobileApp)
  @ManyToOne(() => MobileApp, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  app: MobileApp;

  @Column({ name: 'app_id' })
  appId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id' })
  createdById: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
