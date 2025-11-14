import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { User } from '../../auth/entities/user.entity';
import { EmailThread } from './email-thread.entity';

export enum EmailStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  RECEIVED = 'received',
  ARCHIVED = 'archived',
}

export enum EmailFolder {
  INBOX = 'inbox',
  SENT = 'sent',
  DRAFTS = 'drafts',
  TRASH = 'trash',
  SPAM = 'spam',
  ARCHIVE = 'archive',
}

export enum EmailPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

registerEnumType(EmailStatus, {
  name: 'EmailStatus',
});

registerEnumType(EmailFolder, {
  name: 'EmailFolder',
});

registerEnumType(EmailPriority, {
  name: 'EmailPriority',
});

@ObjectType()
@Entity('emails')
export class Email {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'user_id' })
  userId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field({ nullable: true })
  @Column({ name: 'thread_id', nullable: true })
  threadId?: string;

  @Field(() => EmailThread, { nullable: true })
  @ManyToOne(() => EmailThread, (thread) => thread.emails, { nullable: true })
  @JoinColumn({ name: 'thread_id' })
  thread?: EmailThread;

  @Field()
  @Column({ name: 'from_address' })
  fromAddress: string;

  @Field()
  @Column({ name: 'from_name', nullable: true })
  fromName?: string;

  @Field(() => [String])
  @Column({ type: 'jsonb', name: 'to_addresses' })
  toAddresses: string[];

  @Field(() => [String], { nullable: true })
  @Column({ type: 'jsonb', name: 'cc_addresses', nullable: true })
  ccAddresses?: string[];

  @Field(() => [String], { nullable: true })
  @Column({ type: 'jsonb', name: 'bcc_addresses', nullable: true })
  bccAddresses?: string[];

  @Field()
  @Column()
  subject: string;

  @Field()
  @Column({ type: 'text' })
  body: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'html_body' })
  htmlBody?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  attachments?: Array<{
    name: string;
    size: number;
    mimeType: string;
    url: string;
  }>;

  @Field(() => EmailStatus)
  @Column({
    type: 'simple-enum',
    enum: EmailStatus,
    default: EmailStatus.DRAFT,
  })
  status: EmailStatus;

  @Field(() => EmailFolder)
  @Column({
    type: 'simple-enum',
    enum: EmailFolder,
    default: EmailFolder.INBOX,
  })
  folder: EmailFolder;

  @Field(() => EmailPriority)
  @Column({
    type: 'simple-enum',
    enum: EmailPriority,
    default: EmailPriority.NORMAL,
  })
  priority: EmailPriority;

  @Field()
  @Column({ default: false, name: 'is_read' })
  isRead: boolean;

  @Field()
  @Column({ default: false, name: 'is_starred' })
  isStarred: boolean;

  @Field()
  @Column({ default: false, name: 'is_important' })
  isImportant: boolean;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  labels?: string[];

  // AI-generated fields
  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'ai_summary' })
  aiSummary?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'ai_category' })
  aiCategory?: string;

  @Field({ nullable: true })
  @Column({ type: 'float', nullable: true, name: 'ai_sentiment_score' })
  aiSentimentScore?: number;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'jsonb', nullable: true, name: 'ai_suggested_replies' })
  aiSuggestedReplies?: string[];

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'sent_at' })
  sentAt?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'received_at' })
  receivedAt?: Date;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
