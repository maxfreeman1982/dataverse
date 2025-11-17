'use client';

import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { GET_ALL_FORMULAS, GET_ALL_INGREDIENTS, type Formula, type Ingredient } from '@/graphql/perfume';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { calculateFormulaCost } from '@/lib/pricing';
import { generateComplianceReport, type FormulaIngredientInput } from '@/lib/compliance';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
  const router = useRouter();

  const { data: formulasData } = useQuery<{ getAllFormulas: Formula[] }>(GET_ALL_FORMULAS);
  const { data: ingredientsData } = useQuery<{ getAllIngredients: Ingredient[] }>(GET_ALL_INGREDIENTS);

  const formulas = formulasData?.getAllFormulas || [];
  const ingredients = ingredientsData?.getAllIngredients || [];

  // Calculate analytics
  const analytics = useMemo(() => {
    // Most used ingredients
    const ingredientUsage = new Map<string, number>();
    formulas.forEach((formula) => {
      formula.ingredients.forEach((fi) => {
        const count = ingredientUsage.get(fi.ingredient.name) || 0;
        ingredientUsage.set(fi.ingredient.name, count + 1);
      });
    });

    const topIngredients = Array.from(ingredientUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Distribution by olfactive family
    const familyCount = new Map<string, number>();
    formulas.forEach((formula) => {
      formula.ingredients.forEach((fi) => {
        const family = fi.ingredient.olfactiveFamily.name;
        familyCount.set(family, (familyCount.get(family) || 0) + 1);
      });
    });

    const familyDistribution = Array.from(familyCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    // Distribution by difficulty
    const difficultyCount = new Map<string, number>();
    formulas.forEach((formula) => {
      difficultyCount.set(formula.difficulty, (difficultyCount.get(formula.difficulty) || 0) + 1);
    });

    const difficultyDistribution = Array.from(difficultyCount.entries()).map(([name, count]) => ({ name, count }));

    // Distribution by gender
    const genderCount = new Map<string, number>();
    formulas.forEach((formula) => {
      genderCount.set(formula.targetGender, (genderCount.get(formula.targetGender) || 0) + 1);
    });

    const genderDistribution = Array.from(genderCount.entries()).map(([name, count]) => ({ name, count }));

    // Compliance stats
    let compliantCount = 0;
    let totalCost = 0;

    formulas.forEach((formula) => {
      const formulaIngredients = formula.ingredients.map((fi) => ({
        ingredient: fi.ingredient,
        percentage: fi.percentage,
      }));

      const compliance = generateComplianceReport(formulaIngredients as FormulaIngredientInput[]);
      if (compliance.isFullyCompliant) compliantCount++;

      const cost = calculateFormulaCost(formulaIngredients, 100);
      totalCost += cost.totalCost;
    });

    const averageCost = formulas.length > 0 ? totalCost / formulas.length : 0;
    const complianceRate = formulas.length > 0 ? (compliantCount / formulas.length) * 100 : 0;

    // Average ingredients per formula
    const totalIngredientsUsed = formulas.reduce((sum, f) => sum + f.ingredients.length, 0);
    const avgIngredientsPerFormula = formulas.length > 0 ? totalIngredientsUsed / formulas.length : 0;

    return {
      topIngredients,
      familyDistribution,
      difficultyDistribution,
      genderDistribution,
      averageCost,
      complianceRate,
      compliantCount,
      avgIngredientsPerFormula,
    };
  }, [formulas]);

  const maxIngredientUsage = Math.max(...analytics.topIngredients.map((i) => i.count), 1);
  const maxFamilyCount = Math.max(...analytics.familyDistribution.map((f) => f.count), 1);

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
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Analytics Dashboard
            </h2>
            <p className="text-muted-foreground">Insights and trends for your perfume library</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Formulas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formulas.length}</div>
            <p className="text-xs text-muted-foreground">Created compositions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost (100ml)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">€{analytics.averageCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per formula</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.complianceRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.compliantCount}/{formulas.length} compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Ingredients</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgIngredientsPerFormula.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Per formula</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top 10 Most Used Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Most Used Ingredients</CardTitle>
            <CardDescription>Frequency across all formulas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topIngredients.map((item, index) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-muted-foreground">{item.count} uses</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${(item.count / maxIngredientUsage) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {analytics.topIngredients.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Olfactive Family Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Olfactive Family Distribution</CardTitle>
            <CardDescription>Usage across all formulas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.familyDistribution.slice(0, 10).map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.count} uses</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ width: `${(item.count / maxFamilyCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {analytics.familyDistribution.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Difficulty Distribution</CardTitle>
            <CardDescription>Formulas by complexity level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.difficultyDistribution.map((item) => {
                const percentage =
                  formulas.length > 0 ? (item.count / formulas.length) * 100 : 0;
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{item.count}</span>
                        <span className="text-sm font-semibold">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          'h-full',
                          item.name === 'beginner' && 'bg-green-500',
                          item.name === 'intermediate' && 'bg-blue-500',
                          item.name === 'advanced' && 'bg-orange-500',
                          item.name === 'expert' && 'bg-red-500'
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Target Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Target Gender Distribution</CardTitle>
            <CardDescription>Formulas by target audience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.genderDistribution.map((item) => {
                const percentage =
                  formulas.length > 0 ? (item.count / formulas.length) * 100 : 0;
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{item.count}</span>
                        <span className="text-sm font-semibold">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          'h-full',
                          item.name === 'feminine' && 'bg-pink-500',
                          item.name === 'masculine' && 'bg-blue-500',
                          item.name === 'unisex' && 'bg-purple-500'
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
