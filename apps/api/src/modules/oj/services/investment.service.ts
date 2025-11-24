import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment, InvestmentStatus } from '../entities/investment.entity';
import { Project, ProjectStatus } from '../entities/project.entity';
import { Wallet } from '../entities/wallet.entity';
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from '../entities/transaction.entity';
import { CreateInvestmentInput, InvestmentSummary, PortfolioItem, InvestmentReturn } from '../dto/investment.dto';
import { ProjectService } from './project.service';

@Injectable()
export class InvestmentService {
  constructor(
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private projectService: ProjectService,
  ) {}

  async createInvestment(investorId: string, input: CreateInvestmentInput): Promise<Investment> {
    const project = await this.projectRepository.findOneOrFail({
      where: { id: input.projectId },
    });

    if (project.status !== ProjectStatus.ACTIVE) {
      throw new BadRequestException('Ce projet n\'accepte pas de nouveaux investissements');
    }

    if (input.amount < Number(project.minimumInvestment)) {
      throw new BadRequestException(
        `L'investissement minimum pour ce projet est de ${project.minimumInvestment} EUR`,
      );
    }

    const remainingAmount = Number(project.targetAmount) - Number(project.raisedAmount);
    if (input.amount > remainingAmount) {
      throw new BadRequestException(
        `Le montant maximum disponible pour ce projet est de ${remainingAmount} EUR`,
      );
    }

    const wallet = await this.walletRepository.findOneOrFail({
      where: { investorId },
    });

    if (Number(wallet.balance) < input.amount) {
      throw new BadRequestException('Solde insuffisant dans votre portefeuille');
    }

    // Deduct from wallet
    wallet.balance = Number(wallet.balance) - input.amount;
    wallet.totalInvested = Number(wallet.totalInvested) + input.amount;
    await this.walletRepository.save(wallet);

    // Create investment
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + project.durationMonths);

    const investment = this.investmentRepository.create({
      investorId,
      projectId: input.projectId,
      amount: input.amount,
      currentValue: input.amount,
      status: InvestmentStatus.CONFIRMED,
      investmentDate: new Date(),
      maturityDate,
    });

    await this.investmentRepository.save(investment);

    // Create transaction record
    const transaction = this.transactionRepository.create({
      reference: this.generateReference('INV'),
      type: TransactionType.INVESTMENT,
      status: TransactionStatus.COMPLETED,
      paymentMethod: PaymentMethod.INTERNAL,
      amount: input.amount,
      currency: 'EUR',
      description: `Investissement dans ${project.name}`,
      walletId: wallet.id,
      relatedInvestmentId: investment.id,
      relatedProjectId: project.id,
      completedAt: new Date(),
    });

    await this.transactionRepository.save(transaction);

    // Update project stats
    const newRaisedAmount = Number(project.raisedAmount) + input.amount;
    const investments = await this.investmentRepository.count({
      where: { projectId: project.id },
    });

    await this.projectService.updateProgress(project.id, newRaisedAmount, investments);

