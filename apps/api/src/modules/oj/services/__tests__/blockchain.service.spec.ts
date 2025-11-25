import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BlockchainService } from '../blockchain.service';
import { Investment } from '../../entities/investment.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Project } from '../../entities/project.entity';

describe('BlockchainService', () => {
  let service: BlockchainService;

  const mockInvestmentRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockTransactionRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockProjectRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config = {
        BLOCKCHAIN_RPC_URL: 'http://localhost:8545',
        BLOCKCHAIN_PRIVATE_KEY: '0xtest123',
        OJ_INVESTMENT_MANAGER_ADDRESS: '0xmanager123',
        OJ_ESCROW_ADDRESS: '0xescrow123',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(Investment),
          useValue: mockInvestmentRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
      ],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProjectStats', () => {
    it('should return null when contract not initialized', async () => {
      const result = await service.getProjectStats('project-123');
      expect(result).toBeNull();
    });
  });

  describe('getEscrowBalance', () => {
    it('should throw error when contract not initialized', async () => {
      await expect(service.getEscrowBalance('project-123')).rejects.toThrow();
    });
  });
});
