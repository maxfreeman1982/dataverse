import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction, TransactionStatus, TransactionType, PaymentMethod } from '../entities/transaction.entity';
import { Wallet } from '../entities/wallet.entity';
import { Investor } from '../entities/investor.entity';

export interface EscrowAccount {
  id: string;
  projectId: string;
  projectName: string;
  totalDeposits: number;
  totalWithdrawals: number;
  currentBalance: number;
  status: 'ACTIVE' | 'FROZEN' | 'RELEASED';
  createdAt: Date;
}

export interface BankTransactionSummary {
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingDepositsCount: number;
  pendingWithdrawalsCount: number;
  todayDeposits: number;
  todayWithdrawals: number;
  totalProcessedToday: number;
}

export interface TransactionValidation {
  transactionId: string;
  action: 'APPROVE' | 'REJECT';
  reason?: string;
  bankReference?: string;
}

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Investor)
    private investorRepository: Repository<Investor>,
  ) {}

  async getBankSummary(): Promise<BankTransactionSummary> {
    const pendingDeposits = await this.transactionRepository.find({
      where: { type: TransactionType.DEPOSIT, status: TransactionStatus.PENDING },
    });

    const pendingWithdrawals = await this.transactionRepository.find({
      where: { type: TransactionType.WITHDRAWAL, status: TransactionStatus.PENDING },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransactions = await this.transactionRepository.find({
      where: {
        completedAt: Between(today, tomorrow),
        status: TransactionStatus.COMPLETED,
      },
    });

    const todayDepositsTotal = todayTransactions
      .filter((t) => t.type === TransactionType.DEPOSIT)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const todayWithdrawalsTotal = todayTransactions
      .filter((t) => t.type === TransactionType.WITHDRAWAL)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      pendingDeposits: pendingDeposits.reduce((sum, t) => sum + Number(t.amount), 0),
      pendingWithdrawals: pendingWithdrawals.reduce((sum, t) => sum + Number(t.amount), 0),
      pendingDepositsCount: pendingDeposits.length,
      pendingWithdrawalsCount: pendingWithdrawals.length,
      todayDeposits: todayDepositsTotal,
      todayWithdrawals: todayWithdrawalsTotal,
      totalProcessedToday: todayTransactions.length,
    };
  }

  async getPendingDeposits(): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { type: TransactionType.DEPOSIT, status: TransactionStatus.PENDING },
      relations: ['wallet'],
      order: { createdAt: 'ASC' },
    });
  }

  async getPendingWithdrawals(): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { type: TransactionType.WITHDRAWAL, status: TransactionStatus.PENDING },
      relations: ['wallet'],
      order: { createdAt: 'ASC' },
    });
  }

  async validateDeposit(
    transactionId: string,
    approve: boolean,
    bankReference?: string,
    reason?: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOneOrFail({
      where: { id: transactionId, type: TransactionType.DEPOSIT },
      relations: ['wallet'],
    });

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Cette transaction ne peut pas être validée');
    }

    if (approve) {
      // Approve deposit
      const wallet = transaction.wallet;
      wallet.pendingBalance = Number(wallet.pendingBalance) - Number(transaction.amount);
      wallet.balance = Number(wallet.balance) + Number(transaction.amount);
      await this.walletRepository.save(wallet);

      transaction.status = TransactionStatus.COMPLETED;
      transaction.completedAt = new Date();
      transaction.externalReference = bankReference;
      transaction.metadata = {
        ...transaction.metadata,
        bankValidation: {
          approvedAt: new Date().toISOString(),
          bankReference,
        },
      };
    } else {
      // Reject deposit
      const wallet = transaction.wallet;
      wallet.pendingBalance = Number(wallet.pendingBalance) - Number(transaction.amount);
      await this.walletRepository.save(wallet);

      transaction.status = TransactionStatus.CANCELLED;
      transaction.metadata = {
        ...transaction.metadata,
        bankValidation: {
          rejectedAt: new Date().toISOString(),
          reason,
        },
      };
    }

    return this.transactionRepository.save(transaction);
  }

  async validateWithdrawal(
    transactionId: string,
    approve: boolean,
    bankReference?: string,
    reason?: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOneOrFail({
      where: { id: transactionId, type: TransactionType.WITHDRAWAL },
      relations: ['wallet'],
    });

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Cette transaction ne peut pas être validée');
    }

    const wallet = transaction.wallet;

    if (approve) {
      // Approve withdrawal - funds already reserved, just complete
      wallet.pendingBalance = Number(wallet.pendingBalance) - Number(transaction.amount);
      await this.walletRepository.save(wallet);

      transaction.status = TransactionStatus.COMPLETED;
      transaction.completedAt = new Date();
      transaction.externalReference = bankReference;
      transaction.metadata = {
        ...transaction.metadata,
        bankValidation: {
          approvedAt: new Date().toISOString(),
          bankReference,
        },
      };
    } else {
      // Reject withdrawal - return funds to available balance
      wallet.pendingBalance = Number(wallet.pendingBalance) - Number(transaction.amount);
      wallet.balance = Number(wallet.balance) + Number(transaction.amount);
      await this.walletRepository.save(wallet);

      transaction.status = TransactionStatus.CANCELLED;
      transaction.metadata = {
        ...transaction.metadata,
        bankValidation: {
          rejectedAt: new Date().toISOString(),
          reason,
        },
      };
    }

    return this.transactionRepository.save(transaction);
  }

  async getTransactionHistory(
    page = 1,
    limit = 50,
    type?: TransactionType,
    status?: TransactionStatus,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ transactions: Transaction[]; total: number; pages: number }> {
    let queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.wallet', 'wallet');

    if (type) {
      queryBuilder = queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (status) {
      queryBuilder = queryBuilder.andWhere('transaction.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder = queryBuilder.andWhere(
        'transaction.createdAt BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    }

    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);

    const transactions = await queryBuilder
      .orderBy('transaction.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { transactions, total, pages };
  }

  async getTransactionDetails(transactionId: string): Promise<Transaction & { investor?: Investor }> {
    const transaction = await this.transactionRepository.findOneOrFail({
      where: { id: transactionId },
      relations: ['wallet'],
    });

    const investor = await this.investorRepository.findOne({
      where: { id: transaction.wallet.investorId },
    });

    return { ...transaction, investor: investor || undefined };
  }

  async flagTransaction(transactionId: string, flagReason: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOneOrFail({
      where: { id: transactionId },
    });

    transaction.metadata = {
      ...transaction.metadata,
      flagged: true,
      flagReason,
      flaggedAt: new Date().toISOString(),
    };

    return this.transactionRepository.save(transaction);
  }

  async getEscrowSummary(): Promise<{
    totalInEscrow: number;
    byProject: { projectId: string; amount: number }[];
  }> {
    // Get all investments that are holding funds
    const investments = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.type = :type', { type: TransactionType.INVESTMENT })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('transaction.relatedProjectId IS NOT NULL')
      .select('transaction.relatedProjectId', 'projectId')
      .addSelect('SUM(transaction.amount)', 'amount')
      .groupBy('transaction.relatedProjectId')
      .getRawMany();

    const totalInEscrow = investments.reduce((sum, i) => sum + Number(i.amount), 0);

    return {
      totalInEscrow,
      byProject: investments.map((i) => ({
        projectId: i.projectId,
        amount: Number(i.amount),
      })),
    };
  }

  async exportTransactions(
    startDate: Date,
    endDate: Date,
    format: 'CSV' | 'JSON',
  ): Promise<string> {
    const transactions = await this.transactionRepository.find({
      where: { createdAt: Between(startDate, endDate) },
      relations: ['wallet'],
      order: { createdAt: 'ASC' },
    });

    if (format === 'JSON') {
      return JSON.stringify(transactions, null, 2);
    }

    // CSV format
    const headers = [
      'Reference',
      'Date',
      'Type',
      'Status',
      'Amount',
      'Currency',
      'Payment Method',
      'Wallet ID',
      'Description',
    ];

    const rows = transactions.map((t) => [
      t.reference,
      t.createdAt.toISOString(),
      t.type,
      t.status,
      t.amount.toString(),
      t.currency,
      t.paymentMethod,
      t.walletId,
      t.description || '',
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
