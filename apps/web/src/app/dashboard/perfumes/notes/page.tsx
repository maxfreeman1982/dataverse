'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_INGREDIENTS, GET_ALL_OLFACTIVE_FAMILIES, type Ingredient, type OlfactiveFamily } from '@/graphql/perfume';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sparkles, Calculator, BookOpen, Beaker, TrendingUp, Target,
  Lightbulb, ArrowRight, ChevronRight
} from 'lucide-react';
import {
  COMPOSITION_TEMPLATES,
  calculateHarmonyScore,
  goldenRatioThreeNotes,
  generateFibonacciComposition,
  PHI,
  type CompositionTemplate,
} from '@/lib/composition';
import { cn } from '@/lib/utils';

export default function NoteLibraryPage() {
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedTenacity, setSelectedTenacity] = useState<string | null>(null);
  const [topPercent, setTopPercent] = useState(30);
  const [heartPercent, setHeartPercent] = useState(40);
  const [basePercent, setBasePercent] = useState(30);

  const { data: ingredientsData } = useQuery<{ getAllIngredients: Ingredient[] }>(GET_ALL_INGREDIENTS);
  const { data: familiesData } = useQuery<{ getAllOlfactiveFamilies: OlfactiveFamily[] }>(GET_ALL_OLFACTIVE_FAMILIES);

  const ingredients = ingredientsData?.getAllIngredients || [];
  const families = familiesData?.getAllOlfactiveFamilies || [];

  // Filter ingredients
  const filteredIngredients = ingredients.filter((ing) => {
    if (selectedFamily && ing.olfactiveFamily.id !== selectedFamily) return false;
    if (selectedTenacity && ing.tenacity !== selectedTenacity) return false;
    return true;
  });

  // Group by tenacity
  const topNotes = ingredients.filter((i) => i.tenacity === 'top');
  const heartNotes = ingredients.filter((i) => i.tenacity === 'heart');
  const baseNotes = ingredients.filter((i) => i.tenacity === 'base');

  // Calculate harmony score
  const harmonyResult = calculateHarmonyScore(topPercent, heartPercent, basePercent);
  const goldenRatio = goldenRatioThreeNotes();

  const handleTemplateApply = (template: CompositionTemplate) => {
    setTopPercent(Math.round(template.topNotes * 100) / 100);
    setHeartPercent(Math.round(template.heartNotes * 100) / 100);
    setBasePercent(Math.round(template.baseNotes * 100) / 100);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            Bibliothèque de Notes
          </h2>
          <p className="text-muted-foreground">
            Explore ingredients and advanced composition techniques
          </p>
        </div>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">
            <BookOpen className="mr-2 h-4 w-4" />
            Browse Notes
          </TabsTrigger>
          <TabsTrigger value="calculator">
            <Calculator className="mr-2 h-4 w-4" />
            Composition Calculator
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Target className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* BROWSE NOTES TAB */}
        <TabsContent value="browse" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Filters */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Olfactive Families</Label>
                  <div className="space-y-1">
                    <Button
                      variant={selectedFamily === null ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedFamily(null)}
                    >
                      All Families ({ingredients.length})
                    </Button>
                    {families.map((family) => {
                      const count = ingredients.filter((i) => i.olfactiveFamily.id === family.id).length;
                      return (
                        <Button
                          key={family.id}
                          variant={selectedFamily === family.id ? 'default' : 'ghost'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setSelectedFamily(family.id)}
                        >
                          {family.name} ({count})
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-sm font-semibold mb-2 block">Note Level</Label>
                  <div className="space-y-1">
                    <Button
                      variant={selectedTenacity === null ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedTenacity(null)}
                    >
                      All Notes ({ingredients.length})
                    </Button>
                    <Button
                      variant={selectedTenacity === 'top' ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedTenacity('top')}
                    >
                      Top Notes ({topNotes.length})
                    </Button>
                    <Button
                      variant={selectedTenacity === 'heart' ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedTenacity('heart')}
                    >
                      Heart Notes ({heartNotes.length})
                    </Button>
                    <Button
                      variant={selectedTenacity === 'base' ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedTenacity('base')}
                    >
                      Base Notes ({baseNotes.length})
                    </Button>
                  </div>
                </div>

                {(selectedFamily || selectedTenacity) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedFamily(null);
                      setSelectedTenacity(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Ingredients Grid */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {filteredIngredients.length} Ingredient{filteredIngredients.length !== 1 ? 's' : ''}
                  </CardTitle>
                  <CardDescription>
                    {selectedFamily && `Filtered by ${families.find((f) => f.id === selectedFamily)?.name} `}
                    {selectedTenacity && `${selectedFamily ? '• ' : ''}${selectedTenacity} notes only`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredIngredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => (window.location.href = `/dashboard/perfumes/ingredients/${ingredient.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{ingredient.name}</h4>
                          <Beaker className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {ingredient.description}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {ingredient.olfactiveFamily.name}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs',
                              ingredient.tenacity === 'top' && 'border-blue-500',
                              ingredient.tenacity === 'heart' && 'border-purple-500',
                              ingredient.tenacity === 'base' && 'border-amber-500'
                            )}
                          >
                            {ingredient.tenacity}
                          </Badge>
                          {ingredient.allergens.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {ingredient.allergens.length} allergen{ingredient.allergens.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* COMPOSITION CALCULATOR TAB */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Calculator Input */}
            <Card>
              <CardHeader>
                <CardTitle>Pyramid Calculator</CardTitle>
                <CardDescription>
                  Enter your note distribution to analyze harmony
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Top Notes</Label>
                      <span className="text-sm font-semibold">{topPercent}%</span>
                    </div>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={topPercent}
                      onChange={(e) => setTopPercent(parseFloat(e.target.value))}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Heart Notes</Label>
                      <span className="text-sm font-semibold">{heartPercent}%</span>
                    </div>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={heartPercent}
                      onChange={(e) => setHeartPercent(parseFloat(e.target.value))}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Base Notes</Label>
                      <span className="text-sm font-semibold">{basePercent}%</span>
                    </div>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={basePercent}
                      onChange={(e) => setBasePercent(parseFloat(e.target.value))}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Total</span>
                    <span
                      className={cn(
                        'text-lg font-bold',
                        Math.abs(topPercent + heartPercent + basePercent - 100) < 0.1
                          ? 'text-green-600'
                          : 'text-red-600'
                      )}
                    >
                      {(topPercent + heartPercent + basePercent).toFixed(1)}%
                    </span>
                  </div>
                  {Math.abs(topPercent + heartPercent + basePercent - 100) >= 0.1 && (
                    <p className="text-xs text-red-600">Total must equal 100%</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Harmony Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Harmony Analysis</CardTitle>
                <CardDescription>Mathematical balance assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Harmony Score */}
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-purple-600">{harmonyResult.score}</span>
                    <span className="text-2xl text-purple-400">/100</span>
                  </div>
                  <Badge
                    variant={harmonyResult.level === 'Perfect' || harmonyResult.level === 'Excellent' ? 'default' : 'secondary'}
                    className="mb-2"
                  >
                    {harmonyResult.level}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{harmonyResult.feedback}</p>
                </div>

                {/* Golden Ratio Reference */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                    <h4 className="font-semibold">Golden Ratio Reference (φ = {PHI.toFixed(3)})</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-blue-50 rounded">
                      <span>Top Notes (Ideal)</span>
                      <span className="font-semibold">{goldenRatio.first.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between p-2 bg-purple-50 rounded">
                      <span>Heart Notes (Ideal)</span>
                      <span className="font-semibold">{goldenRatio.second.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between p-2 bg-amber-50 rounded">
                      <span>Base Notes (Ideal)</span>
                      <span className="font-semibold">{goldenRatio.third.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    setTopPercent(goldenRatio.first);
                    setHeartPercent(goldenRatio.second);
                    setBasePercent(goldenRatio.third);
                  }}
                >
                  Apply Golden Ratio
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <CardTitle>Composition Templates</CardTitle>
                </div>
                <CardDescription>
                  Professional formulas based on mathematics and perfumery traditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {COMPOSITION_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className="p-5 border-2 rounded-lg hover:border-purple-300 hover:bg-accent transition-all cursor-pointer"
                      onClick={() => handleTemplateApply(template)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg mb-1">{template.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {template.technique}
                          </Badge>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600">Top</span>
                          <span className="font-semibold">{template.topNotes.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${template.topNotes}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-purple-600">Heart</span>
                          <span className="font-semibold">{template.heartNotes.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-purple-500"
                            style={{ width: `${template.heartNotes}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-amber-600">Base</span>
                          <span className="font-semibold">{template.baseNotes.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-amber-500"
                            style={{ width: `${template.baseNotes}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground italic">{template.rationale}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mathematical Concepts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                    Le Nombre d'Or (φ)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Le nombre d'or (φ ≈ 1.618) est une proportion divine trouvée dans la nature, l'art et l'architecture.
                  </p>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm font-mono">φ = (1 + √5) / 2 ≈ 1.618033989</p>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Utilisé par les Grecs anciens</li>
                    <li>• Présent dans les coquillages, fleurs</li>
                    <li>• Crée un équilibre naturel</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Suite de Fibonacci
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Séquence mathématique où chaque nombre est la somme des deux précédents: 1, 1, 2, 3, 5, 8, 13...
                  </p>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-mono">F(n) = F(n-1) + F(n-2)</p>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Progressions harmonieuses naturelles</li>
                    <li>• Ratio converge vers φ</li>
                    <li>• Idéal pour compositions complexes</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
