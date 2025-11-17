import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Match } from './match.entity';

@ObjectType()
@Entity('tracking_data')
@Index(['matchId', 'timestamp'])
export class TrackingData {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Float)
  @Column({ type: 'float' })
  timestamp: number; // seconds from match start

  @Field(() => Int)
  @Column({ type: 'int' })
  frame: number; // frame number

  @Field({ nullable: true })
  @Column({ nullable: true })
  period?: string; // first-half, second-half, extra-time-1, extra-time-2

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  ball?: {
    x: number; // meters from center (0,0)
    y: number; // meters from center
    z?: number; // height in meters
    speed?: number; // m/s
    possession?: string; // home, away, none
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  players?: Array<{
    playerId: string;
    team: string; // home or away
    x: number; // meters
    y: number; // meters
    speed?: number; // m/s
    acceleration?: number; // m/s²
    direction?: number; // degrees 0-360
    heartRate?: number; // bpm
    distance?: number; // total distance covered in meters
    sprints?: number; // number of sprints
    highIntensityRuns?: number;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  derived?: {
    pitch?: {
      length: number; // meters (typically 105)
      width: number; // meters (typically 68)
    };
    possession?: string; // home, away
    pressure?: {
      home: number; // 0-100
      away: number;
    };
    compactness?: {
      home: number; // team compactness
      away: number;
    };
    defensiveLine?: {
      home: number; // y position of defensive line
      away: number;
    };
  };

  // Relations
  @Field(() => Match)
  @ManyToOne(() => Match, (match) => match.trackingData, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @Column()
  matchId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
