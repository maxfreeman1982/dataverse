'use client'

import { useQuery, useMutation } from '@apollo/client'
import { GET_CHANNELS, GET_MESSAGES, CREATE_CHANNEL, CREATE_MESSAGE, EMIT_TYPING } from '@/graphql/chat'
import { CREATE_VIDEO_CALL } from '@/graphql/video'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useChatWebSocket } from '@/hooks/use-chat-websocket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Hash,
  Lock,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Users,
  MessageSquare,
  Video,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Channel {
  id: string
  name: string
  description?: string
  type: 'public' | 'private' | 'direct'
  icon?: string
  lastMessageAt?: string
  members?: Array<{ id: string; firstName: string; lastName: string }>
}

interface Message {
  id: string
  content: string
  createdAt: string
  isEdited: boolean
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  replyTo?: {
    id: string
    content: string
    user: {
      firstName: string
      lastName: string
    }
  }
  reactions?: Record<string, string[]>
}

export default function ChatPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public' as const,
    icon: '💬',
  })

  const { data: channelsData, loading: channelsLoading, refetch: refetchChannels } = useQuery(GET_CHANNELS)
  const { data: messagesData, loading: messagesLoading, refetch: refetchMessages } = useQuery(GET_MESSAGES, {
    variables: { channelId: selectedChannel?.id, limit: 100 },
    skip: !selectedChannel,
  })

  const { chatEvents, typingUsers, clearEvent } = useChatWebSocket(selectedChannel?.id)

  const [createChannel] = useMutation(CREATE_CHANNEL, {
    onCompleted: (data) => {
      toast({ title: 'Channel created', description: 'Your channel has been created.' })
      setCreateDialogOpen(false)
      setFormData({ name: '', description: '', type: 'public', icon: '💬' })
      refetchChannels()
      setSelectedChannel(data.createChannel)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  const [createVideoCall] = useMutation(CREATE_VIDEO_CALL, {
    onCompleted: (data) => {
      router.push(`/dashboard/video/${data.createVideoCall.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const [sendMessage] = useMutation(CREATE_MESSAGE, {
    onCompleted: () => {
      setMessageInput('')
      refetchMessages()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  const [emitTyping] = useMutation(EMIT_TYPING)

  useEffect(() => {
    if (chatEvents) {
      if (chatEvents.type === 'message:created') {
        refetchMessages()
        scrollToBottom()
      } else if (chatEvents.type === 'channel:created' || chatEvents.type === 'channel:updated') {
        refetchChannels()
      }
      clearEvent()
    }
  }, [chatEvents, refetchMessages, refetchChannels, clearEvent])

  useEffect(() => {
    if (channelsData?.channels && !selectedChannel && channelsData.channels.length > 0) {
      setSelectedChannel(channelsData.channels[0])
    }
  }, [channelsData, selectedChannel])

  useEffect(() => {
    scrollToBottom()
  }, [messagesData])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCreateChannel = async () => {
    if (!formData.name) {
      toast({ title: 'Validation error', description: 'Name is required.', variant: 'destructive' })
      return
    }

    await createChannel({
      variables: {
        input: {
          name: formData.name,
          description: formData.description || null,
          type: formData.type.toUpperCase(),
          icon: formData.icon,
        },
      },
    })
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel) return

    await sendMessage({
      variables: {
        input: {
          channelId: selectedChannel.id,
          content: messageInput.trim(),
        },
      },
    })
  }

  const handleTyping = () => {
    if (!selectedChannel) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    emitTyping({ variables: { channelId: selectedChannel.id } })

    typingTimeoutRef.current = setTimeout(() => {
      // Typing stopped
    }, 3000)
  }

  const handleStartCall = async () => {
    if (!selectedChannel) return

    await createVideoCall({
      variables: {
        input: {
          name: `${selectedChannel.name} Call`,
          channelId: selectedChannel.id,
        },
      },
    })
  }

  const channels: Channel[] = channelsData?.channels || []
  const messages: Message[] = messagesData?.messages || []

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Channels Sidebar */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Channels</h2>
            <Button size="icon" variant="ghost" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {channelsLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : channels.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No channels yet. Create one to start chatting!
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedChannel?.id === channel.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="text-lg">{channel.icon || (channel.type === 'private' ? '🔒' : '#')}</span>
                  <span className="flex-1 text-left truncate font-medium">{channel.name}</span>
                  {channel.members && channel.members.length > 0 && (
                    <span className="text-xs opacity-70">{channel.members.length}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="h-16 border-b px-6 flex items-center justify-between bg-background">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedChannel.icon || '#'}</span>
                <div>
                  <h1 className="font-semibold">{selectedChannel.name}</h1>
                  {selectedChannel.description && (
                    <p className="text-xs text-muted-foreground">{selectedChannel.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStartCall}
                  title="Start video call"
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message, idx) => {
                    const showAvatar =
                      idx === 0 || messages[idx - 1].user.id !== message.user.id
                    return (
                      <MessageItem
                        key={message.id}
                        message={message}
                        showAvatar={showAvatar}
                      />
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Someone is typing...</span>
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4 bg-background">
              <div className="flex items-end space-x-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Textarea
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value)
                      handleTyping()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder={`Message #${selectedChannel.name}`}
                    className="min-h-[60px] resize-none"
                  />
                </div>
                <Button variant="ghost" size="icon">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Channel Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
            <DialogDescription>
              Create a new channel for your team to collaborate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="general"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this channel about?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateChannel}>Create Channel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MessageItem({
  message,
  showAvatar,
}: {
  message: Message
  showAvatar: boolean
}) {
  const initials = `${message.user.firstName?.[0] || ''}${message.user.lastName?.[0] || ''}`.toUpperCase()

  return (
    <div className="flex items-start space-x-3">
      {showAvatar ? (
        <Avatar className="h-10 w-10">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-10" />
      )}
      <div className="flex-1">
        {showAvatar && (
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="font-semibold text-sm">
              {message.user.firstName} {message.user.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
        <div className="text-sm leading-relaxed">{message.content}</div>
        {message.isEdited && (
          <span className="text-xs text-muted-foreground ml-1">(edited)</span>
        )}
      </div>
    </div>
  )
}
