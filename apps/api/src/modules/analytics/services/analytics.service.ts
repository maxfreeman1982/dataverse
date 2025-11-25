import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../oj/entities/project.entity';
import { Investment } from '../../oj/entities/investment.entity';
import { Transaction } from '../../oj/entities/transaction.entity';
import { SentryService } from '../../../common/monitoring/sentry.config';

export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalInvestments: number;
  totalInvested: number;
  totalReturns: number;
  averageInvestment: number;
  conversionRate: number;
}

export interface UserMetrics {
  userId: string;
  totalInvested: number;
  totalReturns: number;
  activeInvestments: number;
  portfolioValue: number;
  roi: number;
  lastActivity: Date;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private analyticsEnabled: boolean;

  constructor(
    private configService: ConfigService,
    private sentryService: SentryService,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {
    this.analyticsEnabled = this.configService.get<string>('ANALYTICS_ENABLED', 'true') === 'true';
  }

  /**
   * Track a custom event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.analyticsEnabled) return;

    this.logger.debug(`Event tracked: ${event.eventName}`, event.properties);

    // Send to Sentry
    this.sentryService.trackEvent(event.eventName, {
      ...event.properties,
      userId: event.userId,
      timestamp: event.timestamp || new Date(),
    });

    // Here you would also send to Google Analytics, Mixpanel, etc.
    // this.sendToGoogleAnalytics(event);
    // this.sendToMixpanel(event);
  }

  /**
   * Track page view
   */
  trackPageView(userId: string, page: string, referrer?: string): void {
    this.trackEvent({
      eventName: 'page_view',
      userId,
      properties: {
        page,
        referrer,
      },
    });
  }

  /**
   * Track user registration
   */
  trackRegistration(userId: string, method: string): void {
    this.trackEvent({
      eventName: 'user_registered',
      userId,
      properties: {
        method, // email, google, etc.
        timestamp: new Date(),
      },
    });
  }

  /**
   * Track login
   */
  trackLogin(userId: string, method: string): void {
    this.trackEvent({
      eventName: 'user_login',
      userId,
      properties: {
        method, // password, 2fa, biometric
        timestamp: new Date(),
      },
    });
  }

  /**
   * Track investment creation
   */
  trackInvestment(
    userId: string,
    projectId: string,
    amount: number,
    success: boolean,
  ): void {
    this.trackEvent({
      eventName: success ? 'investment_created' : 'investment_failed',
      userId,
      properties: {
        projectId,
        amount,
        currency: 'EUR',
        timestamp: new Date(),
      },
    });
  }

  /**
   * Track KYC submission
   */
  trackKYCSubmission(userId: string, documentType: string): void {
    this.trackEvent({
      eventName: 'kyc_submitted',
      userId,
      properties: {
        documentType,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Track withdrawal request
   */
  trackWithdrawal(userId: string, amount: number, success: boolean): void {
    this.trackEvent({
      eventName: success ? 'withdrawal_requested' : 'withdrawal_failed',
      userId,
      properties: {
        amount,
        currency: 'EUR',
        timestamp: new Date(),
      },
    });
  }

  /**
   * Track project view
   */
  trackProjectView(userId: string, projectId: string): void {
    this.trackEvent({
      eventName: 'project_viewed',
      userId,
      properties: {
        projectId,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Get platform-wide metrics
   */
  async getPlatformMetrics(): Promise<PlatformMetrics> {
    try {
      // Total and active projects
      const totalProjects = await this.projectRepository.count();
      const activeProjects = await this.projectRepository.count({
        where: { status: 'ACTIVE' },
      });

      // Investment metrics
      const investments = await this.investmentRepository.find({
        where: { status: 'ACTIVE' },
      });

      const totalInvestments = investments.length;
      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
      const totalReturns = investments.reduce(
        (sum, inv) => sum + (inv.totalReturns || 0),
        0,
      );
      const averageInvestment = totalInvestments > 0 ? totalInvested / totalInvestments : 0;

      // Unique users
      const uniqueInvestors = new Set(investments.map(inv => inv.investorId));
      const activeUsers = uniqueInvestors.size;

      // Conversion rate (simplified - would need more data)
      const conversionRate = 0; // This would require tracking visitors vs investors

      return {
        totalUsers: activeUsers, // Simplified
        activeUsers,
        totalProjects,
        activeProjects,
        totalInvestments,
        totalInvested,
        totalReturns,
        averageInvestment,
        conversionRate,
      };
    } catch (error) {
      this.logger.error('Failed to get platform metrics:', error);
      throw error;
    }
  }

  /**
   * Get user-specific metrics
   */
  async getUserMetrics(userId: string): Promise<UserMetrics> {
    try {
      const investments = await this.investmentRepository.find({
        where: { investorId: userId, status: 'ACTIVE' },
      });

      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
      const totalReturns = investments.reduce(
        (sum, inv) => sum + (inv.totalReturns || 0),
        0,
      );
      const activeInvestments = investments.length;
      const portfolioValue = totalInvested + totalReturns;
      const roi = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

      // Get last activity
      const lastTransaction = await this.transactionRepository.findOne({
        where: { investment: { investorId: userId } },
        order: { createdAt: 'DESC' },
      });

      return {
        userId,
        totalInvested,
        totalReturns,
        activeInvestments,
        portfolioValue,
        roi,
        lastActivity: lastTransaction?.createdAt || new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to get metrics for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get project performance metrics
   */
  async getProjectMetrics(projectId: string): Promise<any> {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      const investments = await this.investmentRepository.find({
        where: { projectId, status: 'ACTIVE' },
      });

      const totalRaised = investments.reduce((sum, inv) => sum + inv.amount, 0);
      const investorCount = new Set(investments.map(inv => inv.investorId)).size;
      const averageInvestment = investments.length > 0 ? totalRaised / investments.length : 0;
      const fundingProgress = (totalRaised / project.targetAmount) * 100;

      return {
        projectId,
        projectName: project.name,
        totalRaised,
        targetAmount: project.targetAmount,
        fundingProgress,
        investorCount,
        averageInvestment,
        status: project.status,
        createdAt: project.createdAt,
      };
    } catch (error) {
      this.logger.error(`Failed to get metrics for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get daily active users (DAU)
   */
  async getDailyActiveUsers(): Promise<number> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // This would require a user activity tracking table
    // Simplified implementation
    return 0;
  }

  /**
   * Get monthly active users (MAU)
   */
  async getMonthlyActiveUsers(): Promise<number> {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // This would require a user activity tracking table
    // Simplified implementation
    return 0;
  }

  /**
   * Calculate retention rate
   */
  async getRetentionRate(cohortDate: Date): Promise<number> {
    // This would require cohort analysis
    // Simplified implementation
    return 0;
  }

  /**
   * Get top performing projects
   */
  async getTopProjects(limit: number = 10): Promise<any[]> {
    const projects = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.investments', 'investment')
      .where('project.status = :status', { status: 'ACTIVE' })
      .orderBy('project.currentAmount', 'DESC')
      .limit(limit)
      .getMany();

    return projects.map(project => ({
      id: project.id,
      name: project.name,
      raised: project.currentAmount,
      target: project.targetAmount,
      progress: (project.currentAmount / project.targetAmount) * 100,
    }));
  }
}
