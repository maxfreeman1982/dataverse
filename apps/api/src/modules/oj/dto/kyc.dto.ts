import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { KycLevel, KycStatus } from '../entities/kyc-verification.entity';

@InputType()
export class StartKycInput {
  @Field(() => KycLevel)
  @IsEnum(KycLevel)
  targetLevel: KycLevel;
}

@InputType()
export class SubmitDocumentInput {
  @Field()
  @IsString()
  documentType: string;

  @Field()
  @IsString()
  documentNumber: string;

  @Field()
  @IsString()
  documentCountry: string;

  @Field({ nullable: true })
  @IsOptional()
  documentExpiryDate?: Date;

  @Field()
  @IsString()
  documentFrontUrl: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  documentBackUrl?: string;
}

@InputType()
export class SubmitSelfieInput {
  @Field()
  @IsString()
  selfieUrl: string;
}

@InputType()
export class SubmitProofOfAddressInput {
  @Field()
  @IsString()
  proofOfAddressUrl: string;
}

@ObjectType()
export class KycProgress {
  @Field(() => KycStatus)
  status: KycStatus;

  @Field(() => KycLevel)
  currentLevel: KycLevel;

  @Field()
  documentSubmitted: boolean;

  @Field()
  selfieSubmitted: boolean;

  @Field()
  proofOfAddressSubmitted: boolean;

  @Field({ nullable: true })
  rejectionReason?: string;

  @Field(() => [String])
  requiredActions: string[];

  @Field(() => [String])
  completedSteps: string[];
}

@ObjectType()
export class KycVerificationResult {
  @Field()
  success: boolean;

  @Field(() => KycStatus)
  status: KycStatus;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  externalVerificationId?: string;
}