    return investment;
  }

  async getInvestmentById(id: string): Promise<Investment> {
    return this.investmentRepository.findOneOrFail({
      where: { id },
      relations: ['project', 'investor'],
    });
  }

  async getInvestorInvestments(investorId: string): Promise<Investment[]> {
    return this.investmentRepository.find({
      where: { investorId },
      relations: ['project'],
      order: { createdAt: 'DESC' },
    });
  }

  async getInvestmentSummary(investorId: string): Promise<InvestmentSummary> {
    const investments = await this.getInvestorInvestments(investorId);

    const activeInvestments = investments.filter(
      (i) => i.status === InvestmentStatus.ACTIVE || i.status === InvestmentStatus.CONFIRMED,
    );

    const totalInvested = investments.reduce((sum, i) => sum + Number(i.amount), 0);
    const currentValue = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);
    const totalReturns = investments.reduce((sum, i) => sum + Number(i.paidReturns), 0);
    const pendingReturns = investments.reduce((sum, i) => sum + Number(i.accruedReturns), 0);

    const averageReturn = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;

    return {
      totalInvested,
      currentValue,
      totalReturns,
      pendingReturns,
      activeInvestments: activeInvestments.length,
      totalInvestments: investments.length,
      averageReturn,
    };
  }

  async getPortfolio(investorId: string): Promise<PortfolioItem[]> {
    const investments = await this.investmentRepository.find({
      where: { investorId },
      relations: ['project'],
    });

    const totalInvested = investments.reduce((sum, i) => sum + Number(i.amount), 0);

    return investments.map((investment) => ({
      projectId: investment.projectId,
      projectName: investment.project.name,
      projectCategory: investment.project.category,
      investedAmount: Number(investment.amount),
      currentValue: Number(investment.currentValue),
      returnRate: Number(investment.project.expectedReturn),
      allocation: totalInvested > 0 ? (Number(investment.amount) / totalInvested) * 100 : 0,
      status: investment.status,
    }));
  }

  async processReturns(investmentId: string, returnAmount: number): Promise<InvestmentReturn> {
    const investment = await this.investmentRepository.findOneOrFail({
      where: { id: investmentId },
      relations: ['project', 'investor'],
    });

    const wallet = await this.walletRepository.findOneOrFail({
      where: { investorId: investment.investorId },
    });

    // Update wallet
    wallet.balance = Number(wallet.balance) + returnAmount;
    wallet.totalReturns = Number(wallet.totalReturns) + returnAmount;
    await this.walletRepository.save(wallet);

    // Update investment
    investment.paidReturns = Number(investment.paidReturns) + returnAmount;
    investment.accruedReturns = Math.max(0, Number(investment.accruedReturns) - returnAmount);
    await this.investmentRepository.save(investment);

    // Create transaction
    const transaction = this.transactionRepository.create({
      reference: this.generateReference('RET'),
      type: TransactionType.RETURN_PAYMENT,
      status: TransactionStatus.COMPLETED,
      paymentMethod: PaymentMethod.INTERNAL,
      amount: returnAmount,
      currency: 'EUR',
      description: `Rendement de ${investment.project.name}`,
      walletId: wallet.id,
      relatedInvestmentId: investment.id,
      relatedProjectId: investment.projectId,
      completedAt: new Date(),
    });

    await this.transactionRepository.save(transaction);

    return {
      investmentId: investment.id,
      projectName: investment.project.name,
      amount: Number(investment.amount),
      returnAmount,
      returnRate: (returnAmount / Number(investment.amount)) * 100,
      paymentDate: new Date(),
      blockchainTxHash: transaction.blockchainTxHash,
    };
  }

  async matureInvestment(investmentId: string): Promise<Investment> {
    const investment = await this.investmentRepository.findOneOrFail({
      where: { id: investmentId },
      relations: ['project'],
    });

    const wallet = await this.walletRepository.findOneOrFail({
      where: { investorId: investment.investorId },
    });

    // Return principal to wallet
    wallet.balance = Number(wallet.balance) + Number(investment.currentValue);
    wallet.totalInvested = Number(wallet.totalInvested) - Number(investment.amount);
    await this.walletRepository.save(wallet);

    // Update investment status
    investment.status = InvestmentStatus.MATURED;
    await this.investmentRepository.save(investment);

    // Create transaction
    const transaction = this.transactionRepository.create({
      reference: this.generateReference('MAT'),
      type: TransactionType.RETURN_PAYMENT,
      status: TransactionStatus.COMPLETED,
      paymentMethod: PaymentMethod.INTERNAL,
      amount: Number(investment.currentValue),
      currency: 'EUR',
      description: `Remboursement du capital - ${investment.project.name}`,
      walletId: wallet.id,
      relatedInvestmentId: investment.id,
      relatedProjectId: investment.projectId,
      completedAt: new Date(),
    });

    await this.transactionRepository.save(transaction);

    return investment;
  }

  async calculateAccruedReturns(investmentId: string): Promise<number> {
    const investment = await this.investmentRepository.findOneOrFail({
      where: { id: investmentId },
      relations: ['project'],
    });

    const daysInvested = Math.floor(
      (Date.now() - investment.investmentDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const annualReturn = Number(investment.project.expectedReturn) / 100;
    const dailyReturn = annualReturn / 365;
    const accruedReturns = Number(investment.amount) * dailyReturn * daysInvested;

    investment.accruedReturns = accruedReturns;
    investment.currentValue = Number(investment.amount) + accruedReturns - Number(investment.paidReturns);
    await this.investmentRepository.save(investment);

    return accruedReturns;
  }

  private generateReference(prefix: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}
