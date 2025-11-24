# OJ Investment Platform - Database

This directory contains the database schema and seed data for the OJ Investment Platform.

## 📁 Structure

```
database/
├── schema.sql              # Complete database schema with tables, indexes, triggers, and views
├── seeds/
│   └── 01-initial-data.sql # Test and demo data for development
└── README.md              # This file
```

## 🗄️ Database Schema

The platform uses PostgreSQL with the following main tables:

### Core Tables

- **`oj_investors`** - User/investor accounts with authentication and profile data
- **`oj_wallets`** - Digital wallets for managing investor funds
- **`oj_kyc_verifications`** - KYC/AML verification records
- **`oj_projects`** - Investment projects and opportunities
- **`oj_investments`** - Individual investment records linking investors to projects
- **`oj_transactions`** - Complete financial transaction history

### Features

- ✅ UUID primary keys for security
- ✅ Comprehensive enum types for status management
- ✅ Automatic timestamp updates via triggers
- ✅ Indexes for optimal query performance
- ✅ Foreign key constraints for data integrity
- ✅ Materialized views for common queries

## 🚀 Setup Instructions

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE oj_investment_platform;

# Connect to the database
\c oj_investment_platform
```

### 2. Create Schema

```bash
# Run the schema file
psql -U postgres -d oj_investment_platform -f apps/api/src/database/schema.sql
```

### 3. Load Seed Data (Development Only)

```bash
# Load test data
psql -U postgres -d oj_investment_platform -f apps/api/src/database/seeds/01-initial-data.sql
```

⚠️ **Warning**: Seed data truncates existing tables. Only use in development!

## 📊 Seed Data Overview

The seed data includes:

- **6 Investors** (4 individual, 2 institutional)
  - All with verified KYC except one pending
  - Realistic French names and addresses
- **6 Projects** across different categories:
  - 2 Energy (solar, wind)
  - 2 Real Estate (commercial, student housing)
  - 1 Agriculture (organic vineyard)
  - 1 Infrastructure (smart city)
- **9 Investments** totaling €1,430,000
- **10+ Transactions** (deposits, investments, returns)
- **6 Wallets** with varying balances

### Test Accounts

```
Email: john.doe@example.com
Password: (use your hashed password)
Type: Individual Investor
Status: Verified
Portfolio: €50,000 invested

Email: contact@greeninvest.fr
Password: (use your hashed password)
Type: Institutional Investor
Status: Verified
Portfolio: €500,000 invested
```

## 📈 Useful Views

The schema includes three materialized views for common queries:

### `v_active_projects`
Projects currently active with investment statistics.

```sql
SELECT * FROM v_active_projects;
```

### `v_investor_portfolios`
Complete portfolio overview for each investor.

```sql
SELECT * FROM v_investor_portfolios
WHERE investor_id = 'your-investor-id';
```

### `v_wallet_transactions`
Transaction summaries grouped by wallet.

```sql
SELECT * FROM v_wallet_transactions
WHERE wallet_id = 'your-wallet-id';
```

## 🔧 TypeORM Configuration

The backend uses TypeORM with the following entities:

```typescript
// Located in: apps/api/src/modules/oj/entities/
- investor.entity.ts
- wallet.entity.ts
- kyc-verification.entity.ts
- project.entity.ts
- investment.entity.ts
- transaction.entity.ts
```

TypeORM will automatically sync the schema in development mode. For production, use migrations.

## 🛡️ Security Notes

1. **Passwords**: All seed passwords are placeholders. Use proper bcrypt hashes in production.
2. **Blockchain Hashes**: Demo hashes are simplified. Real implementation will use actual transaction hashes.
3. **KYC Documents**: Document URLs point to example URLs. Implement secure storage in production.
4. **API Keys**: No sensitive keys are included in seed data.

## 📝 Database Maintenance

### Backup

```bash
# Full backup
pg_dump -U postgres oj_investment_platform > backup.sql

# Schema only
pg_dump -U postgres --schema-only oj_investment_platform > schema-backup.sql

# Data only
pg_dump -U postgres --data-only oj_investment_platform > data-backup.sql
```

### Restore

```bash
psql -U postgres -d oj_investment_platform < backup.sql
```

### Reset Database

```bash
# Drop and recreate
dropdb -U postgres oj_investment_platform
createdb -U postgres oj_investment_platform

# Recreate schema and data
psql -U postgres -d oj_investment_platform -f apps/api/src/database/schema.sql
psql -U postgres -d oj_investment_platform -f apps/api/src/database/seeds/01-initial-data.sql
```

## 🔍 Useful Queries

### Check Active Investments
```sql
SELECT
  i.*,
  inv."firstName" || ' ' || inv."lastName" as investor_name,
  p.name as project_name
FROM oj_investments i
JOIN oj_investors inv ON i."investorId" = inv.id
JOIN oj_projects p ON i."projectId" = p.id
WHERE i.status = 'ACTIVE';
```

### Calculate Platform Statistics
```sql
SELECT
  COUNT(DISTINCT "investorId") as total_investors,
  COUNT(DISTINCT "projectId") as total_projects,
  SUM(amount) as total_invested,
  AVG(amount) as avg_investment
FROM oj_investments
WHERE status IN ('ACTIVE', 'MATURED');
```

### Find High-Value Investors
```sql
SELECT
  i.id,
  i."firstName" || ' ' || i."lastName" as name,
  w."totalInvested",
  w."totalReturns",
  COUNT(inv.id) as investment_count
FROM oj_investors i
JOIN oj_wallets w ON i.id = w."investorId"
LEFT JOIN oj_investments inv ON i.id = inv."investorId"
GROUP BY i.id, w.id
HAVING w."totalInvested" > 100000
ORDER BY w."totalInvested" DESC;
```

## 📞 Support

For database-related issues:
- Check TypeORM entity definitions
- Verify enum types match between SQL and TypeScript
- Ensure foreign key relationships are correctly defined
- Review indexes if experiencing slow queries

## 🔄 Migration Notes

For production deployments, consider:
1. Creating TypeORM migrations from entity changes
2. Implementing database versioning
3. Adding rollback procedures
4. Setting up automated backups
5. Configuring connection pooling
6. Enabling query logging for debugging
