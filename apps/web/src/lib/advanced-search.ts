/**
 * Advanced Search and Filtering System
 * Multi-criteria filtering for ingredients with preset management
 */

import type { Ingredient } from '@/graphql/perfume';

export interface SearchFilters {
  query: string;
  families: string[];
  tenacities: string[];
  diffusions: string[];
  priceRange: {
    min: number;
    max: number;
  };
  hasAllergens: boolean | null;
  noteLevel: string[];
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: SearchFilters;
  createdAt: Date;
}

export const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  families: [],
  tenacities: [],
  diffusions: [],
  priceRange: {
    min: 0,
    max: 1000,
  },
  hasAllergens: null,
  noteLevel: [],
};

export const TENACITY_OPTIONS = ['weak', 'medium', 'strong', 'very strong'];
export const DIFFUSION_OPTIONS = ['poor', 'moderate', 'good', 'excellent'];
export const NOTE_LEVEL_OPTIONS = ['top', 'heart', 'base'];

/**
 * Filter ingredients based on search criteria
 */
export function filterIngredients(
  ingredients: Ingredient[],
  filters: SearchFilters
): Ingredient[] {
  return ingredients.filter((ingredient) => {
    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const searchableText = [
        ingredient.name,
        ingredient.description,
        ingredient.olfactiveFamily.name,
      ]
        .join(' ')
        .toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // Olfactive family filter
    if (filters.families.length > 0) {
      if (!filters.families.includes(ingredient.olfactiveFamily.id)) {
        return false;
      }
    }

    // Tenacity filter
    if (filters.tenacities.length > 0) {
      if (!filters.tenacities.includes(ingredient.tenacity)) {
        return false;
      }
    }

    // Diffusion filter
    if (filters.diffusions.length > 0) {
      if (!filters.diffusions.includes(ingredient.diffusion)) {
        return false;
      }
    }

    // Price range filter
    if (
      ingredient.pricePerGram < filters.priceRange.min ||
      ingredient.pricePerGram > filters.priceRange.max
    ) {
      return false;
    }

    // Allergen filter
    if (filters.hasAllergens !== null) {
      const hasAllergens = ingredient.allergens && ingredient.allergens.length > 0;
      if (filters.hasAllergens !== hasAllergens) {
        return false;
      }
    }

    // Note level filter
    if (filters.noteLevel.length > 0) {
      if (!filters.noteLevel.includes(ingredient.noteLevel)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get filter statistics
 */
export function getFilterStats(
  allIngredients: Ingredient[],
  filteredIngredients: Ingredient[]
): {
  total: number;
  filtered: number;
  percentage: number;
  averagePrice: number;
  familyBreakdown: Record<string, number>;
} {
  const total = allIngredients.length;
  const filtered = filteredIngredients.length;
  const percentage = total > 0 ? (filtered / total) * 100 : 0;

  const totalPrice = filteredIngredients.reduce(
    (sum, ing) => sum + ing.pricePerGram,
    0
  );
  const averagePrice = filtered > 0 ? totalPrice / filtered : 0;

  const familyBreakdown: Record<string, number> = {};
  filteredIngredients.forEach((ing) => {
    const family = ing.olfactiveFamily.name;
    familyBreakdown[family] = (familyBreakdown[family] || 0) + 1;
  });

  return {
    total,
    filtered,
    percentage,
    averagePrice,
    familyBreakdown,
  };
}

/**
 * Export filtered results to CSV
 */
export function exportToCSV(ingredients: Ingredient[]): string {
  const headers = [
    'Name',
    'Olfactive Family',
    'Tenacity',
    'Diffusion',
    'Note Level',
    'Price/g',
    'Has Allergens',
    'Description',
  ];

  const rows = ingredients.map((ing) => [
    ing.name,
    ing.olfactiveFamily.name,
    ing.tenacity,
    ing.diffusion,
    ing.noteLevel,
    ing.pricePerGram.toFixed(2),
    ing.allergens && ing.allergens.length > 0 ? 'Yes' : 'No',
    `"${ing.description.replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Predefined filter presets for common searches
 */
export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'luxury-ingredients',
    name: 'Luxury Ingredients',
    description: 'Premium high-cost materials',
    filters: {
      ...DEFAULT_FILTERS,
      priceRange: { min: 50, max: 1000 },
      tenacities: ['strong', 'very strong'],
    },
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'safe-for-sensitive',
    name: 'Safe for Sensitive Skin',
    description: 'Allergen-free ingredients',
    filters: {
      ...DEFAULT_FILTERS,
      hasAllergens: false,
    },
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'top-notes',
    name: 'Fresh Top Notes',
    description: 'Volatile opening notes',
    filters: {
      ...DEFAULT_FILTERS,
      noteLevel: ['top'],
      tenacities: ['weak', 'medium'],
    },
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'long-lasting-base',
    name: 'Long-lasting Base',
    description: 'Tenacious base notes',
    filters: {
      ...DEFAULT_FILTERS,
      noteLevel: ['base'],
      tenacities: ['strong', 'very strong'],
    },
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'floral-heart',
    name: 'Floral Heart Notes',
    description: 'Classic floral middle notes',
    filters: {
      ...DEFAULT_FILTERS,
      noteLevel: ['heart'],
      families: [], // Will be populated with floral family IDs
    },
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'budget-friendly',
    name: 'Budget-Friendly',
    description: 'Affordable ingredients under €10/g',
    filters: {
      ...DEFAULT_FILTERS,
      priceRange: { min: 0, max: 10 },
    },
    createdAt: new Date('2025-01-01'),
  },
];

/**
 * Save filter preset to localStorage
 */
export function saveFilterPreset(name: string, description: string, filters: SearchFilters): FilterPreset {
  const preset: FilterPreset = {
    id: `custom-${Date.now()}`,
    name,
    description,
    filters,
    createdAt: new Date(),
  };

  const saved = getSavedPresets();
  saved.push(preset);
  localStorage.setItem('filter-presets', JSON.stringify(saved));

  return preset;
}

/**
 * Get saved filter presets from localStorage
 */
export function getSavedPresets(): FilterPreset[] {
  if (typeof window === 'undefined') return [];

  const saved = localStorage.getItem('filter-presets');
  if (!saved) return [];

  try {
    return JSON.parse(saved).map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
    }));
  } catch {
    return [];
  }
}

/**
 * Delete a saved filter preset
 */
export function deleteFilterPreset(id: string): void {
  const saved = getSavedPresets();
  const filtered = saved.filter((p) => p.id !== id);
  localStorage.setItem('filter-presets', JSON.stringify(filtered));
}
