import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
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

// ABI Imports (to be generated from compiled contracts)
const OJInvestmentManagerABI = [
  "function createProject(string projectId, string projectName, string symbol, uint256 fundingGoal, uint256 expectedReturn, uint256 projectDuration, uint256 minimumInvestment, uint256 fundingDeadline) external returns (address)",
  "function investInProject(string projectId) external payable",
  "function distributeReturns(string projectId) external payable",
  "function updateProjectStatus(string projectId, uint8 newStatus) external",
  "function getProjectToken(string projectId) external view returns (address)",
  "function getAllProjects() external view returns (string[])",
  "function getInvestorProjects(address investor) external view returns (string[])",
  "function totalProjects() external view returns (uint256)",
  "function totalFundsRaised() external view returns (uint256)",
];

const OJTokenABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function totalRaised() external view returns (uint256)",
  "function totalReturns() external view returns (uint256)",
  "function totalInvestors() external view returns (uint256)",
  "function getInvestorInfo(address investor) external view returns (uint256 tokenBalance, uint256 totalInvested, uint256 claimableReturns, uint256 totalClaimed)",
  "function getProjectStats() external view returns (uint256 raised, uint256 goal, uint256 investors, uint256 distributedReturns, uint8 currentStatus)",
  "function claimReturns() external",
  "function status() external view returns (uint8)",
];

