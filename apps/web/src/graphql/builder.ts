import { gql } from '@apollo/client'

export const PAGE_FIELDS = gql`
  fragment PageFields on Page {
    id
    name
    description
    slug
    status
    icon
    coverImage
    createdAt
    updatedAt
    publishedAt
    createdBy {
      id
      email
      firstName
      lastName
    }
  }
`

export const COMPONENT_FIELDS = gql`
  fragment ComponentFields on PageComponent {
    id
    pageId
    type
    properties
    style
    order
    parentId
  }
`

export const GET_PAGES = gql`
  ${PAGE_FIELDS}
  query GetPages {
    pages {
      ...PageFields
      components {
        id
        type
        order
      }
    }
  }
`

export const GET_PAGE = gql`
  ${PAGE_FIELDS}
  ${COMPONENT_FIELDS}
  query GetPage($id: ID!) {
    page(id: $id) {
      ...PageFields
      components {
        ...ComponentFields
      }
    }
  }
`

export const GET_PAGE_BY_SLUG = gql`
  ${PAGE_FIELDS}
  ${COMPONENT_FIELDS}
  query GetPageBySlug($slug: String!) {
    pageBySlug(slug: $slug) {
      ...PageFields
      components {
        ...ComponentFields
      }
    }
  }
`

export const CREATE_PAGE = gql`
  ${PAGE_FIELDS}
  mutation CreatePage($input: CreatePageInput!) {
    createPage(input: $input) {
      ...PageFields
    }
  }
`

export const UPDATE_PAGE = gql`
  ${PAGE_FIELDS}
  mutation UpdatePage($id: ID!, $input: UpdatePageInput!) {
    updatePage(id: $id, input: $input) {
      ...PageFields
    }
  }
`

export const DELETE_PAGE = gql`
  mutation DeletePage($id: ID!) {
    deletePage(id: $id)
  }
`

export const PUBLISH_PAGE = gql`
  ${PAGE_FIELDS}
  mutation PublishPage($id: ID!) {
    publishPage(id: $id) {
      ...PageFields
    }
  }
`

export const UNPUBLISH_PAGE = gql`
  ${PAGE_FIELDS}
  mutation UnpublishPage($id: ID!) {
    unpublishPage(id: $id) {
      ...PageFields
    }
  }
`

export const CREATE_COMPONENT = gql`
  ${COMPONENT_FIELDS}
  mutation CreateComponent($input: CreateComponentInput!) {
    createComponent(input: $input) {
      ...ComponentFields
    }
  }
`

export const UPDATE_COMPONENT = gql`
  ${COMPONENT_FIELDS}
  mutation UpdateComponent($id: ID!, $input: UpdateComponentInput!) {
    updateComponent(id: $id, input: $input) {
      ...ComponentFields
    }
  }
`

export const DELETE_COMPONENT = gql`
  mutation DeleteComponent($id: ID!) {
    deleteComponent(id: $id)
  }
`

export const REORDER_COMPONENTS = gql`
  ${COMPONENT_FIELDS}
  mutation ReorderComponents($pageId: ID!, $componentIds: [ID!]!) {
    reorderComponents(pageId: $pageId, componentIds: $componentIds) {
      ...ComponentFields
    }
  }
`
