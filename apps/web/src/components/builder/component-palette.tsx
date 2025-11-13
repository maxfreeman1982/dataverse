'use client'

import { useMutation } from '@apollo/client'
import { CREATE_COMPONENT } from '@/graphql/builder'
import { useToast } from '@/hooks/use-toast'
import {
  Type,
  Heading,
  MousePointer,
  TextCursor,
  RectangleHorizontal,
  Table,
  Box,
  Image as ImageIcon,
  Minus,
  BarChart3,
  List,
} from 'lucide-react'

const COMPONENT_TYPES = [
  { type: 'text', icon: Type, label: 'Text', description: 'Paragraph text' },
  { type: 'heading', icon: Heading, label: 'Heading', description: 'Title or heading' },
  { type: 'button', icon: MousePointer, label: 'Button', description: 'Clickable button' },
  { type: 'input', icon: TextCursor, label: 'Input', description: 'Text input field' },
  { type: 'form', icon: RectangleHorizontal, label: 'Form', description: 'Form container' },
  { type: 'table', icon: Table, label: 'Table', description: 'Data table' },
  { type: 'card', icon: Box, label: 'Card', description: 'Card container' },
  { type: 'container', icon: Box, label: 'Container', description: 'Flex container' },
  { type: 'image', icon: ImageIcon, label: 'Image', description: 'Image component' },
  { type: 'divider', icon: Minus, label: 'Divider', description: 'Horizontal line' },
  { type: 'chart', icon: BarChart3, label: 'Chart', description: 'Data visualization' },
  { type: 'list', icon: List, label: 'List', description: 'List of items' },
]

const DEFAULT_PROPERTIES: Record<string, any> = {
  text: { content: 'Click to edit text', size: 'base' },
  heading: { content: 'Heading', level: 2 },
  button: { label: 'Button', variant: 'default', size: 'default' },
  input: { placeholder: 'Enter text...', type: 'text', label: 'Input' },
  form: { title: 'Form', fields: [] },
  table: { tableId: '', columns: [] },
  card: { title: 'Card Title', content: 'Card content' },
  container: { direction: 'column', gap: 4 },
  image: { src: '', alt: 'Image', width: '100%' },
  divider: { thickness: 1, color: '#e5e7eb' },
  chart: { type: 'bar', data: [] },
  list: { items: ['Item 1', 'Item 2', 'Item 3'] },
}

export function ComponentPalette({
  pageId,
  onComponentAdded,
}: {
  pageId: string
  onComponentAdded: () => void
}) {
  const { toast } = useToast()

  const [createComponent] = useMutation(CREATE_COMPONENT, {
    onCompleted: () => {
      toast({ title: 'Component added', description: 'Component added to canvas.' })
      onComponentAdded()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  const handleAddComponent = async (type: string) => {
    await createComponent({
      variables: {
        input: {
          pageId,
          type,
          properties: DEFAULT_PROPERTIES[type] || {},
          style: {},
          order: 9999, // Add to end
        },
      },
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-4">
        Click to add components to your page
      </p>
      {COMPONENT_TYPES.map(({ type, icon: Icon, label, description }) => (
        <button
          key={type}
          onClick={() => handleAddComponent(type)}
          className="w-full flex items-start space-x-3 p-3 rounded-lg border bg-background hover:bg-accent hover:border-primary transition-all text-left"
        >
          <div className="p-2 rounded-md bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
