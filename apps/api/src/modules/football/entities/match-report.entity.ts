import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Match } from './match.entity';

@ObjectType()
@Entity('match_reports')
export class MatchReport {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  reportType: string; // executive-summary, tactical-deep-dive, coaching-recommendations, opponent-analysis

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  executiveSummary?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  tacticalAnalysisDeep?: string;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  patternsDetected?: {
    offensive?: Array<any>;
    defensive?: Array<any>;
    transition?: Array<any>;
  };

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  spatioTemporalAnalysis?: string;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  predictionModel?: {
    microPredictions?: Array<any>;
    sequencePredictions?: Array<any>;
    probableScenarios?: Array<any>;
  };

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  opponentProfile?: string;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  weaknessesExploitable?: Array<{
    weakness: string;
    severity: number;
    exploitationStrategy: string;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  risksAndDangerZones?: Array<{
    risk: string;
    probability: number;
    mitigation: string;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  coachingRecommendationsLive?: string;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  intelligentSubstitutions?: Array<{
    playerOut: string;
    playerIn: string;
    reason: string;
    expectedImpact: string;
    optimalTiming?: number; // minute
  }>;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  trainingPlanGenerated?: string;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  setPieceProposals?: Array<{
    type: string;
    situation: string;
    strategy: string;
    expectedEffectiveness: number;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  crossSportInnovation?: Array<{
    sport: string;
    concept: string;
    application: string;
    expectedBenefit: string;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  syntheticReportForStaff?: string;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  keyMetrics?: {
    offensiveEfficiency?: number;
    defensiveStrength?: number;
    transitionQuality?: number;
    setPieceEffectiveness?: number;
    individualPerformances?: Array<{
      playerId: string;
      rating: number;
      highlights: string;
    }>;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  aiModelInfo?: {
    modelUsed?: string; // OpenAI, Claude, custom
    promptVersion?: string;
    processingTime?: number; // seconds
    confidence?: number;
  };

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  rawAIOutput?: string; // full AI response for reference

  // Relations
  @Field(() => Match)
  @ManyToOne(() => Match, (match) => match.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @Column()
  matchId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
