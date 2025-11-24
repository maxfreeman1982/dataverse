import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Investment } from '../entities/investment.entity';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class SpvService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Get SPV project dashboard statistics
   */
  async getSpvDashboard(projectId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['investments', 'investments.investor'],
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    const totalInvestors = project.investments?.length || 0;
    const fundingProgress = project.fundingGoal
      ? (project.currentFunding / project.fundingGoal) * 100
      : 0;

    // Calculate monthly cash flow
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyInvestments = await this.investmentRepository
      .createQueryBuilder('investment')
      .where('investment.projectId = :projectId', { projectId })
      .andWhere('investment.investmentDate BETWEEN :start AND :end', {
        start: firstDayOfMonth,
        end: lastDayOfMonth,
      })
      .select('SUM(investment.amount)', 'total')
      .getRawOne();

    return {
      projectName: project.name,
      spvName: project.spvName,
      status: project.status,
      fundingGoal: project.fundingGoal,
      currentFunding: project.currentFunding,
      fundingProgress,
      totalInvestors,
      expectedReturn: project.expectedReturn,
      duration: project.duration,
      monthlyInvestments: parseFloat(monthlyInvestments?.total || '0'),
      escrowBalance: project.escrowBalance || 0,
      startDate: project.startDate,
      endDate: project.endDate,
    };
  }

  /**
   * Get project investors list
   */
  async getProjectInvestors(projectId: string, page = 1, limit = 20) {
    const [investments, total] = await this.investmentRepository.findAndCount({
      where: { projectId },
      relations: ['investor', 'investor.wallet'],
      order: { investmentDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      investments: investments.map((inv) => ({
        id: inv.id,
        amount: inv.amount,
        tokensAmount: inv.tokensAmount,
        investmentDate: inv.investmentDate,
        currentValue: inv.currentValue,
        returnGenerated: inv.returnGenerated,
        investor: {
          id: inv.investor.id,
          firstName: inv.investor.firstName,
          lastName: inv.investor.lastName,
          email: inv.investor.email,
          investorType: inv.investor.investorType,
        },
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get project milestones
   */
  async getProjectMilestones(projectId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    // Milestones stored in metadata JSON
    return project.metadata?.milestones || [];
  }

  /**
   * Update project milestone
   */
  async updateMilestone(
    projectId: string,
    milestoneId: string,
    status: string,
    progress: number,
    notes?: string,
  ) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    const milestones = project.metadata?.milestones || [];
    const milestoneIndex = milestones.findIndex((m: any) => m.id === milestoneId);

    if (milestoneIndex === -1) {
      throw new NotFoundException('Milestone non trouvé');
    }

    milestones[milestoneIndex] = {
      ...milestones[milestoneIndex],
      status,
      progress,
      notes,
      updatedAt: new Date(),
    };

    project.metadata = {
      ...project.metadata,
      milestones,
    };

    await this.projectRepository.save(project);

    return milestones[milestoneIndex];
  }

  /**
   * Add project document
   */
  async addDocument(
    projectId: string,
    documentType: string,
    title: string,
    fileUrl: string,
    description?: string,
  ) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    const documents = project.metadata?.documents || [];
    const newDocument = {
      id: `doc-${Date.now()}`,
      type: documentType,
      title,
      fileUrl,
      description,
      uploadedAt: new Date(),
    };

    documents.push(newDocument);

    project.metadata = {
      ...project.metadata,
      documents,
    };

    await this.projectRepository.save(project);

    return newDocument;
  }

  /**
   * Get project documents
   */
  async getDocuments(projectId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    return project.metadata?.documents || [];
  }

  /**
   * Get project financial report
   */
  async getFinancialReport(projectId: string, period: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get investments in period
    const investments = await this.investmentRepository
      .createQueryBuilder('investment')
      .where('investment.projectId = :projectId', { projectId })
      .andWhere('investment.investmentDate BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .select('SUM(investment.amount)', 'totalAmount')
      .addSelect('COUNT(investment.id)', 'count')
      .getRawOne();

    // Get distributions in period (from escrow releases)
    const distributions = project.metadata?.escrowReleases?.filter(
      (release: any) =>
        new Date(release.date) >= startDate && new Date(release.date) <= endDate,
    ) || [];

    const totalDistributed = distributions.reduce(
      (sum: number, release: any) => sum + release.amount,
      0,
    );

    return {
      period,
      startDate,
      endDate,
      totalInvestments: parseFloat(investments?.totalAmount || '0'),
      investmentCount: parseInt(investments?.count || '0'),
      totalDistributed,
      distributionCount: distributions.length,
      currentEscrow: project.escrowBalance || 0,
      projectValue: project.currentFunding || 0,
      roi: project.expectedReturn || 0,
    };
  }

  /**
   * Request escrow release
   */
  async requestEscrowRelease(
    projectId: string,
    amount: number,
    reason: string,
    beneficiary: string,
  ) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    if (amount > (project.escrowBalance || 0)) {
      throw new UnauthorizedException('Solde séquestre insuffisant');
    }

    const requests = project.metadata?.escrowRequests || [];
    const newRequest = {
      id: `req-${Date.now()}`,
      amount,
      reason,
      beneficiary,
      status: 'PENDING',
      requestedAt: new Date(),
    };

    requests.push(newRequest);

    project.metadata = {
      ...project.metadata,
      escrowRequests: requests,
    };

    await this.projectRepository.save(project);

    return newRequest;
  }

  /**
   * Get escrow release requests
   */
  async getEscrowRequests(projectId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    return project.metadata?.escrowRequests || [];
  }

  /**
   * Update project status
   */
  async updateProjectStatus(projectId: string, status: string, notes?: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    project.status = status as any;

    if (notes) {
      project.metadata = {
        ...project.metadata,
        statusHistory: [
          ...(project.metadata?.statusHistory || []),
          {
            status,
            notes,
            changedAt: new Date(),
          },
        ],
      };
    }

    await this.projectRepository.save(project);

    return project;
  }

  /**
   * Get investor distribution list
   */
  async getDistributionList(projectId: string) {
    const investments = await this.investmentRepository.find({
      where: { projectId },
      relations: ['investor', 'investor.wallet'],
    });

    return investments.map((inv) => ({
      investorId: inv.investor.id,
      investorName: `${inv.investor.firstName} ${inv.investor.lastName}`,
      email: inv.investor.email,
      investmentAmount: inv.amount,
      tokensAmount: inv.tokensAmount,
      walletBalance: inv.investor.wallet?.balance || 0,
      bankAccountLinked: inv.investor.wallet?.bankAccountLinked || false,
    }));
  }
}
