import { Resolver, Query, Mutation, Args, Int, Float, ObjectType, Field, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OjAuthGuard } from '../guards/oj-auth.guard';
import { OjAdminGuard } from '../guards/oj-admin.guard';
import { BankService } from '../services/bank.service';
import { Transaction, TransactionStatus, TransactionType } from '../entities/transaction.entity';
import { Investor } from '../entities/investor.entity';

@ObjectType()
class BankSummary {
  @Field(() => Float)
  pendingDeposits: number;

  @Field(() => Float)
  pendingWithdrawals: number;

  @Field(() => Int)
  pendingDepositsCount: number;

  @Field(() => Int)
  pendingWithdrawalsCount: number;

  @Field(() => Float)
  todayDeposits: number;

  @Field(() => Float)
  todayWithdrawals: number;

  @Field(() => Int)
  totalProcessedToday: number;
}

@ObjectType()
class TransactionListResult {
  @Field(() => [Transaction])
  transactions: Transaction[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  pages: number;
}

@ObjectType()
class TransactionWithInvestor {
  @Field(() => Transaction)
  transaction: Transaction;

  @Field(() => Investor, { nullable: true })
  investor?: Investor;
}

@ObjectType()
class ProjectEscrow {
  @Field()
  projectId: string;

  @Field(() => Float)
  amount: number;
}

@ObjectType()
class EscrowSummary {
  @Field(() => Float)
  totalInEscrow: number;

  @Field(() => [ProjectEscrow])
  byProject: ProjectEscrow[];
}

@Resolver()
export class BankResolver {
  constructor(private bankService: BankService) {}

  @Query(() => BankSummary)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async bankSummary(): Promise<BankSummary> {
    return this.bankService.getBankSummary();
  }

  @Query(() => [Transaction])
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async bankPendingDeposits(): Promise<Transaction[]> {
    return this.bankService.getPendingDeposits();
  }

  @Query(() => [Transaction])
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async bankPendingWithdrawals(): Promise<Transaction[]> {
    return this.bankService.getPendingWithdrawals();
  }

  @Query(() => TransactionListResult)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async bankTransactionHistory(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('type', { type: () => TransactionType, nullable: true }) type?: TransactionType,
    @Args('status', { type: () => TransactionStatus, nullable: true }) status?: TransactionStatus,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ): Promise<TransactionListResult> {
    return this.bankService.getTransactionHistory(
      page || 1,
      limit || 50,
      type,
      status,
      startDate,
      endDate,
    );
  }

  @Query(() => Transaction)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async bankTransactionDetails(
    @Args('transactionId', { type: () => ID }) transactionId: string,
  ): Promise<Transaction> {
    return this.bankService.getTransactionDetails(transactionId);
  }

  @Query(() => EscrowSummary)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async bankEscrowSummary(): Promise<EscrowSummary> {
    return this.bankService.getEscrowSummary();
  }

  @Mutation(() => Transaction)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async bankValidateDeposit(
    @Args('transactionId', { type: () => ID }) transactionId: string,
    @Args('approve') approve: boolean,
    @Args('bankReference', { nullable: true }) bankReference?: string,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<Transaction> {
    return this.bankService.validateDeposit(transactionId, approve, bankReference, reason);
  }

  @Mutation(() => Transaction)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async bankValidateWithdrawal(
    @Args('transactionId', { type: () => ID }) transactionId: string,
    @Args('approve') approve: boolean,
    @Args('bankReference', { nullable: true }) bankReference?: string,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<Transaction> {
    return this.bankService.validateWithdrawal(transactionId, approve, bankReference, reason);
  }

  @Mutation(() => Transaction)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async bankFlagTransaction(
    @Args('transactionId', { type: () => ID }) transactionId: string,
    @Args('reason') reason: string,
  ): Promise<Transaction> {
    return this.bankService.flagTransaction(transactionId, reason);
  }

  @Query(() => String)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async bankExportTransactions(
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
    @Args('format', { defaultValue: 'CSV' }) format: string,
  ): Promise<string> {
    return this.bankService.exportTransactions(startDate, endDate, format as 'CSV' | 'JSON');
  }
}
