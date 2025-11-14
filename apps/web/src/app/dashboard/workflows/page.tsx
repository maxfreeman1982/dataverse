'use client'

import { useQuery, useMutation } from '@apollo/client'
import {
  GET_WORKFLOWS,
  CREATE_WORKFLOW,
  DELETE_WORKFLOW,
  TOGGLE_WORKFLOW_ENABLED,
  EXECUTE_WORKFLOW,
  GET_WORKFLOW_EXECUTIONS,
} from '@/graphql/workflow'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Play, Pause, Trash2, Zap, Clock, CheckCircle2, XCircle, Activity } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Workflow {
  id: string
  name: string
  description?: string
  triggerType: string
  enabled: boolean
  executionCount: number
  lastExecutedAt?: string
}

export default function WorkflowsPage() {
  const { toast } = useToast()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: 'manual',
  })

  const { data, loading, refetch } = useQuery(GET_WORKFLOWS)
  const { data: execData } = useQuery(GET_WORKFLOW_EXECUTIONS, {
    variables: { workflowId: selectedWorkflow, limit: 10 },
    skip: !selectedWorkflow,
  })

  const [createWorkflow] = useMutation(CREATE_WORKFLOW, {
    onCompleted: () => {
      toast({ title: 'Workflow created' })
      setCreateDialogOpen(false)
      setFormData({ name: '', description: '', triggerType: 'manual' })
      refetch()
    },
  })

  const [deleteWorkflow] = useMutation(DELETE_WORKFLOW, {
    onCompleted: () => {
      toast({ title: 'Workflow deleted' })
      refetch()
    },
  })

  const [toggleEnabled] = useMutation(TOGGLE_WORKFLOW_ENABLED, {
    onCompleted: () => {
      refetch()
    },
  })

  const [executeWorkflow, { loading: executing }] = useMutation(EXECUTE_WORKFLOW, {
    onCompleted: () => {
      toast({ title: 'Workflow execution started' })
      refetch()
    },
  })

  const handleCreate = async () => {
    if (!formData.name) return

    await createWorkflow({
      variables: {
        input: {
          name: formData.name,
          description: formData.description || null,
          triggerType: formData.triggerType.toUpperCase(),
          triggerConfig: {},
        },
      },
    })
  }

  const handleExecute = async (workflowId: string) => {
    await executeWorkflow({
      variables: {
        input: {
          workflowId,
          triggerData: {},
        },
      },
    })
  }

  const workflows: Workflow[] = data?.workflows || []
  const executions = execData?.workflowExecutions || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Automation</h1>
          <p className="text-muted-foreground mt-2">
            Automate tasks across your workspace
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : workflows.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No workflows yet. Create your first automation!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <Card
                  key={workflow.id}
                  className={`cursor-pointer transition-all ${
                    selectedWorkflow === workflow.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedWorkflow(workflow.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center space-x-2">
                          <span>{workflow.name}</span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              workflow.enabled
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {workflow.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </CardTitle>
                        <CardDescription>{workflow.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {workflow.enabled && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleExecute(workflow.id)
                            }}
                            disabled={executing}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleEnabled({ variables: { id: workflow.id } })
                          }}
                        >
                          {workflow.enabled ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteWorkflow({ variables: { id: workflow.id } })
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Zap className="h-3 w-3 mr-1" />
                        {workflow.triggerType.toLowerCase().replace('_', ' ')}
                      </span>
                      <span className="flex items-center">
                        <Activity className="h-3 w-3 mr-1" />
                        {workflow.executionCount} executions
                      </span>
                      {workflow.lastExecutedAt && (
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(workflow.lastExecutedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Execution History */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {!selectedWorkflow ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Select a workflow to view executions
                  </p>
                ) : executions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No executions yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {executions.map((exec: any) => (
                      <div
                        key={exec.id}
                        className="border rounded-lg p-3 space-y-2 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center space-x-2">
                            {exec.status === 'success' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : exec.status === 'failed' ? (
                              <XCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            )}
                            <span className="capitalize">{exec.status}</span>
                          </span>
                          {exec.durationMs && (
                            <span className="text-xs text-muted-foreground">
                              {exec.durationMs}ms
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(exec.createdAt).toLocaleString()}
                        </p>
                        {exec.error && (
                          <p className="text-xs text-red-600 mt-2">{exec.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Workflow</DialogTitle>
            <DialogDescription>
              Create a new automated workflow
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Send welcome message"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this workflow do?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trigger</label>
              <Select
                value={formData.triggerType}
                onValueChange={(value) => setFormData({ ...formData, triggerType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="record_created">Record Created</SelectItem>
                  <SelectItem value="record_updated">Record Updated</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Workflow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
