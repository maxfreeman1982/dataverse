import { InputType, Field, Float, ObjectType, ID, Int } from '@nestjs/graphql';
import { IsString, IsNumber, Min, IsUUID, IsOptional } from 'class-validator';

@InputType()
export class CreateInvestmentInput {
  @Field(() => ID)
  @IsUUID()
  projectId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(1)
  amount: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  otpCode?: string;
}

@InputType()
export class InvestmentFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;
}

@ObjectType()
export class InvestmentSummary {
  @Field(() => Float)
  totalInvested: number;

  @Field(() => Float)
  currentValue: number;

  @Field(() => Float)
  totalReturns: number;

  @Field(() => Float)
  pendingReturns: number;

  @Field(() => Int)
  activeInvestments: number;

  @Field(() => Int)
  totalInvestments: number;

  @Field(() => Float)
  averageReturn: number;
}

@ObjectType()
export class InvestmentReturn {
  @Field(() => ID)
  investmentId: string;

  @Field()
  projectName: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Float)
  returnAmount: number;

  @Field(() => Float)
  returnRate: number;

  @Field()
  paymentDate: Date;

  @Field({ nullable: true })
  blockchainTxHash?: string;
}

@ObjectType()
export class PortfolioItem {
  @Field(() => ID)
  projectId: string;

  @Field()
  projectName: string;

  @Field()
  projectCategory: string;

  @Field(() => Float)
  investedAmount: number;

  @Field(() => Float)
  currentValue: number;

  @Field(() => Float)
  returnRate: number;

  @Field(() => Float)
  allocation: number;

  @Field()
  status: string;
}
