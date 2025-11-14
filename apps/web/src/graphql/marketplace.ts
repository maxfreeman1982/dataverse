import { gql } from '@apollo/client';

export const GET_PLUGINS = gql`
  query GetPlugins($input: GetPluginsInput) {
    plugins(input: $input) {
      id
      name
      slug
      description
      longDescription
      version
      author
      category
      status
      iconUrl
      screenshots
      tags
      downloadUrl
      homepageUrl
      documentationUrl
      repositoryUrl
      averageRating
      reviewCount
      downloadCount
      installCount
      isFeatured
      isVerified
      createdAt
      updatedAt
      publishedAt
      authorUser {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const GET_PLUGIN = gql`
  query GetPlugin($id: ID!) {
    plugin(id: $id) {
      id
      name
      slug
      description
      longDescription
      version
      author
      category
      status
      iconUrl
      screenshots
      tags
      downloadUrl
      homepageUrl
      documentationUrl
      repositoryUrl
      averageRating
      reviewCount
      downloadCount
      installCount
      isFeatured
      isVerified
      createdAt
      updatedAt
      publishedAt
      authorUser {
        id
        email
        firstName
        lastName
      }
      reviews {
        id
        rating
        comment
        createdAt
        user {
          id
          email
          firstName
          lastName
        }
      }
    }
  }
`;

export const GET_INSTALLED_PLUGINS = gql`
  query GetInstalledPlugins {
    installedPlugins {
      id
      installedVersion
      status
      isEnabled
      installedAt
      lastUsedAt
      plugin {
        id
        name
        slug
        description
        version
        author
        category
        iconUrl
        tags
        averageRating
        reviewCount
      }
    }
  }
`;

export const INSTALL_PLUGIN = gql`
  mutation InstallPlugin($input: InstallPluginInput!) {
    installPlugin(input: $input) {
      id
      installedVersion
      status
      isEnabled
      installedAt
      plugin {
        id
        name
        version
      }
    }
  }
`;

export const UNINSTALL_PLUGIN = gql`
  mutation UninstallPlugin($pluginId: ID!) {
    uninstallPlugin(pluginId: $pluginId)
  }
`;

export const TOGGLE_PLUGIN = gql`
  mutation TogglePlugin($pluginId: ID!) {
    togglePlugin(pluginId: $pluginId) {
      id
      isEnabled
    }
  }
`;

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      rating
      comment
      createdAt
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const GET_PLUGIN_REVIEWS = gql`
  query GetPluginReviews($pluginId: ID!) {
    pluginReviews(pluginId: $pluginId) {
      id
      rating
      comment
      createdAt
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const SEED_MARKETPLACE = gql`
  mutation SeedMarketplace {
    seedMarketplace
  }
`;
