'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_PRESENTATION, UPDATE_PRESENTATION } from '@/graphql/office';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Plus, Trash2, Play } from 'lucide-react';
import { debounce } from 'lodash';

export default function PresentationEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const presentationId = params.id as string;

  const [title, setTitle] = useState('');
  const [slides, setSlides] = useState<any[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isPresentMode, setIsPresentMode] = useState(false);

  const { data, loading } = useQuery(GET_PRESENTATION, {
    variables: { id: presentationId },
    skip: !presentationId,
  });

  const [updatePresentation] = useMutation(UPDATE_PRESENTATION, {
    onCompleted: () => {
      setIsSaving(false);
    },
  });

  const presentation = data?.presentation;

  useEffect(() => {
    if (presentation) {
      setTitle(presentation.title);
      setSlides(presentation.slides || []);
    }
  }, [presentation]);

  const debouncedSave = debounce(async (newTitle: string, newSlides: any[]) => {
    setIsSaving(true);
    await updatePresentation({
      variables: {
        input: {
          id: presentationId,
          title: newTitle,
          slides: newSlides,
        },
      },
    });
  }, 1000);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave(newTitle, slides);
  };

  const extractSlideText = (slide: any): string => {
    if (!slide.content || !slide.content.content) return '';
    let text = '';
    const traverse = (node: any) => {
      if (node.text) text += node.text;
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(traverse);
      }
    };
    traverse(slide.content);
    return text;
  };

  const textToSlideContent = (text: string): any => {
    const paragraphs = text.split('\n').map((line) => ({
      type: 'paragraph',
      content: line ? [{ type: 'text', text: line }] : [],
    }));
    return { type: 'doc', content: paragraphs };
  };

  const handleSlideContentChange = (index: number, newText: string) => {
    const newSlides = [...slides];
    newSlides[index] = {
      ...newSlides[index],
      content: textToSlideContent(newText),
    };
    setSlides(newSlides);
    debouncedSave(title, newSlides);
  };

  const addSlide = () => {
    const newSlide = {
      id: `slide${slides.length + 1}`,
      order: slides.length,
      content: { type: 'doc', content: [] },
      layout: 'content',
      background: '#ffffff',
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setActiveSlideIndex(slides.length);
    debouncedSave(title, newSlides);
  };

  const deleteSlide = (index: number) => {
    if (slides.length === 1) {
      toast({ title: 'Cannot delete the last slide', variant: 'destructive' });
      return;
    }
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    setActiveSlideIndex(Math.min(index, newSlides.length - 1));
    debouncedSave(title, newSlides);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading presentation...</p>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Presentation not found</p>
      </div>
    );
  }

  const activeSlide = slides[activeSlideIndex];

  // Presentation Mode
  if (isPresentMode) {
    return (
      <div className="h-screen bg-black flex flex-col">
        <div className="p-4 flex justify-between items-center bg-gray-900">
          <span className="text-white">
            Slide {activeSlideIndex + 1} / {slides.length}
          </span>
          <Button variant="ghost" onClick={() => setIsPresentMode(false)}>
            Exit Presentation
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="w-full max-w-5xl aspect-video bg-white rounded-lg shadow-2xl p-12">
            <div className="h-full prose max-w-none text-2xl">
              {activeSlide && (
                <pre className="whitespace-pre-wrap font-sans">
                  {extractSlideText(activeSlide)}
                </pre>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 flex justify-center space-x-4">
          <Button
            disabled={activeSlideIndex === 0}
            onClick={() => setActiveSlideIndex(activeSlideIndex - 1)}
          >
            Previous
          </Button>
          <Button
            disabled={activeSlideIndex === slides.length - 1}
            onClick={() => setActiveSlideIndex(activeSlideIndex + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  // Editor Mode
  return (
    <div className="flex h-screen">
      {/* Slide Thumbnails */}
      <div className="w-64 border-r bg-muted/30">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Slides</h3>
        </div>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-2 space-y-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => setActiveSlideIndex(index)}
                className={`relative p-2 border-2 rounded cursor-pointer transition-colors ${
                  index === activeSlideIndex
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <div className="aspect-video bg-white rounded p-2 text-xs overflow-hidden">
                  <div className="font-semibold mb-1">Slide {index + 1}</div>
                  <div className="text-muted-foreground line-clamp-3">
                    {extractSlideText(slide).substring(0, 100)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSlide(index);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-2 border-t">
          <Button onClick={addSlide} className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Slide
          </Button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
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
              placeholder="Untitled Presentation"
            />
          </div>
          <div className="flex items-center space-x-2">
            {isSaving && <span className="text-sm text-muted-foreground">Saving...</span>}
            <Button onClick={() => setIsPresentMode(true)}>
              <Play className="mr-2 h-4 w-4" />
              Present
            </Button>
          </div>
        </div>

        {/* Slide Editor */}
        <div className="flex-1 flex items-center justify-center p-12 bg-muted/20">
          <div className="w-full max-w-5xl aspect-video bg-white rounded-lg shadow-xl p-12">
            {activeSlide && (
              <Textarea
                value={extractSlideText(activeSlide)}
                onChange={(e) => handleSlideContentChange(activeSlideIndex, e.target.value)}
                className="w-full h-full text-lg border-none focus-visible:ring-0 resize-none"
                placeholder="Enter slide content..."
              />
            )}
          </div>
        </div>

        {/* Slide Info */}
        <div className="border-t p-2 text-center text-sm text-muted-foreground">
          Slide {activeSlideIndex + 1} of {slides.length}
        </div>
      </div>
    </div>
  );
}
