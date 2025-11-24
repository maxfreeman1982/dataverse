import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { Investment } from './investment.entity';
import { KycVerification } from './kyc-verification.entity';

export enum InvestorType {
  INDIVIDUAL = 'INDIVIDUAL',
  INSTITUTIONAL = 'INSTITUTIONAL',
  HOLDING = 'HOLDING',
}

export enum InvestorStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
}

registerEnumType(InvestorType, { name: 'InvestorType' });
registerEnumType(InvestorStatus, { name: 'InvestorStatus' });

@ObjectType()
@Entity('oj_investors')
export class Investor {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Field(() => InvestorType)
  @Column({ type: 'varchar', default: InvestorType.INDIVIDUAL })
  investorType: InvestorType;

  @Field(() => InvestorStatus)
  @Column({ type: 'varchar', default: InvestorStatus.PENDING })
  status: InvestorStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  companyName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  companyRegistration?: string;

  @Field()
  @Column({ default: false })
  biometricEnabled: boolean;

  @Field()
  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  twoFactorSecret?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastLoginIp?: string;

  @Field(() => Wallet, { nullable: true })
  @OneToOne(() => Wallet, (wallet) => wallet.investor)
  wallet?: Wallet;

  @Field(() => [Investment], { nullable: true })
  @OneToMany(() => Investment, (investment) => investment.investor)
  investments?: Investment[];

  @Field(() => KycVerification, { nullable: true })
  @OneToOne(() => KycVerification, (kyc) => kyc.investor)
  kycVerification?: KycVerification;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
