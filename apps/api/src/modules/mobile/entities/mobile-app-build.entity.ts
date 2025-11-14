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
import { MobileApp } from './mobile-app.entity';
import { User } from '../../auth/entities/user.entity';

export enum BuildStatus {
  PENDING = 'pending',
  BUILDING = 'building',
  SUCCESS = 'success',
  FAILED = 'failed',
  UPLOADED = 'uploaded',
  PUBLISHED = 'published',
}

export enum BuildType {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

registerEnumType(BuildStatus, {
  name: 'BuildStatus',
});

registerEnumType(BuildType, {
  name: 'BuildType',
});

@ObjectType()
@Entity('mobile_app_builds')
export class MobileAppBuild {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  version: string;

  @Field(() => Int)
  @Column({ name: 'build_number' })
  buildNumber: number;

  @Field(() => BuildStatus)
  @Column({
    type: 'enum',
    enum: BuildStatus,
    default: BuildStatus.PENDING,
  })
  status: BuildStatus;

  @Field(() => BuildType)
  @Column({
    type: 'enum',
    enum: BuildType,
    default: BuildType.DEVELOPMENT,
  })
  type: BuildType;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'release_notes' })
  releaseNotes?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'changelog' })
  changelog?: string;

  // Build artifacts
  @Field({ nullable: true })
  @Column({ nullable: true, name: 'ios_build_url' })
  iosBuildUrl?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'android_build_url' })
  androidBuildUrl?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'build_log_url' })
  buildLogUrl?: string;

  // Build metadata
  @Field({ nullable: true })
  @Column({ nullable: true, name: 'commit_hash' })
  commitHash?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'branch_name' })
  branchName?: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, name: 'build_duration' })
  buildDuration?: number; // in seconds

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage?: string;

  // Statistics
  @Field(() => Int)
  @Column({ default: 0, name: 'download_count' })
  downloadCount: number;

  @Field(() => Int)
  @Column({ default: 0, name: 'install_count' })
  installCount: number;

  @Field(() => Int)
  @Column({ default: 0, name: 'crash_count' })
  crashCount: number;

  // Flags
  @Field()
  @Column({ default: false, name: 'is_mandatory_update' })
  isMandatoryUpdate: boolean;

  @Field()
  @Column({ default: false, name: 'is_beta' })
  isBeta: boolean;

  // Relationships
  @Field(() => MobileApp)
  @ManyToOne(() => MobileApp, (app) => app.builds, { onDelete: 'CASCADE' })
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

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true, name: 'started_at' })
  startedAt?: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt?: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true, name: 'published_at' })
  publishedAt?: Date;
}
