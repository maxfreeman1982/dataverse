'use client'

import { useState, useEffect } from 'react'
import { useMutation, gql } from '@apollo/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

const CREATE_RECORD = gql`
  mutation CreateRecord($tableId: String!, $data: JSONObject!) {
    createDatabaseRecord(tableId: $tableId, data: $data) {
      id
      data
      createdAt
    }
  }
`

const UPDATE_RECORD = gql`
  mutation UpdateRecord($id: String!, $data: JSONObject!) {
    updateDatabaseRecord(id: $id, data: $data) {
      id
      data
      updatedAt
    }
  }
`

interface Column {
  id: string
  name: string
  slug: string
  type: string
  isRequired: boolean
  defaultValue?: string
}

interface Table {
  id: string
  name: string
  columns: Column[]
}

interface Record {
  id: string
  data: Record<string, any>
}

interface RecordDialogProps {
  table: Table
  record?: Record | null
  open: boolean
  onClose: (shouldRefetch?: boolean) => void
}

export function RecordDialog({ table, record, open, onClose }: RecordDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Record<string, any>>({})

  const [createRecord, { loading: creating }] = useMutation(CREATE_RECORD, {
    onCompleted: () => {
      toast({
        title: 'Record created',
        description: 'The record has been created successfully',
      })
      onClose(true)
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
  })

  const [updateRecord, { loading: updating }] = useMutation(UPDATE_RECORD, {
    onCompleted: () => {
      toast({
        title: 'Record updated',
        description: 'The record has been updated successfully',
      })
      onClose(true)
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
  })

  useEffect(() => {
    if (record) {
      setFormData(record.data || {})
    } else {
      // Initialize with default values
      const defaults: Record<string, any> = {}
      table?.columns?.forEach((col) => {
        if (col.defaultValue) {
          defaults[col.slug] = col.defaultValue
        }
      })
      setFormData(defaults)
    }
  }, [record, table, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Convert values to proper types
    const processedData: Record<string, any> = {}
    table?.columns?.forEach((col) => {
      const value = formData[col.slug]
      if (value === '' || value === null || value === undefined) {
        return
      }

      switch (col.type) {
        case 'number':
          processedData[col.slug] = Number(value)
          break
        case 'boolean':
          processedData[col.slug] = value === 'true' || value === true
          break
        default:
          processedData[col.slug] = value
      }
    })

    if (record) {
      await updateRecord({
        variables: { id: record.id, data: processedData },
      })
    } else {
      await createRecord({
        variables: { tableId: table.id, data: processedData },
      })
    }
  }

  const handleChange = (slug: string, value: any) => {
    setFormData((prev) => ({ ...prev, [slug]: value }))
  }

  const renderInput = (column: Column) => {
    const value = formData[column.slug] || ''

    switch (column.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleChange(column.slug, e.target.value)}
            required={column.isRequired}
          />
        )
      case 'boolean':
        return (
          <select
            value={String(value)}
            onChange={(e) => handleChange(column.slug, e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required={column.isRequired}
          >
            <option value="">Select...</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        )
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleChange(column.slug, e.target.value)}
            required={column.isRequired}
          />
        )
      case 'datetime':
        return (
          <Input
            type="datetime-local"
            value={value}
            onChange={(e) => handleChange(column.slug, e.target.value)}
            required={column.isRequired}
          />
        )
      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleChange(column.slug, e.target.value)}
            required={column.isRequired}
          />
        )
      case 'url':
        return (
          <Input
            type="url"
            value={value}
            onChange={(e) => handleChange(column.slug, e.target.value)}
            required={column.isRequired}
            placeholder="https://..."
          />
        )
      case 'phone':
        return (
          <Input
            type="tel"
            value={value}
            onChange={(e) => handleChange(column.slug, e.target.value)}
            required={column.isRequired}
          />
        )
      case 'rich_text':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(column.slug, e.target.value)}
            required={column.isRequired}
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        )
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleChange(column.slug, e.target.value)}
            required={column.isRequired}
          />
        )
    }
  }

  const sortedColumns = [...(table?.columns || [])].sort((a, b) => a.order - b.order)

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {record ? 'Edit Record' : 'Add New Record'}
          </DialogTitle>
          <DialogDescription>
            {record
              ? 'Update the fields below to edit this record'
              : `Add a new record to ${table?.name}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {sortedColumns.map((column) => (
              <div key={column.id} className="space-y-2">
                <Label htmlFor={column.slug}>
                  {column.name}
                  {column.isRequired && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                {renderInput(column)}
                {column.type !== 'text' && (
                  <p className="text-xs text-muted-foreground">
                    Type: {column.type}
                  </p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={creating || updating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating
                ? 'Saving...'
                : record
                ? 'Update'
                : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
