import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { KycVerification, KycLevel } from '../entities/kyc-verification.entity';
import { KycService } from '../services/kyc.service';
import {
  StartKycInput,
  SubmitDocumentInput,
  SubmitSelfieInput,
  SubmitProofOfAddressInput,
  KycProgress,
  KycVerificationResult,
} from '../dto/kyc.dto';
import { OjAuthGuard } from '../guards/oj-auth.guard';
import { OjAdminGuard } from '../guards/oj-admin.guard';
import { CurrentInvestor } from '../decorators/current-investor.decorator';
import { Investor } from '../entities/investor.entity';

@Resolver(() => KycVerification)
export class KycResolver {
  constructor(private kycService: KycService) {}

  @Query(() => KycVerification)
  @UseGuards(OjAuthGuard)
  async myKyc(@CurrentInvestor() investor: Investor): Promise<KycVerification> {
    return this.kycService.getKycByInvestorId(investor.id);
  }

  @Query(() => KycProgress)
  @UseGuards(OjAuthGuard)
  async kycProgress(@CurrentInvestor() investor: Investor): Promise<KycProgress> {
    return this.kycService.getKycProgress(investor.id);
  }

  @Mutation(() => KycVerification)
  @UseGuards(OjAuthGuard)
  async startKyc(
    @CurrentInvestor() investor: Investor,
    @Args('input') input: StartKycInput,
  ): Promise<KycVerification> {
    return this.kycService.startKyc(investor.id, input);
  }

  @Mutation(() => KycVerification)
  @UseGuards(OjAuthGuard)
  async submitKycDocument(
    @CurrentInvestor() investor: Investor,
    @Args('input') input: SubmitDocumentInput,
  ): Promise<KycVerification> {
    return this.kycService.submitDocument(investor.id, input);
  }

  @Mutation(() => KycVerification)
  @UseGuards(OjAuthGuard)
  async submitKycSelfie(
    @CurrentInvestor() investor: Investor,
    @Args('input') input: SubmitSelfieInput,
  ): Promise<KycVerification> {
    return this.kycService.submitSelfie(investor.id, input);
  }

  @Mutation(() => KycVerification)
  @UseGuards(OjAuthGuard)
  async submitKycProofOfAddress(
    @CurrentInvestor() investor: Investor,
    @Args('input') input: SubmitProofOfAddressInput,
  ): Promise<KycVerification> {
    return this.kycService.submitProofOfAddress(investor.id, input);
  }

  @Mutation(() => KycVerification)
  @UseGuards(OjAuthGuard)
  async submitKycForReview(@CurrentInvestor() investor: Investor): Promise<KycVerification> {
    return this.kycService.submitForReview(investor.id);
  }

  @Mutation(() => KycVerificationResult)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async approveKyc(
    @Args('investorId', { type: () => ID }) investorId: string,
    @Args('level', { type: () => KycLevel, nullable: true }) level?: KycLevel,
  ): Promise<KycVerificationResult> {
    return this.kycService.approveKyc(investorId, level);
  }

  @Mutation(() => KycVerificationResult)
  @UseGuards(OjAuthGuard, OjAdminGuard)
  async rejectKyc(
    @Args('investorId', { type: () => ID }) investorId: string,
    @Args('reason') reason: string,
  ): Promise<KycVerificationResult> {
    return this.kycService.rejectKyc(investorId, reason);
  }

  @Mutation(() => KycVerificationResult)
  @UseGuards(OjAuthGuard)
  async verifyKycExternal(@CurrentInvestor() investor: Investor): Promise<KycVerificationResult> {
    return this.kycService.verifyWithExternalProvider(investor.id);
  }
}
