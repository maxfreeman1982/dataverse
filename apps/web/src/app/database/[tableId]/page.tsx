'use client'

import { useQuery, useMutation, gql } from '@apollo/client'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Trash2, Edit, ArrowLeft, Search, Filter, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/database/data-table'
import { RecordDialog } from '@/components/database/record-dialog'
import { useToast } from '@/hooks/use-toast'
import { useTableWebSocket } from '@/hooks/use-websocket'
import { useState, useEffect } from 'react'

const GET_TABLE_WITH_RECORDS = gql`
  query GetTableWithRecords($tableId: String!, $page: Int, $limit: Int, $search: String) {
    databaseTable(id: $tableId) {
      id
      name
      slug
      description
      icon
      columns {
        id
        name
        slug
        type
        isRequired
        isUnique
        order
      }
    }
    databaseRecords(tableId: $tableId, filters: { page: $page, limit: $limit, search: $search }) {
      records {
        id
        data
        createdAt
        updatedAt
        createdBy {
          fullName
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`

const DELETE_RECORD = gql`
  mutation DeleteRecord($id: String!) {
    deleteDatabaseRecord(id: $id)
  }
`

export default function TableDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const tableId = params.tableId as string

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data, loading, error, refetch } = useQuery(GET_TABLE_WITH_RECORDS, {
    variables: { tableId, page, limit: 50, search: search || undefined },
  })

  // WebSocket real-time updates
  const { isConnected, recordEvents, clearEvent } = useTableWebSocket(tableId)

  // Refetch data when WebSocket event received
  useEffect(() => {
    if (recordEvents) {
      refetch()
      clearEvent()

      // Show toast notification
      const eventType = recordEvents.type
      if (eventType === 'created') {
        toast({
          title: 'New record added',
          description: 'A new record was added by another user',
        })
      } else if (eventType === 'updated') {
        toast({
          title: 'Record updated',
          description: 'A record was updated by another user',
        })
      } else if (eventType === 'deleted') {
        toast({
          title: 'Record deleted',
          description: 'A record was deleted by another user',
        })
      }
    }
  }, [recordEvents, refetch, clearEvent, toast])

  const [deleteRecord] = useMutation(DELETE_RECORD, {
    onCompleted: () => {
      toast({
        title: 'Record deleted',
        description: 'The record has been deleted successfully',
      })
      refetch()
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
  })

  if (loading && !data) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-10 w-64 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <Card className="h-96 animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Card className="border-destructive p-6">
          <h2 className="text-lg font-semibold text-destructive">Error loading table</h2>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </Card>
      </div>
    )
  }

  const table = data?.databaseTable
  const recordsData = data?.databaseRecords
  const records = recordsData?.records || []

  const handleCreateRecord = () => {
    setSelectedRecord(null)
    setIsDialogOpen(true)
  }

  const handleEditRecord = (record: any) => {
    setSelectedRecord(record)
    setIsDialogOpen(true)
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      await deleteRecord({ variables: { id: recordId } })
    }
  }

  const handleDialogClose = (shouldRefetch?: boolean) => {
    setIsDialogOpen(false)
    setSelectedRecord(null)
    if (shouldRefetch) {
      refetch()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/database')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              {table?.icon && <span className="text-3xl">{table.icon}</span>}
              <h1 className="text-4xl font-bold">{table?.name}</h1>
            </div>
            {table?.description && (
              <p className="text-muted-foreground mt-1">{table.description}</p>
            )}
          </div>
        </div>
        <Button onClick={handleCreateRecord}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      {/* Stats & Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {recordsData?.total || 0} records • {table?.columns?.length || 0} columns
          </div>
          <div className={`flex items-center space-x-1 text-xs ${isConnected ? 'text-green-600' : 'text-muted-foreground'}`}>
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        table={table}
        records={records}
        onEdit={handleEditRecord}
        onDelete={handleDeleteRecord}
      />

      {/* Pagination */}
      {recordsData && recordsData.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {page} of {recordsData.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page === recordsData.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Record Dialog */}
      <RecordDialog
        table={table}
        record={selectedRecord}
        open={isDialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  )
}
