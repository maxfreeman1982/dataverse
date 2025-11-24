import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { KycVerification, KycStatus, KycLevel } from '../entities/kyc-verification.entity';
import { Investor, InvestorStatus } from '../entities/investor.entity';
import { StartKycInput, SubmitDocumentInput, SubmitSelfieInput, SubmitProofOfAddressInput, KycProgress, KycVerificationResult } from '../dto/kyc.dto';

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(KycVerification)
    private kycRepository: Repository<KycVerification>,
    @InjectRepository(Investor)
    private investorRepository: Repository<Investor>,
    private configService: ConfigService,
  ) {}

  async startKyc(investorId: string, input: StartKycInput): Promise<KycVerification> {
    const kyc = await this.kycRepository.findOneOrFail({
      where: { investorId },
    });

    if (kyc.status === KycStatus.APPROVED) {
      throw new BadRequestException('Votre KYC est déjà approuvé');
    }

    if (kyc.status === KycStatus.IN_REVIEW) {
      throw new BadRequestException('Votre KYC est en cours de vérification');
    }

    kyc.status = KycStatus.PENDING;
    return this.kycRepository.save(kyc);
  }

  async submitDocument(investorId: string, input: SubmitDocumentInput): Promise<KycVerification> {
    const kyc = await this.kycRepository.findOneOrFail({
      where: { investorId },
    });

    if (kyc.status === KycStatus.APPROVED) {
      throw new BadRequestException('Votre KYC est déjà approuvé');
    }

    kyc.documentType = input.documentType;
    kyc.documentNumber = input.documentNumber;
    kyc.documentCountry = input.documentCountry;
    kyc.documentExpiryDate = input.documentExpiryDate;
    kyc.documentFrontUrl = input.documentFrontUrl;
    kyc.documentBackUrl = input.documentBackUrl;

    if (kyc.status === KycStatus.NOT_STARTED || kyc.status === KycStatus.REJECTED) {
      kyc.status = KycStatus.PENDING;
    }

    return this.kycRepository.save(kyc);
  }

  async submitSelfie(investorId: string, input: SubmitSelfieInput): Promise<KycVerification> {
    const kyc = await this.kycRepository.findOneOrFail({
      where: { investorId },
    });

    if (kyc.status === KycStatus.APPROVED) {
      throw new BadRequestException('Votre KYC est déjà approuvé');
    }

    kyc.selfieUrl = input.selfieUrl;

    if (kyc.status === KycStatus.NOT_STARTED || kyc.status === KycStatus.REJECTED) {
      kyc.status = KycStatus.PENDING;
    }

    return this.kycRepository.save(kyc);
  }

  async submitProofOfAddress(investorId: string, input: SubmitProofOfAddressInput): Promise<KycVerification> {
    const kyc = await this.kycRepository.findOneOrFail({
      where: { investorId },
    });

    if (kyc.status === KycStatus.APPROVED) {
      throw new BadRequestException('Votre KYC est déjà approuvé');
    }

    kyc.proofOfAddressUrl = input.proofOfAddressUrl;

    if (kyc.status === KycStatus.NOT_STARTED || kyc.status === KycStatus.REJECTED) {
      kyc.status = KycStatus.PENDING;
    }

    return this.kycRepository.save(kyc);
  }

  async getKycProgress(investorId: string): Promise<KycProgress> {
    const kyc = await this.kycRepository.findOneOrFail({
      where: { investorId },
    });

    const completedSteps: string[] = [];
    const requiredActions: string[] = [];

    if (kyc.documentFrontUrl) {
      completedSteps.push('document');
    } else {
      requiredActions.push('Soumettre un document d\'identité');
    }

    if (kyc.selfieUrl) {
      completedSteps.push('selfie');
    } else {
      requiredActions.push('Prendre un selfie de vérification');
    }

    if (kyc.proofOfAddressUrl) {
      completedSteps.push('proof_of_address');
    } else if (kyc.level === KycLevel.ENHANCED || kyc.level === KycLevel.STANDARD) {
      requiredActions.push('Soumettre un justificatif de domicile');
    }

    return {
      status: kyc.status,
      currentLevel: kyc.level,
      documentSubmitted: !!kyc.documentFrontUrl,
      selfieSubmitted: !!kyc.selfieUrl,
      proofOfAddressSubmitted: !!kyc.proofOfAddressUrl,
      rejectionReason: kyc.rejectionReason,
      requiredActions,
      completedSteps,
    };
  }

  async submitForReview(investorId: string): Promise<KycVerification> {
    const kyc = await this.kycRepository.findOneOrFail({
      where: { investorId },
    });

    if (!kyc.documentFrontUrl || !kyc.selfieUrl) {
      throw new BadRequestException('Veuillez soumettre tous les documents requis');
    }

    kyc.status = KycStatus.IN_REVIEW;
    return this.kycRepository.save(kyc);
  }

  async approveKyc(investorId: string, level: KycLevel = KycLevel.STANDARD): Promise<KycVerificationResult> {
    const kyc = await this.kycRepository.findOneOrFail({
      where: { investorId },
    });

    const investor = await this.investorRepository.findOneOrFail({
      where: { id: investorId },
    });

    kyc.status = KycStatus.APPROVED;
    kyc.level = level;
    kyc.verifiedAt = new Date();
    kyc.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    await this.kycRepository.save(kyc);

    investor.status = InvestorStatus.VERIFIED;
    await this.investorRepository.save(investor);

    return {
      success: true,
      status: KycStatus.APPROVED,
      message: 'Votre identité a été vérifiée avec succès',
    };
  }

  async rejectKyc(investorId: string, reason: string): Promise<KycVerificationResult> {
    const kyc = await this.kycRepository.findOneOrFail({
      where: { investorId },
    });

    kyc.status = KycStatus.REJECTED;
    kyc.rejectionReason = reason;
    await this.kycRepository.save(kyc);

    return {
      success: false,
      status: KycStatus.REJECTED,
      message: reason,
    };
  }

  async getKycByInvestorId(investorId: string): Promise<KycVerification> {
    return this.kycRepository.findOneOrFail({
      where: { investorId },
    });
  }

  async verifyWithExternalProvider(investorId: string): Promise<KycVerificationResult> {
    const kyc = await this.kycRepository.findOneOrFail({
      where: { investorId },
    });

    // Placeholder for external KYC provider integration (Onfido, Sumsub, Trulioo)
    // In production, this would make API calls to the verification provider
    const verificationProvider = this.configService.get('KYC_PROVIDER', 'manual');

    kyc.verificationProvider = verificationProvider;
    kyc.externalVerificationId = `${verificationProvider}-${Date.now()}`;

    // Simulate verification result
    kyc.verificationResult = {
      provider: verificationProvider,
      timestamp: new Date().toISOString(),
      checks: {
        document_authenticity: 'passed',
        face_match: 'passed',
        data_consistency: 'passed',
      },
    };

    await this.kycRepository.save(kyc);

    return {
      success: true,
      status: kyc.status,
      externalVerificationId: kyc.externalVerificationId,
      message: 'Vérification externe initiée',
    };
  }
}
