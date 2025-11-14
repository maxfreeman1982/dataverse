import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { AIConversation } from './ai-conversation.entity';
import { User } from '../../users/user.entity';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

@ObjectType()
@Entity('ai_messages')
export class AIMessage {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id' })
  conversationId: string;

  @Field(() => AIConversation)
  @ManyToOne(() => AIConversation)
  @JoinColumn({ name: 'conversation_id' })
  conversation: AIConversation;

  @Column({ name: 'user_id' })
  userId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @Column({
    type: 'simple-enum',
    enum: MessageRole,
  })
  role: MessageRole;

  @Field()
  @Column({ type: 'text' })
  content: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'jsonb', nullable: true, name: 'retrieved_docs' })
  retrievedDocs?: string[];

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, name: 'token_count' })
  tokenCount?: number;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
