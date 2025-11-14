import { gql } from '@apollo/client';

export const CREATE_MCP_SERVER = gql`
  mutation CreateMCPServer($input: CreateMCPServerInput!) {
    createMCPServer(input: $input) {
      id
      name
      description
      type
      url
      status
      isEnabled
      isPublic
      createdAt
      tools {
        id
        name
        description
        tags
      }
    }
  }
`;

export const GET_MCP_SERVERS = gql`
  query MCPServers {
    mcpServers {
      id
      name
      description
      type
      url
      status
      isEnabled
      isPublic
      lastConnectedAt
      lastError
      createdAt
      tools {
        id
        name
        description
        tags
        isEnabled
        usageCount
      }
    }
  }
`;

export const GET_MCP_SERVER = gql`
  query MCPServer($id: ID!) {
    mcpServer(id: $id) {
      id
      name
      description
      type
      url
      config
      headers
      status
      isEnabled
      isPublic
      lastConnectedAt
      lastError
      createdAt
      updatedAt
      tools {
        id
        name
        description
        schema
        tags
        examples
        isEnabled
        usageCount
        lastUsedAt
      }
    }
  }
`;

export const UPDATE_MCP_SERVER = gql`
  mutation UpdateMCPServer($input: UpdateMCPServerInput!) {
    updateMCPServer(input: $input) {
      id
      name
      description
      url
      status
      isEnabled
      isPublic
      updatedAt
    }
  }
`;

export const DELETE_MCP_SERVER = gql`
  mutation DeleteMCPServer($id: ID!) {
    deleteMCPServer(id: $id)
  }
`;

export const CONNECT_MCP_SERVER = gql`
  mutation ConnectMCPServer($id: ID!) {
    connectMCPServer(id: $id) {
      id
      status
      lastConnectedAt
      lastError
      tools {
        id
        name
        description
      }
    }
  }
`;

export const GET_MCP_TOOLS = gql`
  query MCPTools($serverId: ID) {
    mcpTools(serverId: $serverId) {
      id
      name
      description
      schema
      tags
      examples
      isEnabled
      usageCount
      lastUsedAt
      server {
        id
        name
        type
        status
      }
    }
  }
`;

export const EXECUTE_MCP_TOOL = gql`
  mutation ExecuteMCPTool($input: ExecuteToolInput!) {
    executeMCPTool(input: $input)
  }
`;
