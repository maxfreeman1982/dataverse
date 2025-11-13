'use client'

import { useQuery, useMutation } from '@apollo/client'
import { GET_PAGES, CREATE_PAGE, DELETE_PAGE } from '@/graphql/builder'
import { useState, useEffect } from 'react'
import { Plus, Layout, Trash2, ExternalLink, Edit2, Globe, FileText } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useBuilderWebSocket } from '@/hooks/use-builder-websocket'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Page {
  id: string
  name: string
  description?: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  icon?: string
  coverImage?: string
  createdAt: string
  updatedAt: string
  components: Array<{ id: string; type: string }>
}

export default function BuilderPage() {
  const { toast } = useToast()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    icon: '📄',
  })

  const { data, loading, refetch } = useQuery(GET_PAGES)
  const { builderEvents, clearEvent } = useBuilderWebSocket()

  useEffect(() => {
    if (builderEvents) {
      if (['page:created', 'page:updated', 'page:deleted'].includes(builderEvents.type)) {
        refetch()
        toast({
          title: 'Page updated',
          description: 'A page was modified by another user.',
        })
      }
      clearEvent()
    }
  }, [builderEvents, refetch, clearEvent, toast])

  const [createPage, { loading: creating }] = useMutation(CREATE_PAGE, {
    onCompleted: () => {
      toast({
        title: 'Page created',
        description: 'Your new page has been created successfully.',
      })
      setCreateDialogOpen(false)
      setFormData({ name: '', description: '', slug: '', icon: '📄' })
      refetch()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const [deletePage] = useMutation(DELETE_PAGE, {
    onCompleted: () => {
      toast({
        title: 'Page deleted',
        description: 'The page has been deleted successfully.',
      })
      setDeleteDialogOpen(false)
      setPageToDelete(null)
      refetch()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleCreate = async () => {
    if (!formData.name || !formData.slug) {
      toast({
        title: 'Validation error',
        description: 'Name and slug are required.',
        variant: 'destructive',
      })
      return
    }

    await createPage({
      variables: {
        input: {
          name: formData.name,
          description: formData.description || null,
          slug: formData.slug,
          icon: formData.icon,
        },
      },
    })
  }

  const handleDelete = async () => {
    if (!pageToDelete) return
    await deletePage({ variables: { id: pageToDelete } })
  }

  const handleSlugChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setFormData((prev) => ({ ...prev, slug }))
  }

  const pages: Page[] = data?.pages || []
  const draftPages = pages.filter((p) => p.status === 'draft')
  const publishedPages = pages.filter((p) => p.status === 'published')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">No-Code Builder</h1>
          <p className="text-muted-foreground mt-2">
            Create beautiful applications without writing code
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>

      {/* Published Pages */}
      {publishedPages.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Published</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedPages.map((page) => (
              <PageCard
                key={page.id}
                page={page}
                onDelete={(id) => {
                  setPageToDelete(id)
                  setDeleteDialogOpen(true)
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Draft Pages */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Drafts</h2>
        </div>
        {draftPages.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Layout className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No pages yet. Create your first page to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draftPages.map((page) => (
              <PageCard
                key={page.id}
                page={page}
                onDelete={(id) => {
                  setPageToDelete(id)
                  setDeleteDialogOpen(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>
              Create a new page for your application. You can add components and publish it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                placeholder="📄"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="My Awesome Page"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (!formData.slug) {
                    handleSlugChange(e.target.value)
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                placeholder="my-awesome-page"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                URL: /p/{formData.slug || 'your-slug'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your page..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating...' : 'Create Page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the page and all its components.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function PageCard({ page, onDelete }: { page: Page; onDelete: (id: string) => void }) {
  const isPublished = page.status === 'published'

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{page.icon || '📄'}</div>
            <div>
              <CardTitle className="text-lg">{page.name}</CardTitle>
              {isPublished && (
                <div className="flex items-center space-x-1 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">Published</span>
                </div>
              )}
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            {isPublished && (
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/p/${page.slug}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/dashboard/builder/${page.id}`}>
                <Edit2 className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(page.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {page.description && (
        <CardContent>
          <CardDescription className="line-clamp-2">{page.description}</CardDescription>
        </CardContent>
      )}
      <CardFooter className="text-xs text-muted-foreground">
        {page.components.length} component{page.components.length !== 1 ? 's' : ''} •{' '}
        Updated {new Date(page.updatedAt).toLocaleDateString()}
      </CardFooter>
    </Card>
  )
}
