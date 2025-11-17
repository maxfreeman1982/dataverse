'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { GET_ALL_FORMULAS, type Formula } from '@/graphql/perfume';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftRight, ChevronLeft, FlaskConical, TrendingUp, Shield, DollarSign, Check, X } from 'lucide-react';
import { calculateFormulaCost } from '@/lib/pricing';
import { generateComplianceReport, type FormulaIngredientInput } from '@/lib/compliance';
import { cn } from '@/lib/utils';

export default function FormulaComparatorPage() {
  const router = useRouter();
  const [formula1Id, setFormula1Id] = useState<string>('');
  const [formula2Id, setFormula2Id] = useState<string>('');
  const [formula3Id, setFormula3Id] = useState<string>('');

  const { data: formulasData } = useQuery<{ getAllFormulas: Formula[] }>(GET_ALL_FORMULAS);
  const formulas = formulasData?.getAllFormulas || [];

  const formula1 = formulas.find((f) => f.id === formula1Id);
  const formula2 = formulas.find((f) => f.id === formula2Id);
  const formula3 = formula3Id ? formulas.find((f) => f.id === formula3Id) : undefined;

  const selectedFormulas = [formula1, formula2, formula3].filter(Boolean) as Formula[];

  // Calculate data for each formula
  const formulaData = useMemo(() => {
    return selectedFormulas.map((formula) => {
      const ingredients = formula.ingredients.map((fi) => ({
        ingredient: fi.ingredient,
        percentage: fi.percentage,
      }));

      const cost = calculateFormulaCost(ingredients, 100);
      const compliance = generateComplianceReport(ingredients as FormulaIngredientInput[]);

      const topNotes = formula.ingredients.filter((fi) => fi.ingredient.tenacity === 'top');
      const heartNotes = formula.ingredients.filter((fi) => fi.ingredient.tenacity === 'heart');
      const baseNotes = formula.ingredients.filter((fi) => fi.ingredient.tenacity === 'base');

      return {
        formula,
        cost,
        compliance,
        topNotes,
        heartNotes,
        baseNotes,
        ingredientNames: formula.ingredients.map((fi) => fi.ingredient.name),
      };
    });
  }, [selectedFormulas]);

  // Find common and unique ingredients
  const comparison = useMemo(() => {
    if (formulaData.length < 2) return null;

    const allIngredients = new Set<string>();
    formulaData.forEach((data) => {
      data.ingredientNames.forEach((name) => allIngredients.add(name));
    });

    const commonIngredients = Array.from(allIngredients).filter((ingredient) => {
      return formulaData.every((data) => data.ingredientNames.includes(ingredient));
    });

    const uniqueIngredients = formulaData.map((data) => {
      return data.ingredientNames.filter((name) => !commonIngredients.includes(name));
    });

    return {
      commonIngredients,
      uniqueIngredients,
    };
  }, [formulaData]);

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
              <ArrowLeftRight className="h-8 w-8 text-purple-600" />
              Formula Comparator
            </h2>
            <p className="text-muted-foreground">Compare up to 3 formulas side by side</p>
          </div>
        </div>
      </div>

      {/* Formula Selectors */}
      <Card>
        <CardHeader>
          <CardTitle>Select Formulas to Compare</CardTitle>
          <CardDescription>Choose 2 or 3 formulas for detailed comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Formula 1 *</label>
              <Select value={formula1Id} onValueChange={setFormula1Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first formula" />
                </SelectTrigger>
                <SelectContent>
                  {formulas.map((formula) => (
                    <SelectItem key={formula.id} value={formula.id}>
                      {formula.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Formula 2 *</label>
              <Select value={formula2Id} onValueChange={setFormula2Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second formula" />
                </SelectTrigger>
                <SelectContent>
                  {formulas
                    .filter((f) => f.id !== formula1Id)
                    .map((formula) => (
                      <SelectItem key={formula.id} value={formula.id}>
                        {formula.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Formula 3 (Optional)</label>
              <Select value={formula3Id} onValueChange={setFormula3Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select third formula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {formulas
                    .filter((f) => f.id !== formula1Id && f.id !== formula2Id)
                    .map((formula) => (
                      <SelectItem key={formula.id} value={formula.id}>
                        {formula.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedFormulas.length >= 2 && (
        <>
          {/* Quick Stats Comparison */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedFormulas.length}, 1fr)` }}>
            {formulaData.map((data, index) => (
              <Card key={data.formula.id} className="border-2 border-purple-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{data.formula.name}</CardTitle>
                    <Badge variant="outline">Formula {index + 1}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{data.formula.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Ingredients:</span>
                      <span className="ml-2 font-semibold">{data.formula.ingredients.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="ml-2 font-semibold text-emerald-600">€{data.cost.totalCost.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="ml-2 font-semibold capitalize">{data.formula.targetGender}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className="ml-2 font-semibold capitalize">{data.formula.difficulty}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {data.compliance.isFullyCompliant ? (
                        <Shield className="h-4 w-4 text-green-600" />
                      ) : (
                        <Shield className="h-4 w-4 text-orange-600" />
                      )}
                      <span className={cn(
                        "text-sm font-semibold",
                        data.compliance.isFullyCompliant ? "text-green-600" : "text-orange-600"
                      )}>
                        {data.compliance.isFullyCompliant ? 'Compliant' : `${data.compliance.violationCount} Violations`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Olfactive Pyramid Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Olfactive Pyramid Comparison</CardTitle>
              <CardDescription>Note distribution across formulas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${selectedFormulas.length}, 1fr)` }}>
                {formulaData.map((data) => (
                  <div key={data.formula.id} className="space-y-4">
                    <h4 className="font-semibold text-center">{data.formula.name}</h4>

                    {/* Top Notes */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-600 font-semibold">Top Notes</span>
                        <span className="font-semibold">
                          {data.topNotes.reduce((sum, n) => sum + n.percentage, 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${data.topNotes.reduce((sum, n) => sum + n.percentage, 0)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.topNotes.length} ingredient{data.topNotes.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Heart Notes */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-600 font-semibold">Heart Notes</span>
                        <span className="font-semibold">
                          {data.heartNotes.reduce((sum, n) => sum + n.percentage, 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${data.heartNotes.reduce((sum, n) => sum + n.percentage, 0)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.heartNotes.length} ingredient{data.heartNotes.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Base Notes */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-amber-600 font-semibold">Base Notes</span>
                        <span className="font-semibold">
                          {data.baseNotes.reduce((sum, n) => sum + n.percentage, 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-amber-500"
                          style={{ width: `${data.baseNotes.reduce((sum, n) => sum + n.percentage, 0)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.baseNotes.length} ingredient{data.baseNotes.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cost Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Cost Comparison
              </CardTitle>
              <CardDescription>Pricing analysis for 100ml batch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedFormulas.length}, 1fr)` }}>
                {formulaData.map((data) => (
                  <div key={data.formula.id} className="space-y-3">
                    <h4 className="font-semibold text-center">{data.formula.name}</h4>
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                      <div className="text-2xl font-bold text-emerald-600">€{data.cost.totalCost.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Total Cost (100ml)</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost/ml:</span>
                        <span className="font-semibold">€{data.cost.costPerMl.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Most expensive:</span>
                        <span className="font-semibold text-xs">
                          {data.cost.ingredients.sort((a, b) => b.totalCost - a.totalCost)[0]?.ingredientName}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Difference */}
              {formulaData.length === 2 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Cost Difference:</span>
                    <span className="text-lg font-bold text-blue-600">
                      €{Math.abs(formulaData[0].cost.totalCost - formulaData[1].cost.totalCost).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formulaData[0].cost.totalCost > formulaData[1].cost.totalCost
                      ? `${formulaData[0].formula.name} is more expensive`
                      : `${formulaData[1].formula.name} is more expensive`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ingredient Comparison */}
          {comparison && (
            <Card>
              <CardHeader>
                <CardTitle>Ingredient Analysis</CardTitle>
                <CardDescription>Common and unique ingredients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Common Ingredients */}
                {comparison.commonIngredients.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold">Common Ingredients ({comparison.commonIngredients.length})</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {comparison.commonIngredients.map((ingredient) => (
                        <Badge key={ingredient} variant="default">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unique Ingredients */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedFormulas.length}, 1fr)` }}>
                  {formulaData.map((data, index) => (
                    <div key={data.formula.id}>
                      <div className="flex items-center gap-2 mb-3">
                        <X className="h-5 w-5 text-orange-600" />
                        <h4 className="font-semibold text-sm">
                          Unique to {data.formula.name} ({comparison.uniqueIngredients[index].length})
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {comparison.uniqueIngredients[index].length > 0 ? (
                          comparison.uniqueIngredients[index].map((ingredient) => (
                            <Badge key={ingredient} variant="outline">
                              {ingredient}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No unique ingredients</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Similarity Score */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Similarity Score:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {formulaData.length >= 2
                        ? Math.round(
                            (comparison.commonIngredients.length /
                              Math.max(formulaData[0].ingredientNames.length, formulaData[1].ingredientNames.length)) *
                              100
                          )}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on shared ingredients between formulas
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {selectedFormulas.length < 2 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FlaskConical className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select formulas to compare</h3>
            <p className="text-muted-foreground">Choose at least 2 formulas to see the comparison</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
