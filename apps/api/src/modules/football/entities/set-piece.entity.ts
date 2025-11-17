import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Team } from './team.entity';

@ObjectType()
@Entity('set_pieces')
export class SetPiece {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  type: string; // corner, free-kick, throw-in, goal-kick, penalty

  @Field()
  @Column()
  situation: string; // offensive, defensive

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  setup?: {
    ballPosition?: { x: number; y: number };
    playerPositions?: Array<{
      playerId?: string;
      position: { x: number; y: number };
      role: string; // kicker, target, decoy, blocker, etc.
      instructions?: string;
    }>;
    formation?: string;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  variations?: Array<{
    name: string;
    description: string;
    triggers?: string; // when to use this variation
    setup?: any;
  }>;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  expectedOutcome?: {
    primaryTarget?: string;
    secondaryTarget?: string;
    successCriteria?: string;
  };

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  successRate?: number; // 0-100

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  statistics?: {
    timesUsed?: number;
    goals?: number;
    assists?: number;
    shots?: number;
    successfulDeliveries?: number;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  optimization?: {
    bestPlayers?: Array<string>;
    optimalConditions?: string;
    counterStrategies?: Array<string>;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  visualRepresentation?: {
    asciiDiagram?: string;
    coordinates?: Array<{ x: number; y: number; label: string }>;
    imageUrl?: string;
  };

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  coachingPoints?: string;

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
