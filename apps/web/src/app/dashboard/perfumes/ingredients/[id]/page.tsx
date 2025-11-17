'use client';

import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { GET_INGREDIENT_BY_ID, type Ingredient } from '@/graphql/perfume';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Beaker, AlertTriangle, Droplet, Wind, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function IngredientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ingredientId = params.id as string;

  const { data, loading } = useQuery<{ getIngredientById: Ingredient }>(GET_INGREDIENT_BY_ID, {
    variables: { id: ingredientId },
  });

  const ingredient = data?.getIngredientById;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Beaker className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading ingredient details...</p>
        </div>
      </div>
    );
  }

  if (!ingredient) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ingredient not found</h3>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
            <h2 className="text-3xl font-bold tracking-tight">{ingredient.name}</h2>
            <p className="text-muted-foreground">{ingredient.olfactiveFamily.name} Family</p>
          </div>
        </div>
        <Button>
          <Beaker className="mr-2 h-4 w-4" />
          Use in Formula
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{ingredient.description}</p>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
              <CardDescription>Chemical and regulatory information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ingredient.casNumber && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">CAS Number</Label>
                    <p className="text-lg font-mono">{ingredient.casNumber}</p>
                  </div>
                </div>
              )}

              {ingredient.iupacName && (
                <div>
                  <Label className="text-sm font-medium">IUPAC Name</Label>
                  <p className="text-sm text-muted-foreground font-mono">{ingredient.iupacName}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mb-2" />
                  <Label className="text-xs mb-1">Tenacity</Label>
                  <Badge variant="secondary" className="capitalize">
                    {ingredient.tenacity}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ingredient.tenacity === 'top' && '0-15 min'}
                    {ingredient.tenacity === 'heart' && '15min-3h'}
                    {ingredient.tenacity === 'base' && '3h+'}
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <Wind className="h-8 w-8 text-purple-600 mb-2" />
                  <Label className="text-xs mb-1">Diffusion</Label>
                  <Badge variant="secondary" className="capitalize">
                    {ingredient.diffusion}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ingredient.diffusion === 'weak' && 'Low spread'}
                    {ingredient.diffusion === 'medium' && 'Moderate spread'}
                    {ingredient.diffusion === 'strong' && 'High spread'}
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <Droplet className="h-8 w-8 text-cyan-600 mb-2" />
                  <Label className="text-xs mb-1">Family</Label>
                  <Badge className="capitalize">{ingredient.olfactiveFamily.name}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allergens */}
          {ingredient.allergens.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <CardTitle>Allergens</CardTitle>
                </div>
                <CardDescription>
                  This ingredient contains {ingredient.allergens.length} regulated allergen(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ingredient.allergens.map((allergen) => (
                    <div
                      key={allergen.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-orange-50/50"
                    >
                      <div>
                        <h4 className="font-medium">{allergen.name}</h4>
                        {allergen.casNumber && (
                          <p className="text-xs text-muted-foreground">CAS: {allergen.casNumber}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-orange-600">
                          Max {allergen.regulatoryLimit}%
                        </div>
                        <p className="text-xs text-muted-foreground">Regulatory limit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Olfactive Family</span>
                <Badge>{ingredient.olfactiveFamily.name}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Note Level</span>
                <Badge variant="secondary" className="capitalize">
                  {ingredient.tenacity}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Diffusion</span>
                <Badge variant="secondary" className="capitalize">
                  {ingredient.diffusion}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Allergens</span>
                <Badge variant={ingredient.allergens.length > 0 ? 'destructive' : 'outline'}>
                  {ingredient.allergens.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Usage Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium mb-1">Typical Dosage</h4>
                <p className="text-muted-foreground">
                  {ingredient.tenacity === 'top' && '5-15% in formula'}
                  {ingredient.tenacity === 'heart' && '20-40% in formula'}
                  {ingredient.tenacity === 'base' && '15-30% in formula'}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Best Paired With</h4>
                <p className="text-muted-foreground">
                  Ingredients from {ingredient.olfactiveFamily.name} family work well together
                </p>
              </div>
              {ingredient.allergens.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1 text-orange-600">Safety Note</h4>
                  <p className="text-muted-foreground">
                    Contains allergens - check regulatory limits before use
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Added</span>
                <span className="font-medium">
                  {format(new Date(ingredient.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs">{ingredient.id.substring(0, 8)}...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
