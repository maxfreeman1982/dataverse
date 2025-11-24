import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { BankService } from './bank.service';
import { Transaction } from '../entities/transaction.entity';
import { Wallet } from '../entities/wallet.entity';
import { Project } from '../entities/project.entity';

describe('BankService', () => {
  let service: BankService;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;
  let walletRepository: jest.Mocked<Repository<Wallet>>;
  let projectRepository: jest.Mocked<Repository<Project>>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;

  const mockTransaction = {
    id: 'tx-123',
    type: 'DEPOSIT',
    status: 'PENDING',
    amount: 1000,
    currency: 'EUR',
    reference: 'DEP-001',
    walletId: 'wallet-123',
    wallet: {
      id: 'wallet-123',
      balance: 5000,
      investorId: 'investor-123',
    },
  };

  const mockWithdrawalTx = {
    id: 'tx-456',
    type: 'WITHDRAWAL',
    status: 'PENDING',
    amount: 2000,
    currency: 'EUR',
    reference: 'WTH-001',
    walletId: 'wallet-123',
    wallet: {
      id: 'wallet-123',
      balance: 5000,
      bankAccountIban: 'FR7630001007941234567890185',
      investorId: 'investor-123',
    },
  };

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as jest.Mocked<QueryRunner>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
              getCount: jest.fn().mockResolvedValue(0),
              getRawOne: jest.fn().mockResolvedValue({ sum: 0 }),
            }),
          },
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Project),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<BankService>(BankService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
    walletRepository = module.get(getRepositoryToken(Wallet));
    projectRepository = module.get(getRepositoryToken(Project));
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return bank summary statistics', async () => {
      transactionRepository.find.mockResolvedValue([mockTransaction] as Transaction[]);

      const result = await service.getSummary();

      expect(result).toHaveProperty('pendingDeposits');
      expect(result).toHaveProperty('pendingWithdrawals');
      expect(result).toHaveProperty('pendingDepositsCount');
      expect(result).toHaveProperty('pendingWithdrawalsCount');
    });
  });

  describe('getPendingDeposits', () => {
    it('should return list of pending deposits', async () => {
      transactionRepository.find.mockResolvedValue([mockTransaction] as Transaction[]);

      const result = await service.getPendingDeposits();

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('DEPOSIT');
      expect(result[0].status).toBe('PENDING');
    });
  });

  describe('getPendingWithdrawals', () => {
    it('should return list of pending withdrawals', async () => {
      transactionRepository.find.mockResolvedValue([mockWithdrawalTx] as Transaction[]);

      const result = await service.getPendingWithdrawals();

      expect(result).toHaveLength(1);
      expect(transactionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: 'WITHDRAWAL', status: 'PENDING' },
        }),
      );
    });
  });

  describe('validateDeposit', () => {
    it('should approve deposit and credit wallet', async () => {
      transactionRepository.findOne.mockResolvedValue(mockTransaction as Transaction);
      queryRunner.manager.findOne.mockResolvedValue(mockTransaction.wallet as Wallet);
      queryRunner.manager.save.mockResolvedValue({
        ...mockTransaction,
        status: 'COMPLETED',
      } as Transaction);

      const result = await service.validateDeposit('tx-123', true, 'BANK-REF-001');

      expect(result.status).toBe('COMPLETED');
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should reject deposit with reason', async () => {
      transactionRepository.findOne.mockResolvedValue(mockTransaction as Transaction);
      transactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        status: 'REJECTED',
      } as Transaction);

      const result = await service.validateDeposit('tx-123', false, undefined, 'Invalid payment');

      expect(result.status).toBe('REJECTED');
    });

    it('should throw error if transaction not found', async () => {
      transactionRepository.findOne.mockResolvedValue(null);

      await expect(service.validateDeposit('non-existent', true)).rejects.toThrow();
    });

    it('should throw error if transaction is not pending', async () => {
      transactionRepository.findOne.mockResolvedValue({
        ...mockTransaction,
        status: 'COMPLETED',
      } as Transaction);

      await expect(service.validateDeposit('tx-123', true)).rejects.toThrow();
    });
  });

  describe('validateWithdrawal', () => {
    it('should approve withdrawal and debit wallet', async () => {
      transactionRepository.findOne.mockResolvedValue(mockWithdrawalTx as Transaction);
      queryRunner.manager.findOne.mockResolvedValue(mockWithdrawalTx.wallet as Wallet);
      queryRunner.manager.save.mockResolvedValue({
        ...mockWithdrawalTx,
        status: 'COMPLETED',
      } as Transaction);

      const result = await service.validateWithdrawal('tx-456', true, 'BANK-REF-002');

      expect(result.status).toBe('COMPLETED');
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should reject withdrawal with reason', async () => {
      transactionRepository.findOne.mockResolvedValue(mockWithdrawalTx as Transaction);
      transactionRepository.save.mockResolvedValue({
        ...mockWithdrawalTx,
        status: 'REJECTED',
      } as Transaction);

      // Also need to refund the wallet
      walletRepository.findOne.mockResolvedValue(mockWithdrawalTx.wallet as Wallet);
      walletRepository.save.mockResolvedValue({
        ...mockWithdrawalTx.wallet,
        balance: 7000, // Original + refund
      } as Wallet);

      const result = await service.validateWithdrawal(
        'tx-456',
        false,
        undefined,
        'Insufficient bank funds',
      );

      expect(result.status).toBe('REJECTED');
    });
  });

  describe('getTransactionHistory', () => {
    it('should return paginated transaction history', async () => {
      const transactions = [mockTransaction, mockWithdrawalTx];
      transactionRepository.find.mockResolvedValue(transactions as Transaction[]);
      transactionRepository.count.mockResolvedValue(2);

      const result = await service.getTransactionHistory(1, 10);

      expect(result).toHaveProperty('transactions');
      expect(result).toHaveProperty('total');
      expect(result.transactions).toHaveLength(2);
    });

    it('should filter by transaction type', async () => {
      transactionRepository.find.mockResolvedValue([mockTransaction] as Transaction[]);
      transactionRepository.count.mockResolvedValue(1);

      const result = await service.getTransactionHistory(1, 10, 'DEPOSIT');

      expect(transactionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'DEPOSIT' }),
        }),
      );
    });
  });

  describe('getEscrowAccounts', () => {
    it('should return list of escrow accounts', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Solar Farm',
          escrowBalance: 500000,
          fundingGoal: 1000000,
        },
      ];
      projectRepository.find.mockResolvedValue(mockProjects as Project[]);

      const result = await service.getEscrowAccounts();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('balance');
    });
  });

  describe('releaseEscrow', () => {
    it('should release escrow funds successfully', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Solar Farm',
        escrowBalance: 500000,
        fundingGoal: 1000000,
      };
      projectRepository.findOne.mockResolvedValue(mockProject as Project);

      const result = await service.releaseEscrow('project-1', 100000, 'Milestone payment');

      expect(result).toHaveProperty('balance');
    });

    it('should throw error if escrow balance insufficient', async () => {
      const mockProject = {
        id: 'project-1',
        escrowBalance: 50000,
      };
      projectRepository.findOne.mockResolvedValue(mockProject as Project);

      await expect(
        service.releaseEscrow('project-1', 100000, 'Payment'),
      ).rejects.toThrow();
    });
  });
});
