import { gql } from '@apollo/client';

// ========== MOBILE APPS ==========

export const GET_MOBILE_APPS = gql`
  query GetMobileApps($input: GetMobileAppsInput) {
    mobileApps(input: $input) {
      id
      name
      slug
      description
      platform
      status
      category
      currentVersion
      currentBuildNumber
      bundleId
      packageName
      appStoreUrl
      playStoreUrl
      iconUrl
      screenshots
      totalDownloads
      activeUsers
      averageRating
      reviewCount
      isPushEnabled
      isOfflineEnabled
      isPublished
      createdAt
      updatedAt
      publishedAt
      owner {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const GET_MOBILE_APP = gql`
  query GetMobileApp($id: ID!) {
    mobileApp(id: $id) {
      id
      name
      slug
      description
      platform
      status
      category
      currentVersion
      currentBuildNumber
      bundleId
      packageName
      appStoreUrl
      playStoreUrl
      iconUrl
      screenshots
      fcmServerKey
      apnsCertificate
      totalDownloads
      activeUsers
      averageRating
      reviewCount
      isPushEnabled
      isOfflineEnabled
      isPublished
      createdAt
      updatedAt
      publishedAt
      owner {
        id
        email
        firstName
        lastName
      }
      builds {
        id
        version
        buildNumber
        status
        type
        releaseNotes
        createdAt
      }
    }
  }
`;

export const CREATE_MOBILE_APP = gql`
  mutation CreateMobileApp($input: CreateMobileAppInput!) {
    createMobileApp(input: $input) {
      id
      name
      slug
      platform
      category
    }
  }
`;

export const UPDATE_MOBILE_APP = gql`
  mutation UpdateMobileApp($input: UpdateMobileAppInput!) {
    updateMobileApp(input: $input) {
      id
      name
      description
      status
      currentVersion
    }
  }
`;

export const DELETE_MOBILE_APP = gql`
  mutation DeleteMobileApp($id: ID!) {
    deleteMobileApp(id: $id)
  }
`;

export const PUBLISH_MOBILE_APP = gql`
  mutation PublishMobileApp($id: ID!) {
    publishMobileApp(id: $id) {
      id
      isPublished
      publishedAt
      status
    }
  }
`;

// ========== BUILDS ==========

export const GET_BUILDS = gql`
  query GetBuilds($input: GetBuildsInput!) {
    builds(input: $input) {
      id
      version
      buildNumber
      status
      type
      releaseNotes
      changelog
      iosBuildUrl
      androidBuildUrl
      buildLogUrl
      commitHash
      branchName
      buildDuration
      errorMessage
      downloadCount
      installCount
      crashCount
      isMandatoryUpdate
      isBeta
      createdAt
      updatedAt
      startedAt
      completedAt
      publishedAt
      createdBy {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const GET_BUILD = gql`
  query GetBuild($id: ID!) {
    build(id: $id) {
      id
      version
      buildNumber
      status
      type
      releaseNotes
      changelog
      iosBuildUrl
      androidBuildUrl
      buildLogUrl
      commitHash
      branchName
      buildDuration
      errorMessage
      downloadCount
      installCount
      crashCount
      isMandatoryUpdate
      isBeta
      createdAt
      updatedAt
      startedAt
      completedAt
      publishedAt
      createdBy {
        id
        email
        firstName
        lastName
      }
      app {
        id
        name
        platform
      }
    }
  }
`;

export const CREATE_BUILD = gql`
  mutation CreateBuild($input: CreateBuildInput!) {
    createBuild(input: $input) {
      id
      version
      buildNumber
      status
      type
    }
  }
`;

export const UPDATE_BUILD = gql`
  mutation UpdateBuild($input: UpdateBuildInput!) {
    updateBuild(input: $input) {
      id
      status
      buildDuration
    }
  }
`;

export const PUBLISH_BUILD = gql`
  mutation PublishBuild($id: ID!) {
    publishBuild(id: $id) {
      id
      status
      publishedAt
    }
  }
`;

// ========== PUSH NOTIFICATIONS ==========

export const GET_PUSH_NOTIFICATIONS = gql`
  query GetPushNotifications($input: GetPushNotificationsInput!) {
    pushNotifications(input: $input) {
      id
      title
      message
      status
      priority
      target
      imageUrl
      deepLink
      scheduledAt
      sentAt
      totalRecipients
      deliveredCount
      openedCount
      clickedCount
      failedCount
      sendToIos
      sendToAndroid
      createdAt
      createdBy {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const CREATE_PUSH_NOTIFICATION = gql`
  mutation CreatePushNotification($input: CreatePushNotificationInput!) {
    createPushNotification(input: $input) {
      id
      title
      message
      status
      priority
      target
    }
  }
`;

export const UPDATE_PUSH_NOTIFICATION = gql`
  mutation UpdatePushNotification($input: UpdatePushNotificationInput!) {
    updatePushNotification(input: $input) {
      id
      title
      message
      status
    }
  }
`;

export const SEND_PUSH_NOTIFICATION = gql`
  mutation SendPushNotification($input: SendPushNotificationInput!) {
    sendPushNotification(input: $input) {
      id
      status
      sentAt
    }
  }
`;

export const DELETE_PUSH_NOTIFICATION = gql`
  mutation DeletePushNotification($id: ID!) {
    deletePushNotification(id: $id)
  }
`;

// ========== SEED ==========

export const SEED_MOBILE_APPS = gql`
  mutation SeedMobileApps {
    seedMobileApps
  }
`;
