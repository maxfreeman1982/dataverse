import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletStatus } from '../entities/wallet.entity';
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from '../entities/transaction.entity';
import { DepositInput, WithdrawInput, LinkBankAccountInput, WalletSummary } from '../dto/wallet.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getWalletByInvestorId(investorId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { investorId },
      relations: ['transactions'],
    });

    if (!wallet) {
      throw new NotFoundException('Portefeuille non trouvé');
    }

    return wallet;
  }

  async getWalletSummary(investorId: string): Promise<WalletSummary> {
    const wallet = await this.getWalletByInvestorId(investorId);

    return {
      totalBalance: Number(wallet.balance) + Number(wallet.pendingBalance),
      availableBalance: Number(wallet.balance),
      pendingBalance: Number(wallet.pendingBalance),
      totalInvested: Number(wallet.totalInvested),
      totalReturns: Number(wallet.totalReturns),
      unrealizedReturns: 0, // Calculate from active investments
    };
  }

  async deposit(investorId: string, input: DepositInput): Promise<Transaction> {
    const wallet = await this.getWalletByInvestorId(investorId);

    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('Votre portefeuille n\'est pas actif');
    }

    const transaction = this.transactionRepository.create({
      reference: this.generateReference('DEP'),
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      paymentMethod: input.paymentMethod,
      amount: input.amount,
      currency: 'EUR',
      description: `Dépôt via ${input.paymentMethod}`,
      walletId: wallet.id,
      externalReference: input.externalReference,
    });

    await this.transactionRepository.save(transaction);

    // Update pending balance
    wallet.pendingBalance = Number(wallet.pendingBalance) + input.amount;
    await this.walletRepository.save(wallet);

    return transaction;
  }

  async confirmDeposit(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOneOrFail({
      where: { id: transactionId },
      relations: ['wallet'],
    });

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Cette transaction ne peut pas être confirmée');
    }

    const wallet = transaction.wallet;

    // Move from pending to available
    wallet.pendingBalance = Number(wallet.pendingBalance) - Number(transaction.amount);
    wallet.balance = Number(wallet.balance) + Number(transaction.amount);
    await this.walletRepository.save(wallet);

    // Update transaction
    transaction.status = TransactionStatus.COMPLETED;
    transaction.completedAt = new Date();
    await this.transactionRepository.save(transaction);

    return transaction;
  }

  async withdraw(investorId: string, input: WithdrawInput): Promise<Transaction> {
    const wallet = await this.getWalletByInvestorId(investorId);

    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('Votre portefeuille n\'est pas actif');
    }

    if (Number(wallet.balance) < input.amount) {
      throw new BadRequestException('Solde insuffisant');
    }

    const targetIban = input.bankAccountIban || wallet.bankAccountIban;
    if (!targetIban) {
      throw new BadRequestException('Veuillez fournir un IBAN de destination');
    }

    const transaction = this.transactionRepository.create({
      reference: this.generateReference('WIT'),
      type: TransactionType.WITHDRAWAL,
      status: TransactionStatus.PENDING,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      amount: input.amount,
      currency: 'EUR',
      description: `Retrait vers ${targetIban}`,
      walletId: wallet.id,
      metadata: { targetIban },
    });

    await this.transactionRepository.save(transaction);

    // Reserve the amount
    wallet.balance = Number(wallet.balance) - input.amount;
    wallet.pendingBalance = Number(wallet.pendingBalance) + input.amount;
    await this.walletRepository.save(wallet);

    return transaction;
  }

  async confirmWithdrawal(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOneOrFail({
      where: { id: transactionId },
      relations: ['wallet'],
    });

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Cette transaction ne peut pas être confirmée');
    }

    const wallet = transaction.wallet;

    // Remove from pending
    wallet.pendingBalance = Number(wallet.pendingBalance) - Number(transaction.amount);
    await this.walletRepository.save(wallet);

    // Update transaction
    transaction.status = TransactionStatus.COMPLETED;
    transaction.completedAt = new Date();
    await this.transactionRepository.save(transaction);

    return transaction;
  }

  async cancelTransaction(transactionId: string, reason?: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOneOrFail({
      where: { id: transactionId },
      relations: ['wallet'],
    });

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Cette transaction ne peut pas être annulée');
    }

    const wallet = transaction.wallet;

    if (transaction.type === TransactionType.DEPOSIT) {
      wallet.pendingBalance = Number(wallet.pendingBalance) - Number(transaction.amount);
    } else if (transaction.type === TransactionType.WITHDRAWAL) {
      wallet.pendingBalance = Number(wallet.pendingBalance) - Number(transaction.amount);
      wallet.balance = Number(wallet.balance) + Number(transaction.amount);
    }

    await this.walletRepository.save(wallet);

    transaction.status = TransactionStatus.CANCELLED;
    transaction.metadata = { ...transaction.metadata, cancellationReason: reason };
    await this.transactionRepository.save(transaction);

    return transaction;
  }

  async linkBankAccount(investorId: string, input: LinkBankAccountInput): Promise<Wallet> {
    const wallet = await this.getWalletByInvestorId(investorId);

    wallet.bankAccountIban = input.bankAccountIban;
    wallet.bankAccountName = input.bankAccountName;
    wallet.bankName = input.bankName;

    return this.walletRepository.save(wallet);
  }

  async getTransactionHistory(investorId: string, limit = 50, offset = 0): Promise<Transaction[]> {
    const wallet = await this.getWalletByInvestorId(investorId);

    return this.transactionRepository.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getTransactionById(transactionId: string): Promise<Transaction> {
    return this.transactionRepository.findOneOrFail({
      where: { id: transactionId },
      relations: ['wallet'],
    });
  }

  private generateReference(prefix: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}
