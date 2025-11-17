'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Sparkles, Search, Copy, Star } from 'lucide-react';
import { ALL_ACCORDS, CLASSIC_ACCORDS, MODERN_ACCORDS, SEASONAL_ACCORDS, searchAccords, type Accord } from '@/lib/accords';
import { cn } from '@/lib/utils';

export default function AccordsLibraryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccord, setSelectedAccord] = useState<Accord | null>(null);

  const filteredAccords = searchTerm ? searchAccords(searchTerm) : ALL_ACCORDS;

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
              <Star className="h-8 w-8 text-amber-600" />
              Bibliothèque d'Accords
            </h2>
            <p className="text-muted-foreground">
              Classic and modern pre-composed accords for perfume creation
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search accords by name, character, or description..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({ALL_ACCORDS.length})</TabsTrigger>
          <TabsTrigger value="classic">Classic ({CLASSIC_ACCORDS.length})</TabsTrigger>
          <TabsTrigger value="modern">Modern ({MODERN_ACCORDS.length})</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal ({SEASONAL_ACCORDS.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AccordGrid accords={filteredAccords} onSelect={setSelectedAccord} />
        </TabsContent>

        <TabsContent value="classic">
          <AccordGrid
            accords={filteredAccords.filter((a) => a.type === 'Classic')}
            onSelect={setSelectedAccord}
          />
        </TabsContent>

        <TabsContent value="modern">
          <AccordGrid
            accords={filteredAccords.filter((a) => a.type === 'Modern')}
            onSelect={setSelectedAccord}
          />
        </TabsContent>

        <TabsContent value="seasonal">
          <AccordGrid
            accords={filteredAccords.filter((a) => a.type === 'Seasonal')}
            onSelect={setSelectedAccord}
          />
        </TabsContent>
      </Tabs>

      {/* Selected Accord Detail Modal */}
      {selectedAccord && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAccord(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-2xl">{selectedAccord.name}</CardTitle>
                    <Badge>{selectedAccord.type}</Badge>
                  </div>
                  <CardDescription className="text-base">{selectedAccord.description}</CardDescription>
                  <div className="mt-2">
                    <span className="text-sm italic text-muted-foreground">
                      "{selectedAccord.character}"
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAccord(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ingredients */}
              <div>
                <h4 className="font-semibold mb-3">Composition</h4>
                <div className="space-y-3">
                  {selectedAccord.ingredients.map((ingredient) => (
                    <div key={ingredient.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{ingredient.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{ingredient.role}</span>
                          <span className="font-semibold">{ingredient.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${ingredient.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Recommendation */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-900">Usage Recommendation</h4>
                <p className="text-sm text-blue-800">{selectedAccord.usageRecommendation}</p>
              </div>

              {/* Best For */}
              <div>
                <h4 className="font-semibold mb-2">Best For</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAccord.bestFor.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t flex gap-2">
                <Button className="flex-1">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Formula
                </Button>
                <Button variant="outline" onClick={() => setSelectedAccord(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function AccordGrid({
  accords,
  onSelect,
}: {
  accords: Accord[];
  onSelect: (accord: Accord) => void;
}) {
  if (accords.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No accords found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accords.map((accord) => (
        <Card
          key={accord.id}
          className="cursor-pointer hover:border-purple-300 hover:shadow-md transition-all"
          onClick={() => onSelect(accord)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">{accord.name}</CardTitle>
                <Badge className="mb-2">{accord.type}</Badge>
              </div>
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <CardDescription className="line-clamp-2">{accord.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm italic text-purple-600">"{accord.character}"</div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase">
                {accord.ingredients.length} Ingredients
              </div>
              <div className="flex flex-wrap gap-1">
                {accord.ingredients.slice(0, 3).map((ing) => (
                  <Badge key={ing.name} variant="outline" className="text-xs">
                    {ing.name}
                  </Badge>
                ))}
                {accord.ingredients.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{accord.ingredients.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex flex-wrap gap-1">
                {accord.bestFor.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs text-muted-foreground">
                    • {tag}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
