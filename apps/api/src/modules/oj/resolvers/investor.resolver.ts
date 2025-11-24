import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Investor } from '../entities/investor.entity';
import { InvestorAuthService } from '../services/investor-auth.service';
import {
  RegisterInvestorInput,
  LoginInvestorInput,
  UpdateInvestorInput,
  AuthPayload,
  TwoFactorSetup,
} from '../dto/investor.dto';
import { OjAuthGuard } from '../guards/oj-auth.guard';
import { CurrentInvestor } from '../decorators/current-investor.decorator';

@Resolver(() => Investor)
export class InvestorResolver {
  constructor(private investorAuthService: InvestorAuthService) {}

  @Mutation(() => AuthPayload)
  async registerInvestor(@Args('input') input: RegisterInvestorInput): Promise<AuthPayload> {
    return this.investorAuthService.register(input);
  }

  @Mutation(() => AuthPayload)
  async loginInvestor(@Args('input') input: LoginInvestorInput): Promise<AuthPayload> {
    return this.investorAuthService.login(input);
  }

  @Mutation(() => AuthPayload)
  async refreshInvestorToken(@Args('refreshToken') refreshToken: string): Promise<AuthPayload> {
    return this.investorAuthService.refreshToken(refreshToken);
  }

  @Query(() => Investor)
  @UseGuards(OjAuthGuard)
  async me(@CurrentInvestor() investor: Investor): Promise<Investor> {
    return this.investorAuthService.getInvestorById(investor.id);
  }

  @Mutation(() => Investor)
  @UseGuards(OjAuthGuard)
  async updateInvestorProfile(
    @CurrentInvestor() investor: Investor,
    @Args('input') input: UpdateInvestorInput,
  ): Promise<Investor> {
    return this.investorAuthService.updateProfile(investor.id, input);
  }

  @Mutation(() => TwoFactorSetup)
  @UseGuards(OjAuthGuard)
  async setupTwoFactor(@CurrentInvestor() investor: Investor): Promise<TwoFactorSetup> {
    return this.investorAuthService.setupTwoFactor(investor.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(OjAuthGuard)
  async enableTwoFactor(
    @CurrentInvestor() investor: Investor,
    @Args('otpCode') otpCode: string,
  ): Promise<boolean> {
    return this.investorAuthService.enableTwoFactor(investor.id, otpCode);
  }

  @Mutation(() => Boolean)
  @UseGuards(OjAuthGuard)
  async disableTwoFactor(
    @CurrentInvestor() investor: Investor,
    @Args('otpCode') otpCode: string,
  ): Promise<boolean> {
    return this.investorAuthService.disableTwoFactor(investor.id, otpCode);
  }
}
