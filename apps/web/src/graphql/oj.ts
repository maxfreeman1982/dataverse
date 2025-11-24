import { gql } from '@apollo/client';

// Auth Mutations
export const REGISTER_INVESTOR = gql`
  mutation RegisterInvestor($input: RegisterInvestorInput!) {
    registerInvestor(input: $input) {
      accessToken
      refreshToken
      investor {
        id
        email
        firstName
        lastName
        status
        investorType
      }
    }
  }
`;

export const LOGIN_INVESTOR = gql`
  mutation LoginInvestor($input: LoginInvestorInput!) {
    loginInvestor(input: $input) {
      accessToken
      refreshToken
      investor {
        id
        email
        firstName
        lastName
        status
        investorType
        twoFactorEnabled
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshInvestorToken($refreshToken: String!) {
    refreshInvestorToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      investor {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

// Investor Queries
export const GET_ME = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      phone
      country
      address
      investorType
      status
      biometricEnabled
      twoFactorEnabled
      createdAt
      wallet {
        id
        walletAddress
        balance
        pendingBalance
        totalInvested
        totalReturns
        virtualAccountNumber
      }
      kycVerification {
        id
        status
        level
      }
    }
  }
`;

// Wallet Queries & Mutations
export const GET_WALLET_SUMMARY = gql`
  query WalletSummary {
    walletSummary {
      totalBalance
      availableBalance
      pendingBalance
      totalInvested
      totalReturns
      unrealizedReturns
    }
  }
`;

export const GET_TRANSACTIONS = gql`
  query TransactionHistory($limit: Int, $offset: Int) {
    transactionHistory(limit: $limit, offset: $offset) {
      id
      reference
      type
      status
      paymentMethod
      amount
      fee
      currency
      description
      blockchainTxHash
      createdAt
      completedAt
    }
  }
`;

export const DEPOSIT = gql`
  mutation Deposit($input: DepositInput!) {
    deposit(input: $input) {
      id
      reference
      type
      status
      amount
      currency
    }
  }
`;

export const WITHDRAW = gql`
  mutation Withdraw($input: WithdrawInput!) {
    withdraw(input: $input) {
      id
      reference
      type
      status
      amount
      currency
    }
  }
`;

export const LINK_BANK_ACCOUNT = gql`
  mutation LinkBankAccount($input: LinkBankAccountInput!) {
    linkBankAccount(input: $input) {
      id
      bankAccountIban
      bankAccountName
      bankName
    }
  }
`;

// Project Queries
export const GET_PROJECTS = gql`
  query OjProjects($filter: ProjectFilterInput, $search: String) {
    ojProjects(filter: $filter, search: $search) {
      id
      name
      shortDescription
      description
      category
      status
      spvName
      targetAmount
      raisedAmount
      minimumInvestment
      expectedReturn
      durationMonths
      startDate
      imageUrl
      progressPercent
      totalInvestors
      seriesCode
    }
  }
`;

export const GET_ACTIVE_PROJECTS = gql`
  query ActiveOjProjects {
    activeOjProjects {
      id
      name
      shortDescription
      category
      status
      targetAmount
      raisedAmount
      minimumInvestment
      expectedReturn
      durationMonths
      imageUrl
      progressPercent
      totalInvestors
      seriesCode
    }
  }
`;

export const GET_PROJECT = gql`
  query OjProject($id: ID!) {
    ojProject(id: $id) {
      id
      name
      description
      shortDescription
      category
      status
      spvName
      spvRegistrationNumber
      spvCountry
      targetAmount
      raisedAmount
      minimumInvestment
      expectedReturn
      durationMonths
      startDate
      endDate
      imageUrl
      documents
      milestones
      financialDetails
      blockchainTxHash
      seriesCode
      progressPercent
      totalInvestors
      createdAt
    }
  }
`;

export const GET_PROJECT_STATS = gql`
  query OjProjectStats {
    ojProjectStats {
      totalProjects
      activeProjects
      totalFundsRaised
      averageReturn
      totalInvestors
    }
  }
`;

// Investment Queries & Mutations
export const GET_MY_INVESTMENTS = gql`
  query MyInvestments {
    myInvestments {
      id
      amount
      currentValue
      accruedReturns
      paidReturns
      status
      investmentDate
      maturityDate
      blockchainTxHash
      tokenId
      project {
        id
        name
        category
        expectedReturn
        status
        imageUrl
      }
    }
  }
`;

export const GET_INVESTMENT_SUMMARY = gql`
  query InvestmentSummary {
    investmentSummary {
      totalInvested
      currentValue
      totalReturns
      pendingReturns
      activeInvestments
      totalInvestments
      averageReturn
    }
  }
`;

export const GET_PORTFOLIO = gql`
  query Portfolio {
    portfolio {
      projectId
      projectName
      projectCategory
      investedAmount
      currentValue
      returnRate
      allocation
      status
    }
  }
`;

export const INVEST = gql`
  mutation Invest($input: CreateInvestmentInput!) {
    invest(input: $input) {
      id
      amount
      currentValue
      status
      investmentDate
      maturityDate
      tokenId
      project {
        id
        name
      }
    }
  }
`;

// KYC Queries & Mutations
export const GET_KYC_PROGRESS = gql`
  query KycProgress {
    kycProgress {
      status
      currentLevel
      documentSubmitted
      selfieSubmitted
      proofOfAddressSubmitted
      rejectionReason
      requiredActions
      completedSteps
    }
  }
`;

export const START_KYC = gql`
  mutation StartKyc($input: StartKycInput!) {
    startKyc(input: $input) {
      id
      status
      level
    }
  }
`;

export const SUBMIT_KYC_DOCUMENT = gql`
  mutation SubmitKycDocument($input: SubmitDocumentInput!) {
    submitKycDocument(input: $input) {
      id
      status
      documentType
      documentNumber
    }
  }
`;

export const SUBMIT_KYC_SELFIE = gql`
  mutation SubmitKycSelfie($input: SubmitSelfieInput!) {
    submitKycSelfie(input: $input) {
      id
      status
      selfieUrl
    }
  }
`;

export const SUBMIT_KYC_FOR_REVIEW = gql`
  mutation SubmitKycForReview {
    submitKycForReview {
      id
      status
    }
  }
`;

// 2FA Mutations
export const SETUP_TWO_FACTOR = gql`
  mutation SetupTwoFactor {
    setupTwoFactor {
      secret
      qrCodeUrl
    }
  }
`;

export const ENABLE_TWO_FACTOR = gql`
  mutation EnableTwoFactor($otpCode: String!) {
    enableTwoFactor(otpCode: $otpCode)
  }
`;

export const DISABLE_TWO_FACTOR = gql`
  mutation DisableTwoFactor($otpCode: String!) {
    disableTwoFactor(otpCode: $otpCode)
  }
`;

// Update Profile
export const UPDATE_INVESTOR_PROFILE = gql`
  mutation UpdateInvestorProfile($input: UpdateInvestorInput!) {
    updateInvestorProfile(input: $input) {
      id
      firstName
      lastName
      phone
      country
      address
      biometricEnabled
    }
  }
`;
