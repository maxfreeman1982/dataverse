'use client'

import { useEffect, useState } from 'react'
import { useWebSocket } from './use-websocket'

interface BuilderEvent {
  type: 'page:created' | 'page:updated' | 'page:deleted' | 'component:created' | 'component:updated' | 'component:deleted' | 'components:reordered'
  data: any
}

export function useBuilderWebSocket() {
  const { isConnected, on } = useWebSocket()
  const [builderEvents, setBuilderEvents] = useState<BuilderEvent | null>(null)

  useEffect(() => {
    if (!isConnected) return

    const cleanupPageCreated = on('page:created', (data) => {
      setBuilderEvents({ type: 'page:created', data })
    })

    const cleanupPageUpdated = on('page:updated', (data) => {
      setBuilderEvents({ type: 'page:updated', data })
    })

    const cleanupPageDeleted = on('page:deleted', (data) => {
      setBuilderEvents({ type: 'page:deleted', data })
    })

    const cleanupComponentCreated = on('component:created', (data) => {
      setBuilderEvents({ type: 'component:created', data })
    })

    const cleanupComponentUpdated = on('component:updated', (data) => {
      setBuilderEvents({ type: 'component:updated', data })
    })

    const cleanupComponentDeleted = on('component:deleted', (data) => {
      setBuilderEvents({ type: 'component:deleted', data })
    })

    const cleanupComponentsReordered = on('components:reordered', (data) => {
      setBuilderEvents({ type: 'components:reordered', data })
    })

    return () => {
      cleanupPageCreated?.()
      cleanupPageUpdated?.()
      cleanupPageDeleted?.()
      cleanupComponentCreated?.()
      cleanupComponentUpdated?.()
      cleanupComponentDeleted?.()
      cleanupComponentsReordered?.()
    }
  }, [isConnected, on])

  const clearEvent = () => setBuilderEvents(null)

  return {
    isConnected,
    builderEvents,
    clearEvent,
  }
}
