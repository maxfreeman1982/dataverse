import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Team } from './team.entity';

@ObjectType()
@Entity('training_plans')
export class TrainingPlan {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field()
  @Column()
  targetDate: Date;

  @Field(() => Int)
  @Column({ type: 'int' })
  duration: number; // minutes

  @Field()
  @Column()
  focus: string; // tactical, technical, physical, set-pieces, recovery

  @Field({ nullable: true })
  @Column({ nullable: true })
  difficulty?: string; // low, medium, high, elite

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  objectives?: Array<{
    objective: string;
    priority: string; // high, medium, low
    metrics?: string;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  weaknesses?: Array<{
    area: string;
    severity: number;
    targetedExercises?: Array<string>;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  exercises?: Array<{
    name: string;
    type: string; // drill, rondo, scrimmage, conditioning, video-analysis
    duration: number; // minutes
    intensity: string; // low, medium, high
    description: string;
    setup?: string;
    coaching points?: Array<string>;
    variations?: Array<string>;
    equipment?: Array<string>;
    playersCount?: number;
    spaceRequired?: string; // half-pitch, full-pitch, small-area
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  warmUp?: {
    duration: number;
    exercises: Array<string>;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  coolDown?: {
    duration: number;
    exercises: Array<string>;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  crossSportInnovation?: Array<{
    sport: string; // basketball, rugby, handball, nfl
    drill: string;
    adaptation: string;
    expectedBenefit: string;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  targetPlayers?: Array<{
    playerId: string;
    specificFocus?: string;
    modifications?: string;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  expectedOutcomes?: Array<{
    outcome: string;
    measurement: string;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  physicalLoad?: {
    expectedDistance?: number; // km
    expectedSprints?: number;
    expectedHighIntensityRuns?: number;
    estimatedCalories?: number;
  };

  @Field({ nullable: true })
  @Column({ nullable: true })
  status?: string; // planned, in-progress, completed, cancelled

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  feedback?: string; // post-session feedback

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  actualMetrics?: {
    attendance?: number;
    completionRate?: number;
    playerRatings?: Record<string, number>;
    injuriesOccurred?: Array<string>;
  };

  // Relations
  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Field(() => Team, { nullable: true })
  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'teamId' })
  team?: Team;

  @Column({ nullable: true })
  teamId?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
