'use client';

import { useQuery, useMutation } from '@apollo/client';
import {
  GET_DOCUMENTS,
  GET_SPREADSHEETS,
  GET_PRESENTATIONS,
  CREATE_DOCUMENT,
  CREATE_SPREADSHEET,
  CREATE_PRESENTATION,
  DELETE_DOCUMENT,
  DELETE_SPREADSHEET,
  DELETE_PRESENTATION,
} from '@/graphql/office';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Table2,
  Presentation as PresentationIcon,
  Plus,
  Trash2,
  MoreVertical,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OfficePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<'document' | 'spreadsheet' | 'presentation'>('document');
  const [title, setTitle] = useState('');

  const { data: docsData, loading: docsLoading, refetch: refetchDocs } = useQuery(GET_DOCUMENTS);
  const { data: sheetsData, loading: sheetsLoading, refetch: refetchSheets } = useQuery(GET_SPREADSHEETS);
  const { data: presData, loading: presLoading, refetch: refetchPres } = useQuery(GET_PRESENTATIONS);

  const [createDocument] = useMutation(CREATE_DOCUMENT, {
    onCompleted: (data) => {
      toast({ title: 'Document created' });
      setCreateDialogOpen(false);
      setTitle('');
      router.push(`/dashboard/office/docs/${data.createDocument.id}`);
    },
  });

  const [createSpreadsheet] = useMutation(CREATE_SPREADSHEET, {
    onCompleted: (data) => {
      toast({ title: 'Spreadsheet created' });
      setCreateDialogOpen(false);
      setTitle('');
      router.push(`/dashboard/office/sheets/${data.createSpreadsheet.id}`);
    },
  });

  const [createPresentation] = useMutation(CREATE_PRESENTATION, {
    onCompleted: (data) => {
      toast({ title: 'Presentation created' });
      setCreateDialogOpen(false);
      setTitle('');
      router.push(`/dashboard/office/slides/${data.createPresentation.id}`);
    },
  });

  const [deleteDocument] = useMutation(DELETE_DOCUMENT, { onCompleted: () => refetchDocs() });
  const [deleteSpreadsheet] = useMutation(DELETE_SPREADSHEET, { onCompleted: () => refetchSheets() });
  const [deletePresentation] = useMutation(DELETE_PRESENTATION, { onCompleted: () => refetchPres() });

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({ title: 'Error', description: 'Please enter a title', variant: 'destructive' });
      return;
    }

    if (createType === 'document') {
      await createDocument({ variables: { input: { title } } });
    } else if (createType === 'spreadsheet') {
      await createSpreadsheet({ variables: { input: { title } } });
    } else {
      await createPresentation({ variables: { input: { title } } });
    }
  };

  const openCreateDialog = (type: 'document' | 'spreadsheet' | 'presentation') => {
    setCreateType(type);
    setCreateDialogOpen(true);
  };

  const documents = docsData?.documents || [];
  const spreadsheets = sheetsData?.spreadsheets || [];
  const presentations = presData?.presentations || [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Office Suite</h1>
        <p className="text-muted-foreground">Create and manage documents, spreadsheets, and presentations</p>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="spreadsheets">
            <Table2 className="mr-2 h-4 w-4" />
            Spreadsheets
          </TabsTrigger>
          <TabsTrigger value="presentations">
            <PresentationIcon className="mr-2 h-4 w-4" />
            Presentations
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Documents</h2>
            <Button onClick={() => openCreateDialog('document')}>
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc: any) => (
              <Card
                key={doc.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/dashboard/office/docs/${doc.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDocument({ variables: { id: doc.id } });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {doc.description && <CardDescription>{doc.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {doc.wordCount} words • {new Date(doc.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {documents.length === 0 && !docsLoading && (
            <div className="text-center py-12 text-muted-foreground">
              No documents yet. Create your first document!
            </div>
          )}
        </TabsContent>

        {/* Spreadsheets Tab */}
        <TabsContent value="spreadsheets" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Spreadsheets</h2>
            <Button onClick={() => openCreateDialog('spreadsheet')}>
              <Plus className="mr-2 h-4 w-4" />
              New Spreadsheet
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spreadsheets.map((sheet: any) => (
              <Card
                key={sheet.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/dashboard/office/sheets/${sheet.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Table2 className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-lg">{sheet.title}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSpreadsheet({ variables: { id: sheet.id } });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {sheet.description && <CardDescription>{sheet.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {sheet.sheetCount} sheet(s) • {new Date(sheet.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {spreadsheets.length === 0 && !sheetsLoading && (
            <div className="text-center py-12 text-muted-foreground">
              No spreadsheets yet. Create your first spreadsheet!
            </div>
          )}
        </TabsContent>

        {/* Presentations Tab */}
        <TabsContent value="presentations" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Presentations</h2>
            <Button onClick={() => openCreateDialog('presentation')}>
              <Plus className="mr-2 h-4 w-4" />
              New Presentation
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presentations.map((pres: any) => (
              <Card
                key={pres.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/dashboard/office/slides/${pres.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <PresentationIcon className="h-5 w-5 text-orange-600" />
                      <CardTitle className="text-lg">{pres.title}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePresentation({ variables: { id: pres.id } });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {pres.description && <CardDescription>{pres.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {pres.slideCount} slide(s) • {new Date(pres.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {presentations.length === 0 && !presLoading && (
            <div className="text-center py-12 text-muted-foreground">
              No presentations yet. Create your first presentation!
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create New{' '}
              {createType === 'document' ? 'Document' : createType === 'spreadsheet' ? 'Spreadsheet' : 'Presentation'}
            </DialogTitle>
            <DialogDescription>Give your {createType} a name to get started</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder={`My ${createType}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
