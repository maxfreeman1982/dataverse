'use client'

import { useMutation } from '@apollo/client'
import { DELETE_COMPONENT, UPDATE_COMPONENT } from '@/graphql/builder'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Move } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageComponent {
  id: string
  pageId: string
  type: string
  properties: Record<string, any>
  style?: Record<string, any>
  order: number
  parentId?: string
}

export function BuilderCanvas({
  components,
  selectedComponent,
  onSelectComponent,
  onComponentsChange,
}: {
  components: PageComponent[]
  selectedComponent: PageComponent | null
  onSelectComponent: (component: PageComponent | null) => void
  onComponentsChange: () => void
}) {
  const { toast } = useToast()

  const [deleteComponent] = useMutation(DELETE_COMPONENT, {
    onCompleted: () => {
      toast({ title: 'Component deleted' })
      onSelectComponent(null)
      onComponentsChange()
    },
  })

  const handleDelete = async (id: string) => {
    await deleteComponent({ variables: { id } })
  }

  const sortedComponents = [...components].sort((a, b) => a.order - b.order)

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-sm border min-h-[800px]">
        <div className="p-8 space-y-4">
          {sortedComponents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Move className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Empty Canvas</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Start building your page by adding components from the left sidebar.
              </p>
            </div>
          ) : (
            sortedComponents.map((component) => (
              <ComponentRenderer
                key={component.id}
                component={component}
                isSelected={selectedComponent?.id === component.id}
                onSelect={() => onSelectComponent(component)}
                onDelete={() => handleDelete(component.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ComponentRenderer({
  component,
  isSelected,
  onSelect,
  onDelete,
}: {
  component: PageComponent
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const { type, properties, style } = component

  const containerClasses = `
    relative group rounded-lg transition-all
    ${isSelected ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/50'}
  `

  const renderContent = () => {
    switch (type) {
      case 'text':
        return (
          <p className={`text-${properties.size || 'base'}`} style={style}>
            {properties.content || 'Text'}
          </p>
        )
      case 'heading':
        const HeadingTag = `h${properties.level || 2}` as keyof JSX.IntrinsicElements
        return (
          <HeadingTag className="text-2xl font-bold" style={style}>
            {properties.content || 'Heading'}
          </HeadingTag>
        )
      case 'button':
        return (
          <button
            className={`px-4 py-2 rounded-md font-medium ${
              properties.variant === 'outline'
                ? 'border border-primary text-primary'
                : 'bg-primary text-primary-foreground'
            }`}
            style={style}
          >
            {properties.label || 'Button'}
          </button>
        )
      case 'input':
        return (
          <div className="space-y-2" style={style}>
            {properties.label && (
              <label className="text-sm font-medium">{properties.label}</label>
            )}
            <input
              type={properties.type || 'text'}
              placeholder={properties.placeholder}
              className="w-full px-3 py-2 border rounded-md"
              disabled
            />
          </div>
        )
      case 'form':
        return (
          <div className="border rounded-lg p-6 space-y-4" style={style}>
            <h3 className="text-lg font-semibold">{properties.title || 'Form'}</h3>
            <div className="space-y-3">
              {properties.fields?.map((field: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <label className="text-sm font-medium">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled
                  />
                </div>
              ))}
              {(!properties.fields || properties.fields.length === 0) && (
                <p className="text-sm text-muted-foreground">No fields added yet</p>
              )}
            </div>
          </div>
        )
      case 'table':
        return (
          <div className="border rounded-lg overflow-hidden" style={style}>
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  {properties.columns?.map((col: string, idx: number) => (
                    <th key={idx} className="px-4 py-2 text-left text-sm font-medium">
                      {col}
                    </th>
                  ))}
                  {(!properties.columns || properties.columns.length === 0) && (
                    <th className="px-4 py-2 text-sm text-muted-foreground">
                      Connect to a table
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 text-sm text-muted-foreground" colSpan={100}>
                    Data will appear here
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      case 'card':
        return (
          <div className="border rounded-lg p-6 space-y-2" style={style}>
            <h3 className="text-lg font-semibold">{properties.title || 'Card Title'}</h3>
            <p className="text-muted-foreground">{properties.content || 'Card content'}</p>
          </div>
        )
      case 'container':
        return (
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex ${
              properties.direction === 'row' ? 'flex-row' : 'flex-col'
            }`}
            style={{ gap: `${properties.gap || 4}px`, ...style }}
          >
            <p className="text-sm text-muted-foreground">
              Container - Drop components here
            </p>
          </div>
        )
      case 'image':
        return (
          <div className="border rounded-lg overflow-hidden" style={style}>
            {properties.src ? (
              <img
                src={properties.src}
                alt={properties.alt || 'Image'}
                className="w-full h-auto"
              />
            ) : (
              <div className="bg-muted h-48 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Add image URL</p>
              </div>
            )}
          </div>
        )
      case 'divider':
        return (
          <hr
            style={{
              borderWidth: `${properties.thickness || 1}px`,
              borderColor: properties.color || '#e5e7eb',
              ...style,
            }}
          />
        )
      case 'chart':
        return (
          <div className="border rounded-lg p-6 bg-muted/30 h-64 flex items-center justify-center" style={style}>
            <p className="text-sm text-muted-foreground">
              Chart: {properties.type || 'bar'}
            </p>
          </div>
        )
      case 'list':
        return (
          <ul className="space-y-2" style={style}>
            {properties.items?.map((item: string, idx: number) => (
              <li key={idx} className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )
      default:
        return <p className="text-muted-foreground">Unknown component: {type}</p>
    }
  }

  return (
    <div className={containerClasses} onClick={onSelect}>
      <div className="p-2">{renderContent()}</div>
      {isSelected && (
        <div className="absolute -top-3 right-2 flex space-x-1">
          <Button
            size="sm"
            variant="destructive"
            className="h-6 px-2"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
