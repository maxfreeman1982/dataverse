import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Investment } from './investment.entity';
import { GraphQLJSON } from 'graphql-type-json';

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  FUNDED = 'FUNDED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ProjectCategory {
  REAL_ESTATE = 'REAL_ESTATE',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  ENERGY = 'ENERGY',
  AGRICULTURE = 'AGRICULTURE',
  TECHNOLOGY = 'TECHNOLOGY',
  OTHER = 'OTHER',
}

registerEnumType(ProjectStatus, { name: 'ProjectStatus' });
registerEnumType(ProjectCategory, { name: 'ProjectCategory' });

@ObjectType()
@Entity('oj_projects')
export class Project {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column('text')
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  shortDescription?: string;

  @Field(() => ProjectCategory)
  @Column({ type: 'varchar', default: ProjectCategory.OTHER })
  category: ProjectCategory;

  @Field(() => ProjectStatus)
  @Column({ type: 'varchar', default: ProjectStatus.DRAFT })
  status: ProjectStatus;

  @Field()
  @Column()
  spvName: string;

  @Field()
  @Column()
  spvRegistrationNumber: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  spvCountry?: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  targetAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  raisedAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  minimumInvestment: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  expectedReturn: number;

  @Field(() => Int)
  @Column()
  durationMonths: number;

  @Field()
  @Column()
  startDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  imageUrl?: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-json', { nullable: true })
  documents?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('simple-json', { nullable: true })
  milestones?: Record<string, any>[];

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('simple-json', { nullable: true })
  financialDetails?: Record<string, any>;

  @Field({ nullable: true })
  @Column({ nullable: true })
  blockchainTxHash?: string;

  @Field()
  @Column()
  seriesCode: string;

  @Field(() => Int)
  @Column({ default: 0 })
  totalInvestors: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercent: number;

  @Field(() => [Investment], { nullable: true })
  @OneToMany(() => Investment, (investment) => investment.project)
  investments?: Investment[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
