import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Investor, InvestorStatus, InvestorType } from '../entities/investor.entity';
import { Project, ProjectStatus } from '../entities/project.entity';
import { Investment, InvestmentStatus } from '../entities/investment.entity';
import { Transaction, TransactionStatus, TransactionType } from '../entities/transaction.entity';
import { KycVerification, KycStatus, KycLevel } from '../entities/kyc-verification.entity';
import { Wallet } from '../entities/wallet.entity';

export interface DashboardStats {
  totalInvestors: number;
  verifiedInvestors: number;
  pendingKyc: number;
  totalProjects: number;
  activeProjects: number;
  totalFundsRaised: number;
  totalInvestments: number;
  pendingTransactions: number;
  monthlyGrowth: number;
}

export interface FinancialReport {
  period: string;
  totalDeposits: number;
  totalWithdrawals: number;
  totalInvestments: number;
  totalReturns: number;
  netFlow: number;
  transactionCount: number;
  averageInvestment: number;
  topProjects: { projectId: string; projectName: string; amount: number }[];
}

export interface InvestorReport {
  totalInvestors: number;
  byType: { type: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byCountry: { country: string; count: number }[];
  newInvestorsThisMonth: number;
  averageInvestmentPerInvestor: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Investor)
    private investorRepository: Repository<Investor>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(KycVerification)
    private kycRepository: Repository<KycVerification>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalInvestors,
      verifiedInvestors,
      pendingKyc,
      totalProjects,
      activeProjects,
      pendingTransactions,
    ] = await Promise.all([
      this.investorRepository.count(),
      this.investorRepository.count({ where: { status: InvestorStatus.VERIFIED } }),
      this.kycRepository.count({ where: { status: KycStatus.PENDING } }),
      this.projectRepository.count(),
      this.projectRepository.count({
        where: [{ status: ProjectStatus.ACTIVE }, { status: ProjectStatus.IN_PROGRESS }],
      }),
      this.transactionRepository.count({ where: { status: TransactionStatus.PENDING } }),
    ]);

    const projects = await this.projectRepository.find();
    const totalFundsRaised = projects.reduce((sum, p) => sum + Number(p.raisedAmount || 0), 0);

    const totalInvestments = await this.investmentRepository.count();

    // Calculate monthly growth (new investors this month vs last month)
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthInvestors = await this.investorRepository.count({
      where: { createdAt: MoreThanOrEqual(thisMonthStart) },
    });
    const lastMonthInvestors = await this.investorRepository.count({
      where: {
        createdAt: Between(lastMonthStart, thisMonthStart),
      },
    });

    const monthlyGrowth = lastMonthInvestors > 0
      ? ((thisMonthInvestors - lastMonthInvestors) / lastMonthInvestors) * 100
      : 100;

    return {
      totalInvestors,
      verifiedInvestors,
      pendingKyc,
      totalProjects,
      activeProjects,
      totalFundsRaised,
      totalInvestments,
      pendingTransactions,
      monthlyGrowth,
    };
  }

  async getAllInvestors(
    page = 1,
    limit = 20,
    status?: InvestorStatus,
    type?: InvestorType,
    search?: string,
  ): Promise<{ investors: Investor[]; total: number; pages: number }> {
    let queryBuilder = this.investorRepository
      .createQueryBuilder('investor')
      .leftJoinAndSelect('investor.wallet', 'wallet')
      .leftJoinAndSelect('investor.kycVerification', 'kyc');

    if (status) {
      queryBuilder = queryBuilder.andWhere('investor.status = :status', { status });
    }

    if (type) {
      queryBuilder = queryBuilder.andWhere('investor.investorType = :type', { type });
    }

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(investor.email ILIKE :search OR investor.firstName ILIKE :search OR investor.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);

    const investors = await queryBuilder
      .orderBy('investor.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { investors, total, pages };
  }

  async getPendingKycVerifications(): Promise<KycVerification[]> {
    return this.kycRepository.find({
      where: [{ status: KycStatus.PENDING }, { status: KycStatus.IN_REVIEW }],
      relations: ['investor'],
      order: { createdAt: 'ASC' },
    });
  }

  async approveInvestor(investorId: string): Promise<Investor> {
    const investor = await this.investorRepository.findOneOrFail({
      where: { id: investorId },
    });

    investor.status = InvestorStatus.VERIFIED;
    return this.investorRepository.save(investor);
  }

  async suspendInvestor(investorId: string, reason: string): Promise<Investor> {
    const investor = await this.investorRepository.findOneOrFail({
      where: { id: investorId },
    });

    investor.status = InvestorStatus.SUSPENDED;
    return this.investorRepository.save(investor);
  }

  async blockInvestor(investorId: string, reason: string): Promise<Investor> {
    const investor = await this.investorRepository.findOneOrFail({
      where: { id: investorId },
    });

    investor.status = InvestorStatus.BLOCKED;
    return this.investorRepository.save(investor);
  }

  async getFinancialReport(startDate: Date, endDate: Date): Promise<FinancialReport> {
    const transactions = await this.transactionRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: TransactionStatus.COMPLETED,
      },
    });

    const deposits = transactions.filter((t) => t.type === TransactionType.DEPOSIT);
    const withdrawals = transactions.filter((t) => t.type === TransactionType.WITHDRAWAL);
    const investments = transactions.filter((t) => t.type === TransactionType.INVESTMENT);
    const returns = transactions.filter((t) => t.type === TransactionType.RETURN_PAYMENT);

    const totalDeposits = deposits.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalWithdrawals = withdrawals.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalInvestments = investments.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalReturns = returns.reduce((sum, t) => sum + Number(t.amount), 0);

    // Get top projects by investment amount
    const investmentsByProject = await this.investmentRepository
      .createQueryBuilder('investment')
      .leftJoinAndSelect('investment.project', 'project')
      .where('investment.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .select('investment.projectId', 'projectId')
      .addSelect('project.name', 'projectName')
      .addSelect('SUM(investment.amount)', 'amount')
      .groupBy('investment.projectId')
      .addGroupBy('project.name')
      .orderBy('amount', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      period: `${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`,
      totalDeposits,
      totalWithdrawals,
      totalInvestments,
      totalReturns,
      netFlow: totalDeposits - totalWithdrawals,
      transactionCount: transactions.length,
      averageInvestment: investments.length > 0 ? totalInvestments / investments.length : 0,
      topProjects: investmentsByProject.map((p) => ({
        projectId: p.projectId,
        projectName: p.projectName,
        amount: Number(p.amount),
      })),
    };
  }

  async getInvestorReport(): Promise<InvestorReport> {
    const investors = await this.investorRepository.find();

    const byType = Object.values(InvestorType).map((type) => ({
      type,
      count: investors.filter((i) => i.investorType === type).length,
    }));

    const byStatus = Object.values(InvestorStatus).map((status) => ({
      status,
      count: investors.filter((i) => i.status === status).length,
    }));

    const countryMap = new Map<string, number>();
    investors.forEach((i) => {
      const country = i.country || 'Non spécifié';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });
    const byCountry = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const newInvestorsThisMonth = investors.filter(
      (i) => new Date(i.createdAt) >= thisMonthStart,
    ).length;

    const investments = await this.investmentRepository.find();
    const totalInvested = investments.reduce((sum, i) => sum + Number(i.amount), 0);
    const averageInvestmentPerInvestor = investors.length > 0
      ? totalInvested / investors.length
      : 0;

    return {
      totalInvestors: investors.length,
      byType,
      byStatus,
      byCountry,
      newInvestorsThisMonth,
      averageInvestmentPerInvestor,
    };
  }

  async getAllProjects(
    page = 1,
    limit = 20,
    status?: ProjectStatus,
  ): Promise<{ projects: Project[]; total: number; pages: number }> {
    let queryBuilder = this.projectRepository.createQueryBuilder('project');

    if (status) {
      queryBuilder = queryBuilder.where('project.status = :status', { status });
    }

    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);

    const projects = await queryBuilder
      .orderBy('project.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { projects, total, pages };
  }

  async getProjectInvestors(projectId: string): Promise<Investment[]> {
    return this.investmentRepository.find({
      where: { projectId },
      relations: ['investor'],
      order: { createdAt: 'DESC' },
    });
  }

  async distributeReturns(
    projectId: string,
    returnPercentage: number,
  ): Promise<{ processed: number; totalAmount: number }> {
    const investments = await this.investmentRepository.find({
      where: {
        projectId,
        status: InvestmentStatus.ACTIVE,
      },
      relations: ['investor'],
    });

    let processed = 0;
    let totalAmount = 0;

    for (const investment of investments) {
      const returnAmount = Number(investment.amount) * (returnPercentage / 100);

      // Update investment
      investment.accruedReturns = Number(investment.accruedReturns) + returnAmount;
      investment.currentValue = Number(investment.currentValue) + returnAmount;
      await this.investmentRepository.save(investment);

      // Update wallet
      const wallet = await this.walletRepository.findOne({
        where: { investorId: investment.investorId },
      });

      if (wallet) {
        wallet.balance = Number(wallet.balance) + returnAmount;
        wallet.totalReturns = Number(wallet.totalReturns) + returnAmount;
        await this.walletRepository.save(wallet);

        // Create transaction
        const transaction = this.transactionRepository.create({
          reference: `RET-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          type: TransactionType.RETURN_PAYMENT,
          status: TransactionStatus.COMPLETED,
          paymentMethod: 'INTERNAL' as any,
          amount: returnAmount,
          currency: 'EUR',
          description: `Distribution de rendement - ${returnPercentage}%`,
          walletId: wallet.id,
          relatedInvestmentId: investment.id,
          relatedProjectId: projectId,
          completedAt: new Date(),
        });
        await this.transactionRepository.save(transaction);
      }

      processed++;
      totalAmount += returnAmount;
    }

    return { processed, totalAmount };
  }
}
