'use client'

import { useQuery, gql } from '@apollo/client'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/utils'

const GET_TABLES_QUERY = gql`
  query GetTables {
    databaseTables {
      id
      name
      slug
      description
      icon
      createdAt
      createdBy {
        fullName
      }
      columns {
        id
        name
        type
      }
    }
  }
`

export default function DatabasePage() {
  const { data, loading, error } = useQuery(GET_TABLES_QUERY)

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Database Studio</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Database Studio</h1>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error loading tables</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const tables = data?.databaseTables || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Database Studio</h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage your data structures
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Table
        </Button>
      </div>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <Plus className="h-6 w-6" />
            </div>
            <CardTitle>No tables yet</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Get started by creating your first database table. Define your schema,
              add columns, and start storing data.
            </CardDescription>
            <div className="mt-6">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Table
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table: any) => (
            <Link key={table.id} href={`/database/${table.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {table.icon ? (
                      <div className="text-2xl">{table.icon}</div>
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500" />
                    )}
                    <div>
                      <CardTitle>{table.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {table.slug}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                {table.description && (
                  <CardDescription className="mt-2">
                    {table.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Columns:</span>
                    <span className="font-medium">{table.columns.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-xs">{formatDateTime(table.createdAt)}</span>
                  </div>
                  {table.createdBy && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">By:</span>
                      <span className="text-xs">{table.createdBy.fullName}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
