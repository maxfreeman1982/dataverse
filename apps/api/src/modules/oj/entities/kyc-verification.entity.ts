import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Investor } from './investor.entity';
import { GraphQLJSON } from 'graphql-type-json';

export enum KycStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum KycLevel {
  NONE = 'NONE',
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  ENHANCED = 'ENHANCED',
}

registerEnumType(KycStatus, { name: 'KycStatus' });
registerEnumType(KycLevel, { name: 'KycLevel' });

@ObjectType()
@Entity('oj_kyc_verifications')
export class KycVerification {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => KycStatus)
  @Column({ type: 'varchar', default: KycStatus.NOT_STARTED })
  status: KycStatus;

  @Field(() => KycLevel)
  @Column({ type: 'varchar', default: KycLevel.NONE })
  level: KycLevel;

  @Field({ nullable: true })
  @Column({ nullable: true })
  documentType?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  documentNumber?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  documentCountry?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  documentExpiryDate?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  documentFrontUrl?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  documentBackUrl?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  selfieUrl?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  proofOfAddressUrl?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  externalVerificationId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  verificationProvider?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('simple-json', { nullable: true })
  verificationResult?: Record<string, any>;

  @Field({ nullable: true })
  @Column({ nullable: true })
  rejectionReason?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  verifiedAt?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  expiresAt?: Date;

  @Field()
  @Column()
  investorId: string;

  @Field(() => Investor)
  @OneToOne(() => Investor, (investor) => investor.kycVerification)
  @JoinColumn({ name: 'investorId' })
  investor: Investor;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
