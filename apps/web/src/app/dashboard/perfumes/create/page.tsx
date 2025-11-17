'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import {
  GET_ALL_INGREDIENTS,
  CREATE_FORMULA,
  type Ingredient,
  type CreateFormulaInput,
} from '@/graphql/perfume';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Plus, X, AlertTriangle, CheckCircle, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormulaIngredient {
  ingredient: Ingredient;
  percentage: number;
}

export default function CreateFormulaPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetGender, setTargetGender] = useState('unisex');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [selectedIngredients, setSelectedIngredients] = useState<FormulaIngredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: ingredientsData } = useQuery<{ getAllIngredients: Ingredient[] }>(GET_ALL_INGREDIENTS);
  const [createFormula, { loading: creating }] = useMutation(CREATE_FORMULA, {
    onCompleted: () => {
      router.push('/dashboard/perfumes');
    },
  });

  const ingredients = ingredientsData?.getAllIngredients || [];
  const totalPercentage = selectedIngredients.reduce((sum, item) => sum + item.percentage, 0);
  const isValid = totalPercentage === 100 && name.trim() !== '' && selectedIngredients.length > 0;

  // Filter ingredients by search term and exclude already selected
  const availableIngredients = ingredients.filter(
    (ing) =>
      !selectedIngredients.some((si) => si.ingredient.id === ing.id) &&
      (ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ing.olfactiveFamily.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addIngredient = useCallback((ingredient: Ingredient) => {
    setSelectedIngredients((prev) => [
      ...prev,
      { ingredient, percentage: 10 },
    ]);
    setSearchTerm('');
  }, []);

  const removeIngredient = useCallback((ingredientId: string) => {
    setSelectedIngredients((prev) => prev.filter((item) => item.ingredient.id !== ingredientId));
  }, []);

  const updatePercentage = useCallback((ingredientId: string, percentage: number) => {
    setSelectedIngredients((prev) =>
      prev.map((item) =>
        item.ingredient.id === ingredientId ? { ...item, percentage: Math.max(0, Math.min(100, percentage)) } : item
      )
    );
  }, []);

  // Group ingredients by tenacity (pyramid)
  const topNotes = selectedIngredients.filter((item) => item.ingredient.tenacity === 'top');
  const heartNotes = selectedIngredients.filter((item) => item.ingredient.tenacity === 'heart');
  const baseNotes = selectedIngredients.filter((item) => item.ingredient.tenacity === 'base');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    await createFormula({
      variables: {
        input: {
          name,
          description,
          targetGender,
          difficulty,
        },
      },
    });
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
            <h2 className="text-3xl font-bold tracking-tight">Create Formula</h2>
            <p className="text-muted-foreground">Compose your unique fragrance</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={!isValid || creating}>
          <FlaskConical className="mr-2 h-4 w-4" />
          {creating ? 'Creating...' : 'Save Formula'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Formula Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Formula Details</CardTitle>
              <CardDescription>Basic information about your fragrance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Midnight Garden"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the inspiration and character..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Target Gender</Label>
                <Select value={targetGender} onValueChange={setTargetGender}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feminine">Feminine</SelectItem>
                    <SelectItem value="masculine">Masculine</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Composition Status */}
          <Card>
            <CardHeader>
              <CardTitle>Composition Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Percentage</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-2xl font-bold',
                        totalPercentage === 100 ? 'text-green-600' : totalPercentage > 100 ? 'text-red-600' : 'text-orange-600'
                      )}
                    >
                      {totalPercentage.toFixed(1)}%
                    </span>
                    {totalPercentage === 100 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        totalPercentage === 100 ? 'bg-green-600' : totalPercentage > 100 ? 'bg-red-600' : 'bg-orange-600'
                      )}
                      style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalPercentage === 100
                      ? 'Perfect! Formula is balanced.'
                      : totalPercentage > 100
                      ? `Over by ${(totalPercentage - 100).toFixed(1)}%`
                      : `${(100 - totalPercentage).toFixed(1)}% remaining`}
                  </p>
                </div>

                <div className="pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ingredients</span>
                    <span className="font-medium">{selectedIngredients.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Top Notes</span>
                    <span className="font-medium">{topNotes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heart Notes</span>
                    <span className="font-medium">{heartNotes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Notes</span>
                    <span className="font-medium">{baseNotes.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Olfactive Pyramid */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Olfactive Pyramid</CardTitle>
              <CardDescription>Visual composition by note levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Top Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Top Notes (0-15 min)</Label>
                  <Badge variant="secondary">
                    {topNotes.reduce((sum, item) => sum + item.percentage, 0).toFixed(0)}%
                  </Badge>
                </div>
                <div className="space-y-2 pl-2 border-l-2 border-blue-500">
                  {topNotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No top notes yet</p>
                  ) : (
                    topNotes.map((item) => (
                      <div key={item.ingredient.id} className="flex items-center justify-between gap-2">
                        <span className="text-sm flex-1">{item.ingredient.name}</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-20 h-8 text-sm"
                            value={item.percentage}
                            onChange={(e) => updatePercentage(item.ingredient.id, parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span className="text-sm">%</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIngredient(item.ingredient.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Heart Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Heart Notes (15min-3h)</Label>
                  <Badge variant="secondary">
                    {heartNotes.reduce((sum, item) => sum + item.percentage, 0).toFixed(0)}%
                  </Badge>
                </div>
                <div className="space-y-2 pl-2 border-l-2 border-purple-500">
                  {heartNotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No heart notes yet</p>
                  ) : (
                    heartNotes.map((item) => (
                      <div key={item.ingredient.id} className="flex items-center justify-between gap-2">
                        <span className="text-sm flex-1">{item.ingredient.name}</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-20 h-8 text-sm"
                            value={item.percentage}
                            onChange={(e) => updatePercentage(item.ingredient.id, parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span className="text-sm">%</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIngredient(item.ingredient.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Base Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Base Notes (3h+)</Label>
                  <Badge variant="secondary">
                    {baseNotes.reduce((sum, item) => sum + item.percentage, 0).toFixed(0)}%
                  </Badge>
                </div>
                <div className="space-y-2 pl-2 border-l-2 border-amber-500">
                  {baseNotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No base notes yet</p>
                  ) : (
                    baseNotes.map((item) => (
                      <div key={item.ingredient.id} className="flex items-center justify-between gap-2">
                        <span className="text-sm flex-1">{item.ingredient.name}</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-20 h-8 text-sm"
                            value={item.percentage}
                            onChange={(e) => updatePercentage(item.ingredient.id, parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span className="text-sm">%</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIngredient(item.ingredient.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Ingredient Library */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Ingredient Library</CardTitle>
              <CardDescription>
                {ingredients.length} ingredients available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="max-h-[600px] overflow-y-auto space-y-2 pr-2">
                {availableIngredients.slice(0, 20).map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => addIngredient(ingredient)}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{ingredient.name}</h4>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {ingredient.olfactiveFamily.name}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {ingredient.tenacity}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {availableIngredients.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    {searchTerm ? 'No ingredients found' : 'All ingredients are in use'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
