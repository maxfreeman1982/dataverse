import { gql } from '@apollo/client'

export const AI_CONVERSATION_FIELDS = gql`
  fragment AIConversationFields on AIConversation {
    id
    title
    createdAt
    updatedAt
    isPinned
    user {
      id
      firstName
      lastName
    }
  }
`

export const AI_MESSAGE_FIELDS = gql`
  fragment AIMessageFields on AIMessage {
    id
    conversationId
    role
    content
    metadata
    retrievedDocs
    tokenCount
    createdAt
    user {
      id
      firstName
      lastName
    }
  }
`

export const GET_AI_CONVERSATIONS = gql`
  ${AI_CONVERSATION_FIELDS}
  query GetAIConversations {
    aiConversations {
      ...AIConversationFields
    }
  }
`

export const GET_AI_MESSAGES = gql`
  ${AI_MESSAGE_FIELDS}
  query GetAIMessages($conversationId: ID!, $limit: Int) {
    aiMessages(conversationId: $conversationId, limit: $limit) {
      ...AIMessageFields
    }
  }
`

export const CREATE_AI_CONVERSATION = gql`
  ${AI_CONVERSATION_FIELDS}
  mutation CreateAIConversation($input: CreateConversationInput!) {
    createAIConversation(input: $input) {
      ...AIConversationFields
    }
  }
`

export const DELETE_AI_CONVERSATION = gql`
  mutation DeleteAIConversation($id: ID!) {
    deleteAIConversation(id: $id)
  }
`

export const TOGGLE_PIN_CONVERSATION = gql`
  ${AI_CONVERSATION_FIELDS}
  mutation TogglePinConversation($id: ID!) {
    togglePinConversation(id: $id) {
      ...AIConversationFields
    }
  }
`

export const SEND_AI_MESSAGE = gql`
  ${AI_MESSAGE_FIELDS}
  mutation SendAIMessage($input: SendMessageInput!) {
    sendAIMessage(input: $input) {
      message {
        ...AIMessageFields
      }
      conversationId
      retrievedDocs
    }
  }
`

export const GET_AI_ANALYTICS = gql`
  query GetAIAnalytics {
    aiAnalytics {
      totalConversations
      totalMessages
      totalTokens
      averageTokensPerMessage
      documentsIndexed
    }
  }
`

export const REINDEX_WORKSPACE = gql`
  mutation ReindexWorkspace {
    reindexWorkspace {
      tables
      pages
      total
    }
  }
`
