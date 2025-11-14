import { gql } from '@apollo/client'

export const WORKFLOW_FIELDS = gql`
  fragment WorkflowFields on Workflow {
    id
    name
    description
    triggerType
    triggerConfig
    nodes
    edges
    enabled
    createdAt
    updatedAt
    lastExecutedAt
    executionCount
    createdBy {
      id
      firstName
      lastName
    }
  }
`

export const EXECUTION_FIELDS = gql`
  fragment ExecutionFields on WorkflowExecution {
    id
    workflowId
    status
    triggerData
    result
    error
    durationMs
    createdAt
    completedAt
  }
`

export const GET_WORKFLOWS = gql`
  ${WORKFLOW_FIELDS}
  query GetWorkflows {
    workflows {
      ...WorkflowFields
    }
  }
`

export const GET_WORKFLOW = gql`
  ${WORKFLOW_FIELDS}
  query GetWorkflow($id: ID!) {
    workflow(id: $id) {
      ...WorkflowFields
    }
  }
`

export const CREATE_WORKFLOW = gql`
  ${WORKFLOW_FIELDS}
  mutation CreateWorkflow($input: CreateWorkflowInput!) {
    createWorkflow(input: $input) {
      ...WorkflowFields
    }
  }
`

export const UPDATE_WORKFLOW = gql`
  ${WORKFLOW_FIELDS}
  mutation UpdateWorkflow($id: ID!, $input: UpdateWorkflowInput!) {
    updateWorkflow(id: $id, input: $input) {
      ...WorkflowFields
    }
  }
`

export const DELETE_WORKFLOW = gql`
  mutation DeleteWorkflow($id: ID!) {
    deleteWorkflow(id: $id)
  }
`

export const TOGGLE_WORKFLOW_ENABLED = gql`
  ${WORKFLOW_FIELDS}
  mutation ToggleWorkflowEnabled($id: ID!) {
    toggleWorkflowEnabled(id: $id) {
      ...WorkflowFields
    }
  }
`

export const GET_WORKFLOW_EXECUTIONS = gql`
  ${EXECUTION_FIELDS}
  query GetWorkflowExecutions($workflowId: ID!, $limit: Int) {
    workflowExecutions(workflowId: $workflowId, limit: $limit) {
      ...ExecutionFields
    }
  }
`

export const GET_EXECUTION_LOGS = gql`
  query GetExecutionLogs($executionId: ID!) {
    executionLogs(executionId: $executionId) {
      id
      nodeId
      level
      message
      data
      createdAt
    }
  }
`

export const EXECUTE_WORKFLOW = gql`
  ${EXECUTION_FIELDS}
  mutation ExecuteWorkflow($input: ExecuteWorkflowInput!) {
    executeWorkflow(input: $input) {
      ...ExecutionFields
    }
  }
`
