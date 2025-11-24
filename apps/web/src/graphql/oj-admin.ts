import { gql } from '@apollo/client';

// Admin Dashboard
export const GET_ADMIN_DASHBOARD_STATS = gql`
  query AdminDashboardStats {
    adminDashboardStats {
      totalInvestors
      verifiedInvestors
      pendingKyc
      totalProjects
      activeProjects
      totalFundsRaised
      totalInvestments
      pendingTransactions
      monthlyGrowth
    }
  }
`;

// Investors Management
export const GET_ADMIN_INVESTORS = gql`
  query AdminInvestors($page: Int, $limit: Int, $status: InvestorStatus, $type: InvestorType, $search: String) {
    adminInvestors(page: $page, limit: $limit, status: $status, type: $type, search: $search) {
      investors {
        id
        email
        firstName
        lastName
        phone
        country
        investorType
        status
        createdAt
        wallet {
          balance
          totalInvested
        }
        kycVerification {
          status
          level
        }
      }
      total
      pages
    }
  }
`;

export const GET_ADMIN_PENDING_KYC = gql`
  query AdminPendingKyc {
    adminPendingKyc {
      id
      status
      level
      documentType
      documentNumber
      documentCountry
      documentFrontUrl
      selfieUrl
      createdAt
      investor {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

// Projects Management
export const GET_ADMIN_PROJECTS = gql`
  query AdminProjects($page: Int, $limit: Int, $status: ProjectStatus) {
    adminProjects(page: $page, limit: $limit, status: $status) {
      projects {
        id
        name
        category
        status
        targetAmount
        raisedAmount
        minimumInvestment
        expectedReturn
        progressPercent
        totalInvestors
        seriesCode
        createdAt
      }
      total
      pages
    }
  }
