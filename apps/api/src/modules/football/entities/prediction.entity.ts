import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TacticalAnalysis } from './tactical-analysis.entity';

@ObjectType()
@Entity('predictions')
export class Prediction {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  predictionType: string; // micro (3-10s), sequence, outcome, player-performance, substitution

  @Field(() => Float)
  @Column({ type: 'float' })
  timeHorizon: number; // seconds ahead

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  currentTimestamp?: number; // when prediction was made

  @Field(() => Float)
  @Column({ type: 'float' })
  confidence: number; // 0-100

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  prediction?: string; // text description

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  predictedSequence?: Array<{
    timestamp: number;
    action: string;
    playerId?: string;
    team?: string;
    location?: { x: number; y: number };
    probability?: number;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  predictedOutcomes?: Array<{
    outcome: string; // goal, shot, turnover, counter-attack, etc.
    probability: number; // 0-100
    expectedValue?: number; // xG, xA, etc.
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  playerPredictions?: Array<{
    playerId: string;
    prediction: string; // fatigue, injury-risk, performance-drop, etc.
    probability: number;
    severity?: number;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  risks?: Array<{
    type: string;
    probability: number;
    impact: number; // 0-100
    description: string;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  opportunities?: Array<{
    type: string;
    probability: number;
    potential: number; // 0-100
    description: string;
    suggestedAction?: string;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  modelInfo?: {
    modelType?: string; // GNN, transformer, LSTM, rule-based
    features?: Array<string>;
    version?: string;
  };

  @Field({ nullable: true })
  @Column({ nullable: true })
  verified?: boolean; // was the prediction correct?

  @Field({ nullable: true })
  @Column({ type: 'float', nullable: true })
  actualOutcome?: number; // actual result for verification

  // Relations
  @Field(() => TacticalAnalysis)
  @ManyToOne(() => TacticalAnalysis, (analysis) => analysis.predictions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'analysisId' })
  analysis: TacticalAnalysis;

  @Column()
  analysisId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
