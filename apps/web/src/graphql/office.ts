import { gql } from '@apollo/client';

// ========== DOCUMENTS ==========

export const CREATE_DOCUMENT = gql`
  mutation CreateDocument($input: CreateDocumentInput!) {
    createDocument(input: $input) {
      id
      title
      content
      status
      visibility
      icon
      description
      tags
      wordCount
      characterCount
      createdAt
      updatedAt
      createdBy {
        id
        username
      }
    }
  }
`;

export const GET_DOCUMENTS = gql`
  query Documents {
    documents {
      id
      title
      status
      visibility
      icon
      description
      tags
      wordCount
      characterCount
      createdAt
      updatedAt
      createdBy {
        id
        username
      }
    }
  }
`;

export const GET_DOCUMENT = gql`
  query Document($id: ID!) {
    document(id: $id) {
      id
      title
      content
      status
      visibility
      icon
      description
      tags
      wordCount
      characterCount
      createdAt
      updatedAt
      createdBy {
        id
        username
      }
      lastEditedBy {
        id
        username
      }
    }
  }
`;

export const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($input: UpdateDocumentInput!) {
    updateDocument(input: $input) {
      id
      title
      content
      status
      visibility
      wordCount
      characterCount
      updatedAt
    }
  }
`;

export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id)
  }
`;

// ========== SPREADSHEETS ==========

export const CREATE_SPREADSHEET = gql`
  mutation CreateSpreadsheet($input: CreateSpreadsheetInput!) {
    createSpreadsheet(input: $input) {
      id
      title
      sheets
      icon
      description
      tags
      sheetCount
      createdAt
      updatedAt
      createdBy {
        id
        username
      }
    }
  }
`;

export const GET_SPREADSHEETS = gql`
  query Spreadsheets {
    spreadsheets {
      id
      title
      icon
      description
      tags
      sheetCount
      createdAt
      updatedAt
      createdBy {
        id
        username
      }
    }
  }
`;

export const GET_SPREADSHEET = gql`
  query Spreadsheet($id: ID!) {
    spreadsheet(id: $id) {
      id
      title
      sheets
      icon
      description
      tags
      sheetCount
      createdAt
      updatedAt
      createdBy {
        id
        username
      }
    }
  }
`;

export const UPDATE_SPREADSHEET = gql`
  mutation UpdateSpreadsheet($input: UpdateSpreadsheetInput!) {
    updateSpreadsheet(input: $input) {
      id
      title
      sheets
      sheetCount
      updatedAt
    }
  }
`;

export const DELETE_SPREADSHEET = gql`
  mutation DeleteSpreadsheet($id: ID!) {
    deleteSpreadsheet(id: $id)
  }
`;

// ========== PRESENTATIONS ==========

export const CREATE_PRESENTATION = gql`
  mutation CreatePresentation($input: CreatePresentationInput!) {
    createPresentation(input: $input) {
      id
      title
      slides
      icon
      description
      tags
      slideCount
      theme
      createdAt
      updatedAt
      createdBy {
        id
        username
      }
    }
  }
`;

export const GET_PRESENTATIONS = gql`
  query Presentations {
    presentations {
      id
      title
      icon
      description
      tags
      slideCount
      theme
      createdAt
      updatedAt
      createdBy {
        id
        username
      }
    }
  }
`;

export const GET_PRESENTATION = gql`
  query Presentation($id: ID!) {
    presentation(id: $id) {
      id
      title
      slides
      icon
      description
      tags
      slideCount
      theme
      createdAt
      updatedAt
      createdBy {
        id
        username
      }
    }
  }
`;

export const UPDATE_PRESENTATION = gql`
  mutation UpdatePresentation($input: UpdatePresentationInput!) {
    updatePresentation(input: $input) {
      id
      title
      slides
      slideCount
      theme
      updatedAt
    }
  }
`;

export const DELETE_PRESENTATION = gql`
  mutation DeletePresentation($id: ID!) {
    deletePresentation(id: $id)
  }
`;
