'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_DOCUMENT, UPDATE_DOCUMENT } from '@/graphql/office';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { debounce } from 'lodash';

export default function DocumentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const documentId = params.id as string;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data, loading } = useQuery(GET_DOCUMENT, {
    variables: { id: documentId },
    skip: !documentId,
  });

  const [updateDocument] = useMutation(UPDATE_DOCUMENT, {
    onCompleted: () => {
      setIsSaving(false);
      toast({ title: 'Document saved' });
    },
    onError: () => {
      setIsSaving(false);
      toast({ title: 'Error saving document', variant: 'destructive' });
    },
  });

  const document = data?.document;

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      // Extract text content from the content object
      const textContent = extractText(document.content);
      setContent(textContent);
    }
  }, [document]);

  // Extract text from TipTap/ProseMirror JSON
  const extractText = (contentObj: any): string => {
    if (!contentObj || !contentObj.content) return '';
    let text = '';
    const traverse = (node: any) => {
      if (node.text) {
        text += node.text;
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(traverse);
      }
      if (node.type === 'paragraph') {
        text += '\n';
      }
    };
    traverse(contentObj);
    return text.trim();
  };

  // Convert plain text to simple TipTap/ProseMirror JSON
  const textToContent = (text: string): any => {
    const paragraphs = text.split('\n').map((line) => ({
      type: 'paragraph',
      content: line ? [{ type: 'text', text: line }] : [],
    }));

    return {
      type: 'doc',
      content: paragraphs,
    };
  };

  // Debounced save
  const debouncedSave = debounce(async (newTitle: string, newContent: string) => {
    setIsSaving(true);
    await updateDocument({
      variables: {
        input: {
          id: documentId,
          title: newTitle,
          content: textToContent(newContent),
        },
      },
    });
  }, 1000);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave(newTitle, content);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    debouncedSave(title, newContent);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading document...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Document not found</p>
      </div>
    );
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/office')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-xl font-bold border-none focus-visible:ring-0 px-0 w-96"
            placeholder="Untitled Document"
          />
        </div>
        <div className="flex items-center space-x-2">
          {isSaving && <span className="text-sm text-muted-foreground">Saving...</span>}
          <span className="text-sm text-muted-foreground">
            {wordCount} words • {charCount} characters
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[600px] text-base border-none focus-visible:ring-0 resize-none"
            placeholder="Start writing..."
          />
        </div>
      </div>
    </div>
  );
}
