import { gql } from '@apollo/client'

export const CHANNEL_FIELDS = gql`
  fragment ChannelFields on Channel {
    id
    name
    description
    type
    icon
    isArchived
    createdAt
    updatedAt
    lastMessageAt
    createdBy {
      id
      email
      firstName
      lastName
    }
    members {
      id
      email
      firstName
      lastName
    }
  }
`

export const MESSAGE_FIELDS = gql`
  fragment MessageFields on Message {
    id
    channelId
    content
    attachments
    mentions
    reactions
    replyToId
    isEdited
    createdAt
    updatedAt
    user {
      id
      email
      firstName
      lastName
    }
    replyTo {
      id
      content
      user {
        id
        firstName
        lastName
      }
    }
  }
`

export const GET_CHANNELS = gql`
  ${CHANNEL_FIELDS}
  query GetChannels {
    channels {
      ...ChannelFields
    }
  }
`

export const GET_CHANNEL = gql`
  ${CHANNEL_FIELDS}
  query GetChannel($id: ID!) {
    channel(id: $id) {
      ...ChannelFields
    }
  }
`

export const GET_MESSAGES = gql`
  ${MESSAGE_FIELDS}
  query GetMessages($channelId: ID!, $limit: Int, $offset: Int) {
    messages(channelId: $channelId, limit: $limit, offset: $offset) {
      ...MessageFields
    }
  }
`

export const CREATE_CHANNEL = gql`
  ${CHANNEL_FIELDS}
  mutation CreateChannel($input: CreateChannelInput!) {
    createChannel(input: $input) {
      ...ChannelFields
    }
  }
`

export const UPDATE_CHANNEL = gql`
  ${CHANNEL_FIELDS}
  mutation UpdateChannel($id: ID!, $input: UpdateChannelInput!) {
    updateChannel(id: $id, input: $input) {
      ...ChannelFields
    }
  }
`

export const DELETE_CHANNEL = gql`
  mutation DeleteChannel($id: ID!) {
    deleteChannel(id: $id)
  }
`

export const ADD_CHANNEL_MEMBER = gql`
  ${CHANNEL_FIELDS}
  mutation AddChannelMember($channelId: ID!, $userId: ID!) {
    addChannelMember(channelId: $channelId, userId: $userId) {
      ...ChannelFields
    }
  }
`

export const REMOVE_CHANNEL_MEMBER = gql`
  ${CHANNEL_FIELDS}
  mutation RemoveChannelMember($channelId: ID!, $userId: ID!) {
    removeChannelMember(channelId: $channelId, userId: $userId) {
      ...ChannelFields
    }
  }
`

export const CREATE_MESSAGE = gql`
  ${MESSAGE_FIELDS}
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      ...MessageFields
    }
  }
`

export const UPDATE_MESSAGE = gql`
  ${MESSAGE_FIELDS}
  mutation UpdateMessage($id: ID!, $input: UpdateMessageInput!) {
    updateMessage(id: $id, input: $input) {
      ...MessageFields
    }
  }
`

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($id: ID!) {
    deleteMessage(id: $id)
  }
`

export const ADD_REACTION = gql`
  ${MESSAGE_FIELDS}
  mutation AddReaction($input: AddReactionInput!) {
    addReaction(input: $input) {
      ...MessageFields
    }
  }
`

export const REMOVE_REACTION = gql`
  ${MESSAGE_FIELDS}
  mutation RemoveReaction($input: AddReactionInput!) {
    removeReaction(input: $input) {
      ...MessageFields
    }
  }
`

export const EMIT_TYPING = gql`
  mutation EmitTyping($channelId: ID!) {
    emitTyping(channelId: $channelId)
  }
`
