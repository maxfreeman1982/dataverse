'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  GET_ALL_OLFACTIVE_FAMILIES,
  GET_ALL_INGREDIENTS,
  GET_ALL_FORMULAS,
  GET_ALL_ALLERGENS,
  type OlfactiveFamily,
  type Ingredient,
  type Formula,
  type Allergen
} from '@/graphql/perfume';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Beaker, FlaskConical, Flower2, AlertTriangle, Plus, Shield, ShieldAlert, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateComplianceReport, getComplianceStatus, type FormulaIngredientInput } from '@/lib/compliance';

export default function PerfumesPage() {
  const [exportingId, setExportingId] = useState<string | null>(null);

  const { data: familiesData, loading: familiesLoading } = useQuery<{ getAllOlfactiveFamilies: OlfactiveFamily[] }>(GET_ALL_OLFACTIVE_FAMILIES);
  const { data: ingredientsData, loading: ingredientsLoading } = useQuery<{ getAllIngredients: Ingredient[] }>(GET_ALL_INGREDIENTS);
  const { data: formulasData, loading: formulasLoading } = useQuery<{ getAllFormulas: Formula[] }>(GET_ALL_FORMULAS);
  const { data: allergensData, loading: allergensLoading } = useQuery<{ getAllAllergens: Allergen[] }>(GET_ALL_ALLERGENS);

  const families = familiesData?.getAllOlfactiveFamilies || [];
  const ingredients = ingredientsData?.getAllIngredients || [];
  const formulas = formulasData?.getAllFormulas || [];
  const allergens = allergensData?.getAllAllergens || [];

  const handleExportPDF = async (formulaId: string, formulaName: string) => {
    setExportingId(formulaId);
    try {
      const response = await fetch(`/api/formulas/${formulaId}/pdf`);
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formula-${formulaName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Perfume Architect Pro</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard/perfumes/notes'}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Note Library
          </Button>
          <Button onClick={() => window.location.href = '/dashboard/perfumes/create'}>
            <Plus className="mr-2 h-4 w-4" />
            New Formula
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingredients</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ingredients.length}</div>
            <p className="text-xs text-muted-foreground">
              Premium raw materials
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formulas</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formulas.length}</div>
            <p className="text-xs text-muted-foreground">
              Created compositions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Olfactive Families</CardTitle>
            <Flower2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{families.length}</div>
            <p className="text-xs text-muted-foreground">
              Fragrance categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allergens</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allergens.length}</div>
            <p className="text-xs text-muted-foreground">
              Monitored substances
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="ingredients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="formulas">Formulas</TabsTrigger>
          <TabsTrigger value="families">Olfactive Families</TabsTrigger>
          <TabsTrigger value="allergens">Allergens</TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingredients Library</CardTitle>
              <CardDescription>
                Manage your collection of {ingredients.length} premium ingredients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ingredientsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading ingredients...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {ingredients.slice(0, 10).map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div className="space-y-1">
                        <h4 className="font-semibold">{ingredient.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {ingredient.description.substring(0, 100)}...
                        </p>
                        <div className="flex gap-2 text-xs">
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                            {ingredient.olfactiveFamily.name}
                          </span>
                          <span className="rounded-full bg-secondary px-2 py-1">
                            Tenacity: {ingredient.tenacity}
                          </span>
                          <span className="rounded-full bg-secondary px-2 py-1">
                            Diffusion: {ingredient.diffusion}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/dashboard/perfumes/ingredients/${ingredient.id}`}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                  {ingredients.length > 10 && (
                    <div className="text-center">
                      <Button variant="outline">View All {ingredients.length} Ingredients</Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Formula Collection</CardTitle>
              <CardDescription>
                Browse and manage your perfume formulas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formulasLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading formulas...</div>
                </div>
              ) : formulas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No formulas yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first perfume formula to get started
                  </p>
                  <Button onClick={() => window.location.href = '/dashboard/perfumes/create'}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Formula
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formulas.map((formula) => {
                    // Calculate compliance for each formula
                    const formulaIngredients: FormulaIngredientInput[] = formula.ingredients.map((fi) => ({
                      ingredient: fi.ingredient,
                      percentage: fi.percentage,
                    }));
                    const complianceReport = generateComplianceReport(formulaIngredients);
                    const complianceStatus = getComplianceStatus(complianceReport);

                    return (
                      <div
                        key={formula.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{formula.name}</h4>
                            {complianceReport.isFullyCompliant ? (
                              <Shield className="h-4 w-4 text-green-600" />
                            ) : (
                              <ShieldAlert className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{formula.description}</p>
                          <div className="flex gap-2 text-xs flex-wrap">
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                              {formula.targetGender}
                            </span>
                            <span className="rounded-full bg-secondary px-2 py-1">
                              {formula.difficulty}
                            </span>
                            <span className="rounded-full bg-secondary px-2 py-1">
                              {formula.ingredients.length} ingredients
                            </span>
                            <span className={`rounded-full px-2 py-1 ${
                              complianceReport.isFullyCompliant
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {complianceStatus.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportPDF(formula.id, formula.name)}
                            disabled={exportingId === formula.id}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/dashboard/perfumes/formulas/${formula.id}/compliance`}
                          >
                            Compliance
                          </Button>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="families" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Olfactive Families</CardTitle>
              <CardDescription>
                Explore the {families.length} fragrance categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {familiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading families...</div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {families.map((family) => (
                    <Card key={family.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{family.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{family.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allergens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Allergen Database</CardTitle>
              <CardDescription>
                Monitor {allergens.length} regulated substances
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allergensLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading allergens...</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {allergens.map((allergen) => (
                    <div
                      key={allergen.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <h4 className="font-medium">{allergen.name}</h4>
                        {allergen.casNumber && (
                          <p className="text-xs text-muted-foreground">CAS: {allergen.casNumber}</p>
                        )}
                      </div>
                      <span className="text-sm font-medium text-orange-600">
                        Limit: {allergen.regulatoryLimit}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
