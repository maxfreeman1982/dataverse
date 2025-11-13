'use client'

import { useMutation } from '@apollo/client'
import { UPDATE_COMPONENT } from '@/graphql/builder'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Package } from 'lucide-react'

interface PageComponent {
  id: string
  type: string
  properties: Record<string, any>
  style?: Record<string, any>
}

export function PropertyEditor({
  component,
  onUpdate,
}: {
  component: PageComponent | null
  onUpdate: (updates: Partial<PageComponent>) => void
}) {
  const { toast } = useToast()
  const [properties, setProperties] = useState<Record<string, any>>({})

  const [updateComponent] = useMutation(UPDATE_COMPONENT, {
    onCompleted: () => {
      toast({ title: 'Component updated' })
      onUpdate({})
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  useEffect(() => {
    if (component) {
      setProperties(component.properties)
    }
  }, [component])

  if (!component) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Select a component to edit its properties
        </p>
      </div>
    )
  }

  const handleSave = async () => {
    await updateComponent({
      variables: {
        id: component.id,
        input: {
          properties,
        },
      },
    })
  }

  const handlePropertyChange = (key: string, value: any) => {
    setProperties((prev) => ({ ...prev, [key]: value }))
  }

  const renderPropertyFields = () => {
    switch (component.type) {
      case 'text':
        return (
          <>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={properties.content || ''}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <Select
                value={properties.size || 'base'}
                onValueChange={(value) => handlePropertyChange('size', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xs">Extra Small</SelectItem>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case 'heading':
        return (
          <>
            <div className="space-y-2">
              <Label>Content</Label>
              <Input
                value={properties.content || ''}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select
                value={String(properties.level || 2)}
                onValueChange={(value) => handlePropertyChange('level', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1</SelectItem>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                  <SelectItem value="4">H4</SelectItem>
                  <SelectItem value="5">H5</SelectItem>
                  <SelectItem value="6">H6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case 'button':
        return (
          <>
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={properties.label || ''}
                onChange={(e) => handlePropertyChange('label', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Variant</Label>
              <Select
                value={properties.variant || 'default'}
                onValueChange={(value) => handlePropertyChange('variant', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="ghost">Ghost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Action URL (optional)</Label>
              <Input
                value={properties.url || ''}
                onChange={(e) => handlePropertyChange('url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </>
        )

      case 'input':
        return (
          <>
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={properties.label || ''}
                onChange={(e) => handlePropertyChange('label', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                value={properties.placeholder || ''}
                onChange={(e) => handlePropertyChange('placeholder', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={properties.type || 'text'}
                onValueChange={(value) => handlePropertyChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="tel">Phone</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case 'card':
        return (
          <>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={properties.title || ''}
                onChange={(e) => handlePropertyChange('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={properties.content || ''}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                rows={4}
              />
            </div>
          </>
        )

      case 'image':
        return (
          <>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={properties.src || ''}
                onChange={(e) => handlePropertyChange('src', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input
                value={properties.alt || ''}
                onChange={(e) => handlePropertyChange('alt', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Width</Label>
              <Input
                value={properties.width || '100%'}
                onChange={(e) => handlePropertyChange('width', e.target.value)}
                placeholder="100%, 400px, etc."
              />
            </div>
          </>
        )

      case 'container':
        return (
          <>
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={properties.direction || 'column'}
                onValueChange={(value) => handlePropertyChange('direction', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="column">Vertical</SelectItem>
                  <SelectItem value="row">Horizontal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Gap (px)</Label>
              <Input
                type="number"
                value={properties.gap || 4}
                onChange={(e) => handlePropertyChange('gap', parseInt(e.target.value))}
              />
            </div>
          </>
        )

      case 'divider':
        return (
          <>
            <div className="space-y-2">
              <Label>Thickness (px)</Label>
              <Input
                type="number"
                value={properties.thickness || 1}
                onChange={(e) => handlePropertyChange('thickness', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={properties.color || '#e5e7eb'}
                onChange={(e) => handlePropertyChange('color', e.target.value)}
              />
            </div>
          </>
        )

      case 'list':
        return (
          <div className="space-y-2">
            <Label>Items (one per line)</Label>
            <Textarea
              value={(properties.items || []).join('\n')}
              onChange={(e) =>
                handlePropertyChange('items', e.target.value.split('\n').filter(Boolean))
              }
              rows={6}
              placeholder="Item 1&#10;Item 2&#10;Item 3"
            />
          </div>
        )

      case 'form':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Form Title</Label>
              <Input
                value={properties.title || ''}
                onChange={(e) => handlePropertyChange('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fields (JSON)</Label>
              <Textarea
                value={JSON.stringify(properties.fields || [], null, 2)}
                onChange={(e) => {
                  try {
                    handlePropertyChange('fields', JSON.parse(e.target.value))
                  } catch {}
                }}
                rows={8}
                placeholder='[{"label": "Name", "type": "text"}]'
                className="font-mono text-xs"
              />
            </div>
          </div>
        )

      case 'table':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Table ID</Label>
              <Input
                value={properties.tableId || ''}
                onChange={(e) => handlePropertyChange('tableId', e.target.value)}
                placeholder="Enter table ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Columns (comma-separated)</Label>
              <Input
                value={(properties.columns || []).join(', ')}
                onChange={(e) =>
                  handlePropertyChange(
                    'columns',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="name, email, status"
              />
            </div>
          </div>
        )

      default:
        return (
          <p className="text-sm text-muted-foreground">
            No editable properties for this component type.
          </p>
        )
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <h3 className="font-medium capitalize">{component.type}</h3>
        <p className="text-xs text-muted-foreground">Component ID: {component.id.slice(0, 8)}...</p>
      </div>

      <div className="space-y-4">{renderPropertyFields()}</div>

      <Button onClick={handleSave} className="w-full">
        Save Changes
      </Button>
    </div>
  )
}
