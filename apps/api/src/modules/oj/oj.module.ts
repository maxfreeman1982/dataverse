import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import { Investor } from './entities/investor.entity';
import { Wallet } from './entities/wallet.entity';
import { Project } from './entities/project.entity';
import { Investment } from './entities/investment.entity';
import { Transaction } from './entities/transaction.entity';
import { KycVerification } from './entities/kyc-verification.entity';

// Services
import { InvestorAuthService } from './services/investor-auth.service';
import { WalletService } from './services/wallet.service';
import { ProjectService } from './services/project.service';
import { InvestmentService } from './services/investment.service';
import { KycService } from './services/kyc.service';
import { BlockchainService } from './services/blockchain.service';
import { AdminService } from './services/admin.service';
import { BankService } from './services/bank.service';
import { CertificateService } from './services/certificate.service';
import { KycProviderService } from './services/kyc-provider.service';
import { OjNotificationGateway } from './services/notification.service';

// Resolvers
import { InvestorResolver } from './resolvers/investor.resolver';
import { WalletResolver } from './resolvers/wallet.resolver';
import { ProjectResolver } from './resolvers/project.resolver';
import { InvestmentResolver } from './resolvers/investment.resolver';
import { KycResolver } from './resolvers/kyc.resolver';
import { AdminResolver } from './resolvers/admin.resolver';
import { BankResolver } from './resolvers/bank.resolver';

// Guards
import { OjAuthGuard } from './guards/oj-auth.guard';
import { OjAdminGuard } from './guards/oj-admin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Investor,
      Wallet,
      Project,
      Investment,
      Transaction,
      KycVerification,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'oj-secret-key'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
  ],
  providers: [
    // Services
    InvestorAuthService,
    WalletService,
    ProjectService,
    InvestmentService,
    KycService,
    BlockchainService,
    AdminService,
    BankService,
    CertificateService,
    KycProviderService,
    // WebSocket Gateway
    OjNotificationGateway,
    // Resolvers
    InvestorResolver,
    WalletResolver,
    ProjectResolver,
    InvestmentResolver,
    KycResolver,
    AdminResolver,
    BankResolver,
    // Guards
    OjAuthGuard,
    OjAdminGuard,
  ],
  exports: [
    InvestorAuthService,
    WalletService,
    ProjectService,
    InvestmentService,
    KycService,
    BlockchainService,
    AdminService,
    BankService,
    CertificateService,
    KycProviderService,
    OjNotificationGateway,
  ],
})
export class OjModule {}
