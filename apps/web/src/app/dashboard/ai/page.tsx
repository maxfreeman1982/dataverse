'use client'

import { useQuery, useMutation } from '@apollo/client'
import {
  GET_AI_CONVERSATIONS,
  GET_AI_MESSAGES,
  CREATE_AI_CONVERSATION,
  DELETE_AI_CONVERSATION,
  SEND_AI_MESSAGE,
  GET_AI_ANALYTICS,
  REINDEX_WORKSPACE,
  TOGGLE_PIN_CONVERSATION,
} from '@/graphql/enhanced-ai'
import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Send,
  Trash2,
  Pin,
  Bot,
  Sparkles,
  BarChart3,
  RefreshCw,
  Brain,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  isPinned: boolean
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
  retrievedDocs?: string[]
  tokenCount?: number
}

export default function AIPage() {
  const { toast } = useToast()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: conversationsData, refetch: refetchConversations } = useQuery(GET_AI_CONVERSATIONS)
  const { data: messagesData, refetch: refetchMessages } = useQuery(GET_AI_MESSAGES, {
    variables: { conversationId: selectedConversation?.id },
    skip: !selectedConversation,
  })
  const { data: analyticsData } = useQuery(GET_AI_ANALYTICS)

  const [createConversation] = useMutation(CREATE_AI_CONVERSATION, {
    onCompleted: (data) => {
      toast({ title: 'Conversation created' })
      setCreateDialogOpen(false)
      setNewTitle('')
      refetchConversations()
      setSelectedConversation(data.createAIConversation)
    },
  })

  const [deleteConversation] = useMutation(DELETE_AI_CONVERSATION, {
    onCompleted: () => {
      toast({ title: 'Conversation deleted' })
      refetchConversations()
      setSelectedConversation(null)
    },
  })

  const [togglePin] = useMutation(TOGGLE_PIN_CONVERSATION, {
    onCompleted: () => {
      refetchConversations()
    },
  })

  const [sendMessage, { loading: sending }] = useMutation(SEND_AI_MESSAGE, {
    onCompleted: () => {
      setMessageInput('')
      refetchMessages()
    },
  })

  const [reindex, { loading: reindexing }] = useMutation(REINDEX_WORKSPACE, {
    onCompleted: (data) => {
      toast({
        title: 'Workspace reindexed',
        description: `Indexed ${data.reindexWorkspace.total} documents`,
      })
    },
  })

  useEffect(() => {
    scrollToBottom()
  }, [messagesData])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCreateConversation = async () => {
    if (!newTitle.trim()) return
    await createConversation({ variables: { input: { title: newTitle.trim() } } })
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return

    await sendMessage({
      variables: {
        input: {
          conversationId: selectedConversation.id,
          message: messageInput.trim(),
          useRAG: true,
        },
      },
    })
  }

  const conversations: Conversation[] = conversationsData?.aiConversations || []
  const messages: Message[] = messagesData?.aiMessages || []
  const analytics = analyticsData?.aiAnalytics

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              AI Hub
            </h2>
            <div className="flex space-x-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowAnalytics(!showAnalytics)}
                title="Analytics"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showAnalytics && analytics && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Conversations:</span>
                  <span className="font-semibold">{analytics.totalConversations}</span>
                </div>
                <div className="flex justify-between">
                  <span>Messages:</span>
                  <span className="font-semibold">{analytics.totalMessages}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tokens used:</span>
                  <span className="font-semibold">{analytics.totalTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Docs indexed:</span>
                  <span className="font-semibold">{analytics.documentsIndexed}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => reindex()}
                  disabled={reindexing}
                >
                  <RefreshCw className={`h-3 w-3 mr-2 ${reindexing ? 'animate-spin' : ''}`} />
                  Reindex Workspace
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No conversations yet. Create one to start!
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer ${
                    selectedConversation?.id === conv.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-sm truncate">{conv.title}</span>
                  <div className="flex space-x-1">
                    {conv.isPinned && <Pin className="h-3 w-3" />}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        togglePin({ variables: { id: conv.id } })
                      }}
                    >
                      <Pin className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation({ variables: { id: conv.id } })
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="h-16 border-b px-6 flex items-center bg-background">
              <Bot className="h-5 w-5 mr-3 text-primary" />
              <div>
                <h1 className="font-semibold">{selectedConversation.title}</h1>
                <p className="text-xs text-muted-foreground">
                  AI Assistant with RAG • GPT-4 Turbo
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Sparkles className="h-12 w-12 text-primary mb-4" />
                  <p className="text-muted-foreground">
                    Ask me anything about your workspace!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    I can search your tables, pages, and messages using RAG
                  </p>
                </div>
              ) : (
                <div className="space-y-6 max-w-3xl mx-auto">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      {message.role === 'user' ? (
                        <>
                          <Avatar className="h-8 w-8 bg-primary">
                            <AvatarFallback className="text-primary-foreground text-xs">
                              U
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-muted rounded-lg p-4">
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500">
                            <AvatarFallback className="text-white text-xs">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-card border rounded-lg p-4">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                              {message.retrievedDocs && message.retrievedDocs.length > 0 && (
                                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                                  <span className="flex items-center">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Used {message.retrievedDocs.length} documents from your workspace
                                  </span>
                                </div>
                              )}
                            </div>
                            {message.tokenCount && (
                              <p className="text-xs text-muted-foreground mt-1 ml-2">
                                {message.tokenCount} tokens
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4 bg-background">
              <div className="max-w-3xl mx-auto flex items-end space-x-2">
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask me anything about your workspace..."
                  className="min-h-[60px] resize-none"
                  disabled={sending}
                />
                <Button onClick={handleSendMessage} disabled={!messageInput.trim() || sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Using RAG with GPT-4 Turbo • Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Select a conversation to start</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New AI Conversation</DialogTitle>
            <DialogDescription>
              Start a new conversation with the AI assistant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="e.g., Data Analysis Help"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateConversation()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateConversation}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
