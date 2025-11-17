import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Team } from './team.entity';

@ObjectType()
@Entity('players')
export class Player {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  photo?: string;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  jerseyNumber?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  position?: string; // GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST

  @Field({ nullable: true })
  @Column({ nullable: true })
  preferredFoot?: string; // Left, Right, Both

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  height?: number; // cm

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  weight?: number; // kg

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  age?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  nationality?: string;

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  biometrics?: {
    vo2max?: number;
    maxHeartRate?: number;
    restingHeartRate?: number;
    sprintSpeed?: number; // km/h
    acceleration?: number;
    stamina?: number;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  attributes?: {
    pace?: number; // 0-100
    shooting?: number;
    passing?: number;
    dribbling?: number;
    defending?: number;
    physical?: number;
    vision?: number;
    positioning?: number;
    finishing?: number;
    tackling?: number;
  };

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  injuries?: Array<{
    type: string;
    startDate: string;
    endDate?: string;
    severity: string; // minor, moderate, severe
  }>;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true, default: 100 })
  currentFitness?: number; // 0-100

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true, default: 0 })
  fatigue?: number; // 0-100

  @Field({ nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  statistics?: {
    matchesPlayed?: number;
    minutesPlayed?: number;
    goals?: number;
    assists?: number;
    yellowCards?: number;
    redCards?: number;
    passAccuracy?: number;
    tackles?: number;
    interceptions?: number;
    clearances?: number;
    shotsOnTarget?: number;
    dribbleSuccess?: number;
  };

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relations
  @Field(() => Team, { nullable: true })
  @ManyToOne(() => Team, (team) => team.players, { onDelete: 'CASCADE' })
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
