'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronLeft,
  FlaskConical,
  Plus,
  Download,
  Filter,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Star,
  Search,
} from 'lucide-react';
import {
  generateMockLabNotes,
  getLabNoteStats,
  filterLabNotes,
  sortLabNotes,
  exportLabNoteToMarkdown,
  type LabNote,
} from '@/lib/lab-notes';
import { cn } from '@/lib/utils';

export default function LabNotesPage() {
  const router = useRouter();

  const [notes, setNotes] = useState<LabNote[]>(() => generateMockLabNotes(15));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LabNote['status'][]>([]);
  const [categoryFilter, setCategoryFilter] = useState<LabNote['category'][]>([]);
  const [selectedNote, setSelectedNote] = useState<LabNote | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'trial' | 'title'>('date');

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    const filtered = filterLabNotes(notes, {
      status: statusFilter.length > 0 ? statusFilter : undefined,
      category: categoryFilter.length > 0 ? categoryFilter : undefined,
      searchQuery: searchQuery || undefined,
    });
    return sortLabNotes(filtered, sortBy, 'desc');
  }, [notes, searchQuery, statusFilter, categoryFilter, sortBy]);

  // Get statistics
  const stats = useMemo(() => getLabNoteStats(notes), [notes]);

  // Toggle filter
  const toggleFilter = <T extends string>(
    current: T[],
    value: T,
    setter: (value: T[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  // Export note
  const handleExport = (note: LabNote) => {
    const markdown = exportLabNoteToMarkdown(note);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-note-${note.id}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Status badge color
  const getStatusColor = (status: LabNote['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'planned':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'archived':
        return 'bg-purple-100 text-purple-700 border-purple-300';
    }
  };

  // Category badge color
  const getCategoryColor = (category: LabNote['category']) => {
    switch (category) {
      case 'modification':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'new-creation':
        return 'bg-pink-100 text-pink-700 border-pink-300';
      case 'testing':
        return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      case 'analysis':
        return 'bg-teal-100 text-teal-700 border-teal-300';
      case 'research':
        return 'bg-cyan-100 text-cyan-700 border-cyan-300';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FlaskConical className="h-8 w-8 text-indigo-600" />
              Lab Notes & Testing Journal
            </h2>
            <p className="text-muted-foreground">
              Track experiments, trials, and formula modifications
            </p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Lab Note
        </Button>
      </div>

      {/* Stats KPIs */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recentActivity} in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.byStatus.completed}
            </div>
            <p className="text-xs text-muted-foreground">Successful tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.byStatus['in-progress']}
            </div>
            <p className="text-xs text-muted-foreground">Active trials</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.successRate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Completed vs failed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.averageRating.toFixed(1)}/10
            </div>
            <p className="text-xs text-muted-foreground">Overall quality</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notes List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Lab Notes</CardTitle>
            <CardDescription>
              {filteredNotes.length} of {notes.length} notes
            </CardDescription>

            {/* Search & Filters */}
            <div className="space-y-3 pt-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Status</div>
                <div className="flex flex-wrap gap-2">
                  {(['planned', 'in-progress', 'completed', 'failed'] as const).map((status) => (
                    <Badge
                      key={status}
                      className={cn(
                        'cursor-pointer capitalize',
                        statusFilter.includes(status)
                          ? getStatusColor(status)
                          : 'bg-gray-100 text-gray-600 border-gray-300'
                      )}
                      onClick={() => toggleFilter(statusFilter, status, setStatusFilter)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Category</div>
                <div className="flex flex-wrap gap-2">
                  {(['modification', 'testing', 'analysis'] as const).map((category) => (
                    <Badge
                      key={category}
                      className={cn(
                        'cursor-pointer capitalize',
                        categoryFilter.includes(category)
                          ? getCategoryColor(category)
                          : 'bg-gray-100 text-gray-600 border-gray-300'
                      )}
                      onClick={() =>
                        toggleFilter(categoryFilter, category, setCategoryFilter)
                      }
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  'p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent',
                  selectedNote?.id === note.id && 'bg-accent border-primary'
                )}
                onClick={() => setSelectedNote(note)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{note.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      Trial #{note.trialNumber} • {note.date.toLocaleDateString()}
                    </p>
                  </div>
                  {note.rating && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 ml-2">
                      {note.rating}/10
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge className={cn('text-xs', getStatusColor(note.status))}>
                    {note.status}
                  </Badge>
                  <Badge className={cn('text-xs', getCategoryColor(note.category))}>
                    {note.category}
                  </Badge>
                </div>
              </div>
            ))}

            {filteredNotes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No lab notes found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Note Details */}
        <Card className="lg:col-span-2">
          {selectedNote ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{selectedNote.title}</CardTitle>
                    <CardDescription>
                      Trial #{selectedNote.trialNumber} •{' '}
                      {selectedNote.date.toLocaleDateString()}
                      {selectedNote.formulaName && ` • Formula: ${selectedNote.formulaName}`}
                    </CardDescription>
                    <div className="flex gap-2 mt-3">
                      <Badge className={getStatusColor(selectedNote.status)}>
                        {selectedNote.status}
                      </Badge>
                      <Badge className={getCategoryColor(selectedNote.category)}>
                        {selectedNote.category}
                      </Badge>
                      {selectedNote.rating && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                          <Star className="h-3 w-3 mr-1" />
                          {selectedNote.rating}/10
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(selectedNote)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
                {/* Objective */}
                <div>
                  <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
                    Objective
                  </h3>
                  <p className="text-sm">{selectedNote.objective}</p>
                </div>

                {/* Hypothesis */}
                {selectedNote.hypothesis && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
                      Hypothesis
                    </h3>
                    <p className="text-sm">{selectedNote.hypothesis}</p>
                  </div>
                )}

                {/* Methodology */}
                <div>
                  <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
                    Methodology
                  </h3>
                  <p className="text-sm">{selectedNote.methodology}</p>
                </div>

                {/* Modifications */}
                {selectedNote.modifications && selectedNote.modifications.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
                      Modifications
                    </h3>
                    <div className="space-y-2">
                      {selectedNote.modifications.map((mod, i) => (
                        <div key={i} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm">{mod.ingredient}</span>
                            <Badge variant="outline">{mod.change}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{mod.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observations */}
                {selectedNote.observations && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
                      Observations
                    </h3>
                    <p className="text-sm">{selectedNote.observations}</p>
                  </div>
                )}

                {/* Performance Metrics */}
                {(selectedNote.longevity || selectedNote.sillage) && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
                      Performance Metrics
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {selectedNote.longevity && (
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-xs font-semibold mb-2 uppercase text-muted-foreground">
                            Longevity
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Top notes:</span>
                              <span className="font-semibold">
                                {selectedNote.longevity.top.toFixed(1)}h
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Heart notes:</span>
                              <span className="font-semibold">
                                {selectedNote.longevity.heart.toFixed(1)}h
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Base notes:</span>
                              <span className="font-semibold">
                                {selectedNote.longevity.base.toFixed(1)}h
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedNote.sillage && (
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-xs font-semibold mb-2 uppercase text-muted-foreground">
                            Sillage
                          </div>
                          <div className="text-lg font-bold capitalize">
                            {selectedNote.sillage}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Olfactive Notes */}
                {selectedNote.olfactiveNotes && selectedNote.olfactiveNotes.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
                      Olfactive Evaluation
                    </h3>
                    <div className="space-y-3">
                      {selectedNote.olfactiveNotes.map((eval, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <div className="font-semibold text-sm capitalize mb-2">
                            {eval.phase.replace('-', ' ')}
                          </div>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="font-medium">Notes: </span>
                              {eval.notes.join(', ')}
                            </div>
                            <div>
                              <span className="font-medium">Impression: </span>
                              {eval.impression}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Data */}
                {(selectedNote.temperature ||
                  selectedNote.humidity ||
                  selectedNote.maceration) && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
                      Technical Conditions
                    </h3>
                    <div className="flex gap-4 text-sm">
                      {selectedNote.temperature && (
                        <div>
                          <span className="text-muted-foreground">Temperature:</span>{' '}
                          <span className="font-semibold">
                            {selectedNote.temperature.toFixed(1)}°C
                          </span>
                        </div>
                      )}
                      {selectedNote.humidity && (
                        <div>
                          <span className="text-muted-foreground">Humidity:</span>{' '}
                          <span className="font-semibold">
                            {selectedNote.humidity.toFixed(0)}%
                          </span>
                        </div>
                      )}
                      {selectedNote.maceration && (
                        <div>
                          <span className="text-muted-foreground">Maceration:</span>{' '}
                          <span className="font-semibold">
                            {selectedNote.maceration} days
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Conclusions */}
                {selectedNote.conclusions && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
                      Conclusions
                    </h3>
                    <p className="text-sm">{selectedNote.conclusions}</p>
                  </div>
                )}

                {/* Next Steps */}
                {selectedNote.nextSteps && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
                      Next Steps
                    </h3>
                    <p className="text-sm">{selectedNote.nextSteps}</p>
                  </div>
                )}

                {/* Tags */}
                {selectedNote.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <FlaskConical className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">No note selected</p>
                <p className="text-sm text-muted-foreground">
                  Select a lab note from the list to view details
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
