-- =========================================
-- OJ Investment Platform - Database Schema
-- PostgreSQL Database
-- =========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- ENUM TYPES
-- =========================================

-- Project related enums
CREATE TYPE project_status_enum AS ENUM (
  'DRAFT',
  'PENDING_APPROVAL',
  'ACTIVE',
  'FUNDED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE project_category_enum AS ENUM (
  'REAL_ESTATE',
  'INFRASTRUCTURE',
  'ENERGY',
  'AGRICULTURE',
  'TECHNOLOGY',
  'OTHER'
);

-- Investor related enums
CREATE TYPE investor_type_enum AS ENUM (
  'INDIVIDUAL',
  'INSTITUTIONAL',
  'HOLDING'
);

CREATE TYPE investor_status_enum AS ENUM (
  'PENDING',
  'VERIFIED',
  'SUSPENDED',
  'BLOCKED'
);

-- KYC related enums
CREATE TYPE kyc_status_enum AS ENUM (
  'NOT_STARTED',
  'PENDING',
  'IN_REVIEW',
  'APPROVED',
  'REJECTED',
  'EXPIRED'
);

CREATE TYPE kyc_level_enum AS ENUM (
  'NONE',
  'BASIC',
  'STANDARD',
  'ENHANCED'
);

-- Investment related enums
CREATE TYPE investment_status_enum AS ENUM (
  'PENDING',
  'CONFIRMED',
  'ACTIVE',
  'MATURED',
  'WITHDRAWN',
  'CANCELLED'
);

-- Wallet related enums
CREATE TYPE wallet_status_enum AS ENUM (
  'ACTIVE',
  'FROZEN',
  'CLOSED'
);

-- Transaction related enums
CREATE TYPE transaction_type_enum AS ENUM (
  'DEPOSIT',
  'WITHDRAWAL',
  'INVESTMENT',
  'RETURN_PAYMENT',
  'TRANSFER',
  'FEE',
  'REFUND'
);

CREATE TYPE transaction_status_enum AS ENUM (
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'REVERSED'
);

CREATE TYPE payment_method_enum AS ENUM (
  'CARD',
  'BANK_TRANSFER',
  'MOBILE_MONEY',
  'CRYPTO',
  'INTERNAL'
);

-- =========================================
-- TABLES
-- =========================================

-- Investors table
CREATE TABLE oj_investors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  "passwordHash" VARCHAR(255) NOT NULL,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(100),
  address TEXT,
  "investorType" investor_type_enum DEFAULT 'INDIVIDUAL',
  status investor_status_enum DEFAULT 'PENDING',
  "companyName" VARCHAR(255),
  "companyRegistration" VARCHAR(255),
  "biometricEnabled" BOOLEAN DEFAULT FALSE,
  "twoFactorEnabled" BOOLEAN DEFAULT FALSE,
  "twoFactorSecret" VARCHAR(255),
  "lastLoginAt" TIMESTAMP,
  "lastLoginIp" VARCHAR(45),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE oj_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "walletAddress" VARCHAR(255) NOT NULL UNIQUE,
  balance DECIMAL(18, 8) DEFAULT 0,
  "pendingBalance" DECIMAL(18, 8) DEFAULT 0,
  "totalInvested" DECIMAL(18, 8) DEFAULT 0,
  "totalReturns" DECIMAL(18, 8) DEFAULT 0,
  status wallet_status_enum DEFAULT 'ACTIVE',
  "bankAccountIban" VARCHAR(50),
  "bankAccountName" VARCHAR(255),
  "bankName" VARCHAR(255),
  "virtualAccountNumber" VARCHAR(50),
  "investorId" UUID NOT NULL UNIQUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("investorId") REFERENCES oj_investors(id) ON DELETE CASCADE
);

-- KYC Verifications table
CREATE TABLE oj_kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status kyc_status_enum DEFAULT 'NOT_STARTED',
  level kyc_level_enum DEFAULT 'NONE',
  "documentType" VARCHAR(50),
  "documentNumber" VARCHAR(100),
  "documentCountry" VARCHAR(100),
  "documentExpiryDate" DATE,
  "documentFrontUrl" TEXT,
  "documentBackUrl" TEXT,
  "selfieUrl" TEXT,
  "proofOfAddressUrl" TEXT,
  "externalVerificationId" VARCHAR(255),
  "verificationProvider" VARCHAR(100),
  "verificationResult" JSONB,
  "rejectionReason" TEXT,
  "verifiedAt" TIMESTAMP,
  "expiresAt" TIMESTAMP,
  "investorId" UUID NOT NULL UNIQUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("investorId") REFERENCES oj_investors(id) ON DELETE CASCADE
);

