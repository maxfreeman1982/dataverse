import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { WalletService } from './wallet.service';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from '../entities/transaction.entity';
import { Investor } from '../entities/investor.entity';

describe('WalletService', () => {
  let service: WalletService;
  let walletRepository: jest.Mocked<Repository<Wallet>>;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;

  const mockWallet = {
    id: 'wallet-123',
    balance: 10000,
    escrowBalance: 0,
    totalDeposited: 15000,
    totalWithdrawn: 5000,
    totalInvested: 0,
    currency: 'EUR',
    investorId: 'investor-123',
    bankAccountLinked: true,
    bankAccountIban: 'FR7630001007941234567890185',
    bankAccountBic: 'BNPAFRPP',
    bankAccountHolder: 'John Doe',
  };

  const mockTransaction = {
    id: 'tx-123',
    type: 'DEPOSIT',
    status: 'PENDING',
    amount: 1000,
    currency: 'EUR',
    reference: 'DEP-001',
    walletId: 'wallet-123',
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

    const mockWalletRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const mockTxRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepo,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTxRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepository = module.get(getRepositoryToken(Wallet));
    transactionRepository = module.get(getRepositoryToken(Transaction));
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWallet', () => {
    it('should return wallet for investor', async () => {
      walletRepository.findOne.mockResolvedValue(mockWallet as Wallet);

      const result = await service.getWallet('investor-123');

      expect(result).toEqual(mockWallet);
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { investorId: 'investor-123' },
        relations: expect.any(Array),
      });
    });

    it('should throw error if wallet not found', async () => {
      walletRepository.findOne.mockResolvedValue(null);

      await expect(service.getWallet('non-existent')).rejects.toThrow();
    });
  });

  describe('initiateDeposit', () => {
    it('should create a pending deposit transaction', async () => {
      walletRepository.findOne.mockResolvedValue(mockWallet as Wallet);
      transactionRepository.create.mockReturnValue(mockTransaction as Transaction);
      transactionRepository.save.mockResolvedValue(mockTransaction as Transaction);

      const result = await service.initiateDeposit('investor-123', 1000, 'BANK_TRANSFER');

      expect(result).toHaveProperty('id');
      expect(transactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DEPOSIT',
          status: 'PENDING',
          amount: 1000,
        }),
      );
    });

    it('should throw error for invalid amount', async () => {
      await expect(
        service.initiateDeposit('investor-123', -100, 'BANK_TRANSFER'),
      ).rejects.toThrow();
    });
  });

  describe('requestWithdrawal', () => {
    it('should create withdrawal request when balance is sufficient', async () => {
      walletRepository.findOne.mockResolvedValue(mockWallet as Wallet);
      transactionRepository.create.mockReturnValue({
        ...mockTransaction,
        type: 'WITHDRAWAL',
      } as Transaction);
      transactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        type: 'WITHDRAWAL',
      } as Transaction);

      const result = await service.requestWithdrawal('investor-123', 5000);

      expect(result).toHaveProperty('type', 'WITHDRAWAL');
      expect(transactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'WITHDRAWAL',
          status: 'PENDING',
          amount: 5000,
        }),
      );
    });

    it('should throw error when balance is insufficient', async () => {
      walletRepository.findOne.mockResolvedValue(mockWallet as Wallet);

      await expect(
        service.requestWithdrawal('investor-123', 50000),
      ).rejects.toThrow('Solde insuffisant');
    });

    it('should throw error if bank account not linked', async () => {
      walletRepository.findOne.mockResolvedValue({
        ...mockWallet,
        bankAccountLinked: false,
      } as Wallet);

      await expect(
        service.requestWithdrawal('investor-123', 1000),
      ).rejects.toThrow();
    });
  });

  describe('linkBankAccount', () => {
    it('should link bank account successfully', async () => {
      walletRepository.findOne.mockResolvedValue(mockWallet as Wallet);
      walletRepository.save.mockResolvedValue({
        ...mockWallet,
        bankAccountLinked: true,
      } as Wallet);

      const bankDetails = {
        iban: 'FR7630001007941234567890185',
        bic: 'BNPAFRPP',
        accountHolder: 'John Doe',
      };

      const result = await service.linkBankAccount('investor-123', bankDetails);

      expect(result.bankAccountLinked).toBe(true);
      expect(walletRepository.save).toHaveBeenCalled();
    });

    it('should validate IBAN format', async () => {
      walletRepository.findOne.mockResolvedValue(mockWallet as Wallet);

      const invalidBankDetails = {
        iban: 'INVALID-IBAN',
        bic: 'BNPAFRPP',
        accountHolder: 'John Doe',
      };

      await expect(
        service.linkBankAccount('investor-123', invalidBankDetails),
      ).rejects.toThrow();
    });
  });

  describe('getTransactionHistory', () => {
    it('should return paginated transaction history', async () => {
      const transactions = [mockTransaction, { ...mockTransaction, id: 'tx-124' }];
      transactionRepository.find.mockResolvedValue(transactions as Transaction[]);

      const result = await service.getTransactionHistory('investor-123', 1, 10);

      expect(result).toHaveLength(2);
      expect(transactionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { walletId: expect.any(String) },
          take: 10,
          skip: 0,
        }),
      );
    });
  });
});
