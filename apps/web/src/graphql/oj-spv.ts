import { gql } from '@apollo/client';

// SPV Dashboard
export const GET_SPV_DASHBOARD = gql`
  query SpvDashboard($projectId: ID!) {
    spvDashboard(projectId: $projectId) {
      projectName
      spvName
      status
      fundingGoal
      currentFunding
      fundingProgress
      totalInvestors
      expectedReturn
      duration
      monthlyInvestments
      escrowBalance
      startDate
      endDate
    }
  }
`;

export const GET_SPV_PROJECT_INVESTORS = gql`
  query SpvProjectInvestors($projectId: ID!, $page: Int, $limit: Int) {
    spvProjectInvestors(projectId: $projectId, page: $page, limit: $limit) {
      investments {
        id
        amount
        tokensAmount
        investmentDate
        currentValue
        returnGenerated
        investor {
          id
          firstName
          lastName
          email
          investorType
        }
      }
      total
      page
      totalPages
    }
  }
`;

export const GET_SPV_PROJECT_MILESTONES = gql`
  query SpvProjectMilestones($projectId: ID!) {
    spvProjectMilestones(projectId: $projectId) {
      id
      title
      description
      status
      progress
      targetDate
      completedDate
      notes
      updatedAt
    }
  }
`;

export const GET_SPV_DOCUMENTS = gql`
  query SpvDocuments($projectId: ID!) {
    spvDocuments(projectId: $projectId) {
      id
      type
      title
      fileUrl
      description
      uploadedAt
    }
  }
`;

export const GET_SPV_FINANCIAL_REPORT = gql`
  query SpvFinancialReport($projectId: ID!, $period: String!) {
    spvFinancialReport(projectId: $projectId, period: $period) {
      period
      startDate
      endDate
      totalInvestments
      investmentCount
      totalDistributed
      distributionCount
      currentEscrow
      projectValue
      roi
    }
  }
`;

export const GET_SPV_ESCROW_REQUESTS = gql`
  query SpvEscrowRequests($projectId: ID!) {
    spvEscrowRequests(projectId: $projectId) {
      id
      amount
      reason
      beneficiary
      status
      requestedAt
      approvedAt
      rejectedReason
    }
  }
`;

export const GET_SPV_DISTRIBUTION_LIST = gql`
  query SpvDistributionList($projectId: ID!) {
    spvDistributionList(projectId: $projectId) {
      investorId
      investorName
      email
      investmentAmount
      tokensAmount
      walletBalance
      bankAccountLinked
    }
  }
`;

// SPV Mutations
export const SPV_UPDATE_MILESTONE = gql`
  mutation SpvUpdateMilestone(
    $projectId: ID!
    $milestoneId: ID!
    $status: String!
    $progress: Float!
    $notes: String
  ) {
    spvUpdateMilestone(
      projectId: $projectId
      milestoneId: $milestoneId
      status: $status
      progress: $progress
      notes: $notes
    ) {
      id
      status
      progress
      notes
      updatedAt
    }
  }
`;

export const SPV_ADD_DOCUMENT = gql`
  mutation SpvAddDocument(
    $projectId: ID!
    $documentType: String!
    $title: String!
    $fileUrl: String!
    $description: String
  ) {
    spvAddDocument(
      projectId: $projectId
      documentType: $documentType
      title: $title
      fileUrl: $fileUrl
      description: $description
    ) {
      id
      type
      title
      fileUrl
      uploadedAt
    }
  }
`;

export const SPV_REQUEST_ESCROW_RELEASE = gql`
  mutation SpvRequestEscrowRelease(
    $projectId: ID!
    $amount: Float!
    $reason: String!
    $beneficiary: String!
  ) {
    spvRequestEscrowRelease(
      projectId: $projectId
      amount: $amount
      reason: $reason
      beneficiary: $beneficiary
    ) {
      id
      amount
      reason
      beneficiary
      status
      requestedAt
    }
  }
`;

export const SPV_UPDATE_PROJECT_STATUS = gql`
  mutation SpvUpdateProjectStatus(
    $projectId: ID!
    $status: String!
    $notes: String
  ) {
    spvUpdateProjectStatus(
      projectId: $projectId
      status: $status
      notes: $notes
    ) {
      id
      status
    }
  }
`;
