import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Investment } from '../entities/investment.entity';
import { InvestmentService } from '../services/investment.service';
import { CreateInvestmentInput, InvestmentSummary, PortfolioItem, InvestmentReturn } from '../dto/investment.dto';
import { OjAuthGuard } from '../guards/oj-auth.guard';
import { OjAdminGuard } from '../guards/oj-admin.guard';
import { CurrentInvestor } from '../decorators/current-investor.decorator';
import { Investor } from '../entities/investor.entity';

@Resolver(() => Investment)
export class InvestmentResolver {
  constructor(private investmentService: InvestmentService) {}

  @Query(() => [Investment])
  @UseGuards(OjAuthGuard)
  async myInvestments(@CurrentInvestor() investor: Investor): Promise<Investment[]> {
    return this.investmentService.getInvestorInvestments(investor.id);
  }

  @Query(() => Investment)
  @UseGuards(OjAuthGuard)
  async investment(@Args('id', { type: () => ID }) id: string): Promise<Investment> {
    return this.investmentService.getInvestmentById(id);
  }

  @Query(() => InvestmentSummary)
  @UseGuards(OjAuthGuard)
  async investmentSummary(@CurrentInvestor() investor: Investor): Promise<InvestmentSummary> {
    return this.investmentService.getInvestmentSummary(investor.id);
  }

  @Query(() => [PortfolioItem])
  @UseGuards(OjAuthGuard)
  async portfolio(@CurrentInvestor() investor: Investor): Promise<PortfolioItem[]> {
    return this.investmentService.getPortfolio(investor.id);
  }

  @Mutation(() => Investment)
  @UseGuards(OjAuthGuard)
  async invest(
    @CurrentInvestor() investor: Investor,
    @Args('input') input: CreateInvestmentInput,
  ): Promise<Investment> {
    return this.investmentService.createInvestment(investor.id, input);
  }

  @Mutation(() => InvestmentReturn)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async processInvestmentReturns(
    @Args('investmentId', { type: () => ID }) investmentId: string,
    @Args('returnAmount') returnAmount: number,
  ): Promise<InvestmentReturn> {
    return this.investmentService.processReturns(investmentId, returnAmount);
  }

  @Mutation(() => Investment)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async matureInvestment(
    @Args('investmentId', { type: () => ID }) investmentId: string,
  ): Promise<Investment> {
    return this.investmentService.matureInvestment(investmentId);
  }

  @Mutation(() => Number)
  @UseGuards(OjAuthGuard)
  async calculateMyReturns(
    @Args('investmentId', { type: () => ID }) investmentId: string,
  ): Promise<number> {
    return this.investmentService.calculateAccruedReturns(investmentId);
  }
}