const OJEscrowABI = [
  "function createEscrowAccount(string projectId, uint256 targetAmount) external",
  "function depositFunds(string projectId) external payable",
  "function requestRelease(string projectId, uint256 amount, address beneficiary, string reason) external returns (uint256)",
  "function approveRelease(uint256 requestId) external",
  "function rejectRelease(uint256 requestId, string rejectionReason) external",
  "function getEscrowAccount(string projectId) external view returns (uint256 balance, uint256 released, uint256 targetAmount, bool isActive)",
  "function getProjectRequests(string projectId) external view returns (uint256[])",
  "function getRequestDetails(uint256 requestId) external view returns (string projectId, uint256 amount, address beneficiary, string reason, bool approved, bool processed, uint256 requestedAt, uint256 processedAt)",
];

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private investmentManagerContract: ethers.Contract;
  private escrowContract: ethers.Contract;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async onModuleInit() {
    try {
      // Initialize provider based on network
      const rpcUrl = this.configService.get<string>(
        'BLOCKCHAIN_RPC_URL',
        'http://127.0.0.1:8545', // Default to local hardhat node
      );

      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Initialize wallet with private key
      const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');
      if (!privateKey) {
        this.logger.warn('BLOCKCHAIN_PRIVATE_KEY not set - blockchain features will be limited');
        return;
      }

      this.wallet = new ethers.Wallet(privateKey, this.provider);

      // Initialize contracts
      const investmentManagerAddress = this.configService.get<string>('OJ_INVESTMENT_MANAGER_ADDRESS');
      const escrowAddress = this.configService.get<string>('OJ_ESCROW_ADDRESS');

      if (investmentManagerAddress) {
        this.investmentManagerContract = new ethers.Contract(
          investmentManagerAddress,
          OJInvestmentManagerABI,
          this.wallet,
        );
        this.logger.log(`Connected to OJInvestmentManager at ${investmentManagerAddress}`);
      }

      if (escrowAddress) {
        this.escrowContract = new ethers.Contract(
          escrowAddress,
          OJEscrowABI,
          this.wallet,
        );
        this.logger.log(`Connected to OJEscrow at ${escrowAddress}`);
      }

      const network = await this.provider.getNetwork();
      this.logger.log(`Connected to blockchain network: ${network.name} (chainId: ${network.chainId})`);

    } catch (error) {
      this.logger.error('Failed to initialize blockchain connection:', error);
      throw error;
    }
  }

  /**
   * Creates a new project on the blockchain
   */
  async createProjectOnChain(project: Project): Promise<BlockchainTransaction> {
    try {
      if (!this.investmentManagerContract) {
        throw new Error('InvestmentManager contract not initialized');
      }

      // Calculate funding deadline (90 days from now)
      const fundingDeadline = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60);

      // Convert amounts to wei (1 EUR = 1 ETH for simplicity)
      const fundingGoal = ethers.parseEther(project.fundingGoal.toString());
      const minimumInvestment = ethers.parseEther(
        (project.minimumInvestment || 1000).toString()
      );

      this.logger.log(`Creating project ${project.id} on blockchain...`);

      const tx = await this.investmentManagerContract.createProject(
        project.id,
        project.name,
        `OJ${project.category.slice(0, 3).toUpperCase()}`, // Generate symbol from category
        fundingGoal,
        Math.floor((project.expectedReturn || 8.5) * 100), // Convert to basis points (8.5% = 850)
        project.duration || 24,
        minimumInvestment,
        fundingDeadline,
      );

      const receipt = await tx.wait();

      // Update project with blockchain info
      project.blockchainTxHash = receipt.hash;
      await this.projectRepository.save(project);

      this.logger.log(`Project ${project.id} created on blockchain with tx ${receipt.hash}`);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date(),
        from: receipt.from,
        to: receipt.to,
        value: '0',
        status: 'confirmed',
      };
    } catch (error) {
      this.logger.error(`Failed to create project on blockchain: ${error.message}`);
      throw error;
    }
  }

  /**
   * Processes an investment transaction on the blockchain
   */
  async processInvestment(investment: Investment): Promise<BlockchainTransaction> {
    try {
      if (!this.investmentManagerContract) {
        throw new Error('InvestmentManager contract not initialized');
      }

      const amountInWei = ethers.parseEther(investment.amount.toString());

      this.logger.log(`Processing investment of ${investment.amount} for project ${investment.projectId}...`);

      const tx = await this.investmentManagerContract.investInProject(
        investment.projectId,
        { value: amountInWei },
      );

      const receipt = await tx.wait();

      // Update investment with blockchain info
      investment.blockchainTxHash = receipt.hash;

      // Get token address for this project
      const tokenAddress = await this.investmentManagerContract.getProjectToken(
        investment.projectId
      );
      investment.tokenId = `${tokenAddress}-${investment.investorId}`;

      await this.investmentRepository.save(investment);

      this.logger.log(`Investment processed with tx ${receipt.hash}`);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date(),
        from: receipt.from,
        to: receipt.to,
        value: amountInWei.toString(),
        status: 'confirmed',
      };
    } catch (error) {
      this.logger.error(`Failed to process investment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mints investment token (legacy method - now handled by processInvestment)
   */
  async mintInvestmentToken(investment: Investment): Promise<TokenInfo> {
    // For backwards compatibility, call processInvestment
    const tx = await this.processInvestment(investment);

    const tokenAddress = await this.investmentManagerContract.getProjectToken(
      investment.projectId
    );

    return {
      tokenId: investment.tokenId,
      contractAddress: tokenAddress,
      owner: investment.investorId,
      metadata: {
        investmentId: investment.id,
        projectId: investment.projectId,
        investorId: investment.investorId,
        amount: investment.amount,
        txHash: tx.txHash,
      },
    };
  }

  /**
   * Records a project on the blockchain (legacy method - now handled by createProjectOnChain)
   */
  async recordProjectOnChain(project: Project): Promise<BlockchainTransaction> {
    return this.createProjectOnChain(project);
  }

  /**
   * Distributes returns to investors
   */
  async distributeReturns(projectId: string, amount: number): Promise<BlockchainTransaction> {
    try {
      if (!this.investmentManagerContract) {
        throw new Error('InvestmentManager contract not initialized');
      }

      const amountInWei = ethers.parseEther(amount.toString());

      this.logger.log(`Distributing ${amount} returns for project ${projectId}...`);

      const tx = await this.investmentManagerContract.distributeReturns(
        projectId,
        { value: amountInWei },
      );

      const receipt = await tx.wait();

      this.logger.log(`Returns distributed with tx ${receipt.hash}`);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date(),
        from: receipt.from,
        to: receipt.to,
        value: amountInWei.toString(),
        status: 'confirmed',
      };
    } catch (error) {
      this.logger.error(`Failed to distribute returns: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gets token information for an investment
   */
  async getTokenInfo(tokenId: string): Promise<TokenInfo | null> {
    const investment = await this.investmentRepository.findOne({
      where: { tokenId },
      relations: ['project', 'investor'],
    });

    if (!investment) {
      return null;
    }

    try {
      const tokenAddress = await this.investmentManagerContract.getProjectToken(
        investment.projectId
      );

      const tokenContract = new ethers.Contract(
        tokenAddress,
        OJTokenABI,
        this.provider,
      );

      const [tokenBalance, totalInvested, claimableReturns, totalClaimed] =
        await tokenContract.getInvestorInfo(investment.investorId);

      return {
        tokenId,
        contractAddress: tokenAddress,
        owner: investment.investorId,
        metadata: {
          investmentId: investment.id,
          projectId: investment.projectId,
          projectName: investment.project?.name,
          tokenBalance: ethers.formatEther(tokenBalance),
          totalInvested: ethers.formatEther(totalInvested),
          claimableReturns: ethers.formatEther(claimableReturns),
          totalClaimed: ethers.formatEther(totalClaimed),
          status: investment.status,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get token info: ${error.message}`);
      return null;
    }
  }

  /**
   * Gets all tokens for an investor
   */
  async getInvestorTokens(investorId: string): Promise<TokenInfo[]> {
    const investments = await this.investmentRepository.find({
      where: { investorId },
      relations: ['project'],
    });

    const tokens: TokenInfo[] = [];

    for (const inv of investments.filter((i) => i.tokenId)) {
      try {
        const tokenAddress = await this.investmentManagerContract.getProjectToken(
          inv.projectId
        );

        const tokenContract = new ethers.Contract(
          tokenAddress,
          OJTokenABI,
          this.provider,
        );

        const [tokenBalance, totalInvested, claimableReturns, totalClaimed] =
          await tokenContract.getInvestorInfo(investorId);

        tokens.push({
          tokenId: inv.tokenId!,
          contractAddress: tokenAddress,
          owner: investorId,
          metadata: {
            investmentId: inv.id,
            projectId: inv.projectId,
            projectName: inv.project?.name,
            tokenBalance: ethers.formatEther(tokenBalance),
            totalInvested: ethers.formatEther(totalInvested),
            claimableReturns: ethers.formatEther(claimableReturns),
            totalClaimed: ethers.formatEther(totalClaimed),
            status: inv.status,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to get token info for investment ${inv.id}: ${error.message}`);
      }
    }

    return tokens;
  }

  /**
   * Gets project statistics from blockchain
   */
  async getProjectStats(projectId: string) {
    try {
      const tokenAddress = await this.investmentManagerContract.getProjectToken(projectId);

      const tokenContract = new ethers.Contract(
        tokenAddress,
        OJTokenABI,
        this.provider,
      );

      const [raised, goal, investors, distributedReturns, currentStatus] =
        await tokenContract.getProjectStats();

      return {
        raised: ethers.formatEther(raised),
        goal: ethers.formatEther(goal),
        investors: Number(investors),
        distributedReturns: ethers.formatEther(distributedReturns),
        status: ['FUNDRAISING', 'FUNDED', 'ACTIVE', 'COMPLETED', 'CANCELLED'][currentStatus],
      };
    } catch (error) {
      this.logger.error(`Failed to get project stats: ${error.message}`);
      return null;
    }
  }

  /**
   * Verifies a transaction on the blockchain
   */
  async verifyTransaction(txHash: string): Promise<BlockchainTransaction | null> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);

      if (!receipt) {
        return null;
      }

      const block = await this.provider.getBlock(receipt.blockNumber);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date(block.timestamp * 1000),
        from: receipt.from,
        to: receipt.to,
        value: '0', // Would need to parse logs for exact value
        status: receipt.status === 1 ? 'confirmed' : 'failed',
      };
    } catch (error) {
      this.logger.error(`Failed to verify transaction: ${error.message}`);
      return null;
    }
  }

  /**
   * Gets all blockchain transactions for a project
   */
  async getProjectTransactions(projectId: string): Promise<BlockchainTransaction[]> {
    const transactions = await this.transactionRepository.find({
      where: { relatedProjectId: projectId },
      order: { createdAt: 'DESC' },
    });

    const blockchainTxs: BlockchainTransaction[] = [];

    for (const tx of transactions.filter((t) => t.blockchainTxHash)) {
      try {
        const verifiedTx = await this.verifyTransaction(tx.blockchainTxHash);
        if (verifiedTx) {
          blockchainTxs.push(verifiedTx);
        }
      } catch (error) {
        this.logger.error(`Failed to verify transaction ${tx.blockchainTxHash}: ${error.message}`);
      }
    }

    return blockchainTxs;
  }

  /**
   * Records a transaction on the blockchain
   */
  async recordTransactionOnChain(transaction: Transaction): Promise<BlockchainTransaction> {
    // Most transactions are now handled by specific methods (processInvestment, distributeReturns, etc.)
    // This method is kept for backwards compatibility

    this.logger.log(`Recording transaction ${transaction.id} - type: ${transaction.type}`);

    // Return mock data for now - in production, each transaction type would call appropriate contract method
    return {
      txHash: transaction.blockchainTxHash || '0x0',
      blockNumber: 0,
      timestamp: new Date(),
      from: '0x0',
      to: '0x0',
      value: transaction.amount.toString(),
      status: 'pending',
    };
  }

  /**
   * Escrow Methods
   */

  async createEscrowAccount(projectId: string, targetAmount: number): Promise<string> {
    try {
      if (!this.escrowContract) {
        throw new Error('Escrow contract not initialized');
      }

      const amountInWei = ethers.parseEther(targetAmount.toString());

      this.logger.log(`Creating escrow account for project ${projectId}...`);

      const tx = await this.escrowContract.createEscrowAccount(projectId, amountInWei);
      const receipt = await tx.wait();

      this.logger.log(`Escrow account created with tx ${receipt.hash}`);

      return receipt.hash;
    } catch (error) {
      this.logger.error(`Failed to create escrow account: ${error.message}`);
      throw error;
    }
  }

  async depositToEscrow(projectId: string, amount: number): Promise<string> {
    try {
      if (!this.escrowContract) {
        throw new Error('Escrow contract not initialized');
      }

      const amountInWei = ethers.parseEther(amount.toString());

      this.logger.log(`Depositing ${amount} to escrow for project ${projectId}...`);

      const tx = await this.escrowContract.depositFunds(projectId, { value: amountInWei });
      const receipt = await tx.wait();

      this.logger.log(`Funds deposited with tx ${receipt.hash}`);

      return receipt.hash;
    } catch (error) {
      this.logger.error(`Failed to deposit to escrow: ${error.message}`);
      throw error;
    }
  }

  async requestEscrowRelease(
    projectId: string,
    amount: number,
    beneficiary: string,
    reason: string,
  ): Promise<number> {
    try {
      if (!this.escrowContract) {
        throw new Error('Escrow contract not initialized');
      }

      const amountInWei = ethers.parseEther(amount.toString());

      this.logger.log(`Requesting escrow release for project ${projectId}...`);

      const tx = await this.escrowContract.requestRelease(
        projectId,
        amountInWei,
        beneficiary,
        reason,
      );
      const receipt = await tx.wait();

      // Parse logs to get request ID
      const event = receipt.logs.find((log) => {
        try {
          return this.escrowContract.interface.parseLog(log)?.name === 'ReleaseRequested';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.escrowContract.interface.parseLog(event);
        return Number(parsed.args.requestId);
      }

      throw new Error('Failed to get request ID from transaction');
    } catch (error) {
      this.logger.error(`Failed to request escrow release: ${error.message}`);
      throw error;
    }
  }

  async getEscrowBalance(projectId: string): Promise<{
    balance: string;
    released: string;
    targetAmount: string;
    isActive: boolean;
  }> {
    try {
      if (!this.escrowContract) {
        throw new Error('Escrow contract not initialized');
      }

      const [balance, released, targetAmount, isActive] =
        await this.escrowContract.getEscrowAccount(projectId);

      return {
        balance: ethers.formatEther(balance),
        released: ethers.formatEther(released),
        targetAmount: ethers.formatEther(targetAmount),
        isActive,
      };
    } catch (error) {
      this.logger.error(`Failed to get escrow balance: ${error.message}`);
      throw error;
    }
  }
}
