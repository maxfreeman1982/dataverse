'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Target,
  Zap,
  Brain,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Star,
  DollarSign,
  Shield,
  BarChart3,
} from 'lucide-react';
import {
  GET_ALL_FORMULAS,
  GET_ALL_INGREDIENTS,
  type Formula,
  type Ingredient,
} from '@/graphql/perfume';
import {
  suggestIngredients,
  findSimilarFormulas,
  generateOptimizationSuggestions,
  generateTrendInsights,
  calculateFormulaConfidence,
} from '@/lib/ai-recommendations';
import { cn } from '@/lib/utils';

export default function AISuggestionsPage() {
  const router = useRouter();

  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);

  const { data: formulasData } = useQuery<{ getAllFormulas: Formula[] }>(GET_ALL_FORMULAS);
  const { data: ingredientsData } = useQuery<{ getAllIngredients: Ingredient[] }>(
    GET_ALL_INGREDIENTS
  );

  const formulas = formulasData?.getAllFormulas || [];
  const ingredients = ingredientsData?.getAllIngredients || [];

  // Generate AI insights
  const trends = useMemo(() => generateTrendInsights(), []);

  const ingredientSuggestions = useMemo(() => {
    if (!selectedFormula) {
      return suggestIngredients([], ingredients, 8);
    }
    const currentIngredients = selectedFormula.ingredients.map((fi) => fi.ingredient);
    return suggestIngredients(currentIngredients, ingredients, 8);
  }, [selectedFormula, ingredients]);

  const similarFormulas = useMemo(() => {
    if (!selectedFormula || formulas.length <= 1) return [];
    return findSimilarFormulas(selectedFormula, formulas, 5);
  }, [selectedFormula, formulas]);

  const optimizations = useMemo(() => {
    if (!selectedFormula) return [];
    return generateOptimizationSuggestions(selectedFormula, ingredients);
  }, [selectedFormula, ingredients]);

  const confidence = useMemo(() => {
    if (!selectedFormula) return null;
    return calculateFormulaConfidence(selectedFormula);
  }, [selectedFormula]);

  // Get optimization icon
  const getOptIcon = (type: string) => {
    switch (type) {
      case 'cost':
        return <DollarSign className="h-5 w-5" />;
      case 'performance':
        return <Zap className="h-5 w-5" />;
      case 'compliance':
        return <Shield className="h-5 w-5" />;
      case 'balance':
        return <Target className="h-5 w-5" />;
      case 'innovation':
        return <Sparkles className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Get trend icon
  const getTrendIcon = (popularity: string) => {
    switch (popularity) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
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
              <Brain className="h-8 w-8 text-purple-600" />
              AI Suggestions
            </h2>
            <p className="text-muted-foreground">
              ML-powered recommendations and insights
            </p>
          </div>
        </div>
      </div>

      {/* Formula Selector */}
      <Card className="border-2 border-purple-200 bg-purple-50/30">
        <CardHeader>
          <CardTitle className="text-lg">Select Formula for Analysis</CardTitle>
          <CardDescription>Choose a formula to get personalized AI recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {formulas.slice(0, 6).map((formula) => (
              <button
                key={formula.id}
                className={cn(
                  'p-3 border-2 rounded-lg text-left transition-all hover:border-purple-400',
                  selectedFormula?.id === formula.id
                    ? 'border-purple-500 bg-purple-100'
                    : 'border-border bg-background'
                )}
                onClick={() => setSelectedFormula(formula)}
              >
                <div className="font-semibold text-sm">{formula.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formula.ingredients.length} ingredients
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="suggestions">
        <TabsList>
          <TabsTrigger value="suggestions">
            <Sparkles className="mr-2 h-4 w-4" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="optimize">
            <Target className="mr-2 h-4 w-4" />
            Optimize
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trends
          </TabsTrigger>
          {selectedFormula && (
            <TabsTrigger value="confidence">
              <BarChart3 className="mr-2 h-4 w-4" />
              Confidence Score
            </TabsTrigger>
          )}
        </TabsList>

        {/* Ingredient Suggestions */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Ingredients</CardTitle>
              <CardDescription>
                {selectedFormula
                  ? `AI-powered suggestions based on "${selectedFormula.name}"`
                  : 'Trending ingredients to start your composition'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ingredientSuggestions.map((suggestion) => (
                <div
                  key={suggestion.ingredient.id}
                  className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{suggestion.ingredient.name}</h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            suggestion.category === 'harmony' && 'bg-green-100 text-green-700 border-green-300',
                            suggestion.category === 'complement' && 'bg-blue-100 text-blue-700 border-blue-300',
                            suggestion.category === 'contrast' && 'bg-orange-100 text-orange-700 border-orange-300',
                            suggestion.category === 'trending' && 'bg-purple-100 text-purple-700 border-purple-300'
                          )}
                        >
                          {suggestion.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-purple-600">
                        {suggestion.score}
                      </div>
                      <div className="text-xs text-muted-foreground">Match Score</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex gap-3 text-muted-foreground">
                      <span>{suggestion.ingredient.olfactiveFamily.name}</span>
                      <span className="capitalize">{suggestion.ingredient.noteLevel}</span>
                      <span className="capitalize">{suggestion.ingredient.tenacity}</span>
                    </div>
                    <span className="text-emerald-600 font-semibold">
                      €{suggestion.ingredient.pricePerGram.toFixed(2)}/g
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Similar Formulas */}
          {similarFormulas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Similar Formulas</CardTitle>
                <CardDescription>Learn from compositions with similar characteristics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {similarFormulas.map((similar) => (
                  <div
                    key={similar.formula.id}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{similar.formula.name}</h4>
                        <p className="text-sm text-muted-foreground">{similar.reason}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {similar.similarity.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Similarity</div>
                      </div>
                    </div>
                    {similar.sharedIngredients.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {similar.sharedIngredients.map((ing) => (
                          <Badge key={ing} variant="secondary" className="text-xs">
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Optimizations */}
        <TabsContent value="optimize" className="space-y-4">
          {!selectedFormula ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Select a Formula</p>
                <p className="text-sm text-muted-foreground">
                  Choose a formula above to receive optimization suggestions
                </p>
              </CardContent>
            </Card>
          ) : optimizations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Formula Optimized!</p>
                <p className="text-sm text-muted-foreground">
                  No major optimization opportunities detected
                </p>
              </CardContent>
            </Card>
          ) : (
            optimizations.map((opt) => (
              <Card key={opt.id} className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={cn('p-2 rounded-lg', `bg-${opt.type}-100`)}>
                        {getOptIcon(opt.type)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{opt.title}</CardTitle>
                        <CardDescription>{opt.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getImpactColor(opt.impact)}>
                      {opt.impact} impact
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-semibold mb-1">Estimated Improvement</div>
                    <div className="text-emerald-600 font-semibold">{opt.estimatedImprovement}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-2">Actions:</div>
                    <div className="space-y-2">
                      {opt.actions.map((action, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            {action.ingredient && (
                              <span className="font-medium">{action.ingredient}: </span>
                            )}
                            {action.change}
                            {action.from !== undefined && action.to !== undefined && (
                              <span className="text-muted-foreground">
                                {' '}({action.from}% → {action.to}%)
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends & Insights</CardTitle>
              <CardDescription>AI-powered analysis of perfumery trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {trends.map((trend) => (
                <div
                  key={trend.id}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{trend.trend}</h4>
                        {getTrendIcon(trend.popularity)}
                      </div>
                      <Badge variant="outline" className="mb-2">
                        {trend.category}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{trend.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-green-600">
                        {trend.confidence}%
                      </div>
                      <div className="text-xs text-muted-foreground">Confidence</div>
                    </div>
                  </div>
                  {trend.suggestedIngredients.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase">
                        Suggested Ingredients
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trend.suggestedIngredients.map((ing) => (
                          <Badge key={ing} variant="secondary">
                            <Star className="h-3 w-3 mr-1" />
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confidence Score */}
        {confidence && (
          <TabsContent value="confidence" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Formula Confidence Score</CardTitle>
                <CardDescription>
                  AI evaluation of "{selectedFormula?.name}" composition quality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                  <div className="text-6xl font-bold text-purple-600 mb-2">
                    {confidence.overall}
                  </div>
                  <div className="text-lg font-semibold text-muted-foreground">
                    Overall Confidence
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Out of 100 points
                  </div>
                </div>

                {/* Factor Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Score Breakdown</h4>
                  {confidence.factors.map((factor) => (
                    <div key={factor.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{factor.name}</span>
                        <span className="text-muted-foreground">{factor.description}</span>
                      </div>
                      <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            'absolute h-full rounded-full transition-all',
                            factor.score >= 20 && 'bg-green-500',
                            factor.score >= 15 && factor.score < 20 && 'bg-blue-500',
                            factor.score >= 10 && factor.score < 15 && 'bg-orange-500',
                            factor.score < 10 && 'bg-red-500'
                          )}
                          style={{ width: `${(factor.score / 25) * 100}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {factor.score} / 25 points
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
