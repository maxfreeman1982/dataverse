import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../auth/entities/user.entity';
import { VideoCall } from './video-call.entity';

@ObjectType()
@Entity('video_call_participants')
export class VideoCallParticipant {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'call_id' })
  callId: string;

  @Field(() => VideoCall)
  @ManyToOne(() => VideoCall, (call) => call.participants)
  @JoinColumn({ name: 'call_id' })
  call: VideoCall;

  @Field()
  @Column({ name: 'user_id' })
  userId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @Column({ default: true, name: 'is_audio_enabled' })
  isAudioEnabled: boolean;

  @Field()
  @Column({ default: true, name: 'is_video_enabled' })
  isVideoEnabled: boolean;

  @Field()
  @Column({ default: false, name: 'is_screen_sharing' })
  isScreenSharing: boolean;

  @Field()
  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @Field({ nullable: true })
  @Column({ name: 'left_at', nullable: true })
  leftAt?: Date;
}
