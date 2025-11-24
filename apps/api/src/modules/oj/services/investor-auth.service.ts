import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { Investor, InvestorStatus } from '../entities/investor.entity';
import { Wallet, WalletStatus } from '../entities/wallet.entity';
import { KycVerification, KycStatus, KycLevel } from '../entities/kyc-verification.entity';
import { RegisterInvestorInput, LoginInvestorInput, UpdateInvestorInput, AuthPayload, TwoFactorSetup } from '../dto/investor.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvestorAuthService {
  constructor(
    @InjectRepository(Investor)
    private investorRepository: Repository<Investor>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(KycVerification)
    private kycRepository: Repository<KycVerification>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(input: RegisterInvestorInput): Promise<AuthPayload> {
    const existingInvestor = await this.investorRepository.findOne({
      where: { email: input.email.toLowerCase() },
    });

    if (existingInvestor) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const investor = this.investorRepository.create({
      ...input,
      email: input.email.toLowerCase(),
      passwordHash,
      status: InvestorStatus.PENDING,
    });

    await this.investorRepository.save(investor);

    // Create wallet for investor
    const wallet = this.walletRepository.create({
      investorId: investor.id,
      walletAddress: this.generateWalletAddress(),
      virtualAccountNumber: this.generateVirtualAccountNumber(),
      status: WalletStatus.ACTIVE,
    });
    await this.walletRepository.save(wallet);

    // Create KYC verification record
    const kyc = this.kycRepository.create({
      investorId: investor.id,
      status: KycStatus.NOT_STARTED,
      level: KycLevel.NONE,
    });
    await this.kycRepository.save(kyc);

    const tokens = await this.generateTokens(investor);

    return {
      ...tokens,
      investor,
    };
  }

  async login(input: LoginInvestorInput): Promise<AuthPayload> {
    const investor = await this.investorRepository.findOne({
      where: { email: input.email.toLowerCase() },
      relations: ['wallet', 'kycVerification'],
    });

    if (!investor) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(input.password, investor.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (investor.status === InvestorStatus.BLOCKED) {
      throw new UnauthorizedException('Votre compte a été bloqué');
    }

    if (investor.status === InvestorStatus.SUSPENDED) {
      throw new UnauthorizedException('Votre compte est suspendu');
    }

    // Check 2FA if enabled
    if (investor.twoFactorEnabled) {
      if (!input.otpCode) {
        throw new BadRequestException('Code OTP requis');
      }

      const isValidOtp = speakeasy.totp.verify({
        secret: investor.twoFactorSecret!,
        encoding: 'base32',
        token: input.otpCode,
      });

      if (!isValidOtp) {
        throw new UnauthorizedException('Code OTP invalide');
      }
    }

    // Update last login
    investor.lastLoginAt = new Date();
    await this.investorRepository.save(investor);

    const tokens = await this.generateTokens(investor);

    return {
      ...tokens,
      investor,
    };
  }

  async setupTwoFactor(investorId: string): Promise<TwoFactorSetup> {
    const investor = await this.investorRepository.findOneOrFail({
      where: { id: investorId },
    });

    const secret = speakeasy.generateSecret({
      name: `OJ Investment (${investor.email})`,
      issuer: 'OJ',
    });

    investor.twoFactorSecret = secret.base32;
    await this.investorRepository.save(investor);

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  async enableTwoFactor(investorId: string, otpCode: string): Promise<boolean> {
    const investor = await this.investorRepository.findOneOrFail({
      where: { id: investorId },
    });

    if (!investor.twoFactorSecret) {
      throw new BadRequestException('Veuillez d\'abord configurer 2FA');
    }

    const isValid = speakeasy.totp.verify({
      secret: investor.twoFactorSecret,
      encoding: 'base32',
      token: otpCode,
    });

    if (!isValid) {
      throw new BadRequestException('Code OTP invalide');
    }

    investor.twoFactorEnabled = true;
    await this.investorRepository.save(investor);

    return true;
  }

  async disableTwoFactor(investorId: string, otpCode: string): Promise<boolean> {
    const investor = await this.investorRepository.findOneOrFail({
      where: { id: investorId },
    });

    if (!investor.twoFactorEnabled) {
      return true;
    }

    const isValid = speakeasy.totp.verify({
      secret: investor.twoFactorSecret!,
      encoding: 'base32',
      token: otpCode,
    });

    if (!isValid) {
      throw new BadRequestException('Code OTP invalide');
    }

    investor.twoFactorEnabled = false;
    investor.twoFactorSecret = undefined;
    await this.investorRepository.save(investor);

    return true;
  }

  async updateProfile(investorId: string, input: UpdateInvestorInput): Promise<Investor> {
    const investor = await this.investorRepository.findOneOrFail({
      where: { id: investorId },
    });

    Object.assign(investor, input);
    return this.investorRepository.save(investor);
  }

  async refreshToken(refreshToken: string): Promise<AuthPayload> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const investor = await this.investorRepository.findOneOrFail({
        where: { id: payload.sub },
        relations: ['wallet', 'kycVerification'],
      });

      const tokens = await this.generateTokens(investor);

      return {
        ...tokens,
        investor,
      };
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
  }

  async getInvestorById(id: string): Promise<Investor> {
    return this.investorRepository.findOneOrFail({
      where: { id },
      relations: ['wallet', 'kycVerification', 'investments'],
    });
  }

  private async generateTokens(investor: Investor): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: investor.id,
      email: investor.email,
      type: 'investor',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private generateWalletAddress(): string {
    return `0x${uuidv4().replace(/-/g, '')}`;
  }

  private generateVirtualAccountNumber(): string {
    const prefix = 'OJ';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString().slice(2, 6);
    return `${prefix}${timestamp}${random}`;
  }
}
