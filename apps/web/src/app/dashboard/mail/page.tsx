'use client';

import { useQuery, useMutation } from '@apollo/client';
import {
  GET_EMAILS,
  GET_EMAIL,
  CREATE_EMAIL,
  UPDATE_EMAIL,
  DELETE_EMAIL,
  GENERATE_AI_REPLY,
  COMPOSE_EMAIL_WITH_AI,
} from '@/graphql/mail';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Star,
  StarOff,
  Inbox,
  Send,
  FileText,
  Trash2,
  Archive,
  Search,
  Plus,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Email {
  id: string;
  subject: string;
  body: string;
  fromAddress: string;
  fromName?: string;
  toAddresses: string[];
  status: string;
  folder: string;
  priority: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  aiSummary?: string;
  aiCategory?: string;
  aiSuggestedReplies?: string[];
  sentAt?: string;
  receivedAt?: string;
  createdAt: string;
}

const folders = [
  { name: 'Inbox', icon: Inbox, value: 'inbox' },
  { name: 'Sent', icon: Send, value: 'sent' },
  { name: 'Drafts', icon: FileText, value: 'drafts' },
  { name: 'Archive', icon: Archive, value: 'archive' },
  { name: 'Trash', icon: Trash2, value: 'trash' },
];

export default function MailPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    body: '',
  });

  const [aiPrompt, setAiPrompt] = useState('');

  const { data: emailsData, loading, refetch } = useQuery(GET_EMAILS, {
    variables: {
      input: {
        folder: selectedFolder,
        limit: 100,
      },
    },
  });

  const [createEmail] = useMutation(CREATE_EMAIL, {
    onCompleted: () => {
      toast({ title: 'Email sent!' });
      setComposeOpen(false);
      setFormData({ to: '', subject: '', body: '' });
      refetch();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const [updateEmail] = useMutation(UPDATE_EMAIL, {
    onCompleted: () => refetch(),
  });

  const [deleteEmail] = useMutation(DELETE_EMAIL, {
    onCompleted: () => {
      toast({ title: 'Email moved to trash' });
      setSelectedEmail(null);
      refetch();
    },
  });

  const [generateAIReply] = useMutation(GENERATE_AI_REPLY);
  const [composeWithAI] = useMutation(COMPOSE_EMAIL_WITH_AI, {
    onCompleted: (data) => {
      setFormData({
        ...formData,
        subject: data.composeEmailWithAI.subject,
        body: data.composeEmailWithAI.body,
      });
      setAiPromptOpen(false);
      setAiPrompt('');
      setComposeOpen(true);
    },
  });

  const emails: Email[] = emailsData?.emails || [];

  const handleSendEmail = async () => {
    if (!formData.to || !formData.subject) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    await createEmail({
      variables: {
        input: {
          toAddresses: formData.to.split(',').map((e) => e.trim()),
          subject: formData.subject,
          body: formData.body,
          isDraft: false,
        },
      },
    });
  };

  const handleToggleStar = async (email: Email) => {
    await updateEmail({
      variables: {
        input: {
          id: email.id,
          isStarred: !email.isStarred,
        },
      },
    });
  };

  const handleMarkAsRead = async (email: Email, isRead: boolean) => {
    await updateEmail({
      variables: {
        input: {
          id: email.id,
          isRead,
        },
      },
    });
  };

  const handleDelete = async (email: Email) => {
    await deleteEmail({ variables: { id: email.id } });
  };

  const handleAICompose = async () => {
    if (!aiPrompt) return;

    await composeWithAI({ variables: { prompt: aiPrompt } });
  };

  const handleAIReply = async (replyIntent: string) => {
    if (!selectedEmail) return;

    const { data } = await generateAIReply({
      variables: {
        emailId: selectedEmail.id,
        replyIntent,
      },
    });

    if (data?.generateAIReply) {
      setFormData({
        to: selectedEmail.fromAddress,
        subject: `Re: ${selectedEmail.subject}`,
        body: data.generateAIReply,
      });
      setSelectedEmail(null);
      setComposeOpen(true);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <Button className="w-full" onClick={() => setComposeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Compose
          </Button>
          <Button
            className="w-full mt-2"
            variant="outline"
            onClick={() => setAiPromptOpen(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Compose
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const count = emails.filter((e) => e.folder === folder.value).length;
              return (
                <button
                  key={folder.value}
                  onClick={() => {
                    setSelectedFolder(folder.value);
                    setSelectedEmail(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedFolder === folder.value
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </div>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Email List */}
      <div className="w-96 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : emails.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No emails in {selectedFolder}
            </div>
          ) : (
            <div className="divide-y">
              {emails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => {
                    setSelectedEmail(email);
                    if (!email.isRead) {
                      handleMarkAsRead(email, true);
                    }
                  }}
                  className={`w-full text-left p-4 hover:bg-muted transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-muted' : ''
                  } ${!email.isRead ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className={`font-medium text-sm truncate ${!email.isRead ? 'font-bold' : ''}`}>
                        {email.fromName || email.fromAddress}
                      </span>
                      {email.aiCategory && (
                        <Badge variant="outline" className="text-xs">
                          {email.aiCategory}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {email.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      <span className="text-xs text-muted-foreground">
                        {new Date(email.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={`text-sm mb-1 ${!email.isRead ? 'font-semibold' : ''}`}>
                    {email.subject}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {email.aiSummary || email.body.substring(0, 100)}...
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Email Detail */}
      <div className="flex-1 flex flex-col">
        {selectedEmail ? (
          <>
            <div className="p-6 border-b">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{selectedEmail.subject}</h1>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span className="font-medium">
                      {selectedEmail.fromName || selectedEmail.fromAddress}
                    </span>
                    <span>•</span>
                    <span>{new Date(selectedEmail.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleStar(selectedEmail)}
                  >
                    {selectedEmail.isStarred ? (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(selectedEmail)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedEmail.aiSummary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-blue-600 mb-1">AI Summary</div>
                      <div className="text-sm text-blue-900">{selectedEmail.aiSummary}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap">{selectedEmail.body}</div>
              </div>
            </ScrollArea>

            {selectedEmail.aiSuggestedReplies && selectedEmail.aiSuggestedReplies.length > 0 && (
              <div className="p-4 border-t bg-muted/30">
                <div className="text-sm font-medium mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Smart Replies
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedEmail.aiSuggestedReplies.map((reply, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIReply(reply)}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select an email to read</p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
            <DialogDescription>Send a new email message</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                placeholder="recipient@example.com"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                rows={10}
                placeholder="Write your message..."
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail}>
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Compose Dialog */}
      <Dialog open={aiPromptOpen} onOpenChange={setAiPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Sparkles className="inline mr-2 h-5 w-5" />
              Compose with AI
            </DialogTitle>
            <DialogDescription>
              Describe what you want to write, and AI will compose the email for you
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="aiPrompt">What do you want to say?</Label>
            <Textarea
              id="aiPrompt"
              rows={4}
              placeholder="e.g., Write a professional email to schedule a meeting..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiPromptOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAICompose}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
