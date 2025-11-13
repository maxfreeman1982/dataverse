'use client'

import { Edit, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateTime } from '@/lib/utils'

interface Column {
  id: string
  name: string
  slug: string
  type: string
  isRequired: boolean
  order: number
}

interface Table {
  id: string
  name: string
  columns: Column[]
}

interface Record {
  id: string
  data: Record<string, any>
  createdAt: string
  updatedAt: string
  createdBy?: {
    fullName: string
  }
}

interface DataTableProps {
  table: Table
  records: Record[]
  onEdit: (record: Record) => void
  onDelete: (recordId: string) => void
}

export function DataTable({ table, records, onEdit, onDelete }: DataTableProps) {
  const sortedColumns = [...(table?.columns || [])].sort((a, b) => a.order - b.order)

  if (!table || !records) {
    return null
  }

  if (records.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">No records yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Click "Add Record" to create your first entry
        </p>
      </div>
    )
  }

  const formatCellValue = (value: any, type: string) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Empty</span>
    }

    switch (type) {
      case 'boolean':
        return value ? '✓' : '✗'
      case 'date':
      case 'datetime':
        return formatDateTime(value)
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value
      case 'url':
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {value}
          </a>
        )
      case 'email':
        return (
          <a href={`mailto:${value}`} className="text-primary hover:underline">
            {value}
          </a>
        )
      default:
        return String(value)
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              {sortedColumns.map((column) => (
                <th
                  key={column.id}
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  {column.name}
                  {column.isRequired && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-semibold w-12">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {records.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-muted/30 transition-colors"
              >
                {sortedColumns.map((column) => (
                  <td key={column.id} className="px-4 py-3 text-sm">
                    {formatCellValue(record.data[column.slug], column.type)}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(record)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(record.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
