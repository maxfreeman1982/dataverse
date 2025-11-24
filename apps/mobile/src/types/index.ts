// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  investorType: InvestorType;
  status: InvestorStatus;
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
}

export enum InvestorType {
  INDIVIDUAL = 'INDIVIDUAL',
  INSTITUTIONAL = 'INSTITUTIONAL',
  HOLDING = 'HOLDING',
}

export enum InvestorStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: ProjectCategory;
  status: ProjectStatus;
  targetAmount: number;
  raisedAmount: number;
  minimumInvestment: number;
  expectedReturn: number;
  durationMonths: number;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  seriesCode: string;
  totalInvestors: number;
  progressPercent: number;
}

export enum ProjectCategory {
  REAL_ESTATE = 'REAL_ESTATE',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  ENERGY = 'ENERGY',
  AGRICULTURE = 'AGRICULTURE',
  TECHNOLOGY = 'TECHNOLOGY',
  OTHER = 'OTHER',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  FUNDED = 'FUNDED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Investment Types
export interface Investment {
  id: string;
  amount: number;
  currentValue: number;
  accruedReturns: number;
  paidReturns: number;
  status: InvestmentStatus;
  investmentDate: string;
  maturityDate?: string;
  project: Project;
}

export enum InvestmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  MATURED = 'MATURED',
  WITHDRAWN = 'WITHDRAWN',
  CANCELLED = 'CANCELLED',
}

// Wallet Types
export interface Wallet {
  id: string;
  walletAddress: string;
  balance: number;
  pendingBalance: number;
  totalInvested: number;
  totalReturns: number;
  status: WalletStatus;
}

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  CLOSED = 'CLOSED',
}

// Transaction Types
export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  amount: number;
  fee?: number;
  currency: string;
  description?: string;
  createdAt: string;
  completedAt?: string;
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  INVESTMENT = 'INVESTMENT',
  RETURN_PAYMENT = 'RETURN_PAYMENT',
  TRANSFER = 'TRANSFER',
  FEE = 'FEE',
  REFUND = 'REFUND',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CRYPTO = 'CRYPTO',
  INTERNAL = 'INTERNAL',
}

// KYC Types
export interface KYCVerification {
  id: string;
  status: KYCStatus;
  level: KYCLevel;
  documentType?: string;
  verifiedAt?: string;
  expiresAt?: string;
}

export enum KYCStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum KYCLevel {
  NONE = 'NONE',
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  ENHANCED = 'ENHANCED',
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ProjectDetails: { projectId: string };
  InvestmentDetails: { investmentId: string };
  Deposit: undefined;
  Withdrawal: undefined;
  KYCVerification: undefined;
  Settings: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Projects: undefined;
  Portfolio: undefined;
  Wallet: undefined;
  More: undefined;
};

// API Response Types
export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Portfolio Summary Types
export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalReturns: number;
  activeInvestments: number;
  availableBalance: number;
  performance: number; // Percentage
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface PerformanceData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
  }[];
}
