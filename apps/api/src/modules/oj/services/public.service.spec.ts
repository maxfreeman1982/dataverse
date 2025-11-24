import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicService } from './public.service';
import { Project } from '../entities/project.entity';
import { Investment } from '../entities/investment.entity';
import { Investor } from '../entities/investor.entity';
import { Transaction } from '../entities/transaction.entity';

describe('PublicService', () => {
  let service: PublicService;
  let projectRepository: jest.Mocked<Repository<Project>>;
  let investmentRepository: jest.Mocked<Repository<Investment>>;
  let investorRepository: jest.Mocked<Repository<Investor>>;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;

  const mockProjects = [
    {
      id: 'project-1',
      name: 'Solar Farm Alpha',
      spvName: 'SPV Solar Alpha',
      category: 'RENEWABLE_ENERGY',
      status: 'FUNDRAISING',
      description: 'Large scale solar farm project',
      fundingGoal: 1000000,
      currentFunding: 500000,
      expectedReturn: 8.5,
      duration: 24,
      minimumInvestment: 1000,
      startDate: new Date('2024-01-01'),
      location: 'France',
      metadata: {
        images: ['image1.jpg'],
        highlights: ['Green energy', 'High ROI'],
      },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicService,
        {
          provide: getRepositoryToken(Project),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn(),
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              getRawOne: jest.fn(),
              getRawMany: jest.fn(),
            }),
          },
        },
        {
          provide: getRepositoryToken(Investment),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              getRawOne: jest.fn(),
            }),
          },
        },
        {
          provide: getRepositoryToken(Investor),
          useValue: {
            count: jest.fn(),
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

    service = module.get<PublicService>(PublicService);
    projectRepository = module.get(getRepositoryToken(Project));
    investmentRepository = module.get(getRepositoryToken(Investment));
    investorRepository = module.get(getRepositoryToken(Investor));
    transactionRepository = module.get(getRepositoryToken(Transaction));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlatformStats', () => {
    it('should return platform statistics', async () => {
      projectRepository.count
        .mockResolvedValueOnce(10) // total projects
        .mockResolvedValueOnce(7); // active projects

      const mockQueryBuilder = projectRepository.createQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue({
        totalFunding: '5000000',
        totalGoal: '10000000',
      });

      investorRepository.count.mockResolvedValue(150);

      const result = await service.getPlatformStats();

      expect(result).toHaveProperty('totalProjects', 10);
      expect(result).toHaveProperty('activeProjects', 7);
      expect(result).toHaveProperty('totalInvestors', 150);
      expect(result).toHaveProperty('fundingProgress');
    });
  });

  describe('getPublicProjects', () => {
    it('should return public projects list', async () => {
      const mockQueryBuilder = projectRepository.createQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockProjects, 1]);

      investmentRepository.count.mockResolvedValue(5);

      const result = await service.getPublicProjects(undefined, undefined, 1, 12);

      expect(result).toHaveProperty('projects');
      expect(result).toHaveProperty('total', 1);
      expect(result.projects[0]).toHaveProperty('name', 'Solar Farm Alpha');
      expect(result.projects[0]).toHaveProperty('investorCount', 5);
    });

    it('should filter projects by status', async () => {
      const mockQueryBuilder = projectRepository.createQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockProjects, 1]);

      investmentRepository.count.mockResolvedValue(5);

      await service.getPublicProjects('FUNDRAISING', undefined, 1, 12);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'project.status = :status',
        { status: 'FUNDRAISING' },
      );
    });

    it('should filter projects by category', async () => {
      const mockQueryBuilder = projectRepository.createQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockProjects, 1]);

      investmentRepository.count.mockResolvedValue(5);

      await service.getPublicProjects(undefined, 'RENEWABLE_ENERGY', 1, 12);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'project.category = :category',
        { category: 'RENEWABLE_ENERGY' },
      );
    });
  });

  describe('getPublicProjectDetails', () => {
    it('should return project details for public project', async () => {
      projectRepository.findOne.mockResolvedValue(mockProjects[0] as any);
      investmentRepository.count.mockResolvedValue(10);
      investmentRepository.find.mockResolvedValue([
        {
          amount: 5000,
          investmentDate: new Date(),
        },
      ] as any[]);

      const result = await service.getPublicProjectDetails('project-1');

      expect(result).toHaveProperty('name', 'Solar Farm Alpha');
      expect(result).toHaveProperty('investorCount', 10);
      expect(result).toHaveProperty('recentInvestments');
    });

    it('should throw error if project not found', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      await expect(service.getPublicProjectDetails('non-existent')).rejects.toThrow(
        'Projet non trouvé',
      );
    });

    it('should throw error if project is not public', async () => {
      projectRepository.findOne.mockResolvedValue({
        ...mockProjects[0],
        status: 'DRAFT',
      } as any);

      await expect(service.getPublicProjectDetails('project-1')).rejects.toThrow(
        'Projet non disponible',
      );
    });
  });

  describe('getRecentActivity', () => {
    it('should return recent platform activity', async () => {
      investmentRepository.find.mockResolvedValue([
        {
          amount: 5000,
          investmentDate: new Date(),
          project: { name: 'Solar Farm Alpha' },
        },
      ] as any[]);

      projectRepository.find.mockResolvedValue([mockProjects[0]] as any[]);

      const result = await service.getRecentActivity(10);

      expect(result).toHaveProperty('recentInvestments');
      expect(result).toHaveProperty('recentProjects');
      expect(result.recentInvestments).toHaveLength(1);
      expect(result.recentProjects).toHaveLength(1);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return platform performance metrics', async () => {
      const mockActiveProjects = [
        {
          ...mockProjects[0],
          status: 'ACTIVE',
          startDate: new Date('2024-01-01'),
          fundedDate: new Date('2024-02-01'),
          expectedReturn: 8.5,
          currentFunding: 1000000,
          fundingGoal: 1000000,
        },
      ];

      projectRepository.find.mockResolvedValue(mockActiveProjects as any[]);

      const result = await service.getPerformanceMetrics();

      expect(result).toHaveProperty('totalActiveProjects', 1);
      expect(result).toHaveProperty('averageFundingTime');
      expect(result).toHaveProperty('averageReturn');
      expect(result).toHaveProperty('successRate');
      expect(result).toHaveProperty('totalValueLocked', 1000000);
    });

    it('should handle projects without funding dates', async () => {
      projectRepository.find.mockResolvedValue([
        { ...mockProjects[0], status: 'ACTIVE', expectedReturn: 8.5 },
      ] as any[]);

      const result = await service.getPerformanceMetrics();

      expect(result.averageFundingTime).toBe(0);
    });
  });

  describe('getCategoryStats', () => {
    it('should return statistics by category', async () => {
      const mockQueryBuilder = projectRepository.createQueryBuilder();
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          category: 'RENEWABLE_ENERGY',
          count: '5',
          totalFunding: '5000000',
        },
        {
          category: 'REAL_ESTATE',
          count: '3',
          totalFunding: '3000000',
        },
      ]);

      const result = await service.getCategoryStats();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('category', 'RENEWABLE_ENERGY');
      expect(result[0]).toHaveProperty('projectCount', 5);
      expect(result[0]).toHaveProperty('totalFunding', 5000000);
    });
  });
});
