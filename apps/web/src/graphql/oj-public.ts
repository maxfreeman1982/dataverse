import { gql } from '@apollo/client';

// Public Platform Stats
export const GET_PUBLIC_PLATFORM_STATS = gql`
  query PublicPlatformStats {
    publicPlatformStats {
      totalProjects
      activeProjects
      totalFunding
      totalFundingGoal
      fundingProgress
      totalInvestors
      totalInvestments
      totalInvestmentAmount
      averageReturn
    }
  }
`;

// Public Projects
export const GET_PUBLIC_PROJECTS = gql`
  query PublicProjects(
    $status: String
    $category: String
    $page: Int
    $limit: Int
  ) {
    publicProjects(
      status: $status
      category: $category
      page: $page
      limit: $limit
    ) {
      projects {
        id
        name
        spvName
        category
        status
        description
        fundingGoal
        currentFunding
        fundingProgress
        expectedReturn
        duration
        minimumInvestment
        investorCount
        startDate
        endDate
        location
        metadata
      }
      total
      page
      totalPages
    }
  }
`;

// Public Project Details
export const GET_PUBLIC_PROJECT_DETAILS = gql`
  query PublicProjectDetails($projectId: ID!) {
    publicProjectDetails(projectId: $projectId) {
      id
      name
      spvName
      category
      status
      description
      fundingGoal
      currentFunding
      fundingProgress
      expectedReturn
      duration
      minimumInvestment
      investorCount
      startDate
      endDate
      location
      metadata
      recentInvestments {
        amount
        date
      }
    }
  }
`;

// Public Recent Activity
export const GET_PUBLIC_RECENT_ACTIVITY = gql`
  query PublicRecentActivity($limit: Int) {
    publicRecentActivity(limit: $limit) {
      recentInvestments {
        projectName
        amount
        date
      }
      recentProjects {
        id
        name
        category
        fundingGoal
        currentFunding
        expectedReturn
      }
    }
  }
`;

// Public Performance Metrics
export const GET_PUBLIC_PERFORMANCE_METRICS = gql`
  query PublicPerformanceMetrics {
    publicPerformanceMetrics {
      totalActiveProjects
      averageFundingTime
      averageReturn
      successRate
      totalValueLocked
    }
  }
`;

// Public Category Stats
export const GET_PUBLIC_CATEGORY_STATS = gql`
  query PublicCategoryStats {
    publicCategoryStats {
      category
      projectCount
      totalFunding
    }
  }
`;