-- Projects table
CREATE TABLE oj_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  "shortDescription" TEXT,
  category project_category_enum DEFAULT 'OTHER',
  status project_status_enum DEFAULT 'DRAFT',
  "spvName" VARCHAR(255) NOT NULL,
  "spvRegistrationNumber" VARCHAR(255) NOT NULL,
  "spvCountry" VARCHAR(100),
  "targetAmount" DECIMAL(18, 2) NOT NULL,
  "raisedAmount" DECIMAL(18, 2) DEFAULT 0,
  "minimumInvestment" DECIMAL(18, 2) NOT NULL,
  "expectedReturn" DECIMAL(5, 2) NOT NULL,
  "durationMonths" INTEGER NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE,
  "imageUrl" TEXT,
  documents JSONB,
  milestones JSONB,
  "financialDetails" JSONB,
  "blockchainTxHash" VARCHAR(255),
  "seriesCode" VARCHAR(50) NOT NULL,
  "totalInvestors" INTEGER DEFAULT 0,
  "progressPercent" DECIMAL(5, 2) DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments table
CREATE TABLE oj_investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(18, 2) NOT NULL,
  "currentValue" DECIMAL(18, 2) DEFAULT 0,
  "accruedReturns" DECIMAL(18, 8) DEFAULT 0,
  "paidReturns" DECIMAL(18, 8) DEFAULT 0,
  status investment_status_enum DEFAULT 'PENDING',
  "investmentDate" DATE NOT NULL,
  "maturityDate" DATE,
  "blockchainTxHash" VARCHAR(255),
  "tokenId" VARCHAR(255),
  "investorId" UUID NOT NULL,
  "projectId" UUID NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("investorId") REFERENCES oj_investors(id) ON DELETE CASCADE,
  FOREIGN KEY ("projectId") REFERENCES oj_projects(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE oj_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference VARCHAR(255) NOT NULL UNIQUE,
  type transaction_type_enum NOT NULL,
  status transaction_status_enum DEFAULT 'PENDING',
  "paymentMethod" payment_method_enum NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  fee DECIMAL(18, 8),
  currency VARCHAR(10) DEFAULT 'EUR',
  description TEXT,
  "blockchainTxHash" VARCHAR(255),
  "externalReference" VARCHAR(255),
  metadata JSONB,
  "walletId" UUID NOT NULL,
  "relatedInvestmentId" UUID,
  "relatedProjectId" UUID,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP,
  FOREIGN KEY ("walletId") REFERENCES oj_wallets(id) ON DELETE CASCADE,
  FOREIGN KEY ("relatedInvestmentId") REFERENCES oj_investments(id) ON DELETE SET NULL,
  FOREIGN KEY ("relatedProjectId") REFERENCES oj_projects(id) ON DELETE SET NULL
);

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================

-- Investors
CREATE INDEX idx_investors_email ON oj_investors(email);
CREATE INDEX idx_investors_status ON oj_investors(status);
CREATE INDEX idx_investors_type ON oj_investors("investorType");

-- Wallets
CREATE INDEX idx_wallets_investor ON oj_wallets("investorId");
CREATE INDEX idx_wallets_address ON oj_wallets("walletAddress");
CREATE INDEX idx_wallets_status ON oj_wallets(status);

-- KYC Verifications
CREATE INDEX idx_kyc_investor ON oj_kyc_verifications("investorId");
CREATE INDEX idx_kyc_status ON oj_kyc_verifications(status);
CREATE INDEX idx_kyc_level ON oj_kyc_verifications(level);

-- Projects
CREATE INDEX idx_projects_status ON oj_projects(status);
CREATE INDEX idx_projects_category ON oj_projects(category);
CREATE INDEX idx_projects_series ON oj_projects("seriesCode");
CREATE INDEX idx_projects_dates ON oj_projects("startDate", "endDate");

-- Investments
CREATE INDEX idx_investments_investor ON oj_investments("investorId");
CREATE INDEX idx_investments_project ON oj_investments("projectId");
CREATE INDEX idx_investments_status ON oj_investments(status);
CREATE INDEX idx_investments_date ON oj_investments("investmentDate");
CREATE INDEX idx_investments_blockchain ON oj_investments("blockchainTxHash");

