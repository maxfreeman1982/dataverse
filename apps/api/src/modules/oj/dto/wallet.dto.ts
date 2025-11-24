import { InputType, Field, Float, ObjectType } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { PaymentMethod } from '../entities/transaction.entity';

@InputType()
export class CreateWalletInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bankAccountIban?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bankName?: string;
}

@InputType()
export class DepositInput {
  @Field(() => Float)
  @IsNumber()
  @Min(1)
  amount: number;

  @Field(() => PaymentMethod)
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  externalReference?: string;
}

@InputType()
export class WithdrawInput {
  @Field(() => Float)
  @IsNumber()
  @Min(1)
  amount: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bankAccountIban?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  otpCode?: string;
}

@InputType()
export class LinkBankAccountInput {
  @Field()
  @IsString()
  bankAccountIban: string;

  @Field()
  @IsString()
  bankAccountName: string;

  @Field()
  @IsString()
  bankName: string;
}

@ObjectType()
export class WalletSummary {
  @Field(() => Float)
  totalBalance: number;

  @Field(() => Float)
  availableBalance: number;

  @Field(() => Float)
  pendingBalance: number;

  @Field(() => Float)
  totalInvested: number;

  @Field(() => Float)
  totalReturns: number;

  @Field(() => Float)
  unrealizedReturns: number;
}
