import { Resolver, Query, Mutation, Args, Int, Float, ObjectType, Field, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OjAuthGuard } from '../guards/oj-auth.guard';
import { OjAdminGuard } from '../guards/oj-admin.guard';
import { AdminService, DashboardStats, FinancialReport, InvestorReport } from '../services/admin.service';
import { Investor, InvestorStatus, InvestorType } from '../entities/investor.entity';
import { Project, ProjectStatus } from '../entities/project.entity';
import { Investment } from '../entities/investment.entity';
import { KycVerification, KycLevel } from '../entities/kyc-verification.entity';
import { KycService } from '../services/kyc.service';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
class AdminDashboardStats {
  @Field(() => Int)
  totalInvestors: number;

  @Field(() => Int)
  verifiedInvestors: number;

  @Field(() => Int)
  pendingKyc: number;

  @Field(() => Int)
  totalProjects: number;

  @Field(() => Int)
  activeProjects: number;

  @Field(() => Float)
  totalFundsRaised: number;

  @Field(() => Int)
  totalInvestments: number;

  @Field(() => Int)
  pendingTransactions: number;

  @Field(() => Float)
  monthlyGrowth: number;
}

@ObjectType()
class InvestorListResult {
  @Field(() => [Investor])
  investors: Investor[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  pages: number;
}

@ObjectType()
class ProjectListResult {
  @Field(() => [Project])
  projects: Project[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  pages: number;
}

@ObjectType()
class TypeCount {
  @Field()
  type: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
class StatusCount {
  @Field()
  status: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
class CountryCount {
  @Field()
  country: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
class TopProject {
  @Field()
  projectId: string;

  @Field()
  projectName: string;

  @Field(() => Float)
  amount: number;
}

@ObjectType()
class AdminFinancialReport {
  @Field()
  period: string;

  @Field(() => Float)
  totalDeposits: number;

  @Field(() => Float)
  totalWithdrawals: number;

  @Field(() => Float)
  totalInvestments: number;

  @Field(() => Float)
  totalReturns: number;

  @Field(() => Float)
  netFlow: number;

  @Field(() => Int)
  transactionCount: number;

  @Field(() => Float)
  averageInvestment: number;

  @Field(() => [TopProject])
  topProjects: TopProject[];
}

@ObjectType()
class AdminInvestorReport {
  @Field(() => Int)
  totalInvestors: number;

  @Field(() => [TypeCount])
  byType: TypeCount[];

  @Field(() => [StatusCount])
  byStatus: StatusCount[];

  @Field(() => [CountryCount])
  byCountry: CountryCount[];

  @Field(() => Int)
  newInvestorsThisMonth: number;

  @Field(() => Float)
  averageInvestmentPerInvestor: number;
}

@ObjectType()
class ReturnDistributionResult {
  @Field(() => Int)
  processed: number;

  @Field(() => Float)
  totalAmount: number;
}

@Resolver()
export class AdminResolver {
  constructor(
    private adminService: AdminService,
    private kycService: KycService,
  ) {}

  @Query(() => AdminDashboardStats)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async adminDashboardStats(): Promise<AdminDashboardStats> {
    return this.adminService.getDashboardStats();
  }

  @Query(() => InvestorListResult)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async adminInvestors(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('status', { type: () => InvestorStatus, nullable: true }) status?: InvestorStatus,
    @Args('type', { type: () => InvestorType, nullable: true }) type?: InvestorType,
    @Args('search', { nullable: true }) search?: string,
  ): Promise<InvestorListResult> {
    return this.adminService.getAllInvestors(page || 1, limit || 20, status, type, search);
  }

  @Query(() => [KycVerification])
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async adminPendingKyc(): Promise<KycVerification[]> {
    return this.adminService.getPendingKycVerifications();
  }

  @Query(() => ProjectListResult)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async adminProjects(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('status', { type: () => ProjectStatus, nullable: true }) status?: ProjectStatus,
  ): Promise<ProjectListResult> {
    return this.adminService.getAllProjects(page || 1, limit || 20, status);
  }

  @Query(() => [Investment])
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async adminProjectInvestors(
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<Investment[]> {
    return this.adminService.getProjectInvestors(projectId);
  }

  @Query(() => AdminFinancialReport)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async adminFinancialReport(
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
  ): Promise<AdminFinancialReport> {
    return this.adminService.getFinancialReport(startDate, endDate);
  }

  @Query(() => AdminInvestorReport)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async adminInvestorReport(): Promise<AdminInvestorReport> {
    return this.adminService.getInvestorReport();
  }

  @Mutation(() => Investor)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async adminApproveInvestor(
    @Args('investorId', { type: () => ID }) investorId: string,
  ): Promise<Investor> {
    return this.adminService.approveInvestor(investorId);
  }

  @Mutation(() => Investor)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async adminSuspendInvestor(
    @Args('investorId', { type: () => ID }) investorId: string,
    @Args('reason') reason: string,
  ): Promise<Investor> {
    return this.adminService.suspendInvestor(investorId, reason);
  }

  @Mutation(() => Investor)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async adminBlockInvestor(
    @Args('investorId', { type: () => ID }) investorId: string,
    @Args('reason') reason: string,
  ): Promise<Investor> {
    return this.adminService.blockInvestor(investorId, reason);
  }

  @Mutation(() => KycVerification)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async adminApproveKyc(
    @Args('investorId', { type: () => ID }) investorId: string,
    @Args('level', { type: () => KycLevel, nullable: true }) level?: KycLevel,
  ): Promise<KycVerification> {
    await this.kycService.approveKyc(investorId, level);
    return this.kycService.getKycByInvestorId(investorId);
  }

  @Mutation(() => KycVerification)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async adminRejectKyc(
    @Args('investorId', { type: () => ID }) investorId: string,
    @Args('reason') reason: string,
  ): Promise<KycVerification> {
    await this.kycService.rejectKyc(investorId, reason);
    return this.kycService.getKycByInvestorId(investorId);
  }

  @Mutation(() => ReturnDistributionResult)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async adminDistributeReturns(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('returnPercentage', { type: () => Float }) returnPercentage: number,
  ): Promise<ReturnDistributionResult> {
    return this.adminService.distributeReturns(projectId, returnPercentage);
  }
}