-- Transactions
CREATE INDEX idx_transactions_wallet ON oj_transactions("walletId");
CREATE INDEX idx_transactions_reference ON oj_transactions(reference);
CREATE INDEX idx_transactions_status ON oj_transactions(status);
CREATE INDEX idx_transactions_type ON oj_transactions(type);
CREATE INDEX idx_transactions_created ON oj_transactions("createdAt");
CREATE INDEX idx_transactions_blockchain ON oj_transactions("blockchainTxHash");
CREATE INDEX idx_transactions_investment ON oj_transactions("relatedInvestmentId");
CREATE INDEX idx_transactions_project ON oj_transactions("relatedProjectId");

-- =========================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON oj_investors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON oj_wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_updated_at BEFORE UPDATE ON oj_kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON oj_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON oj_investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- VIEWS FOR COMMON QUERIES
-- =========================================

-- Active projects with statistics
CREATE OR REPLACE VIEW v_active_projects AS
SELECT
  p.*,
  COUNT(DISTINCT i."investorId") as active_investors,
  SUM(i.amount) as total_invested,
  AVG(i."currentValue" / NULLIF(i.amount, 0)) as avg_performance
FROM oj_projects p
LEFT JOIN oj_investments i ON p.id = i."projectId" AND i.status = 'ACTIVE'
WHERE p.status IN ('ACTIVE', 'IN_PROGRESS', 'FUNDED')
GROUP BY p.id;

-- Investor portfolio summary
CREATE OR REPLACE VIEW v_investor_portfolios AS
SELECT
  inv.id as investor_id,
  inv.email,
  inv."firstName",
  inv."lastName",
  w.balance as wallet_balance,
  w."totalInvested",
  w."totalReturns",
  COUNT(DISTINCT i.id) as total_investments,
  COUNT(DISTINCT i."projectId") as projects_count,
  SUM(i.amount) as invested_amount,
  SUM(i."currentValue") as current_value,
  SUM(i."accruedReturns") as accrued_returns,
  SUM(i."paidReturns") as paid_returns
FROM oj_investors inv
LEFT JOIN oj_wallets w ON inv.id = w."investorId"
LEFT JOIN oj_investments i ON inv.id = i."investorId"
WHERE inv.status = 'VERIFIED'
GROUP BY inv.id, w.id;

-- Transaction summary by wallet
CREATE OR REPLACE VIEW v_wallet_transactions AS
SELECT
  w.id as wallet_id,
  w."walletAddress",
  w."investorId",
  COUNT(t.id) as transaction_count,
  SUM(CASE WHEN t.type = 'DEPOSIT' AND t.status = 'COMPLETED' THEN t.amount ELSE 0 END) as total_deposits,
  SUM(CASE WHEN t.type = 'WITHDRAWAL' AND t.status = 'COMPLETED' THEN t.amount ELSE 0 END) as total_withdrawals,
  SUM(CASE WHEN t.type = 'INVESTMENT' AND t.status = 'COMPLETED' THEN t.amount ELSE 0 END) as total_investments,
  SUM(CASE WHEN t.type = 'RETURN_PAYMENT' AND t.status = 'COMPLETED' THEN t.amount ELSE 0 END) as total_returns
FROM oj_wallets w
LEFT JOIN oj_transactions t ON w.id = t."walletId"
GROUP BY w.id;

-- =========================================
-- COMMENTS FOR DOCUMENTATION
-- =========================================

COMMENT ON TABLE oj_investors IS 'Stores investor/user account information';
COMMENT ON TABLE oj_wallets IS 'Digital wallets for managing funds';
COMMENT ON TABLE oj_kyc_verifications IS 'KYC/AML verification records';
COMMENT ON TABLE oj_projects IS 'Investment projects/opportunities';
COMMENT ON TABLE oj_investments IS 'Individual investment records';
COMMENT ON TABLE oj_transactions IS 'Financial transaction history';

COMMENT ON VIEW v_active_projects IS 'Summary view of active projects with statistics';
COMMENT ON VIEW v_investor_portfolios IS 'Comprehensive investor portfolio overview';
COMMENT ON VIEW v_wallet_transactions IS 'Transaction summary grouped by wallet';
