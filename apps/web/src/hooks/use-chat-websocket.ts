'use client'

import { useEffect, useState } from 'react'
import { useWebSocket } from './use-websocket'

interface ChatEvent {
  type:
    | 'channel:created'
    | 'channel:updated'
    | 'channel:deleted'
    | 'channel:member:added'
    | 'channel:member:removed'
    | 'message:created'
    | 'message:updated'
    | 'message:deleted'
    | 'message:reaction'
    | 'message:reaction:removed'
    | 'user:typing'
  data: any
}

export function useChatWebSocket(channelId?: string) {
  const { isConnected, on } = useWebSocket()
  const [chatEvents, setChatEvents] = useState<ChatEvent | null>(null)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isConnected) return

    const cleanupChannelCreated = on('channel:created', (data) => {
      setChatEvents({ type: 'channel:created', data })
    })

    const cleanupChannelUpdated = on('channel:updated', (data) => {
      setChatEvents({ type: 'channel:updated', data })
    })

    const cleanupChannelDeleted = on('channel:deleted', (data) => {
      setChatEvents({ type: 'channel:deleted', data })
    })

    const cleanupMemberAdded = on('channel:member:added', (data) => {
      setChatEvents({ type: 'channel:member:added', data })
    })

    const cleanupMemberRemoved = on('channel:member:removed', (data) => {
      setChatEvents({ type: 'channel:member:removed', data })
    })

    const cleanupMessageCreated = on('message:created', (data) => {
      if (!channelId || data.channelId === channelId) {
        setChatEvents({ type: 'message:created', data })
      }
    })

    const cleanupMessageUpdated = on('message:updated', (data) => {
      if (!channelId || data.channelId === channelId) {
        setChatEvents({ type: 'message:updated', data })
      }
    })

    const cleanupMessageDeleted = on('message:deleted', (data) => {
      if (!channelId || data.channelId === channelId) {
        setChatEvents({ type: 'message:deleted', data })
      }
    })

    const cleanupReaction = on('message:reaction', (data) => {
      if (!channelId || data.channelId === channelId) {
        setChatEvents({ type: 'message:reaction', data })
      }
    })

    const cleanupReactionRemoved = on('message:reaction:removed', (data) => {
      if (!channelId || data.channelId === channelId) {
        setChatEvents({ type: 'message:reaction:removed', data })
      }
    })

    const cleanupTyping = on('user:typing', (data) => {
      if (channelId && data.channelId === channelId) {
        setTypingUsers((prev) => new Set(prev).add(data.userId))

        // Remove typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Set(prev)
            next.delete(data.userId)
            return next
          })
        }, 3000)
      }
    })

    return () => {
      cleanupChannelCreated?.()
      cleanupChannelUpdated?.()
      cleanupChannelDeleted?.()
      cleanupMemberAdded?.()
      cleanupMemberRemoved?.()
      cleanupMessageCreated?.()
      cleanupMessageUpdated?.()
      cleanupMessageDeleted?.()
      cleanupReaction?.()
      cleanupReactionRemoved?.()
      cleanupTyping?.()
    }
  }, [isConnected, on, channelId])

  const clearEvent = () => setChatEvents(null)

  return {
    isConnected,
    chatEvents,
    typingUsers: Array.from(typingUsers),
    clearEvent,
  }
}
