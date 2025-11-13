'use client'

import { useQuery, useMutation } from '@apollo/client'
import { GET_PAGE, UPDATE_PAGE, PUBLISH_PAGE, UNPUBLISH_PAGE } from '@/graphql/builder'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useBuilderWebSocket } from '@/hooks/use-builder-websocket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Save,
  Eye,
  Globe,
  ArrowLeft,
  Settings,
  Layers,
  Plus,
  GripVertical,
} from 'lucide-react'
import Link from 'next/link'
import { BuilderCanvas } from '@/components/builder/builder-canvas'
import { ComponentPalette } from '@/components/builder/component-palette'
import { PropertyEditor } from '@/components/builder/property-editor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Page {
  id: string
  name: string
  description?: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  icon?: string
  components: PageComponent[]
}

interface PageComponent {
  id: string
  pageId: string
  type: string
  properties: Record<string, any>
  style?: Record<string, any>
  order: number
  parentId?: string
}

export default function BuilderEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const pageId = params.pageId as string

  const [selectedComponent, setSelectedComponent] = useState<PageComponent | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { data, loading, refetch } = useQuery(GET_PAGE, {
    variables: { id: pageId },
    skip: !pageId,
  })

  const { builderEvents, clearEvent } = useBuilderWebSocket()

  useEffect(() => {
    if (builderEvents && pageId) {
      const { type, data } = builderEvents
      if (
        type === 'component:created' ||
        type === 'component:updated' ||
        type === 'component:deleted' ||
        type === 'components:reordered'
      ) {
        if (data.pageId === pageId) {
          refetch()
          toast({
            title: 'Component updated',
            description: 'A component was modified by another user.',
          })
        }
      } else if (type === 'page:updated' && data.page?.id === pageId) {
        refetch()
        toast({
          title: 'Page updated',
          description: 'Page settings were updated.',
        })
      }
      clearEvent()
    }
  }, [builderEvents, pageId, refetch, clearEvent, toast])

  const [updatePage] = useMutation(UPDATE_PAGE, {
    onCompleted: () => {
      toast({ title: 'Page saved', description: 'Changes saved successfully.' })
      setIsSaving(false)
      refetch()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      setIsSaving(false)
    },
  })

  const [publishPage] = useMutation(PUBLISH_PAGE, {
    onCompleted: () => {
      toast({ title: 'Page published', description: 'Your page is now live!' })
      refetch()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  const [unpublishPage] = useMutation(UNPUBLISH_PAGE, {
    onCompleted: () => {
      toast({ title: 'Page unpublished', description: 'Your page is now a draft.' })
      refetch()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  const page: Page | null = data?.page || null
  const isPublished = page?.status === 'published'

  const handlePublishToggle = async () => {
    if (isPublished) {
      await unpublishPage({ variables: { id: pageId } })
    } else {
      await publishPage({ variables: { id: pageId } })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    // In a real implementation, this would save component changes
    await updatePage({
      variables: {
        id: pageId,
        input: {
          name: page?.name,
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-muted-foreground mb-4">Page not found</p>
        <Button asChild>
          <Link href="/dashboard/builder">Back to Builder</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top Toolbar */}
      <div className="border-b bg-background px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/builder">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{page.icon || '📄'}</span>
            <div>
              <h1 className="text-lg font-semibold">{page.name}</h1>
              <p className="text-xs text-muted-foreground">/p/{page.slug}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/p/${page.slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button size="sm" onClick={handlePublishToggle}>
            <Globe className="h-4 w-4 mr-2" />
            {isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Components & Layers */}
        <div className="w-64 border-r bg-muted/30 overflow-y-auto">
          <Tabs defaultValue="components" className="h-full">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="components" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Components
              </TabsTrigger>
              <TabsTrigger value="layers" className="flex-1">
                <Layers className="h-4 w-4 mr-2" />
                Layers
              </TabsTrigger>
            </TabsList>
            <TabsContent value="components" className="mt-0 p-4">
              <ComponentPalette pageId={pageId} onComponentAdded={refetch} />
            </TabsContent>
            <TabsContent value="layers" className="mt-0 p-4">
              <LayersPanel
                components={page.components}
                selectedId={selectedComponent?.id}
                onSelect={setSelectedComponent}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-auto bg-muted/20">
          <BuilderCanvas
            components={page.components}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            onComponentsChange={refetch}
          />
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l bg-background overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <h2 className="font-semibold">Properties</h2>
            </div>
          </div>
          <PropertyEditor
            component={selectedComponent}
            onUpdate={(updates) => {
              // Handle component updates
              refetch()
            }}
          />
        </div>
      </div>
    </div>
  )
}

function LayersPanel({
  components,
  selectedId,
  onSelect,
}: {
  components: PageComponent[]
  selectedId?: string
  onSelect: (component: PageComponent) => void
}) {
  if (components.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        No components yet. Add components from the palette.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {components
        .sort((a, b) => a.order - b.order)
        .map((component) => (
          <button
            key={component.id}
            onClick={() => onSelect(component)}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedId === component.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <GripVertical className="h-4 w-4 opacity-50" />
            <span className="flex-1 text-left capitalize">{component.type}</span>
          </button>
        ))}
    </div>
  )
}
