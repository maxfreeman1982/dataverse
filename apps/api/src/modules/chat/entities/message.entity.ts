import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { User } from '../../users/user.entity';
import { Channel } from './channel.entity';

@ObjectType()
@Entity('messages')
export class Message {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'channel_id' })
  channelId: string;

  @Field(() => Channel)
  @ManyToOne(() => Channel, (channel) => channel.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @Column({ name: 'user_id' })
  userId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @Column({ type: 'text' })
  content: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  attachments?: Record<string, any>[];

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  mentions?: Record<string, any>[];

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  reactions?: Record<string, any>;

  @Field({ nullable: true })
  @Column({ name: 'reply_to_id', nullable: true })
  replyToId?: string;

  @Field(() => Message, { nullable: true })
  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'reply_to_id' })
  replyTo?: Message;

  @Field(() => Boolean)
  @Column({ default: false, name: 'is_edited' })
  isEdited: boolean;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
