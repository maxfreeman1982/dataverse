import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from '../entities/transaction.entity';
import { WalletService } from '../services/wallet.service';
import { DepositInput, WithdrawInput, LinkBankAccountInput, WalletSummary } from '../dto/wallet.dto';
import { OjAuthGuard } from '../guards/oj-auth.guard';
import { CurrentInvestor } from '../decorators/current-investor.decorator';
import { Investor } from '../entities/investor.entity';

@Resolver(() => Wallet)
export class WalletResolver {
  constructor(private walletService: WalletService) {}

  @Query(() => Wallet)
  @UseGuards(OjAuthGuard)
  async myWallet(@CurrentInvestor() investor: Investor): Promise<Wallet> {
    return this.walletService.getWalletByInvestorId(investor.id);
  }

  @Query(() => WalletSummary)
  @UseGuards(OjAuthGuard)
  async walletSummary(@CurrentInvestor() investor: Investor): Promise<WalletSummary> {
    return this.walletService.getWalletSummary(investor.id);
  }

  @Query(() => [Transaction])
  @UseGuards(OjAuthGuard)
  async transactionHistory(
    @CurrentInvestor() investor: Investor,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ): Promise<Transaction[]> {
    return this.walletService.getTransactionHistory(investor.id, limit, offset);
  }

  @Query(() => Transaction)
  @UseGuards(OjAuthGuard)
  async transaction(@Args('id') id: string): Promise<Transaction> {
    return this.walletService.getTransactionById(id);
  }

  @Mutation(() => Transaction)
  @UseGuards(OjAuthGuard)
  async deposit(
    @CurrentInvestor() investor: Investor,
    @Args('input') input: DepositInput,
  ): Promise<Transaction> {
    return this.walletService.deposit(investor.id, input);
  }

  @Mutation(() => Transaction)
  @UseGuards(OjAuthGuard)
  async withdraw(
    @CurrentInvestor() investor: Investor,
    @Args('input') input: WithdrawInput,
  ): Promise<Transaction> {
    return this.walletService.withdraw(investor.id, input);
  }

  @Mutation(() => Wallet)
  @UseGuards(OjAuthGuard)
  async linkBankAccount(
    @CurrentInvestor() investor: Investor,
    @Args('input') input: LinkBankAccountInput,
  ): Promise<Wallet> {
    return this.walletService.linkBankAccount(investor.id, input);
  }
}
