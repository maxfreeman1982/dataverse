import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Investor } from './investor.entity';
import { Project } from './project.entity';

export enum InvestmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  MATURED = 'MATURED',
  WITHDRAWN = 'WITHDRAWN',
  CANCELLED = 'CANCELLED',
}

registerEnumType(InvestmentStatus, { name: 'InvestmentStatus' });

@ObjectType()
@Entity('oj_investments')
export class Investment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  currentValue: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  accruedReturns: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  paidReturns: number;

  @Field(() => InvestmentStatus)
  @Column({ type: 'varchar', default: InvestmentStatus.PENDING })
  status: InvestmentStatus;

  @Field()
  @Column()
  investmentDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  maturityDate?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  blockchainTxHash?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  tokenId?: string;

  @Field()
  @Column()
  investorId: string;

  @Field(() => Investor)
  @ManyToOne(() => Investor, (investor) => investor.investments)
  @JoinColumn({ name: 'investorId' })
  investor: Investor;

  @Field()
  @Column()
  projectId: string;

  @Field(() => Project)
  @ManyToOne(() => Project, (project) => project.investments)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
