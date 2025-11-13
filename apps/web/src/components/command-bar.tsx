'use client'

import { useEffect, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import { Command } from 'cmdk'
import { Search, Sparkles, Database, Zap, Mail, MessageSquare, FileText, Loader2 } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

const AI_CHAT_MUTATION = gql`
  mutation AIChat($message: String!) {
    aiChat(message: $message) {
      answer
      context
      suggestedActions
    }
  }
`

export function CommandBar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [aiResponse, setAiResponse] = useState<string | null>(null)

  const [aiChat, { loading }] = useMutation(AI_CHAT_MUTATION, {
    onCompleted: (data) => {
      setAiResponse(data.aiChat.answer)
    },
    onError: (error) => {
      setAiResponse(`Error: ${error.message}`)
    },
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!open) {
      // Reset on close
      setTimeout(() => {
        setSearch('')
        setAiResponse(null)
      }, 200)
    }
  }, [open])

  const handleAIQuery = async () => {
    if (!search.trim()) return
    await aiChat({ variables: { message: search } })
  }

  const handleNavigate = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-2xl">
        <Command className="rounded-lg border-none">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Search or ask AI anything..."
              value={search}
              onValueChange={setSearch}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>

          {aiResponse ? (
            <div className="p-4 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">AI Response</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {aiResponse}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setAiResponse(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <Command.List className="max-h-[400px] overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm">
                No results found.
              </Command.Empty>

              {search && (
                <Command.Group heading="AI Assistant">
                  <Command.Item
                    onSelect={handleAIQuery}
                    className="flex items-center space-x-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent"
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ask AI</p>
                      <p className="text-xs text-muted-foreground">
                        Get AI-powered answer to: "{search}"
                      </p>
                    </div>
                  </Command.Item>
                </Command.Group>
              )}

              <Command.Group heading="Navigation">
                <Command.Item
                  onSelect={() => handleNavigate('/dashboard')}
                  className="flex items-center space-x-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Dashboard</p>
                    <p className="text-xs text-muted-foreground">Go to home</p>
                  </div>
                </Command.Item>

                <Command.Item
                  onSelect={() => handleNavigate('/database')}
                  className="flex items-center space-x-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent"
                >
                  <Database className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Database</p>
                    <p className="text-xs text-muted-foreground">View all tables</p>
                  </div>
                </Command.Item>

                <Command.Item
                  onSelect={() => handleNavigate('/builder')}
                  className="flex items-center space-x-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent"
                >
                  <Zap className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Builder</p>
                    <p className="text-xs text-muted-foreground">No-code app builder</p>
                  </div>
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Quick Actions">
                <Command.Item className="flex items-center space-x-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-medium">New Table</p>
                    <p className="text-xs text-muted-foreground">Create a database table</p>
                  </div>
                </Command.Item>

                <Command.Item className="flex items-center space-x-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium">New App</p>
                    <p className="text-xs text-muted-foreground">Build with no-code</p>
                  </div>
                </Command.Item>
              </Command.Group>
            </Command.List>
          )}
        </Command>
      </DialogContent>
    </Dialog>
  )
}
