'use client'

import { useQuery } from '@apollo/client'
import { GET_PAGE_BY_SLUG } from '@/graphql/builder'
import { useParams } from 'next/navigation'
import { Globe } from 'lucide-react'

interface PageComponent {
  id: string
  type: string
  properties: Record<string, any>
  style?: Record<string, any>
  order: number
}

interface Page {
  id: string
  name: string
  description?: string
  slug: string
  status: string
  icon?: string
  components: PageComponent[]
}

export default function PublicPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data, loading, error } = useQuery(GET_PAGE_BY_SLUG, {
    variables: { slug },
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !data?.pageBySlug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Globe className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or hasn't been published yet.
        </p>
      </div>
    )
  }

  const page: Page = data.pageBySlug
  const sortedComponents = [...page.components].sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            {page.icon && <span className="text-4xl">{page.icon}</span>}
            <div>
              <h1 className="text-3xl font-bold">{page.name}</h1>
              {page.description && (
                <p className="text-muted-foreground mt-1">{page.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {sortedComponents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">This page is empty.</p>
            </div>
          ) : (
            sortedComponents.map((component) => (
              <PublicComponentRenderer key={component.id} component={component} />
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Built with DataVerse OS</p>
        </div>
      </footer>
    </div>
  )
}

function PublicComponentRenderer({ component }: { component: PageComponent }) {
  const { type, properties, style } = component

  switch (type) {
    case 'text':
      return (
        <p className={`text-${properties.size || 'base'}`} style={style}>
          {properties.content || ''}
        </p>
      )

    case 'heading':
      const HeadingTag = `h${properties.level || 2}` as keyof JSX.IntrinsicElements
      const headingSizes: Record<number, string> = {
        1: 'text-4xl',
        2: 'text-3xl',
        3: 'text-2xl',
        4: 'text-xl',
        5: 'text-lg',
        6: 'text-base',
      }
      return (
        <HeadingTag
          className={`${headingSizes[properties.level || 2]} font-bold`}
          style={style}
        >
          {properties.content || ''}
        </HeadingTag>
      )

    case 'button':
      const ButtonComponent = properties.url ? 'a' : 'button'
      return (
        <ButtonComponent
          href={properties.url}
          target={properties.url ? '_blank' : undefined}
          rel={properties.url ? 'noopener noreferrer' : undefined}
          className={`inline-flex px-6 py-3 rounded-lg font-medium transition-colors ${
            properties.variant === 'outline'
              ? 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
              : properties.variant === 'ghost'
              ? 'text-primary hover:bg-primary/10'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
          style={style}
        >
          {properties.label || 'Button'}
        </ButtonComponent>
      )

    case 'input':
      return (
        <div className="space-y-2" style={style}>
          {properties.label && (
            <label className="text-sm font-medium block">{properties.label}</label>
          )}
          <input
            type={properties.type || 'text'}
            placeholder={properties.placeholder}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )

    case 'form':
      return (
        <form className="border rounded-lg p-8 space-y-6 bg-card" style={style}>
          {properties.title && (
            <h3 className="text-2xl font-bold">{properties.title}</h3>
          )}
          <div className="space-y-4">
            {properties.fields?.map((field: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <label className="text-sm font-medium block">{field.label}</label>
                <input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Submit
          </button>
        </form>
      )

    case 'table':
      return (
        <div className="border rounded-lg overflow-hidden" style={style}>
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                {properties.columns?.map((col: string, idx: number) => (
                  <th key={idx} className="px-6 py-3 text-left text-sm font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  className="px-6 py-4 text-sm text-muted-foreground text-center"
                  colSpan={100}
                >
                  No data available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )

    case 'card':
      return (
        <div className="border rounded-lg p-8 bg-card space-y-3" style={style}>
          {properties.title && (
            <h3 className="text-2xl font-bold">{properties.title}</h3>
          )}
          {properties.content && (
            <p className="text-muted-foreground leading-relaxed">{properties.content}</p>
          )}
        </div>
      )

    case 'container':
      return (
        <div
          className={`flex ${
            properties.direction === 'row' ? 'flex-row' : 'flex-col'
          }`}
          style={{ gap: `${properties.gap || 16}px`, ...style }}
        >
          {/* Container children would be nested components */}
        </div>
      )

    case 'image':
      if (!properties.src) return null
      return (
        <div style={style}>
          <img
            src={properties.src}
            alt={properties.alt || 'Image'}
            style={{ width: properties.width || '100%' }}
            className="rounded-lg"
          />
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
        <div
          className="border rounded-lg p-8 bg-muted/30 h-96 flex items-center justify-center"
          style={style}
        >
          <p className="text-muted-foreground">Chart: {properties.type || 'bar'}</p>
        </div>
      )

    case 'list':
      return (
        <ul className="space-y-3" style={style}>
          {properties.items?.map((item: string, idx: number) => (
            <li key={idx} className="flex items-start space-x-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      )

    default:
      return null
  }
}
