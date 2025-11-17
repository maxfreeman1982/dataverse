import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Team } from './team.entity';
import { TrackingData } from './tracking-data.entity';
import { MatchEvent } from './match-event.entity';
import { TacticalAnalysis } from './tactical-analysis.entity';
import { MatchReport } from './match-report.entity';

@ObjectType()
@Entity('matches')
export class Match {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  date: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  venue?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  competition?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  season?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  matchday?: string;

  @Field()
  @Column({ default: 'scheduled' })
  status: string; // scheduled, live, half-time, finished, postponed

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  homeScore?: number;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  awayScore?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  homeFormation?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  awayFormation?: string;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  environment?: {
    temperature?: number; // Celsius
    humidity?: number; // %
    windSpeed?: number; // km/h
    weather?: string; // sunny, rainy, cloudy, etc.
    altitude?: number; // meters
    pitchCondition?: string; // excellent, good, fair, poor
    pitchType?: string; // natural, artificial, hybrid
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  statistics?: {
    possession?: { home: number; away: number };
    shots?: { home: number; away: number };
    shotsOnTarget?: { home: number; away: number };
    corners?: { home: number; away: number };
    fouls?: { home: number; away: number };
    yellowCards?: { home: number; away: number };
    redCards?: { home: number; away: number };
    offsides?: { home: number; away: number };
    passes?: { home: number; away: number };
    passAccuracy?: { home: number; away: number };
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  lineup?: {
    home?: Array<{ playerId: string; position: string; number: number }>;
    away?: Array<{ playerId: string; position: string; number: number }>;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  substitutions?: Array<{
    team: string;
    playerIn: string;
    playerOut: string;
    minute: number;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  videoUrl?: string;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  videoFrames?: Array<{
    timestamp: number;
    frameUrl: string;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  coachGoals?: string; // Instructions from staff

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relations
  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Field(() => Team)
  @ManyToOne(() => Team, (team) => team.homeMatches)
  @JoinColumn({ name: 'homeTeamId' })
  homeTeam: Team;

  @Column()
  homeTeamId: string;

  @Field(() => Team)
  @ManyToOne(() => Team, (team) => team.awayMatches)
  @JoinColumn({ name: 'awayTeamId' })
  awayTeam: Team;

  @Column()
  awayTeamId: string;

  @Field(() => [TrackingData], { nullable: true })
  @OneToMany(() => TrackingData, (tracking) => tracking.match, { cascade: true })
  trackingData?: TrackingData[];

  @Field(() => [MatchEvent], { nullable: true })
  @OneToMany(() => MatchEvent, (event) => event.match, { cascade: true })
  events?: MatchEvent[];

  @Field(() => [TacticalAnalysis], { nullable: true })
  @OneToMany(() => TacticalAnalysis, (analysis) => analysis.match, {
    cascade: true,
  })
  analyses?: TacticalAnalysis[];

  @Field(() => MatchReport, { nullable: true })
  @OneToMany(() => MatchReport, (report) => report.match, { cascade: true })
  reports?: MatchReport[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
