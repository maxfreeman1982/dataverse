/**
 * Pricing & Cost Calculator for Perfume Formulas
 * Calculate costs, margins, ROI, and batch pricing
 */

import type { Ingredient } from '@/graphql/perfume';

// Mock pricing data (in real app, this would come from backend)
// Prices in EUR per gram
const INGREDIENT_PRICES: Record<string, number> = {
  // Default pricing tiers
  'top-note-default': 0.50,      // €0.50/g for top notes
  'heart-note-default': 0.75,    // €0.75/g for heart notes
  'base-note-default': 1.20,     // €1.20/g for base notes

  // Specific ingredient pricing (examples)
  'bergamot': 0.45,
  'lavender': 0.35,
  'rose': 1.50,
  'jasmine': 2.20,
  'oud': 15.00,
  'ambergris': 25.00,
  'vanilla': 0.80,
  'patchouli': 0.60,
};

export interface BatchSize {
  volume: number;        // in ml
  label: string;
  unit: string;
}

export const BATCH_SIZES: BatchSize[] = [
  { volume: 10, label: '10ml', unit: 'Sample' },
  { volume: 30, label: '30ml', unit: 'Travel Size' },
  { volume: 50, label: '50ml', unit: 'Standard' },
  { volume: 100, label: '100ml', unit: 'Large' },
  { volume: 500, label: '500ml', unit: 'Professional' },
  { volume: 1000, label: '1L', unit: 'Lab Batch' },
  { volume: 5000, label: '5L', unit: 'Production' },
  { volume: 10000, label: '10L', unit: 'Industrial' },
];

export interface IngredientCost {
  ingredientId: string;
  ingredientName: string;
  percentage: number;
  pricePerGram: number;
  quantityGrams: number;
  totalCost: number;
}

export interface FormulaCost {
  ingredients: IngredientCost[];
  totalCost: number;
  costPerMl: number;
  batchVolume: number;
}

export interface PricingAnalysis {
  formulaCost: FormulaCost;
  suggestedRetailPrice: number;
  profitMargin: number;
  profitMarginPercent: number;
  breakEvenUnits: number;
  roi: number;
}

/**
 * Get price per gram for an ingredient
 */
export function getIngredientPrice(ingredient: Ingredient): number {
  // First, check for specific ingredient pricing
  const ingredientKey = ingredient.name.toLowerCase().replace(/\s+/g, '-');
  if (INGREDIENT_PRICES[ingredientKey]) {
    return INGREDIENT_PRICES[ingredientKey];
  }

  // Fallback to tenacity-based pricing
  const tenacityKey = `${ingredient.tenacity}-note-default`;
  return INGREDIENT_PRICES[tenacityKey] || 1.0; // Default €1/g
}

/**
 * Calculate cost for a formula at a specific batch size
 */
export function calculateFormulaCost(
  ingredients: Array<{ ingredient: Ingredient; percentage: number }>,
  batchVolumeMl: number = 100
): FormulaCost {
  // Assume perfume density ≈ 0.9 g/ml (typical for alcohol-based perfumes)
  const densityGramsPerMl = 0.9;
  const totalGrams = batchVolumeMl * densityGramsPerMl;

  const ingredientCosts: IngredientCost[] = ingredients.map((item) => {
    const pricePerGram = getIngredientPrice(item.ingredient);
    const quantityGrams = (totalGrams * item.percentage) / 100;
    const totalCost = pricePerGram * quantityGrams;

    return {
      ingredientId: item.ingredient.id,
      ingredientName: item.ingredient.name,
      percentage: item.percentage,
      pricePerGram,
      quantityGrams,
      totalCost,
    };
  });

  const totalCost = ingredientCosts.reduce((sum, item) => sum + item.totalCost, 0);
  const costPerMl = totalCost / batchVolumeMl;

  return {
    ingredients: ingredientCosts,
    totalCost: Math.round(totalCost * 100) / 100,
    costPerMl: Math.round(costPerMl * 100) / 100,
    batchVolume: batchVolumeMl,
  };
}

/**
 * Calculate pricing analysis with margins and ROI
 */
