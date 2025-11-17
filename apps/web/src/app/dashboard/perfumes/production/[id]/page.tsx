'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { GET_FORMULA_BY_ID, type Formula } from '@/graphql/perfume';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Package, Printer, FlaskConical, Scale } from 'lucide-react';
import { calculateFormulaCost, calculateBatchComparison, BATCH_SIZES, type BatchSize } from '@/lib/pricing';
import { cn } from '@/lib/utils';

export default function ProductionCalculatorPage() {
  const params = useParams();
  const router = useRouter();
  const formulaId = params.id as string;
  const [selectedBatch, setSelectedBatch] = useState<BatchSize>(BATCH_SIZES[3]); // 100ml default

  const { data, loading } = useQuery<{ getFormulaById: Formula }>(GET_FORMULA_BY_ID, {
    variables: { id: formulaId },
  });

  const formula = data?.getFormulaById;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading formula...</p>
        </div>
      </div>
    );
  }

  if (!formula) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Formula not found</h3>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Convert formula ingredients
  const ingredients = formula.ingredients.map((fi) => ({
    ingredient: fi.ingredient,
    percentage: fi.percentage,
  }));

  // Calculate costs for all batch sizes
  const batchComparison = calculateBatchComparison(ingredients, BATCH_SIZES);

  // Calculate for selected batch
  const selectedCost = calculateFormulaCost(ingredients, selectedBatch.volume);

  // Calculate quantities in grams (density 0.9 g/ml)
  const density = 0.9;
  const totalGrams = selectedBatch.volume * density;

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
            <h2 className="text-3xl font-bold tracking-tight">Production Calculator</h2>
            <p className="text-muted-foreground">{formula.name}</p>
          </div>
        </div>
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print Recipe
        </Button>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calculator">
            <Scale className="mr-2 h-4 w-4" />
            Batch Calculator
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <Package className="mr-2 h-4 w-4" />
            Batch Comparison
          </TabsTrigger>
        </TabsList>

        {/* CALCULATOR TAB */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Batch Size Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Select Batch Size</CardTitle>
                <CardDescription>Choose production volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {BATCH_SIZES.map((batch) => (
                    <Button
                      key={batch.label}
                      variant={selectedBatch.label === batch.label ? 'default' : 'outline'}
                      className="flex flex-col h-auto py-3"
                      onClick={() => setSelectedBatch(batch)}
                    >
                      <span className="text-lg font-bold">{batch.label}</span>
                      <span className="text-xs text-muted-foreground">{batch.unit}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
                <CardDescription>For {selectedBatch.label} batch</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200">
                  <div className="text-sm text-muted-foreground mb-1">Total Cost</div>
                  <div className="text-3xl font-bold text-emerald-600">
                    €{selectedCost.totalCost.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost per ml</span>
                    <span className="font-semibold">€{selectedCost.costPerMl.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total volume</span>
                    <span className="font-semibold">{selectedBatch.volume} ml</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total weight</span>
                    <span className="font-semibold">{totalGrams.toFixed(1)} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ingredients</span>
                    <span className="font-semibold">{formula.ingredients.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Production Info</CardTitle>
                <CardDescription>Batch characteristics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Batch Type</span>
                  <Badge>{selectedBatch.unit}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Difficulty</span>
                  <Badge variant="outline" className="capitalize">{formula.difficulty}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Target</span>
                  <Badge variant="secondary" className="capitalize">{formula.targetGender}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Density</span>
                  <Badge variant="outline">{density} g/ml</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ingredient List with Quantities */}
          <Card>
            <CardHeader>
              <CardTitle>Production Recipe - {selectedBatch.label}</CardTitle>
              <CardDescription>Exact quantities for this batch size</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 pb-2 border-b font-semibold text-sm">
                  <div className="col-span-5">Ingredient</div>
                  <div className="col-span-2 text-center">%</div>
                  <div className="col-span-2 text-right">Grams</div>
                  <div className="col-span-2 text-right">Cost (€)</div>
                  <div className="col-span-1 text-center">Note</div>
                </div>

                {/* Group by tenacity */}
                {['top', 'heart', 'base'].map((tenacity) => {
                  const notesOfType = selectedCost.ingredients.filter((item) => {
                    const ingredient = ingredients.find((i) => i.ingredient.id === item.ingredientId);
                    return ingredient?.ingredient.tenacity === tenacity;
                  });

                  if (notesOfType.length === 0) return null;

                  return (
                    <div key={tenacity} className="space-y-2">
                      <div className={cn(
                        "text-xs font-semibold uppercase mt-4 mb-2 px-2 py-1 rounded",
                        tenacity === 'top' && 'bg-blue-100 text-blue-700',
                        tenacity === 'heart' && 'bg-purple-100 text-purple-700',
                        tenacity === 'base' && 'bg-amber-100 text-amber-700'
                      )}>
                        {tenacity} Notes ({notesOfType.length})
                      </div>
                      {notesOfType.map((item) => (
                        <div key={item.ingredientId} className="grid grid-cols-12 gap-4 py-2 hover:bg-accent rounded px-2">
                          <div className="col-span-5 font-medium">{item.ingredientName}</div>
                          <div className="col-span-2 text-center">{item.percentage.toFixed(2)}%</div>
                          <div className="col-span-2 text-right font-semibold">{item.quantityGrams.toFixed(2)}g</div>
                          <div className="col-span-2 text-right text-emerald-600 font-semibold">
                            €{item.totalCost.toFixed(2)}
                          </div>
                          <div className="col-span-1 text-center">
                            <Badge variant="outline" className="text-xs capitalize">{tenacity[0]}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* Total Row */}
                <div className="grid grid-cols-12 gap-4 py-3 border-t-2 font-bold text-lg">
                  <div className="col-span-5">TOTAL</div>
                  <div className="col-span-2 text-center">100%</div>
                  <div className="col-span-2 text-right">{totalGrams.toFixed(2)}g</div>
                  <div className="col-span-2 text-right text-emerald-600">€{selectedCost.totalCost.toFixed(2)}</div>
                  <div className="col-span-1"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPARISON TAB */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Size Comparison</CardTitle>
              <CardDescription>Compare costs across different production volumes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {batchComparison.map((batch) => (
                  <div
                    key={batch.batchSize.label}
                    className="p-4 border-2 rounded-lg hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{batch.batchSize.label}</h4>
                        <p className="text-sm text-muted-foreground">{batch.batchSize.unit}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">
                          €{batch.totalCost.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          €{batch.costPerMl.toFixed(3)}/ml
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="ml-2 font-semibold">{batch.batchVolume} ml</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="ml-2 font-semibold">{(batch.batchVolume * density).toFixed(1)} g</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ingredients:</span>
                        <span className="ml-2 font-semibold">{batch.ingredients.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
