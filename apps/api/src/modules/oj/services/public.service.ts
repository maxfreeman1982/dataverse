import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Investment } from '../entities/investment.entity';
import { Investor } from '../entities/investor.entity';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(Investor)
    private investorRepository: Repository<Investor>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Get public platform statistics
   */
  async getPlatformStats() {
    // Total projects
    const totalProjects = await this.projectRepository.count();
    const activeProjects = await this.projectRepository.count({
      where: [
        { status: 'FUNDRAISING' },
        { status: 'FUNDED' },
        { status: 'ACTIVE' },
      ],
    });

    // Total funding
    const fundingStats = await this.projectRepository
      .createQueryBuilder('project')
      .select('SUM(project.currentFunding)', 'totalFunding')
      .addSelect('SUM(project.fundingGoal)', 'totalGoal')
      .getRawOne();

    // Total investors
    const totalInvestors = await this.investorRepository.count();

    // Total investments
    const investmentStats = await this.investmentRepository
      .createQueryBuilder('investment')
      .select('COUNT(investment.id)', 'count')
      .addSelect('SUM(investment.amount)', 'totalAmount')
      .getRawOne();

    // Calculate average return
    const avgReturn = await this.projectRepository
      .createQueryBuilder('project')
      .where('project.status IN (:...statuses)', {
        statuses: ['ACTIVE', 'COMPLETED'],
      })
      .select('AVG(project.expectedReturn)', 'avgReturn')
      .getRawOne();

    return {
      totalProjects,
      activeProjects,
      totalFunding: parseFloat(fundingStats?.totalFunding || '0'),
      totalFundingGoal: parseFloat(fundingStats?.totalGoal || '0'),
      fundingProgress:
        fundingStats?.totalGoal > 0
          ? (fundingStats.totalFunding / fundingStats.totalGoal) * 100
          : 0,
      totalInvestors,
      totalInvestments: parseInt(investmentStats?.count || '0'),
      totalInvestmentAmount: parseFloat(investmentStats?.totalAmount || '0'),
      averageReturn: parseFloat(avgReturn?.avgReturn || '0'),
    };
  }

  /**
   * Get public projects list
   */
  async getPublicProjects(status?: string, category?: string, page = 1, limit = 12) {
    const query = this.projectRepository.createQueryBuilder('project');

    // Only show projects that are visible to public
    query.where('project.status IN (:...statuses)', {
      statuses: ['FUNDRAISING', 'FUNDED', 'ACTIVE', 'COMPLETED'],
    });

    if (status) {
      query.andWhere('project.status = :status', { status });
    }

    if (category) {
      query.andWhere('project.category = :category', { category });
    }

    query
      .orderBy('project.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [projects, total] = await query.getManyAndCount();

    // Add investor count for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const investorCount = await this.investmentRepository.count({
          where: { projectId: project.id },
        });

        const fundingProgress = project.fundingGoal
          ? (project.currentFunding / project.fundingGoal) * 100
          : 0;

        return {
          id: project.id,
          name: project.name,
          spvName: project.spvName,
          category: project.category,
          status: project.status,
          description: project.description,
          fundingGoal: project.fundingGoal,
          currentFunding: project.currentFunding,
          fundingProgress,
          expectedReturn: project.expectedReturn,
          duration: project.duration,
          minimumInvestment: project.minimumInvestment,
          investorCount,
          startDate: project.startDate,
          endDate: project.endDate,
          location: project.location,
          // Hide sensitive information
          metadata: {
            images: project.metadata?.images || [],
            highlights: project.metadata?.highlights || [],
          },
        };
      }),
    );

    return {
      projects: projectsWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get public project details
   */
  async getPublicProjectDetails(projectId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Projet non trouvé');
    }

    // Only show if project is public
    if (!['FUNDRAISING', 'FUNDED', 'ACTIVE', 'COMPLETED'].includes(project.status)) {
      throw new Error('Projet non disponible');
    }

    const investorCount = await this.investmentRepository.count({
      where: { projectId },
    });

    const fundingProgress = project.fundingGoal
      ? (project.currentFunding / project.fundingGoal) * 100
      : 0;

    // Get recent investments (anonymized)
    const recentInvestments = await this.investmentRepository.find({
      where: { projectId },
      order: { investmentDate: 'DESC' },
      take: 5,
    });

    return {
      id: project.id,
      name: project.name,
      spvName: project.spvName,
      category: project.category,
      status: project.status,
      description: project.description,
      fundingGoal: project.fundingGoal,
      currentFunding: project.currentFunding,
      fundingProgress,
      expectedReturn: project.expectedReturn,
      duration: project.duration,
      minimumInvestment: project.minimumInvestment,
      investorCount,
      startDate: project.startDate,
      endDate: project.endDate,
      location: project.location,
      metadata: {
        images: project.metadata?.images || [],
        highlights: project.metadata?.highlights || [],
        milestones: project.metadata?.milestones?.map((m: any) => ({
          title: m.title,
          status: m.status,
          progress: m.progress,
        })) || [],
        documents: project.metadata?.documents?.filter(
          (d: any) => d.public === true,
        ) || [],
      },
      recentInvestments: recentInvestments.map((inv) => ({
        amount: inv.amount,
        date: inv.investmentDate,
        // Anonymized investor
      })),
    };
  }

  /**
   * Get recent platform activity
   */
  async getRecentActivity(limit = 10) {
    const recentInvestments = await this.investmentRepository.find({
      relations: ['project'],
      order: { investmentDate: 'DESC' },
      take: limit,
    });

    const recentProjects = await this.projectRepository.find({
      where: { status: 'FUNDRAISING' },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      recentInvestments: recentInvestments.map((inv) => ({
        projectName: inv.project.name,
        amount: inv.amount,
        date: inv.investmentDate,
        // Anonymized
      })),
      recentProjects: recentProjects.map((proj) => ({
        id: proj.id,
        name: proj.name,
        category: proj.category,
        fundingGoal: proj.fundingGoal,
        currentFunding: proj.currentFunding,
        expectedReturn: proj.expectedReturn,
      })),
    };
  }

  /**
   * Get platform performance metrics
   */
  async getPerformanceMetrics() {
    // Calculate metrics for completed/active projects
    const projects = await this.projectRepository.find({
      where: [{ status: 'ACTIVE' }, { status: 'COMPLETED' }],
    });

    const totalProjects = projects.length;
    const avgFundingTime = projects.reduce((sum, p) => {
      if (p.startDate && p.fundedDate) {
        const days = Math.floor(
          (p.fundedDate.getTime() - p.startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        return sum + days;
      }
      return sum;
    }, 0) / totalProjects;

    const avgReturn = projects.reduce((sum, p) => sum + (p.expectedReturn || 0), 0) / totalProjects;

    const successRate =
      (projects.filter((p) => p.currentFunding >= p.fundingGoal).length / totalProjects) * 100;

    return {
      totalActiveProjects: totalProjects,
      averageFundingTime: Math.round(avgFundingTime) || 0,
      averageReturn: avgReturn.toFixed(2),
      successRate: successRate.toFixed(1),
      totalValueLocked: projects.reduce((sum, p) => sum + (p.currentFunding || 0), 0),
    };
  }

  /**
   * Get projects by category stats
   */
  async getCategoryStats() {
    const stats = await this.projectRepository
      .createQueryBuilder('project')
      .select('project.category', 'category')
      .addSelect('COUNT(project.id)', 'count')
      .addSelect('SUM(project.currentFunding)', 'totalFunding')
      .groupBy('project.category')
      .getRawMany();

    return stats.map((stat) => ({
      category: stat.category,
      projectCount: parseInt(stat.count),
      totalFunding: parseFloat(stat.totalFunding || '0'),
    }));
  }
}
