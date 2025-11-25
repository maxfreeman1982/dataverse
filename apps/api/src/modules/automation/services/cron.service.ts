import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Project } from '../../oj/entities/project.entity';
import { Investment } from '../../oj/entities/investment.entity';
import { Transaction, TransactionType, TransactionStatus } from '../../oj/entities/transaction.entity';
import { EmailService } from '../../notifications/services/email.service';
import { SmsService } from '../../notifications/services/sms.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  /**
   * Calculate and distribute returns every day at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async calculateDailyReturns(): Promise<void> {
    this.logger.log('Starting daily returns calculation...');

    try {
      // Find all active investments eligible for returns
      const activeInvestments = await this.investmentRepository.find({
        where: { status: 'ACTIVE' },
        relations: ['project', 'investor'],
      });

      let totalReturnsProcessed = 0;
      let totalAmount = 0;

      for (const investment of activeInvestments) {
        // Calculate daily return based on annual return rate
        const project = investment.project;
        if (!project.returnRate) continue;

        const dailyRate = project.returnRate / 365 / 100;
        const dailyReturn = investment.amount * dailyRate;

        // Create return transaction
        const transaction = this.transactionRepository.create({
          investmentId: investment.id,
          type: TransactionType.RETURN_PAYMENT,
          amount: dailyReturn,
          status: TransactionStatus.COMPLETED,
          description: `Rendement journalier - ${project.name}`,
          metadata: {
            calculationDate: new Date(),
            annualRate: project.returnRate,
            dailyRate: dailyRate,
          },
        });

        await this.transactionRepository.save(transaction);

        // Update investment total returns
        investment.totalReturns = (investment.totalReturns || 0) + dailyReturn;
        await this.investmentRepository.save(investment);

        totalReturnsProcessed++;
        totalAmount += dailyReturn;

        // Send notification for significant returns (> €100)
        if (dailyReturn >= 100) {
          await this.emailService.sendReturnPaymentNotification(
            investment.investor.email,
            dailyReturn,
            project.name,
          );
        }
      }

      this.logger.log(
        `Daily returns calculated: ${totalReturnsProcessed} investments, €${totalAmount.toFixed(2)} total`,
      );
    } catch (error) {
      this.logger.error('Failed to calculate daily returns:', error);
    }
  }

  /**
   * Send weekly portfolio summary every Monday at 9 AM
   */
  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_9AM)
  async sendWeeklyPortfolioSummary(): Promise<void> {
    // Only run on Mondays
    if (new Date().getDay() !== 1) return;

    this.logger.log('Sending weekly portfolio summaries...');

    try {
      // Get all investors with active investments
      const investments = await this.investmentRepository.find({
        where: { status: 'ACTIVE' },
        relations: ['investor', 'project'],
      });

      // Group by investor
      const investorMap = new Map<string, any[]>();
      investments.forEach((inv) => {
        const investorId = inv.investor.id;
        if (!investorMap.has(investorId)) {
          investorMap.set(investorId, []);
        }
        investorMap.get(investorId).push(inv);
      });

      // Send summary to each investor
      for (const [investorId, invs] of investorMap.entries()) {
        const investor = invs[0].investor;
        const totalInvested = invs.reduce((sum, inv) => sum + inv.amount, 0);
        const totalReturns = invs.reduce((sum, inv) => sum + (inv.totalReturns || 0), 0);

        // Email summary (you would create a proper template)
        await this.emailService.sendEmail({
          to: investor.email,
          subject: 'Résumé hebdomadaire de votre portefeuille',
          html: `
            <h2>Résumé de votre portefeuille</h2>
            <p>Bonjour ${investor.firstName},</p>
            <p>Voici un résumé de vos investissements cette semaine:</p>
            <ul>
              <li>Investissements actifs: ${invs.length}</li>
              <li>Total investi: €${totalInvested.toLocaleString()}</li>
              <li>Rendements totaux: €${totalReturns.toLocaleString()}</li>
              <li>Performance: +${((totalReturns / totalInvested) * 100).toFixed(2)}%</li>
            </ul>
            <p>Consultez votre tableau de bord pour plus de détails.</p>
          `,
        });
      }

      this.logger.log(`Weekly summaries sent to ${investorMap.size} investors`);
    } catch (error) {
      this.logger.error('Failed to send weekly summaries:', error);
    }
  }

  /**
   * Check project deadlines every day at 3 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async checkProjectDeadlines(): Promise<void> {
    this.logger.log('Checking project deadlines...');

    try {
      const today = new Date();
      const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Find projects ending soon
      const projectsEndingSoon = await this.projectRepository
        .createQueryBuilder('project')
        .where('project.endDate >= :today', { today })
        .andWhere('project.endDate <= :in30Days', { in30Days })
        .andWhere('project.status IN (:...statuses)', {
          statuses: ['ACTIVE', 'IN_PROGRESS'],
        })
        .getMany();

      for (const project of projectsEndingSoon) {
        const daysRemaining = Math.ceil(
          (project.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Alert if less than 7 days remaining
        if (daysRemaining <= 7) {
          this.logger.warn(
            `Project "${project.name}" ending in ${daysRemaining} days`,
          );

          // Notify all investors
          const investments = await this.investmentRepository.find({
            where: { projectId: project.id, status: 'ACTIVE' },
            relations: ['investor'],
          });

          for (const inv of investments) {
            await this.emailService.sendEmail({
              to: inv.investor.email,
              subject: `Projet "${project.name}" arrive à échéance`,
              html: `
                <h2>Échéance du projet</h2>
                <p>Le projet "${project.name}" arrive à échéance dans ${daysRemaining} jours.</p>
                <p>Votre investissement: €${inv.amount.toLocaleString()}</p>
                <p>Rendements à ce jour: €${(inv.totalReturns || 0).toLocaleString()}</p>
              `,
            });
          }
        }
      }

      this.logger.log(`Checked ${projectsEndingSoon.length} projects with upcoming deadlines`);
    } catch (error) {
      this.logger.error('Failed to check project deadlines:', error);
    }
  }

  /**
   * Clean up old pending transactions every day at 4 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async cleanupPendingTransactions(): Promise<void> {
    this.logger.log('Cleaning up old pending transactions...');

    try {
      // Cancel transactions pending for more than 48 hours
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

      const result = await this.transactionRepository
        .createQueryBuilder()
        .update(Transaction)
        .set({ status: TransactionStatus.CANCELLED })
        .where('status = :status', { status: TransactionStatus.PENDING })
        .andWhere('createdAt < :date', { date: twoDaysAgo })
        .execute();

      this.logger.log(`Cancelled ${result.affected} old pending transactions`);
    } catch (error) {
      this.logger.error('Failed to cleanup pending transactions:', error);
    }
  }

  /**
   * Update project statistics every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async updateProjectStatistics(): Promise<void> {
    this.logger.log('Updating project statistics...');

    try {
      const projects = await this.projectRepository.find({
        where: { status: 'ACTIVE' },
      });

      for (const project of projects) {
        // Calculate total raised
        const investments = await this.investmentRepository.find({
          where: { projectId: project.id, status: 'ACTIVE' },
        });

        const totalRaised = investments.reduce((sum, inv) => sum + inv.amount, 0);
        const investorCount = new Set(investments.map(inv => inv.investorId)).size;
        const progress = (totalRaised / project.targetAmount) * 100;

        // Update project
        project.currentAmount = totalRaised;
        project.investorCount = investorCount;
        project.metadata = {
          ...project.metadata,
          progress: progress,
          lastStatisticsUpdate: new Date(),
        };

        await this.projectRepository.save(project);

        // Check if project reached funding goal
        if (progress >= 100 && project.status === 'ACTIVE') {
          project.status = 'FUNDED';
          await this.projectRepository.save(project);

          this.logger.log(`Project "${project.name}" reached funding goal!`);

          // Notify all investors
          for (const inv of investments) {
            // Implementation would fetch investor details and send notification
          }
        }
      }

      this.logger.log(`Updated statistics for ${projects.length} projects`);
    } catch (error) {
      this.logger.error('Failed to update project statistics:', error);
    }
  }

  /**
   * Generate monthly reports on the 1st of each month at 6 AM
   */
  @Cron('0 6 1 * *') // At 6:00 AM on the 1st of every month
  async generateMonthlyReports(): Promise<void> {
    this.logger.log('Generating monthly reports...');

    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      lastMonth.setDate(1);
      lastMonth.setHours(0, 0, 0, 0);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      // Calculate platform statistics for last month
      const newInvestments = await this.investmentRepository.count({
        where: {
          createdAt: LessThan(thisMonth),
        },
      });

      const totalTransactions = await this.transactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.createdAt >= :start', { start: lastMonth })
        .andWhere('transaction.createdAt < :end', { end: thisMonth })
        .getCount();

      const totalVolume = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.createdAt >= :start', { start: lastMonth })
        .andWhere('transaction.createdAt < :end', { end: thisMonth })
        .getRawOne();

      this.logger.log(`Monthly report generated:
        - New investments: ${newInvestments}
        - Total transactions: ${totalTransactions}
        - Total volume: €${totalVolume?.total || 0}
      `);

      // Here you would store the report or send it to admins
    } catch (error) {
      this.logger.error('Failed to generate monthly reports:', error);
    }
  }

  /**
   * Send KYC reminders every week on Wednesday at 10 AM
   */
  @Cron('0 10 * * 3') // Every Wednesday at 10:00 AM
  async sendKYCReminders(): Promise<void> {
    this.logger.log('Sending KYC reminders...');

    try {
      // This would query investors with pending KYC status
      // and send them reminders to complete their verification

      this.logger.log('KYC reminders sent');
    } catch (error) {
      this.logger.error('Failed to send KYC reminders:', error);
    }
  }

  /**
   * Health check log every 5 minutes (for monitoring)
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async healthCheckLog(): Promise<void> {
    const activeConnections = await this.projectRepository.query(
      'SELECT COUNT(*) FROM pg_stat_activity',
    );

    this.logger.debug(`Health check: ${activeConnections[0]?.count || 0} DB connections`);
  }
}
