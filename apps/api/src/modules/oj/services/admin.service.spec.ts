import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { Investor } from '../entities/investor.entity';
import { Project } from '../entities/project.entity';
import { Investment } from '../entities/investment.entity';
import { Transaction } from '../entities/transaction.entity';
import { KycVerification } from '../entities/kyc-verification.entity';

describe('AdminService', () => {
  let service: AdminService;
  let investorRepository: jest.Mocked<Repository<Investor>>;
  let projectRepository: jest.Mocked<Repository<Project>>;
  let investmentRepository: jest.Mocked<Repository<Investment>>;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;
  let kycRepository: jest.Mocked<Repository<KycVerification>>;

  const mockInvestors = [
    {
      id: 'investor-1',
      email: 'investor1@test.com',
      firstName: 'John',
      lastName: 'Doe',
      status: 'ACTIVE',
      createdAt: new Date(),
    },
    {
      id: 'investor-2',
      email: 'investor2@test.com',
      firstName: 'Jane',
      lastName: 'Smith',
      status: 'PENDING',
      createdAt: new Date(),
    },
  ];

  const mockProjects = [
    {
      id: 'project-1',
      name: 'Solar Farm Alpha',
      status: 'FUNDRAISING',
      fundingGoal: 1000000,
      currentFunding: 500000,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Investor),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockResolvedValue(10),
              getMany: jest.fn().mockResolvedValue(mockInvestors),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([]),
            }),
          },
        },
        {
          provide: getRepositoryToken(Project),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ sum: 1000000 }),
            }),
          },
        },
        {
          provide: getRepositoryToken(Investment),
          useValue: {
            find: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ sum: 500000 }),
            }),
          },
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            find: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ sum: 100000 }),
              getCount: jest.fn().mockResolvedValue(5),
            }),
          },
        },
        {
          provide: getRepositoryToken(KycVerification),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    investorRepository = module.get(getRepositoryToken(Investor));
    projectRepository = module.get(getRepositoryToken(Project));
    investmentRepository = module.get(getRepositoryToken(Investment));
    transactionRepository = module.get(getRepositoryToken(Transaction));
    kycRepository = module.get(getRepositoryToken(KycVerification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      investorRepository.count.mockResolvedValue(100);
      projectRepository.count.mockResolvedValue(10);
      transactionRepository.count.mockResolvedValue(5);

      const result = await service.getDashboardStats();

      expect(result).toHaveProperty('totalInvestors');
      expect(result).toHaveProperty('totalProjects');
      expect(result).toHaveProperty('pendingTransactions');
    });
  });

  describe('getAllInvestors', () => {
    it('should return paginated list of investors', async () => {
      investorRepository.find.mockResolvedValue(mockInvestors as Investor[]);
      investorRepository.count.mockResolvedValue(2);

      const result = await service.getAllInvestors(1, 10);

      expect(result).toHaveProperty('investors');
      expect(result).toHaveProperty('total');
      expect(result.investors).toHaveLength(2);
    });

    it('should filter investors by status', async () => {
      investorRepository.find.mockResolvedValue([mockInvestors[0]] as Investor[]);
      investorRepository.count.mockResolvedValue(1);

      const result = await service.getAllInvestors(1, 10, 'ACTIVE');

      expect(investorRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ACTIVE' }),
        }),
      );
    });
  });

  describe('getPendingKyc', () => {
    it('should return list of pending KYC verifications', async () => {
      const mockPendingKyc = [
        {
          id: 'kyc-1',
          status: 'PENDING',
          investor: mockInvestors[1],
        },
      ];
      kycRepository.find.mockResolvedValue(mockPendingKyc as KycVerification[]);

      const result = await service.getPendingKyc();

      expect(result).toHaveLength(1);
      expect(kycRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PENDING' },
        }),
      );
    });
  });

  describe('approveKyc', () => {
    it('should approve KYC and update investor status', async () => {
      const mockKyc = {
        id: 'kyc-1',
        status: 'PENDING',
        investorId: 'investor-1',
      };
      kycRepository.findOne.mockResolvedValue(mockKyc as KycVerification);
      kycRepository.save.mockResolvedValue({
        ...mockKyc,
        status: 'APPROVED',
      } as KycVerification);
      investorRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.approveKyc('investor-1', 'STANDARD');

      expect(result.status).toBe('APPROVED');
      expect(kycRepository.save).toHaveBeenCalled();
    });

    it('should throw error if KYC not found', async () => {
      kycRepository.findOne.mockResolvedValue(null);

      await expect(service.approveKyc('non-existent', 'STANDARD')).rejects.toThrow();
    });
  });

  describe('rejectKyc', () => {
    it('should reject KYC with reason', async () => {
      const mockKyc = {
        id: 'kyc-1',
        status: 'PENDING',
        investorId: 'investor-1',
      };
      kycRepository.findOne.mockResolvedValue(mockKyc as KycVerification);
      kycRepository.save.mockResolvedValue({
        ...mockKyc,
        status: 'REJECTED',
        rejectionReason: 'Invalid documents',
      } as KycVerification);

      const result = await service.rejectKyc('investor-1', 'Invalid documents');

      expect(result.status).toBe('REJECTED');
      expect(result.rejectionReason).toBe('Invalid documents');
    });
  });

  describe('getFinancialReport', () => {
    it('should return financial report for period', async () => {
      const result = await service.getFinancialReport('month');

      expect(result).toHaveProperty('totalDeposits');
      expect(result).toHaveProperty('totalWithdrawals');
      expect(result).toHaveProperty('totalInvestments');
    });
  });

  describe('getAllProjects', () => {
    it('should return all projects', async () => {
      projectRepository.find.mockResolvedValue(mockProjects as Project[]);

      const result = await service.getAllProjects();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('name', 'Solar Farm Alpha');
    });
  });

  describe('updateProjectStatus', () => {
    it('should update project status', async () => {
      projectRepository.findOne.mockResolvedValue(mockProjects[0] as Project);
      projectRepository.save.mockResolvedValue({
        ...mockProjects[0],
        status: 'FUNDED',
      } as Project);

      const result = await service.updateProjectStatus('project-1', 'FUNDED');

      expect(result.status).toBe('FUNDED');
      expect(projectRepository.save).toHaveBeenCalled();
    });

    it('should throw error if project not found', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProjectStatus('non-existent', 'FUNDED'),
      ).rejects.toThrow();
    });
  });
});