export function calculatePricingAnalysis(
  formulaCost: FormulaCost,
  retailPrice: number,
  fixedCosts: number = 0 // packaging, labor, etc.
): PricingAnalysis {
  const totalCost = formulaCost.totalCost + fixedCosts;
  const profitMargin = retailPrice - totalCost;
  const profitMarginPercent = totalCost > 0 ? (profitMargin / totalCost) * 100 : 0;
  const breakEvenUnits = fixedCosts > 0 ? Math.ceil(fixedCosts / profitMargin) : 0;
  const roi = totalCost > 0 ? (profitMargin / totalCost) * 100 : 0;

  return {
    formulaCost,
    suggestedRetailPrice: retailPrice,
    profitMargin: Math.round(profitMargin * 100) / 100,
    profitMarginPercent: Math.round(profitMarginPercent * 100) / 100,
    breakEvenUnits,
    roi: Math.round(roi * 100) / 100,
  };
}

/**
 * Suggest retail price based on industry standards
 * Typical perfume markup: 5-10x cost for luxury brands
 */
export function suggestRetailPrice(
  formulaCost: FormulaCost,
  markupMultiplier: number = 7
): number {
  const baseCost = formulaCost.totalCost;

  // Add typical packaging costs (assume €5 for 100ml)
  const packagingCost = (formulaCost.batchVolume / 100) * 5;

  // Add labor and overhead (assume 20% of base cost)
  const overheadCost = baseCost * 0.2;

  const totalCost = baseCost + packagingCost + overheadCost;
  const suggestedPrice = totalCost * markupMultiplier;

  // Round to .99 pricing
  return Math.ceil(suggestedPrice) - 0.01;
}

/**
 * Calculate cost breakdown by note level
 */
export function calculateCostByNoteLevel(
  formulaCost: FormulaCost,
  ingredients: Array<{ ingredient: Ingredient; percentage: number }>
): {
  topNotesCost: number;
  heartNotesCost: number;
  baseNotesCost: number;
} {
  let topNotesCost = 0;
  let heartNotesCost = 0;
  let baseNotesCost = 0;

  formulaCost.ingredients.forEach((costItem) => {
    const ingredient = ingredients.find((i) => i.ingredient.id === costItem.ingredientId);
    if (!ingredient) return;

    const tenacity = ingredient.ingredient.tenacity;
    if (tenacity === 'top') {
      topNotesCost += costItem.totalCost;
    } else if (tenacity === 'heart') {
      heartNotesCost += costItem.totalCost;
    } else if (tenacity === 'base') {
      baseNotesCost += costItem.totalCost;
    }
  });

  return {
    topNotesCost: Math.round(topNotesCost * 100) / 100,
    heartNotesCost: Math.round(heartNotesCost * 100) / 100,
    baseNotesCost: Math.round(baseNotesCost * 100) / 100,
  };
}

/**
 * Compare costs across multiple batch sizes
 */
export function calculateBatchComparison(
  ingredients: Array<{ ingredient: Ingredient; percentage: number }>,
  batchSizes: BatchSize[]
): Array<FormulaCost & { batchSize: BatchSize }> {
  return batchSizes.map((batchSize) => {
    const cost = calculateFormulaCost(ingredients, batchSize.volume);
    return {
      ...cost,
      batchSize,
    };
  });
}

/**
 * Calculate most expensive ingredients
 */
export function getMostExpensiveIngredients(
  formulaCost: FormulaCost,
  topN: number = 5
): IngredientCost[] {
  return [...formulaCost.ingredients]
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, topN);
}

/**
 * Get pricing tier label
 */
export function getPricingTier(costPerMl: number): {
  tier: 'Budget' | 'Mid-Range' | 'Premium' | 'Luxury' | 'Ultra-Luxury';
  color: string;
} {
  if (costPerMl < 0.5) {
    return { tier: 'Budget', color: 'text-green-600' };
  } else if (costPerMl < 1.5) {
    return { tier: 'Mid-Range', color: 'text-blue-600' };
  } else if (costPerMl < 3.0) {
    return { tier: 'Premium', color: 'text-purple-600' };
  } else if (costPerMl < 5.0) {
    return { tier: 'Luxury', color: 'text-amber-600' };
  } else {
    return { tier: 'Ultra-Luxury', color: 'text-rose-600' };
  }
}
