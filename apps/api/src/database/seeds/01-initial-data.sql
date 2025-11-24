-- =========================================
-- OJ Investment Platform - Seed Data
-- Test and Demo Data for Development
-- =========================================

-- Clear existing data (for development only)
TRUNCATE TABLE oj_transactions CASCADE;
TRUNCATE TABLE oj_investments CASCADE;
TRUNCATE TABLE oj_projects CASCADE;
TRUNCATE TABLE oj_kyc_verifications CASCADE;
TRUNCATE TABLE oj_wallets CASCADE;
TRUNCATE TABLE oj_investors CASCADE;

-- =========================================
-- INVESTORS
-- =========================================

-- Individual Investors
INSERT INTO oj_investors (id, email, "passwordHash", "firstName", "lastName", phone, country, address, "investorType", status, "biometricEnabled", "twoFactorEnabled", "createdAt") VALUES
('a1b2c3d4-e5f6-4789-0123-456789abcdef', 'john.doe@example.com', '$2b$10$YourHashedPasswordHere1', 'John', 'Doe', '+33612345678', 'France', '123 Rue de la Paix, 75001 Paris', 'INDIVIDUAL', 'VERIFIED', TRUE, TRUE, NOW() - INTERVAL '6 months'),
('b2c3d4e5-f6a7-4890-1234-56789abcdef0', 'marie.martin@example.com', '$2b$10$YourHashedPasswordHere2', 'Marie', 'Martin', '+33687654321', 'France', '45 Avenue des Champs-Élysées, 75008 Paris', 'INDIVIDUAL', 'VERIFIED', TRUE, FALSE, NOW() - INTERVAL '4 months'),
('c3d4e5f6-a7b8-4901-2345-6789abcdef01', 'pierre.dupont@example.com', '$2b$10$YourHashedPasswordHere3', 'Pierre', 'Dupont', '+33698765432', 'France', '78 Boulevard Saint-Germain, 75006 Paris', 'INDIVIDUAL', 'VERIFIED', FALSE, TRUE, NOW() - INTERVAL '3 months'),
('d4e5f6a7-b8c9-4012-3456-789abcdef012', 'sophie.bernard@example.com', '$2b$10$YourHashedPasswordHere4', 'Sophie', 'Bernard', '+33612348765', 'France', '12 Rue de Rivoli, 75004 Paris', 'INDIVIDUAL', 'PENDING', FALSE, FALSE, NOW() - INTERVAL '1 month');

-- Institutional Investors
INSERT INTO oj_investors (id, email, "passwordHash", "firstName", "lastName", phone, country, address, "investorType", status, "companyName", "companyRegistration", "twoFactorEnabled", "createdAt") VALUES
('e5f6a7b8-c9d0-4123-4567-89abcdef0123', 'contact@greeninvest.fr', '$2b$10$YourHashedPasswordHere5', 'Jean', 'Leroy', '+33140123456', 'France', '56 Avenue Montaigne, 75008 Paris', 'INSTITUTIONAL', 'VERIFIED', 'Green Invest Capital', 'FR123456789', TRUE, NOW() - INTERVAL '8 months'),
('f6a7b8c9-d0e1-4234-5678-9abcdef01234', 'admin@futureventures.com', '$2b$10$YourHashedPasswordHere6', 'Claire', 'Dubois', '+33145678901', 'France', '89 Rue du Faubourg Saint-Honoré, 75008 Paris', 'INSTITUTIONAL', 'VERIFIED', 'Future Ventures SAS', 'FR987654321', TRUE, NOW() - INTERVAL '5 months');

-- =========================================
-- WALLETS
-- =========================================

