import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { GraphQLJSON } from 'graphql-type-json';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  INVESTMENT = 'INVESTMENT',
  RETURN_PAYMENT = 'RETURN_PAYMENT',
  TRANSFER = 'TRANSFER',
  FEE = 'FEE',
  REFUND = 'REFUND',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CRYPTO = 'CRYPTO',
  INTERNAL = 'INTERNAL',
}

registerEnumType(TransactionType, { name: 'TransactionType' });
registerEnumType(TransactionStatus, { name: 'TransactionStatus' });
registerEnumType(PaymentMethod, { name: 'PaymentMethod' });

@ObjectType()
@Entity('oj_transactions')
export class Transaction {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  reference: string;

  @Field(() => TransactionType)
  @Column({ type: 'varchar' })
  type: TransactionType;

  @Field(() => TransactionStatus)
  @Column({ type: 'varchar', default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Field(() => PaymentMethod)
  @Column({ type: 'varchar' })
  paymentMethod: PaymentMethod;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  fee?: number;

  @Field()
  @Column({ default: 'EUR' })
  currency: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  blockchainTxHash?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  externalReference?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('simple-json', { nullable: true })
  metadata?: Record<string, any>;

  @Field()
  @Column()
  walletId: string;

  @Field(() => Wallet)
  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedInvestmentId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedProjectId?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  completedAt?: Date;
}
