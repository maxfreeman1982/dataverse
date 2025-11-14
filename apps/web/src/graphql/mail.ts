import { gql } from '@apollo/client';

export const CREATE_EMAIL = gql`
  mutation CreateEmail($input: CreateEmailInput!) {
    createEmail(input: $input) {
      id
      subject
      body
      toAddresses
      fromAddress
      fromName
      status
      folder
      priority
      isRead
      isStarred
      threadId
      aiSummary
      aiCategory
      aiSuggestedReplies
      sentAt
      createdAt
    }
  }
`;

export const GET_EMAILS = gql`
  query Emails($input: GetEmailsInput) {
    emails(input: $input) {
      id
      subject
      body
      toAddresses
      fromAddress
      fromName
      status
      folder
      priority
      isRead
      isStarred
      isImportant
      labels
      threadId
      aiSummary
      aiCategory
      aiSentimentScore
      sentAt
      receivedAt
      createdAt
    }
  }
`;

export const GET_EMAIL = gql`
  query Email($id: ID!) {
    email(id: $id) {
      id
      subject
      body
      htmlBody
      toAddresses
      ccAddresses
      bccAddresses
      fromAddress
      fromName
      status
      folder
      priority
      isRead
      isStarred
      isImportant
      labels
      attachments
      threadId
      thread {
        id
        subject
        emailCount
        participants
      }
      aiSummary
      aiCategory
      aiSentimentScore
      aiSuggestedReplies
      sentAt
      receivedAt
      createdAt
    }
  }
`;

export const UPDATE_EMAIL = gql`
  mutation UpdateEmail($input: UpdateEmailInput!) {
    updateEmail(input: $input) {
      id
      isRead
      isStarred
      isImportant
      folder
      labels
    }
  }
`;

export const DELETE_EMAIL = gql`
  mutation DeleteEmail($id: ID!) {
    deleteEmail(id: $id)
  }
`;

export const GET_EMAIL_THREADS = gql`
  query EmailThreads {
    emailThreads {
      id
      subject
      participants
      emailCount
      unreadCount
      lastEmailAt
      createdAt
    }
  }
`;

export const GENERATE_AI_REPLY = gql`
  mutation GenerateAIReply($emailId: ID!, $replyIntent: String!) {
    generateAIReply(emailId: $emailId, replyIntent: $replyIntent)
  }
`;

export const COMPOSE_EMAIL_WITH_AI = gql`
  mutation ComposeEmailWithAI($prompt: String!) {
    composeEmailWithAI(prompt: $prompt) {
      subject
      body
    }
  }
`;