INSERT INTO oj_wallets (id, "walletAddress", balance, "pendingBalance", "totalInvested", "totalReturns", status, "bankAccountIban", "bankAccountName", "bankName", "investorId", "createdAt") VALUES
('10000001-0000-0000-0000-000000000001', 'OJ-WALLET-001-JD', 15000.00, 0, 50000.00, 4250.50, 'ACTIVE', 'FR7612345678901234567890123', 'John Doe', 'BNP Paribas', 'a1b2c3d4-e5f6-4789-0123-456789abcdef', NOW() - INTERVAL '6 months'),
('10000001-0000-0000-0000-000000000002', 'OJ-WALLET-002-MM', 25000.00, 5000.00, 75000.00, 6500.75, 'ACTIVE', 'FR7698765432109876543210987', 'Marie Martin', 'Crédit Agricole', 'b2c3d4e5-f6a7-4890-1234-56789abcdef0', NOW() - INTERVAL '4 months'),
('10000001-0000-0000-0000-000000000003', 'OJ-WALLET-003-PD', 8000.00, 2000.00, 30000.00, 2100.25, 'ACTIVE', 'FR7611223344556677889900112', 'Pierre Dupont', 'Société Générale', 'c3d4e5f6-a7b8-4901-2345-6789abcdef01', NOW() - INTERVAL '3 months'),
('10000001-0000-0000-0000-000000000004', 'OJ-WALLET-004-SB', 1000.00, 0, 0, 0, 'ACTIVE', 'FR7622334455667788990011223', 'Sophie Bernard', 'LCL', 'd4e5f6a7-b8c9-4012-3456-789abcdef012', NOW() - INTERVAL '1 month'),
('10000001-0000-0000-0000-000000000005', 'OJ-WALLET-005-GIC', 150000.00, 20000.00, 500000.00, 45000.00, 'ACTIVE', 'FR7633445566778899001122334', 'Green Invest Capital', 'BNP Paribas', 'e5f6a7b8-c9d0-4123-4567-89abcdef0123', NOW() - INTERVAL '8 months'),
('10000001-0000-0000-0000-000000000006', 'OJ-WALLET-006-FV', 200000.00, 50000.00, 800000.00, 75000.00, 'ACTIVE', 'FR7644556677889900112233445', 'Future Ventures SAS', 'Crédit Agricole', 'f6a7b8c9-d0e1-4234-5678-9abcdef01234', NOW() - INTERVAL '5 months');

-- =========================================
-- KYC VERIFICATIONS
-- =========================================