`;

export const GET_ADMIN_PROJECT_INVESTORS = gql`
  query AdminProjectInvestors($projectId: ID!) {
    adminProjectInvestors(projectId: $projectId) {
      id
      amount
      currentValue
      status
      investmentDate
      investor {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

// Reports
export const GET_ADMIN_FINANCIAL_REPORT = gql`
  query AdminFinancialReport($startDate: DateTime!, $endDate: DateTime!) {
    adminFinancialReport(startDate: $startDate, endDate: $endDate) {
      period
      totalDeposits
      totalWithdrawals
      totalInvestments
      totalReturns
      netFlow
      transactionCount
      averageInvestment
      topProjects {
        projectId
        projectName
        amount
      }
    }
  }
`;

export const GET_ADMIN_INVESTOR_REPORT = gql`
  query AdminInvestorReport {
    adminInvestorReport {
      totalInvestors
      byType {
        type
        count
      }
      byStatus {
        status
        count
      }
      byCountry {
        country
        count
      }
      newInvestorsThisMonth
      averageInvestmentPerInvestor
    }
  }
`;

// Mutations
export const ADMIN_APPROVE_INVESTOR = gql`
  mutation AdminApproveInvestor($investorId: ID!) {
    adminApproveInvestor(investorId: $investorId) {
      id
      status
    }
  }
`;

export const ADMIN_SUSPEND_INVESTOR = gql`
  mutation AdminSuspendInvestor($investorId: ID!, $reason: String!) {
    adminSuspendInvestor(investorId: $investorId, reason: $reason) {
      id
      status
    }
  }
`;

export const ADMIN_BLOCK_INVESTOR = gql`
  mutation AdminBlockInvestor($investorId: ID!, $reason: String!) {
    adminBlockInvestor(investorId: $investorId, reason: $reason) {
      id
      status
    }
  }
`;

export const ADMIN_APPROVE_KYC = gql`
  mutation AdminApproveKyc($investorId: ID!, $level: KycLevel) {
    adminApproveKyc(investorId: $investorId, level: $level) {
      id
      status
      level
    }
  }
`;

export const ADMIN_REJECT_KYC = gql`
  mutation AdminRejectKyc($investorId: ID!, $reason: String!) {
    adminRejectKyc(investorId: $investorId, reason: $reason) {
      id
      status
      rejectionReason
    }
  }
`;

export const ADMIN_DISTRIBUTE_RETURNS = gql`
  mutation AdminDistributeReturns($projectId: ID!, $returnPercentage: Float!) {
    adminDistributeReturns(projectId: $projectId, returnPercentage: $returnPercentage) {
      processed
      totalAmount
    }
  }
`;

// Bank Interface
export const GET_BANK_SUMMARY = gql`
  query BankSummary {
    bankSummary {
      pendingDeposits
      pendingWithdrawals
      pendingDepositsCount
      pendingWithdrawalsCount
      todayDeposits
      todayWithdrawals
      totalProcessedToday
    }
  }
`;

export const GET_BANK_PENDING_DEPOSITS = gql`
  query BankPendingDeposits {
    bankPendingDeposits {
      id
      reference
      amount
      currency
      paymentMethod
      status
      description
      createdAt
      wallet {
        id
        investorId
        bankAccountIban
      }
    }
  }
`;

export const GET_BANK_PENDING_WITHDRAWALS = gql`
  query BankPendingWithdrawals {
    bankPendingWithdrawals {
      id
      reference
      amount
      currency
      status
      metadata
      createdAt
      wallet {
        id
        investorId
        bankAccountIban
        bankAccountBic
        bankAccountHolder
        investor {
          id
          email
          firstName
          lastName
        }
      }
    }
  }
`;

export const GET_BANK_TRANSACTION_HISTORY = gql`
  query BankTransactionHistory($page: Int, $limit: Int, $type: TransactionType, $status: TransactionStatus) {
    bankTransactionHistory(page: $page, limit: $limit, type: $type, status: $status) {
      transactions {
        id
        reference
        bankReference
        type
        status
        amount
        currency
        paymentMethod
        description
        blockchainTxHash
        validatedBy
        createdAt
        completedAt
        wallet {
          id
          investor {
            id
            email
            firstName
            lastName
          }
        }
      }
      total
      pages
    }
  }
`;

export const GET_BANK_ESCROW_SUMMARY = gql`
  query BankEscrowSummary {
    bankEscrowSummary {
      totalInEscrow
      byProject {
        projectId
        amount
      }
    }
  }
`;

export const BANK_VALIDATE_DEPOSIT = gql`
  mutation BankValidateDeposit($transactionId: ID!, $approve: Boolean!, $bankReference: String, $reason: String) {
    bankValidateDeposit(transactionId: $transactionId, approve: $approve, bankReference: $bankReference, reason: $reason) {
      id
      status
      externalReference
    }
  }
`;

export const BANK_VALIDATE_WITHDRAWAL = gql`
  mutation BankValidateWithdrawal($transactionId: ID!, $approve: Boolean!, $bankReference: String, $reason: String) {
    bankValidateWithdrawal(transactionId: $transactionId, approve: $approve, bankReference: $bankReference, reason: $reason) {
      id
      status
      externalReference
    }
  }
`;

export const BANK_FLAG_TRANSACTION = gql`
  mutation BankFlagTransaction($transactionId: ID!, $reason: String!) {
    bankFlagTransaction(transactionId: $transactionId, reason: $reason) {
      id
      metadata
    }
  }
`;

// Additional Admin Queries
export const GET_ADMIN_ALL_INVESTORS = gql`
  query AdminAllInvestors($page: Int, $limit: Int) {
    adminAllInvestors(page: $page, limit: $limit) {
      investors {
        id
        email
        firstName
        lastName
        phone
        kycStatus
        investmentsCount
        createdAt
        wallet {
          id
          balance
        }
      }
      total
    }
  }
`;

export const GET_ADMIN_ALL_PROJECTS = gql`
  query AdminAllProjects {
    adminAllProjects {
      id
      name
      spvName
      status
      fundingGoal
      currentFunding
      expectedReturn
      duration
      investorsCount
      createdAt
    }
  }
`;

export const ADMIN_UPDATE_PROJECT_STATUS = gql`
  mutation AdminUpdateProjectStatus($projectId: ID!, $status: String!) {
    adminUpdateProjectStatus(projectId: $projectId, status: $status) {
      id
      status
    }
  }
`;

// Escrow Management
export const GET_BANK_ESCROW_ACCOUNTS = gql`
  query BankEscrowAccounts {
    bankEscrowAccounts {
      id
      balance
      targetAmount
      releasedAmount
      status
      investorsCount
      createdAt
      project {
        id
        name
        spvName
      }
      releases {
        amount
        reason
        date
      }
    }
  }
`;

export const BANK_RELEASE_ESCROW = gql`
  mutation BankReleaseEscrow($escrowId: ID!, $amount: Float!, $reason: String!) {
    bankReleaseEscrow(escrowId: $escrowId, amount: $amount, reason: $reason) {
      id
      balance
      releasedAmount
    }
  }
`;
