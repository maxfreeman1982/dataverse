import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { SpvService } from './spv.service';
import { Project } from '../entities/project.entity';
import { Investment } from '../entities/investment.entity';
import { Transaction } from '../entities/transaction.entity';

describe('SpvService', () => {
  let service: SpvService;
  let projectRepository: jest.Mocked<Repository<Project>>;
  let investmentRepository: jest.Mocked<Repository<Investment>>;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;

  const mockProject = {
    id: 'project-1',
    name: 'Solar Farm Alpha',
    spvName: 'SPV Solar Alpha',
    status: 'FUNDRAISING',
    fundingGoal: 1000000,
    currentFunding: 500000,
    expectedReturn: 8.5,
    duration: 24,
    escrowBalance: 450000,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2026-01-01'),
    metadata: {
      milestones: [
        {
          id: 'milestone-1',
          title: 'Site Acquisition',
          status: 'COMPLETED',
          progress: 100,
        },
      ],
      documents: [
        {
          id: 'doc-1',
          type: 'FINANCIAL',
          title: 'Q1 Report',
          fileUrl: 'https://example.com/report.pdf',
        },
      ],
      escrowRequests: [],
    },
  };

  const mockInvestments = [
    {
      id: 'inv-1',
      projectId: 'project-1',
      amount: 10000,
      tokensAmount: 1000,
      investmentDate: new Date(),
      currentValue: 10500,
      returnGenerated: 500,
      investor: {
        id: 'investor-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        investorType: 'INDIVIDUAL',
      },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpvService,
        {
          provide: getRepositoryToken(Project),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Investment),
          useValue: {
            findAndCount: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              getRawOne: jest.fn(),
            }),
          },
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SpvService>(SpvService);
    projectRepository = module.get(getRepositoryToken(Project));
    investmentRepository = module.get(getRepositoryToken(Investment));
    transactionRepository = module.get(getRepositoryToken(Transaction));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSpvDashboard', () => {
    it('should return SPV dashboard statistics', async () => {
      projectRepository.findOne.mockResolvedValue({
        ...mockProject,
        investments: mockInvestments,
      } as any);

      const result = await service.getSpvDashboard('project-1');

      expect(result).toHaveProperty('projectName', 'Solar Farm Alpha');
      expect(result).toHaveProperty('spvName', 'SPV Solar Alpha');
      expect(result).toHaveProperty('fundingProgress', 50);
      expect(result).toHaveProperty('totalInvestors', 1);
      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        relations: ['investments', 'investments.investor'],
      });
    });

    it('should throw error if project not found', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      await expect(service.getSpvDashboard('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getProjectInvestors', () => {
    it('should return paginated list of project investors', async () => {
      investmentRepository.findAndCount.mockResolvedValue([
        mockInvestments as any[],
        1,
      ]);

      const result = await service.getProjectInvestors('project-1', 1, 20);

      expect(result).toHaveProperty('investments');
      expect(result).toHaveProperty('total', 1);
      expect(result.investments).toHaveLength(1);
      expect(result.investments[0]).toHaveProperty('amount', 10000);
    });
  });

  describe('getProjectMilestones', () => {
    it('should return project milestones', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject as any);

      const result = await service.getProjectMilestones('project-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('title', 'Site Acquisition');
      expect(result[0]).toHaveProperty('status', 'COMPLETED');
    });

    it('should return empty array if no milestones', async () => {
      projectRepository.findOne.mockResolvedValue({
        ...mockProject,
        metadata: {},
      } as any);

      const result = await service.getProjectMilestones('project-1');

      expect(result).toEqual([]);
    });
  });

  describe('updateMilestone', () => {
    it('should update milestone successfully', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject as any);
      projectRepository.save.mockResolvedValue(mockProject as any);

      const result = await service.updateMilestone(
        'project-1',
        'milestone-1',
        'IN_PROGRESS',
        75,
        'Making good progress',
      );

      expect(result).toHaveProperty('status', 'IN_PROGRESS');
      expect(result).toHaveProperty('progress', 75);
      expect(projectRepository.save).toHaveBeenCalled();
    });

    it('should throw error if milestone not found', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject as any);

      await expect(
        service.updateMilestone('project-1', 'non-existent', 'COMPLETED', 100),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addDocument', () => {
    it('should add document to project', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject as any);
      projectRepository.save.mockResolvedValue(mockProject as any);

      const result = await service.addDocument(
        'project-1',
        'LEGAL',
        'Contract',
        'https://example.com/contract.pdf',
        'Main contract document',
      );

      expect(result).toHaveProperty('type', 'LEGAL');
      expect(result).toHaveProperty('title', 'Contract');
      expect(result).toHaveProperty('fileUrl');
      expect(projectRepository.save).toHaveBeenCalled();
    });
  });

  describe('getDocuments', () => {
    it('should return project documents', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject as any);

      const result = await service.getDocuments('project-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('title', 'Q1 Report');
    });
  });

  describe('getFinancialReport', () => {
    it('should return financial report for period', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject as any);

      const result = await service.getFinancialReport('project-1', 'month');

      expect(result).toHaveProperty('period', 'month');
      expect(result).toHaveProperty('totalInvestments');
      expect(result).toHaveProperty('currentEscrow', 450000);
    });
  });

  describe('requestEscrowRelease', () => {
    it('should create escrow release request', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject as any);
      projectRepository.save.mockResolvedValue(mockProject as any);

      const result = await service.requestEscrowRelease(
        'project-1',
        100000,
        'Milestone payment',
        'Construction Company ABC',
      );

      expect(result).toHaveProperty('amount', 100000);
      expect(result).toHaveProperty('status', 'PENDING');
      expect(result).toHaveProperty('beneficiary', 'Construction Company ABC');
      expect(projectRepository.save).toHaveBeenCalled();
    });

    it('should throw error if escrow balance insufficient', async () => {
      projectRepository.findOne.mockResolvedValue({
        ...mockProject,
        escrowBalance: 50000,
      } as any);

      await expect(
        service.requestEscrowRelease('project-1', 100000, 'Payment', 'Vendor'),
      ).rejects.toThrow();
    });
  });

  describe('updateProjectStatus', () => {
    it('should update project status', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject as any);
      projectRepository.save.mockResolvedValue({
        ...mockProject,
        status: 'ACTIVE',
      } as any);

      const result = await service.updateProjectStatus(
        'project-1',
        'ACTIVE',
        'Project is now active',
      );

      expect(result.status).toBe('ACTIVE');
      expect(projectRepository.save).toHaveBeenCalled();
    });
  });

  describe('getDistributionList', () => {
    it('should return investor distribution list', async () => {
      investmentRepository.find.mockResolvedValue([
        {
          ...mockInvestments[0],
          investor: {
            ...mockInvestments[0].investor,
            wallet: {
              balance: 5000,
              bankAccountLinked: true,
            },
          },
        },
      ] as any[]);

      const result = await service.getDistributionList('project-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('investorName', 'John Doe');
      expect(result[0]).toHaveProperty('walletBalance', 5000);
      expect(result[0]).toHaveProperty('bankAccountLinked', true);
    });
  });
});
