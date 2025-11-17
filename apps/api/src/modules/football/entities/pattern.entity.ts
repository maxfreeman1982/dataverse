import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
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
@Entity('patterns')
export class Pattern {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  type: string; // offensive, defensive, transition, set-piece

  @Field()
  @Column()
  category: string; // passing-sequence, press-trap, overload, counter-attack, build-up, etc.

  @Field()
  @Column()
  name: string; // descriptive name

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => Float)
  @Column({ type: 'float' })
  frequency: number; // how often this pattern occurs

  @Field(() => Float)
  @Column({ type: 'float' })
  successRate: number; // 0-100

  @Field(() => Float)
  @Column({ type: 'float' })
  effectiveness: number; // 0-100

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  support?: number; // number of occurrences

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  sequence?: Array<{
    step: number;
    action: string;
    playerId?: string;
    location?: { x: number; y: number };
    timestamp?: number;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  players?: Array<{
    playerId: string;
    role: string;
    frequency: number;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  zones?: Array<string>; // zones where this pattern occurs

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  triggers?: Array<string>; // what triggers this pattern

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  outcomes?: {
    shot?: number;
    goal?: number;
    assist?: number;
    turnover?: number;
    other?: number;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  counterMeasures?: Array<{
    suggestion: string;
    effectiveness: number;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  visualRepresentation?: {
    asciiDiagram?: string;
    coordinates?: Array<{ x: number; y: number; label: string }>;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  crossSportAnalogy?: {
    sport: string; // basketball, rugby, handball, nfl
    pattern: string;
    explanation: string;
  };

  // Relations
  @Field(() => TacticalAnalysis)
  @ManyToOne(() => TacticalAnalysis, (analysis) => analysis.patterns, {
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
