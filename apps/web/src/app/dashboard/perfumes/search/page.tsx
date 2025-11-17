'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import {
  GET_ALL_OLFACTIVE_FAMILIES,
  GET_ALL_INGREDIENTS,
  type OlfactiveFamily,
  type Ingredient,
} from '@/graphql/perfume';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronLeft,
  Search,
  X,
  Download,
  Save,
  Filter,
  BarChart3,
  RefreshCw,
  Bookmark,
} from 'lucide-react';
import {
  filterIngredients,
  getFilterStats,
  exportToCSV,
  DEFAULT_FILTERS,
  FILTER_PRESETS,
  TENACITY_OPTIONS,
  DIFFUSION_OPTIONS,
  NOTE_LEVEL_OPTIONS,
  saveFilterPreset,
  getSavedPresets,
  deleteFilterPreset,
  type SearchFilters,
  type FilterPreset,
} from '@/lib/advanced-search';
import { cn } from '@/lib/utils';

export default function AdvancedSearchPage() {
  const router = useRouter();

  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const { data: familiesData } = useQuery<{ getAllOlfactiveFamilies: OlfactiveFamily[] }>(
    GET_ALL_OLFACTIVE_FAMILIES
  );
  const { data: ingredientsData } = useQuery<{ getAllIngredients: Ingredient[] }>(
    GET_ALL_INGREDIENTS
  );

  const families = familiesData?.getAllOlfactiveFamilies || [];
  const allIngredients = ingredientsData?.getAllIngredients || [];

  // Load saved presets
  useMemo(() => {
    setSavedPresets(getSavedPresets());
  }, []);

  // Filter ingredients based on current filters
  const filteredIngredients = useMemo(() => {
    return filterIngredients(allIngredients, filters);
  }, [allIngredients, filters]);

  // Get statistics
  const stats = useMemo(() => {
    return getFilterStats(allIngredients, filteredIngredients);
  }, [allIngredients, filteredIngredients]);

  // Update filter
  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Toggle array filter
  const toggleArrayFilter = <K extends keyof SearchFilters>(
    key: K,
    value: string
  ) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as SearchFilters[K]);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Apply preset
  const applyPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
  };

  // Save current filters as preset
  const handleSavePreset = () => {
    if (presetName.trim()) {
      const preset = saveFilterPreset(presetName, presetDescription, filters);
      setSavedPresets([...savedPresets, preset]);
      setPresetName('');
      setPresetDescription('');
      setShowSavePreset(false);
    }
  };

  // Delete preset
  const handleDeletePreset = (id: string) => {
    deleteFilterPreset(id);
    setSavedPresets(savedPresets.filter((p) => p.id !== id));
  };

  // Export results
  const handleExport = () => {
    const csv = exportToCSV(filteredIngredients);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ingredients-search-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.families.length > 0) count++;
    if (filters.tenacities.length > 0) count++;
    if (filters.diffusions.length > 0) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) count++;
    if (filters.hasAllergens !== null) count++;
    if (filters.noteLevel.length > 0) count++;
    return count;
  }, [filters]);

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
              <Search className="h-8 w-8 text-purple-600" />
              Advanced Search
            </h2>
            <p className="text-muted-foreground">
              Multi-criteria filtering with preset management
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={filteredIngredients.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSavePreset(!showSavePreset)}>
            <Save className="mr-2 h-4 w-4" />
            Save Preset
          </Button>
        </div>
      </div>

      {/* Save Preset Form */}
      {showSavePreset && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Save Current Filters as Preset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Preset Name</Label>
                <Input
                  placeholder="e.g., My Favorite Florals"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Optional description"
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                <Bookmark className="mr-2 h-4 w-4" />
                Save Preset
              </Button>
              <Button variant="outline" onClick={() => setShowSavePreset(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Bar */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Results</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredIngredients.length}</div>
            <p className="text-xs text-muted-foreground">
              {stats.percentage.toFixed(0)}% of {stats.total} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Filters</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFilterCount}</div>
            <p className="text-xs text-muted-foreground">Criteria applied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              €{stats.averagePrice.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Per gram</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Family</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {Object.keys(stats.familyBreakdown).length > 0
                ? Object.entries(stats.familyBreakdown).sort((a, b) => b[1] - a[1])[0][0]
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Most common</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text Search */}
            <div className="space-y-2">
              <Label>Search Query</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ingredients..."
                  value={filters.query}
                  onChange={(e) => updateFilter('query', e.target.value)}
                  className="pl-8"
                />
                {filters.query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-6 w-6 p-0"
                    onClick={() => updateFilter('query', '')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label>Price Range (€/g)</Label>
              <div className="px-2">
                <Slider
                  min={0}
                  max={1000}
                  step={5}
                  value={[filters.priceRange.min, filters.priceRange.max]}
                  onValueChange={([min, max]) =>
                    updateFilter('priceRange', { min, max })
                  }
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>€{filters.priceRange.min}</span>
                <span>€{filters.priceRange.max}</span>
              </div>
            </div>

            {/* Olfactive Families */}
            <div className="space-y-2">
              <Label>Olfactive Families</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {families.slice(0, 8).map((family) => (
                  <div key={family.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`family-${family.id}`}
                      checked={filters.families.includes(family.id)}
                      onCheckedChange={() => toggleArrayFilter('families', family.id)}
                    />
                    <label
                      htmlFor={`family-${family.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {family.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tenacity */}
            <div className="space-y-2">
              <Label>Tenacity</Label>
              <div className="space-y-2">
                {TENACITY_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tenacity-${option}`}
                      checked={filters.tenacities.includes(option)}
                      onCheckedChange={() => toggleArrayFilter('tenacities', option)}
                    />
                    <label
                      htmlFor={`tenacity-${option}`}
                      className="text-sm font-medium leading-none capitalize cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Diffusion */}
            <div className="space-y-2">
              <Label>Diffusion</Label>
              <div className="space-y-2">
                {DIFFUSION_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`diffusion-${option}`}
                      checked={filters.diffusions.includes(option)}
                      onCheckedChange={() => toggleArrayFilter('diffusions', option)}
                    />
                    <label
                      htmlFor={`diffusion-${option}`}
                      className="text-sm font-medium leading-none capitalize cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Note Level */}
            <div className="space-y-2">
              <Label>Note Level</Label>
              <div className="space-y-2">
                {NOTE_LEVEL_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`note-${option}`}
                      checked={filters.noteLevel.includes(option)}
                      onCheckedChange={() => toggleArrayFilter('noteLevel', option)}
                    />
                    <label
                      htmlFor={`note-${option}`}
                      className="text-sm font-medium leading-none capitalize cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Allergens */}
            <div className="space-y-2">
              <Label>Allergens</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-allergens"
                    checked={filters.hasAllergens === true}
                    onCheckedChange={(checked) =>
                      updateFilter('hasAllergens', checked ? true : null)
                    }
                  />
                  <label
                    htmlFor="has-allergens"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    With Allergens
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="no-allergens"
                    checked={filters.hasAllergens === false}
                    onCheckedChange={(checked) =>
                      updateFilter('hasAllergens', checked ? false : null)
                    }
                  />
                  <label
                    htmlFor="no-allergens"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Without Allergens
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-4">
          <Tabs defaultValue="results">
            <TabsList>
              <TabsTrigger value="results">
                Results ({filteredIngredients.length})
              </TabsTrigger>
              <TabsTrigger value="presets">
                Presets ({FILTER_PRESETS.length + savedPresets.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>
                    {filteredIngredients.length} ingredient
                    {filteredIngredients.length !== 1 ? 's' : ''} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredIngredients.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-semibold mb-2">No ingredients found</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Try adjusting your filters or search query
                      </p>
                      <Button variant="outline" onClick={resetFilters}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset Filters
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredIngredients.map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={() =>
                            (window.location.href = `/dashboard/perfumes/ingredients/${ingredient.id}`)
                          }
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{ingredient.name}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {ingredient.description}
                              </p>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                              €{ingredient.pricePerGram.toFixed(2)}/g
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{ingredient.olfactiveFamily.name}</Badge>
                            <Badge variant="secondary" className="capitalize">
                              {ingredient.noteLevel}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                              {ingredient.tenacity}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                              {ingredient.diffusion}
                            </Badge>
                            {ingredient.allergens && ingredient.allergens.length > 0 && (
                              <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                                Allergens: {ingredient.allergens.length}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="presets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Built-in Presets</CardTitle>
                  <CardDescription>Quick filters for common searches</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {FILTER_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => applyPreset(preset)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{preset.name}</h4>
                          <p className="text-sm text-muted-foreground">{preset.description}</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {savedPresets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Saved Presets</CardTitle>
                    <CardDescription>Custom filter combinations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {savedPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className="p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1" onClick={() => applyPreset(preset)}>
                            <h4 className="font-semibold cursor-pointer">{preset.name}</h4>
                            <p className="text-sm text-muted-foreground">{preset.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => applyPreset(preset)}
                            >
                              Apply
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePreset(preset.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
