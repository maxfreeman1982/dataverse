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
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../../users/user.entity';
import { Channel } from '../../chat/entities/channel.entity';
import { VideoCallParticipant } from './video-call-participant.entity';

export enum CallStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  ENDED = 'ended',
}

registerEnumType(CallStatus, {
  name: 'CallStatus',
});

@ObjectType()
@Entity('video_calls')
export class VideoCall {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field(() => CallStatus)
  @Column({
    type: 'simple-enum',
    enum: CallStatus,
    default: CallStatus.WAITING,
  })
  status: CallStatus;

  @Field({ nullable: true })
  @Column({ name: 'channel_id', nullable: true })
  channelId?: string;

  @Field(() => Channel, { nullable: true })
  @ManyToOne(() => Channel, { nullable: true })
  @JoinColumn({ name: 'channel_id' })
  channel?: Channel;

  @Field()
  @Column({ name: 'started_by_id' })
  startedById: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'started_by_id' })
  startedBy: User;

  @Field(() => [VideoCallParticipant], { nullable: true })
  @OneToMany(() => VideoCallParticipant, (participant) => participant.call, {
    cascade: true,
  })
  participants?: VideoCallParticipant[];

  @Field()
  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Field({ nullable: true })
  @Column({ name: 'ended_at', nullable: true })
  endedAt?: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
