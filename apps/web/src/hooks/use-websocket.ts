import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'

export function useWebSocket(tableId?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map())

  useEffect(() => {
    // Create socket connection
    const socket = io(`${WEBSOCKET_URL}/ws`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('WebSocket connected')
      setIsConnected(true)

      // Join table room if tableId provided
      if (tableId) {
        socket.emit('join', `table:${tableId}`)
      }
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    })

    socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

    return () => {
      socket.disconnect()
    }
  }, [tableId])

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (!socketRef.current) return

    // Add listener to our map
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set())
    }
    listenersRef.current.get(event)?.add(callback)

    // Add socket listener
    socketRef.current.on(event, callback)

    // Return cleanup function
    return () => {
      socketRef.current?.off(event, callback)
      listenersRef.current.get(event)?.delete(callback)
    }
  }, [])

  const emit = useCallback((event: string, data: any) => {
    if (!socketRef.current || !isConnected) {
      console.warn('Socket not connected, cannot emit event:', event)
      return
    }
    socketRef.current.emit(event, data)
  }, [isConnected])

  return {
    isConnected,
    on,
    emit,
    socket: socketRef.current,
  }
}

export function useTableWebSocket(tableId: string) {
  const { isConnected, on, emit } = useWebSocket(tableId)
  const [recordEvents, setRecordEvents] = useState<{
    type: 'created' | 'updated' | 'deleted'
    data: any
  } | null>(null)

  useEffect(() => {
    if (!isConnected) return

    const cleanupCreated = on('record:created', (data) => {
      console.log('Record created:', data)
      setRecordEvents({ type: 'created', data })
    })

    const cleanupUpdated = on('record:updated', (data) => {
      console.log('Record updated:', data)
      setRecordEvents({ type: 'updated', data })
    })

    const cleanupDeleted = on('record:deleted', (data) => {
      console.log('Record deleted:', data)
      setRecordEvents({ type: 'deleted', data })
    })

    return () => {
      cleanupCreated?.()
      cleanupUpdated?.()
      cleanupDeleted?.()
    }
  }, [isConnected, on])

  return {
    isConnected,
    recordEvents,
    clearEvent: () => setRecordEvents(null),
  }
}
