import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InvestorAuthService } from './investor-auth.service';
import { Investor } from '../entities/investor.entity';
import { Wallet } from '../entities/wallet.entity';

describe('InvestorAuthService', () => {
  let service: InvestorAuthService;
  let investorRepository: jest.Mocked<Repository<Investor>>;
  let walletRepository: jest.Mocked<Repository<Wallet>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockInvestor = {
    id: 'investor-123',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+33612345678',
    country: 'FR',
    investorType: 'INDIVIDUAL',
    isEmailVerified: true,
    twoFactorEnabled: false,
    status: 'ACTIVE',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockInvestorRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    const mockWalletRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestorAuthService,
        {
          provide: getRepositoryToken(Investor),
          useValue: mockInvestorRepo,
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepo,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<InvestorAuthService>(InvestorAuthService);
    investorRepository = module.get(getRepositoryToken(Investor));
    walletRepository = module.get(getRepositoryToken(Wallet));
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      password: 'SecurePassword123!',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+33698765432',
      country: 'FR',
      investorType: 'INDIVIDUAL' as const,
    };

    it('should register a new investor successfully', async () => {
      investorRepository.findOne.mockResolvedValue(null);
      investorRepository.create.mockReturnValue({
        ...registerDto,
        id: 'new-investor-id',
      } as Investor);
      investorRepository.save.mockResolvedValue({
        ...registerDto,
        id: 'new-investor-id',
      } as Investor);
      walletRepository.create.mockReturnValue({ id: 'wallet-id' } as Wallet);
      walletRepository.save.mockResolvedValue({ id: 'wallet-id' } as Wallet);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('investor');
      expect(investorRepository.save).toHaveBeenCalled();
      expect(walletRepository.save).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      investorRepository.findOne.mockResolvedValue(mockInvestor as Investor);

      await expect(service.register(registerDto)).rejects.toThrow(
        'Un compte existe déjà avec cet email',
      );
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const password = 'ValidPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      investorRepository.findOne.mockResolvedValue({
        ...mockInvestor,
        password: hashedPassword,
        twoFactorEnabled: false,
      } as Investor);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(mockInvestor.email, password);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('investor');
    });

    it('should throw error with invalid credentials', async () => {
      investorRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login('wrong@example.com', 'wrongpassword'),
      ).rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('should require 2FA if enabled', async () => {
      const password = 'ValidPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      investorRepository.findOne.mockResolvedValue({
        ...mockInvestor,
        password: hashedPassword,
        twoFactorEnabled: true,
      } as Investor);

      const result = await service.login(mockInvestor.email, password);

      expect(result).toHaveProperty('requiresTwoFactor', true);
      expect(result).not.toHaveProperty('accessToken');
    });
  });

  describe('getProfile', () => {
    it('should return investor profile', async () => {
      investorRepository.findOne.mockResolvedValue(mockInvestor as Investor);

      const result = await service.getProfile(mockInvestor.id);

      expect(result).toEqual(mockInvestor);
      expect(investorRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockInvestor.id },
        relations: expect.any(Array),
      });
    });

    it('should throw error if investor not found', async () => {
      investorRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('non-existent-id')).rejects.toThrow(
        'Investisseur non trouvé',
      );
    });
  });
});
