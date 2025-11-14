import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../../users/user.entity';
import { Message } from './message.entity';

export enum ChannelType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  DIRECT = 'direct',
}

registerEnumType(ChannelType, {
  name: 'ChannelType',
});

@ObjectType()
@Entity('channels')
export class Channel {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => ChannelType)
  @Column({
    type: 'simple-enum',
    enum: ChannelType,
    default: ChannelType.PUBLIC,
  })
  type: ChannelType;

  @Field({ nullable: true })
  @Column({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'cover_image' })
  coverImage?: string;

  @Field(() => Boolean)
  @Column({ default: false, name: 'is_archived' })
  isArchived: boolean;

  @Column({ name: 'created_by' })
  createdById: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Field(() => [User], { nullable: true })
  @ManyToMany(() => User)
  @JoinTable({
    name: 'channel_members',
    joinColumn: { name: 'channel_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  members?: User[];

  @Field(() => [Message], { nullable: true })
  @OneToMany(() => Message, (message) => message.channel)
  messages?: Message[];

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'last_message_at' })
  lastMessageAt?: Date;
}