INSERT INTO oj_kyc_verifications (id, status, level, "documentType", "documentNumber", "documentCountry", "documentExpiryDate", "documentFrontUrl", "selfieUrl", "proofOfAddressUrl", "verificationProvider", "verifiedAt", "expiresAt", "investorId", "createdAt") VALUES
('20000001-0000-0000-0000-000000000001', 'APPROVED', 'ENHANCED', 'PASSPORT', 'FR123456', 'France', '2028-12-31', 'https://storage.example.com/kyc/doc1-front.jpg', 'https://storage.example.com/kyc/selfie1.jpg', 'https://storage.example.com/kyc/address1.pdf', 'Onfido', NOW() - INTERVAL '5 months', NOW() + INTERVAL '19 months', 'a1b2c3d4-e5f6-4789-0123-456789abcdef', NOW() - INTERVAL '6 months'),
('20000001-0000-0000-0000-000000000002', 'APPROVED', 'STANDARD', 'ID_CARD', 'FR987654', 'France', '2027-06-30', 'https://storage.example.com/kyc/doc2-front.jpg', 'https://storage.example.com/kyc/selfie2.jpg', 'https://storage.example.com/kyc/address2.pdf', 'Onfido', NOW() - INTERVAL '3 months', NOW() + INTERVAL '21 months', 'b2c3d4e5-f6a7-4890-1234-56789abcdef0', NOW() - INTERVAL '4 months'),
('20000001-0000-0000-0000-000000000003', 'APPROVED', 'STANDARD', 'PASSPORT', 'FR654321', 'France', '2029-03-15', 'https://storage.example.com/kyc/doc3-front.jpg', 'https://storage.example.com/kyc/selfie3.jpg', 'https://storage.example.com/kyc/address3.pdf', 'Onfido', NOW() - INTERVAL '2 months', NOW() + INTERVAL '22 months', 'c3d4e5f6-a7b8-4901-2345-6789abcdef01', NOW() - INTERVAL '3 months'),
('20000001-0000-0000-0000-000000000004', 'PENDING', 'NONE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'd4e5f6a7-b8c9-4012-3456-789abcdef012', NOW() - INTERVAL '1 month'),
('20000001-0000-0000-0000-000000000005', 'APPROVED', 'ENHANCED', 'COMPANY_REG', 'FR123456789', 'France', '2030-12-31', 'https://storage.example.com/kyc/company1-reg.pdf', NULL, 'https://storage.example.com/kyc/company1-address.pdf', 'Manual', NOW() - INTERVAL '7 months', NOW() + INTERVAL '17 months', 'e5f6a7b8-c9d0-4123-4567-89abcdef0123', NOW() - INTERVAL '8 months'),
('20000001-0000-0000-0000-000000000006', 'APPROVED', 'ENHANCED', 'COMPANY_REG', 'FR987654321', 'France', '2030-06-30', 'https://storage.example.com/kyc/company2-reg.pdf', NULL, 'https://storage.example.com/kyc/company2-address.pdf', 'Manual', NOW() - INTERVAL '4 months', NOW() + INTERVAL '20 months', 'f6a7b8c9-d0e1-4234-5678-9abcdef01234', NOW() - INTERVAL '5 months');

-- =========================================
-- PROJECTS
-- =========================================

-- Renewable Energy Projects
INSERT INTO oj_projects (id, name, description, "shortDescription", category, status, "spvName", "spvRegistrationNumber", "spvCountry", "targetAmount", "raisedAmount", "minimumInvestment", "expectedReturn", "durationMonths", "startDate", "endDate", "imageUrl", "seriesCode", "totalInvestors", "progressPercent", "createdAt") VALUES
('30000001-0000-0000-0000-000000000001',
  'Solar Farm Provence Alpha',
  'Large-scale solar energy project in Provence region, southern France. This project will deploy 50,000 solar panels across 25 hectares of agricultural land, generating clean renewable energy for 15,000 households. The project includes long-term power purchase agreements (PPAs) with major French utilities, guaranteeing stable returns for investors.',
  '50,000 solar panels generating clean energy in Provence',
  'ENERGY',
  'IN_PROGRESS',
  'Solar Provence SPV SAS',
  'FR-SPV-2024-001',
  'France',
  2500000.00,
  2100000.00,
  1000.00,
  8.50,
  36,
  '2024-01-15',
  '2027-01-15',
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
  'PROJ-2024-001',
  42,
  84.00,
  NOW() - INTERVAL '10 months'),

('30000001-0000-0000-0000-000000000002',
  'Wind Farm Bretagne Beta',
  'Offshore wind energy project off the coast of Brittany. Installation of 15 wind turbines with a total capacity of 75MW, providing clean electricity to 60,000 homes. The project benefits from favorable wind conditions and government subsidies for renewable energy.',
  'Offshore wind farm with 15 turbines in Brittany',
  'ENERGY',
  'FUNDED',
  'Wind Bretagne SPV SAS',
  'FR-SPV-2024-002',
  'France',
  5000000.00,
  5000000.00,
  5000.00,
  9.20,
  48,
  '2024-03-01',
  '2028-03-01',
  'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800',
  'PROJ-2024-002',
  87,
  100.00,
  NOW() - INTERVAL '8 months');

-- Real Estate Projects
INSERT INTO oj_projects (id, name, description, "shortDescription", category, status, "spvName", "spvRegistrationNumber", "spvCountry", "targetAmount", "raisedAmount", "minimumInvestment", "expectedReturn", "durationMonths", "startDate", "imageUrl", "seriesCode", "totalInvestors", "progressPercent", "createdAt") VALUES
('30000001-0000-0000-0000-000000000003',
  'Paris Commercial Complex',
  'Premium commercial real estate development in central Paris, 8th arrondissement. Construction of a mixed-use building with retail spaces, offices, and parking. Prime location near Champs-Élysées with high rental demand from luxury brands and professional services.',
  'Mixed-use commercial building in Paris 8th',
  'REAL_ESTATE',
  'ACTIVE',
  'Paris Commercial SPV SAS',
  'FR-SPV-2024-003',
  'France',
  8000000.00,
  4500000.00,
  10000.00,
  10.50,
  60,
  '2024-06-01',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  'PROJ-2024-003',
  65,
  56.25,
  NOW() - INTERVAL '5 months'),

('30000001-0000-0000-0000-000000000004',
  'Lyon Student Residences',
  'Development of modern student housing near major universities in Lyon. 200 fully-furnished studio apartments with amenities including co-working spaces, gym, and laundry facilities. Long-term partnership with universities guarantees occupancy.',
  '200 modern student apartments in Lyon',
  'REAL_ESTATE',
  'ACTIVE',
  'Lyon Housing SPV SAS',
  'FR-SPV-2024-004',
  'France',
  3500000.00,
  1200000.00,
  2000.00,
  7.80,
  36,
  '2024-09-01',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
  'PROJ-2024-004',
  28,
  34.29,
  NOW() - INTERVAL '2 months');

-- Agriculture Projects
INSERT INTO oj_projects (id, name, description, "shortDescription", category, status, "spvName", "spvRegistrationNumber", "spvCountry", "targetAmount", "raisedAmount", "minimumInvestment", "expectedReturn", "durationMonths", "startDate", "imageUrl", "seriesCode", "totalInvestors", "progressPercent", "createdAt") VALUES
('30000001-0000-0000-0000-000000000005',
  'Organic Vineyard Bordeaux',
  'Acquisition and modernization of a 50-hectare organic vineyard in Bordeaux region. Implementation of sustainable farming practices and modern wine-making facilities. Established distribution channels in France and export markets.',
  'Organic wine production in Bordeaux region',
  'AGRICULTURE',
  'COMPLETED',
  'Bordeaux Wine SPV SAS',
  'FR-SPV-2023-001',
  'France',
  1500000.00,
  1500000.00,
  1000.00,
  12.00,
  24,
  '2023-01-01',
  '2025-01-01',
  'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800',
  'PROJ-2023-001',
  52,
  100.00,
  NOW() - INTERVAL '22 months');

-- Infrastructure Projects
INSERT INTO oj_projects (id, name, description, "shortDescription", category, status, "spvName", "spvRegistrationNumber", "spvCountry", "targetAmount", "raisedAmount", "minimumInvestment", "expectedReturn", "durationMonths", "startDate", "imageUrl", "seriesCode", "totalInvestors", "progressPercent", "createdAt") VALUES
('30000001-0000-0000-0000-000000000006',
  'Smart City Infrastructure Toulouse',
  'Development of smart city infrastructure including EV charging stations, IoT sensors, and fiber optic network in Toulouse. Public-private partnership with city government ensuring long-term revenue streams.',
  'Smart city infrastructure deployment in Toulouse',
  'INFRASTRUCTURE',
  'PENDING_APPROVAL',
  'Toulouse Smart SPV SAS',
  'FR-SPV-2024-005',
  'France',
  6000000.00,
  0,
  5000.00,
  9.50,
  48,
  '2025-01-01',
  'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800',
  'PROJ-2024-005',
  0,
  0,
  NOW() - INTERVAL '1 month');

-- =========================================
-- INVESTMENTS
-- =========================================

-- John Doe's investments
INSERT INTO oj_investments (id, amount, "currentValue", "accruedReturns", "paidReturns", status, "investmentDate", "maturityDate", "blockchainTxHash", "tokenId", "investorId", "projectId", "createdAt") VALUES
('40000001-0000-0000-0000-000000000001', 25000.00, 26750.00, 1750.00, 1500.00, 'ACTIVE', '2024-02-01', '2027-02-01', '0xabc123...', 'TOKEN-001-JD-SOLAR', 'a1b2c3d4-e5f6-4789-0123-456789abcdef', '30000001-0000-0000-0000-000000000001', NOW() - INTERVAL '9 months'),
('40000001-0000-0000-0000-000000000002', 25000.00, 28500.00, 3500.00, 2750.50, 'MATURED', '2023-02-01', '2025-02-01', '0xdef456...', 'TOKEN-002-JD-WINE', 'a1b2c3d4-e5f6-4789-0123-456789abcdef', '30000001-0000-0000-0000-000000000005', NOW() - INTERVAL '21 months');

-- Marie Martin's investments
INSERT INTO oj_investments (id, amount, "currentValue", "accruedReturns", "paidReturns", status, "investmentDate", "maturityDate", "investorId", "projectId", "createdAt") VALUES
('40000001-0000-0000-0000-000000000003', 50000.00, 54250.00, 4250.00, 3500.00, 'ACTIVE', '2024-04-01', '2028-04-01', 'b2c3d4e5-f6a7-4890-1234-56789abcdef0', '30000001-0000-0000-0000-000000000002', NOW() - INTERVAL '7 months'),
('40000001-0000-0000-0000-000000000004', 25000.00, 26150.00, 1150.00, 1000.75, 'ACTIVE', '2024-07-01', '2027-07-01', 'b2c3d4e5-f6a7-4890-1234-56789abcdef0', '30000001-0000-0000-0000-000000000001', NOW() - INTERVAL '4 months');

-- Pierre Dupont's investments
INSERT INTO oj_investments (id, amount, "currentValue", "accruedReturns", "paidReturns", status, "investmentDate", "maturityDate", "investorId", "projectId", "createdAt") VALUES
('40000001-0000-0000-0000-000000000005', 30000.00, 32100.00, 2100.00, 2100.25, 'ACTIVE', '2024-08-01', '2027-08-01', 'c3d4e5f6-a7b8-4901-2345-6789abcdef01', '30000001-0000-0000-0000-000000000003', NOW() - INTERVAL '3 months');

-- Green Invest Capital's investments
INSERT INTO oj_investments (id, amount, "currentValue", "accruedReturns", "paidReturns", status, "investmentDate", "maturityDate", "investorId", "projectId", "createdAt") VALUES
('40000001-0000-0000-0000-000000000006', 250000.00, 268750.00, 18750.00, 15000.00, 'ACTIVE', '2024-02-15', '2027-02-15', 'e5f6a7b8-c9d0-4123-4567-89abcdef0123', '30000001-0000-0000-0000-000000000001', NOW() - INTERVAL '9 months'),
('40000001-0000-0000-0000-000000000007', 250000.00, 278500.00, 28500.00, 30000.00, 'ACTIVE', '2024-03-15', '2028-03-15', 'e5f6a7b8-c9d0-4123-4567-89abcdef0123', '30000001-0000-0000-0000-000000000002', NOW() - INTERVAL '8 months');

-- Future Ventures SAS's investments
INSERT INTO oj_investments (id, amount, "currentValue", "accruedReturns", "paidReturns", status, "investmentDate", "maturityDate", "investorId", "projectId", "createdAt") VALUES
('40000001-0000-0000-0000-000000000008', 500000.00, 542500.00, 42500.00, 45000.00, 'ACTIVE', '2024-04-01', '2028-04-01', 'f6a7b8c9-d0e1-4234-5678-9abcdef01234', '30000001-0000-0000-0000-000000000002', NOW() - INTERVAL '7 months'),
('40000001-0000-0000-0000-000000000009', 300000.00, 324500.00, 24500.00, 0, 'ACTIVE', '2024-07-01', '2029-07-01', 'f6a7b8c9-d0e1-4234-5678-9abcdef01234', '30000001-0000-0000-0000-000000000003', NOW() - INTERVAL '4 months');

-- =========================================
-- TRANSACTIONS
-- =========================================

-- John Doe's transactions
INSERT INTO oj_transactions (id, reference, type, status, "paymentMethod", amount, fee, currency, description, "walletId", "relatedInvestmentId", "relatedProjectId", "createdAt", "completedAt") VALUES
('50000001-0000-0000-0000-000000000001', 'TXN-2024-001-JD-DEP', 'DEPOSIT', 'COMPLETED', 'BANK_TRANSFER', 50000.00, 0, 'EUR', 'Initial deposit', '10000001-0000-0000-0000-000000000001', NULL, NULL, NOW() - INTERVAL '9 months', NOW() - INTERVAL '9 months'),
('50000001-0000-0000-0000-000000000002', 'TXN-2024-002-JD-INV', 'INVESTMENT', 'COMPLETED', 'INTERNAL', 25000.00, 0, 'EUR', 'Investment in Solar Farm Provence Alpha', '10000001-0000-0000-0000-000000000001', '40000001-0000-0000-0000-000000000001', '30000001-0000-0000-0000-000000000001', NOW() - INTERVAL '9 months', NOW() - INTERVAL '9 months'),
('50000001-0000-0000-0000-000000000003', 'TXN-2024-003-JD-RET', 'RETURN_PAYMENT', 'COMPLETED', 'INTERNAL', 1500.50, 0, 'EUR', 'Quarterly return payment', '10000001-0000-0000-0000-000000000001', '40000001-0000-0000-0000-000000000001', '30000001-0000-0000-0000-000000000001', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months'),
('50000001-0000-0000-0000-000000000004', 'TXN-2023-004-JD-RET', 'RETURN_PAYMENT', 'COMPLETED', 'INTERNAL', 2750.50, 0, 'EUR', 'Final return from wine project', '10000001-0000-0000-0000-000000000001', '40000001-0000-0000-0000-000000000002', '30000001-0000-0000-0000-000000000005', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month');

-- Marie Martin's transactions
INSERT INTO oj_transactions (id, reference, type, status, "paymentMethod", amount, fee, currency, description, "walletId", "relatedProjectId", "createdAt", "completedAt") VALUES
('50000001-0000-0000-0000-000000000005', 'TXN-2024-005-MM-DEP', 'DEPOSIT', 'COMPLETED', 'CARD', 100000.00, 250.00, 'EUR', 'Initial deposit via card', '10000001-0000-0000-0000-000000000002', NULL, NOW() - INTERVAL '7 months', NOW() - INTERVAL '7 months'),
('50000001-0000-0000-0000-000000000006', 'TXN-2024-006-MM-INV', 'INVESTMENT', 'COMPLETED', 'INTERNAL', 50000.00, 0, 'EUR', 'Investment in Wind Farm Bretagne', '10000001-0000-0000-0000-000000000002', '30000001-0000-0000-0000-000000000002', NOW() - INTERVAL '7 months', NOW() - INTERVAL '7 months'),
('50000001-0000-0000-0000-000000000007', 'TXN-2024-007-MM-DEP', 'DEPOSIT', 'COMPLETED', 'BANK_TRANSFER', 30000.00, 0, 'EUR', 'Additional deposit', '10000001-0000-0000-0000-000000000002', NULL, NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months');

-- Green Invest Capital's transactions
INSERT INTO oj_transactions (id, reference, type, status, "paymentMethod", amount, fee, currency, description, "walletId", "relatedProjectId", "createdAt", "completedAt") VALUES
('50000001-0000-0000-0000-000000000008', 'TXN-2024-008-GIC-DEP', 'DEPOSIT', 'COMPLETED', 'BANK_TRANSFER', 600000.00, 0, 'EUR', 'Corporate deposit', '10000001-0000-0000-0000-000000000005', NULL, NOW() - INTERVAL '9 months', NOW() - INTERVAL '9 months'),
('50000001-0000-0000-0000-000000000009', 'TXN-2024-009-GIC-RET', 'RETURN_PAYMENT', 'COMPLETED', 'INTERNAL', 45000.00, 0, 'EUR', 'Quarterly returns distribution', '10000001-0000-0000-0000-000000000005', NULL, NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months');

-- Pending transactions (for demo)
INSERT INTO oj_transactions (id, reference, type, status, "paymentMethod", amount, fee, currency, description, "walletId", "createdAt") VALUES
('50000001-0000-0000-0000-000000000010', 'TXN-2024-010-PENDING', 'WITHDRAWAL', 'PENDING', 'BANK_TRANSFER', 5000.00, 10.00, 'EUR', 'Withdrawal request pending', '10000001-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days');

-- =========================================
-- DATA SUMMARY
-- =========================================

-- Summary statistics
DO $$
DECLARE
  investor_count INTEGER;
  project_count INTEGER;
  investment_count INTEGER;
  total_invested NUMERIC;
BEGIN
  SELECT COUNT(*) INTO investor_count FROM oj_investors;
  SELECT COUNT(*) INTO project_count FROM oj_projects;
  SELECT COUNT(*) INTO investment_count FROM oj_investments;
  SELECT SUM(amount) INTO total_invested FROM oj_investments WHERE status != 'CANCELLED';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'OJ Investment Platform - Seed Data Summary';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Investors: %', investor_count;
  RAISE NOTICE 'Projects: %', project_count;
  RAISE NOTICE 'Investments: %', investment_count;
  RAISE NOTICE 'Total Invested: € %', total_invested;
  RAISE NOTICE '========================================';
END $$;
