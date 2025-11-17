import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { User } from '../../users/user.entity';
import { PluginInstallation } from './plugin-installation.entity';
import { PluginReview } from './plugin-review.entity';

export enum PluginStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  DEPRECATED = 'deprecated',
  SUSPENDED = 'suspended',
}

export enum PluginCategory {
  PRODUCTIVITY = 'productivity',
  COMMUNICATION = 'communication',
  ANALYTICS = 'analytics',
  AUTOMATION = 'automation',
  AI_ML = 'ai_ml',
  INTEGRATION = 'integration',
  UTILITIES = 'utilities',
  DESIGN = 'design',
  OTHER = 'other',
}

registerEnumType(PluginStatus, {
  name: 'PluginStatus',
});

registerEnumType(PluginCategory, {
  name: 'PluginCategory',
});

@ObjectType()
@Entity('plugins')
export class Plugin {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field()
  @Column({ type: 'text' })
  description: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'long_description' })
  longDescription?: string;

  @Field()
  @Column()
  version: string;

  @Field()
  @Column()
  author: string;

  @Field()
  @Column({ name: 'author_id' })
  authorId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  authorUser: User;

  @Field(() => PluginCategory)
  @Column({
    type: 'simple-enum',
    enum: PluginCategory,
    default: PluginCategory.OTHER,
  })
  category: PluginCategory;

  @Field(() => PluginStatus)
  @Column({
    type: 'simple-enum',
    enum: PluginStatus,
    default: PluginStatus.DRAFT,
  })
  status: PluginStatus;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'icon_url' })
  iconUrl?: string;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  screenshots?: string[];

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  tags?: string[];

  @Field()
  @Column({ name: 'download_url' })
  downloadUrl: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'homepage_url' })
  homepageUrl?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'documentation_url' })
  documentationUrl?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'repository_url' })
  repositoryUrl?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  permissions?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  config?: Record<string, any>;

  @Field(() => Float)
  @Column({ type: 'float', default: 0, name: 'average_rating' })
  averageRating: number;

  @Field(() => Int)
  @Column({ default: 0, name: 'review_count' })
  reviewCount: number;

  @Field(() => Int)
  @Column({ default: 0, name: 'download_count' })
  downloadCount: number;

  @Field(() => Int)
  @Column({ default: 0, name: 'install_count' })
  installCount: number;

  @Field()
  @Column({ default: false, name: 'is_featured' })
  isFeatured: boolean;

  @Field()
  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  @Field(() => [PluginInstallation], { nullable: true })
  @OneToMany(() => PluginInstallation, (installation) => installation.plugin)
  installations?: PluginInstallation[];

  @Field(() => [PluginReview], { nullable: true })
  @OneToMany(() => PluginReview, (review) => review.plugin)
  reviews?: PluginReview[];

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'published_at' })
  publishedAt?: Date;
}
