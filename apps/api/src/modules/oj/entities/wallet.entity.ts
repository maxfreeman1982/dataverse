import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Investor } from './investor.entity';
import { Transaction } from './transaction.entity';

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  CLOSED = 'CLOSED',
}

registerEnumType(WalletStatus, { name: 'WalletStatus' });

@ObjectType()
@Entity('oj_wallets')
export class Wallet {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  walletAddress: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  balance: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  pendingBalance: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  totalInvested: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  totalReturns: number;

  @Field(() => WalletStatus)
  @Column({ type: 'varchar', default: WalletStatus.ACTIVE })
  status: WalletStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  bankAccountIban?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  bankAccountName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  bankName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  virtualAccountNumber?: string;

  @Field()
  @Column()
  investorId: string;

  @Field(() => Investor)
  @OneToOne(() => Investor, (investor) => investor.wallet)
  @JoinColumn({ name: 'investorId' })
  investor: Investor;

  @Field(() => [Transaction], { nullable: true })
  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions?: Transaction[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
