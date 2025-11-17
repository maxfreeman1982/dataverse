import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
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
import { Match } from './match.entity';
import { Pattern } from './pattern.entity';
import { Prediction } from './prediction.entity';

@ObjectType()
@Entity('tactical_analyses')
export class TacticalAnalysis {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  analysisType: string; // pre-match, live, post-match, opponent-scouting

  @Field({ nullable: true })
  @Column({ type: 'float', nullable: true })
  timestamp?: number; // for live analysis

  @Field({ nullable: true })
  @Column({ nullable: true })
  phase?: string; // build-up, defensive-block, transition, set-piece, counter-attack

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  spatialAnalysis?: {
    zones?: Array<{
      zone: string; // defensive-third, middle-third, attacking-third, left, center, right
      occupation?: { home: number; away: number }; // percentage
      effectiveness?: number;
    }>;
    heatMaps?: {
      home?: Array<{ playerId: string; zones: Record<string, number> }>;
      away?: Array<{ playerId: string; zones: Record<string, number> }>;
    };
    pressing?: {
      intensity?: { home: number; away: number };
      zones?: Array<string>;
      triggers?: Array<string>;
    };
    spaceControl?: {
      home?: number; // percentage of pitch controlled
      away?: number;
    };
    defensiveLine?: {
      home?: { average: number; variance: number };
      away?: { average: number; variance: number };
    };
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  offensiveAnalysis?: {
    buildUpStyle?: string; // short-passing, long-balls, wing-play, through-center
    attackingWidth?: number; // meters
    progressionSpeed?: string; // slow, medium, fast
    keyPlayers?: Array<{
      playerId: string;
      role: string;
      impact: number; // 0-100
    }>;
    creationZones?: Array<string>;
    shootingZones?: Array<string>;
    crossingFrequency?: number;
    throughBallsAttempted?: number;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  defensiveAnalysis?: {
    blockHeight?: string; // high, medium, low
    blockCompactness?: number; // meters between lines
    pressingIntensity?: number; // 0-100
    pressingTriggers?: Array<string>;
    counterPressingEffectiveness?: number;
    recoverySpeed?: number;
    weakZones?: Array<string>;
    vulnerabilities?: Array<{
      type: string;
      severity: number; // 0-100
      description: string;
    }>;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  transitionAnalysis?: {
    offensiveTransition?: {
      speed?: number; // seconds
      playerInvolvement?: number;
      successRate?: number;
    };
    defensiveTransition?: {
      recoverySpeed?: number;
      counterPressingEffectiveness?: number;
      regainHeight?: number; // average y position
    };
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  risks?: Array<{
    type: string;
    severity: number; // 0-100
    description: string;
    timeWindow?: number; // next X seconds
    affectedPlayers?: Array<string>;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  opportunities?: Array<{
    type: string;
    potential: number; // 0-100
    description: string;
    suggestedAction?: string;
    targetPlayers?: Array<string>;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  recommendations?: string;

  // Relations
  @Field(() => Match)
  @ManyToOne(() => Match, (match) => match.analyses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @Column()
  matchId: string;

  @Field(() => [Pattern], { nullable: true })
  @OneToMany(() => Pattern, (pattern) => pattern.analysis, { cascade: true })
  patterns?: Pattern[];

  @Field(() => [Prediction], { nullable: true })
  @OneToMany(() => Prediction, (prediction) => prediction.analysis, {
    cascade: true,
  })
  predictions?: Prediction[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
