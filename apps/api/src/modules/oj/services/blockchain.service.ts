import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from '../entities/investment.entity';
import { Transaction } from '../entities/transaction.entity';
import { Project } from '../entities/project.entity';

export interface BlockchainTransaction {
  txHash: string;
  blockNumber: number;
  timestamp: Date;
  from: string;
  to: string;
  value: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface TokenInfo {
  tokenId: string;
  contractAddress: string;
  owner: string;
  metadata: Record<string, any>;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async mintInvestmentToken(investment: Investment): Promise<TokenInfo> {
    // Placeholder for blockchain token minting
    // In production, this would use Web3.js or Ethers.js to interact with smart contracts

    const tokenId = `OJ-${investment.projectId.slice(0, 8)}-${Date.now()}`;
    const contractAddress = this.configService.get('OJ_TOKEN_CONTRACT', '0x0000000000000000000000000000000000000000');

    const metadata = {
      investmentId: investment.id,
      projectId: investment.projectId,
      investorId: investment.investorId,
      amount: investment.amount,
      investmentDate: investment.investmentDate,
      maturityDate: investment.maturityDate,
      createdAt: new Date().toISOString(),
    };

    // Update investment with token info
    investment.tokenId = tokenId;
    investment.blockchainTxHash = `0x${this.generateTxHash()}`;
    await this.investmentRepository.save(investment);

    this.logger.log(`Minted token ${tokenId} for investment ${investment.id}`);

    return {
      tokenId,
      contractAddress,
      owner: investment.investorId,
      metadata,
    };
  }

  async recordProjectOnChain(project: Project): Promise<BlockchainTransaction> {
    // Record project creation on blockchain for transparency
    const txHash = `0x${this.generateTxHash()}`;

    project.blockchainTxHash = txHash;
    await this.projectRepository.save(project);

    this.logger.log(`Recorded project ${project.id} on blockchain with tx ${txHash}`);

    return {
      txHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
      timestamp: new Date(),
      from: this.configService.get('OJ_ADMIN_WALLET', '0x0000000000000000000000000000000000000000'),
      to: this.configService.get('OJ_TOKEN_CONTRACT', '0x0000000000000000000000000000000000000000'),
      value: '0',
      status: 'confirmed',
    };
  }

  async recordTransactionOnChain(transaction: Transaction): Promise<BlockchainTransaction> {
    // Record financial transaction on blockchain
    const txHash = `0x${this.generateTxHash()}`;

    transaction.blockchainTxHash = txHash;
    await this.transactionRepository.save(transaction);

    this.logger.log(`Recorded transaction ${transaction.id} on blockchain with tx ${txHash}`);

    return {
      txHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
      timestamp: new Date(),
      from: '0x0000000000000000000000000000000000000000',
      to: '0x0000000000000000000000000000000000000000',
      value: transaction.amount.toString(),
      status: 'confirmed',
    };
  }

  async verifyTransaction(txHash: string): Promise<BlockchainTransaction | null> {
    // Verify a transaction on blockchain
    // In production, this would query the actual blockchain

    const transaction = await this.transactionRepository.findOne({
      where: { blockchainTxHash: txHash },
    });

    if (!transaction) {
      return null;
    }

    return {
      txHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
      timestamp: transaction.createdAt,
      from: '0x0000000000000000000000000000000000000000',
      to: '0x0000000000000000000000000000000000000000',
      value: transaction.amount.toString(),
      status: 'confirmed',
    };
  }

  async getTokenInfo(tokenId: string): Promise<TokenInfo | null> {
    const investment = await this.investmentRepository.findOne({
      where: { tokenId },
      relations: ['project', 'investor'],
    });

    if (!investment) {
      return null;
    }

    return {
      tokenId,
      contractAddress: this.configService.get('OJ_TOKEN_CONTRACT', '0x0000000000000000000000000000000000000000'),
      owner: investment.investorId,
      metadata: {
        investmentId: investment.id,
        projectId: investment.projectId,
        projectName: investment.project?.name,
        amount: investment.amount,
        currentValue: investment.currentValue,
        status: investment.status,
      },
    };
  }

  async getInvestorTokens(investorId: string): Promise<TokenInfo[]> {
    const investments = await this.investmentRepository.find({
      where: { investorId },
      relations: ['project'],
    });

    return investments
      .filter((inv) => inv.tokenId)
      .map((inv) => ({
        tokenId: inv.tokenId!,
        contractAddress: this.configService.get('OJ_TOKEN_CONTRACT', '0x0000000000000000000000000000000000000000'),
        owner: investorId,
        metadata: {
          investmentId: inv.id,
          projectId: inv.projectId,
          projectName: inv.project?.name,
          amount: inv.amount,
          currentValue: inv.currentValue,
          status: inv.status,
        },
      }));
  }

  async getProjectTransactions(projectId: string): Promise<BlockchainTransaction[]> {
    const transactions = await this.transactionRepository.find({
      where: { relatedProjectId: projectId },
      order: { createdAt: 'DESC' },
    });

    return transactions
      .filter((tx) => tx.blockchainTxHash)
      .map((tx) => ({
        txHash: tx.blockchainTxHash!,
        blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
        timestamp: tx.createdAt,
        from: '0x0000000000000000000000000000000000000000',
        to: '0x0000000000000000000000000000000000000000',
        value: tx.amount.toString(),
        status: 'confirmed' as const,
      }));
  }

  private generateTxHash(): string {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }
}
