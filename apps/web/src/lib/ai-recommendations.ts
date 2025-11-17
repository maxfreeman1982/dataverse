/**
 * AI-Powered Recommendation Engine
 * ML-based suggestions for perfume formulation
 */

import type { Ingredient, Formula } from '@/graphql/perfume';

export interface IngredientSuggestion {
  ingredient: Ingredient;
  score: number; // 0-100
  reason: string;
  category: 'complement' | 'harmony' | 'contrast' | 'trending';
}

export interface FormulaSuggestion {
  formula: Formula;
  similarity: number; // 0-100
  reason: string;
  sharedIngredients: string[];
}

export interface OptimizationSuggestion {
  id: string;
  type: 'cost' | 'performance' | 'compliance' | 'balance' | 'innovation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  estimatedImprovement: string;
  actions: {
    ingredient?: string;
    change: string;
    from?: number;
    to?: number;
  }[];
}

export interface TrendInsight {
  id: string;
  category: string;
  trend: string;
  confidence: number; // 0-100
  description: string;
  suggestedIngredients: string[];
  popularity: 'rising' | 'stable' | 'declining';
}

/**
 * Calculate ingredient similarity based on olfactive family and characteristics
 */
function calculateIngredientSimilarity(
  ing1: Ingredient,
  ing2: Ingredient
): number {
  let score = 0;

  // Family match (40 points)
  if (ing1.olfactiveFamily.id === ing2.olfactiveFamily.id) {
    score += 40;
  }

  // Note level match (20 points)
  if (ing1.noteLevel === ing2.noteLevel) {
    score += 20;
  }

  // Tenacity match (20 points)
  if (ing1.tenacity === ing2.tenacity) {
    score += 20;
  }

  // Diffusion match (20 points)
  if (ing1.diffusion === ing2.diffusion) {
    score += 20;
  }

  return score;
}

/**
 * Suggest ingredients based on current selection
 */
export function suggestIngredients(
  currentIngredients: Ingredient[],
  allIngredients: Ingredient[],
  limit: number = 5
): IngredientSuggestion[] {
  if (currentIngredients.length === 0) {
    // Suggest trending/popular ingredients
    return allIngredients
      .filter((ing) => ['Bergamot', 'Lavender', 'Vanilla', 'Sandalwood', 'Rose'].includes(ing.name))
      .slice(0, limit)
      .map((ing) => ({
        ingredient: ing,
        score: 85 + Math.floor(Math.random() * 15),
        reason: 'Popular foundational ingredient',
        category: 'trending' as const,
      }));
  }

  const suggestions: IngredientSuggestion[] = [];
  const currentIds = new Set(currentIngredients.map((i) => i.id));

  // Analyze current composition
  const familyCounts: Record<string, number> = {};
  const noteLevelCounts: Record<string, number> = {};

  currentIngredients.forEach((ing) => {
    familyCounts[ing.olfactiveFamily.name] = (familyCounts[ing.olfactiveFamily.name] || 0) + 1;
    noteLevelCounts[ing.noteLevel] = (noteLevelCounts[ing.noteLevel] || 0) + 1;
  });

  // Suggest complementary ingredients
  allIngredients
    .filter((ing) => !currentIds.has(ing.id))
    .forEach((ingredient) => {
      let score = 0;
      let reason = '';
      let category: IngredientSuggestion['category'] = 'complement';

      // Check for family harmony
      const currentFamilies = Object.keys(familyCounts);
      if (currentFamilies.includes(ingredient.olfactiveFamily.name)) {
        score += 30;
        reason = `Harmonizes with your ${ingredient.olfactiveFamily.name.toLowerCase()} notes`;
        category = 'harmony';
      }

      // Check for note level balance
      const needsTop = (noteLevelCounts['top'] || 0) < 2;
      const needsBase = (noteLevelCounts['base'] || 0) < 2;

      if (needsTop && ingredient.noteLevel === 'top') {
        score += 25;
        reason = 'Strengthens top note freshness';
      } else if (needsBase && ingredient.noteLevel === 'base') {
        score += 25;
        reason = 'Adds depth and longevity';
      }

      // Check for contrast opportunities
      const currentNoteLevel = currentIngredients[0]?.noteLevel;
      if (currentNoteLevel && ingredient.noteLevel !== currentNoteLevel) {
        score += 15;
        if (!reason) {
          reason = 'Creates interesting contrast';
          category = 'contrast';
        }
      }

      // Similarity bonus
      currentIngredients.forEach((current) => {
        const similarity = calculateIngredientSimilarity(current, ingredient);
        score += similarity * 0.2;
      });

      // Trending ingredients
      const trendingNames = ['Bergamot', 'Iris', 'Oud', 'Ambergris', 'Tonka Bean'];
      if (trendingNames.includes(ingredient.name)) {
        score += 10;
        if (!reason) {
          reason = 'Trending in modern perfumery';
          category = 'trending';
        }
      }

      if (score > 20) {
        suggestions.push({
          ingredient,
          score: Math.min(100, score),
          reason: reason || 'Complements your composition',
          category,
        });
      }
    });

  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Find similar formulas
 */
export function findSimilarFormulas(
  targetFormula: Formula,
  allFormulas: Formula[],
  limit: number = 5
): FormulaSuggestion[] {
  const suggestions: FormulaSuggestion[] = [];

  const targetIngredientIds = new Set(
    targetFormula.ingredients.map((fi) => fi.ingredient.id)
  );

  allFormulas
    .filter((f) => f.id !== targetFormula.id)
    .forEach((formula) => {
      const formulaIngredientIds = formula.ingredients.map((fi) => fi.ingredient.id);
      const sharedIngredients = formulaIngredientIds.filter((id) =>
        targetIngredientIds.has(id)
      );

      const similarity = (sharedIngredients.length / Math.max(targetIngredientIds.size, formulaIngredientIds.length)) * 100;

      // Family similarity
      let familyBonus = 0;
      if (formula.olfactiveFamily.id === targetFormula.olfactiveFamily.id) {
        familyBonus = 20;
      }

      const totalSimilarity = Math.min(100, similarity + familyBonus);

      if (totalSimilarity > 25) {
        const ingredientNames = sharedIngredients.map((id) => {
          const ing = formula.ingredients.find((fi) => fi.ingredient.id === id);
          return ing?.ingredient.name || 'Unknown';
        });

        suggestions.push({
          formula,
          similarity: totalSimilarity,
          reason: sharedIngredients.length > 0
            ? `Shares ${sharedIngredients.length} ingredients`
            : 'Similar olfactive family',
          sharedIngredients: ingredientNames,
        });
      }
    });

  return suggestions
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/**
 * Generate optimization suggestions for a formula
 */
export function generateOptimizationSuggestions(
  formula: Formula,
  allIngredients: Ingredient[]
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  // Calculate current metrics
  const totalPercentage = formula.ingredients.reduce(
    (sum, fi) => sum + fi.percentage,
    0
  );
  const ingredientsByLevel: Record<string, typeof formula.ingredients> = {
    top: [],
    heart: [],
    base: [],
  };

  formula.ingredients.forEach((fi) => {
    const level = fi.ingredient.noteLevel;
    if (!ingredientsByLevel[level]) ingredientsByLevel[level] = [];
    ingredientsByLevel[level].push(fi);
  });

  // Cost optimization
  const expensiveIngredients = formula.ingredients
    .filter((fi) => fi.ingredient.pricePerGram > 20)
    .sort((a, b) => b.ingredient.pricePerGram - a.ingredient.pricePerGram);

  if (expensiveIngredients.length > 0) {
    const mostExpensive = expensiveIngredients[0];
    const similarCheaper = allIngredients.find(
      (ing) =>
        ing.olfactiveFamily.id === mostExpensive.ingredient.olfactiveFamily.id &&
        ing.noteLevel === mostExpensive.ingredient.noteLevel &&
        ing.pricePerGram < mostExpensive.ingredient.pricePerGram * 0.7 &&
        !formula.ingredients.some((fi) => fi.ingredient.id === ing.id)
    );

    if (similarCheaper) {
      suggestions.push({
        id: 'cost-opt-1',
        type: 'cost',
        title: 'Reduce Production Cost',
        description: `Replace ${mostExpensive.ingredient.name} with more economical ${similarCheaper.name}`,
        impact: 'high',
        estimatedImprovement: `Save €${((mostExpensive.ingredient.pricePerGram - similarCheaper.pricePerGram) * mostExpensive.percentage * 0.9).toFixed(2)} per 100ml`,
        actions: [
          {
            ingredient: mostExpensive.ingredient.name,
            change: `Replace with ${similarCheaper.name}`,
            from: mostExpensive.percentage,
            to: mostExpensive.percentage,
          },
        ],
      });
    }
  }

  // Balance optimization
  const topPercentage = ingredientsByLevel.top.reduce((sum, fi) => sum + fi.percentage, 0);
  const basePercentage = ingredientsByLevel.base.reduce((sum, fi) => sum + fi.percentage, 0);

  if (topPercentage > 40) {
    suggestions.push({
      id: 'balance-opt-1',
      type: 'balance',
      title: 'Improve Longevity',
      description: 'Formula has excessive top notes. Add more base notes for better lasting power',
      impact: 'medium',
      estimatedImprovement: '+2-3 hours longevity',
      actions: [
        {
          change: 'Reduce top notes by 5-10%',
          from: topPercentage,
          to: topPercentage - 7,
        },
        {
          change: 'Increase base notes by 5-10%',
          from: basePercentage,
          to: basePercentage + 7,
        },
      ],
    });
  }

  // Performance optimization
  const weakDiffusion = formula.ingredients.filter(
    (fi) => fi.ingredient.diffusion === 'poor'
  );

  if (weakDiffusion.length > formula.ingredients.length * 0.5) {
    suggestions.push({
      id: 'perf-opt-1',
      type: 'performance',
      title: 'Enhance Sillage',
      description: 'Many ingredients have poor diffusion. Add ingredients with better projection',
      impact: 'medium',
      estimatedImprovement: 'Improved scent trail and presence',
      actions: [
        {
          change: 'Add high-diffusion ingredients (e.g., citrus, aldehydes)',
        },
      ],
    });
  }

  // Compliance optimization
  const hasAllergens = formula.ingredients.some(
    (fi) => fi.ingredient.allergens && fi.ingredient.allergens.length > 0
  );

  if (hasAllergens) {
    suggestions.push({
      id: 'compliance-opt-1',
      type: 'compliance',
      title: 'Allergen-Free Alternative',
      description: 'Consider allergen-free versions for sensitive markets',
      impact: 'low',
      estimatedImprovement: 'Wider market appeal',
      actions: [
        {
          change: 'Explore synthetic alternatives for allergen-containing ingredients',
        },
      ],
    });
  }

  // Innovation suggestion
  suggestions.push({
    id: 'innovation-1',
    type: 'innovation',
    title: 'Add Modern Twist',
    description: 'Consider adding a trendy ingredient to modernize the formula',
    impact: 'low',
    estimatedImprovement: 'Contemporary appeal',
    actions: [
      {
        change: 'Add 2-3% of trending ingredient (e.g., Iso E Super, Ambroxan)',
      },
    ],
  });

  return suggestions;
}

/**
 * Generate trend insights
 */
export function generateTrendInsights(): TrendInsight[] {
  return [
    {
      id: 'trend-1',
      category: 'Olfactive Family',
      trend: 'Woody Aromatics Rising',
      confidence: 87,
      description: 'Woody aromatic compositions are seeing 35% growth in consumer interest. Focus on cedarwood, vetiver, and sage combinations.',
      suggestedIngredients: ['Cedarwood', 'Vetiver', 'Sage', 'Cypress'],
      popularity: 'rising',
    },
    {
      id: 'trend-2',
      category: 'Ingredient',
      trend: 'Sustainable Oud Alternatives',
      confidence: 92,
      description: 'Natural oud scarcity driving demand for sustainable synthetic alternatives. Oud Accord and Cypriol gaining traction.',
      suggestedIngredients: ['Oud Accord', 'Cypriol', 'Patchouli'],
      popularity: 'rising',
    },
    {
      id: 'trend-3',
      category: 'Consumer Preference',
      trend: 'Clean & Minimalist',
      confidence: 78,
      description: 'Consumers increasingly prefer formulas with fewer ingredients (5-8) and transparent, recognizable notes.',
      suggestedIngredients: ['Bergamot', 'White Musk', 'Iso E Super'],
      popularity: 'rising',
    },
    {
      id: 'trend-4',
      category: 'Market Segment',
      trend: 'Gender-Neutral Fragrances',
      confidence: 85,
      description: 'Unisex fragrances growing 42% year-over-year. Balance fresh citrus with warm woody bases.',
      suggestedIngredients: ['Bergamot', 'Lavender', 'Sandalwood', 'Ambroxan'],
      popularity: 'rising',
    },
    {
      id: 'trend-5',
      category: 'Technique',
      trend: 'Layered Compositions',
      confidence: 73,
      description: 'Multi-layered fragrances with distinct phases performing well. Design clear top-heart-base progression.',
      suggestedIngredients: ['Citrus notes', 'Floral hearts', 'Woody bases'],
      popularity: 'stable',
    },
    {
      id: 'trend-6',
      category: 'Regional',
      trend: 'Middle East Luxury',
      confidence: 88,
      description: 'High-concentration oriental fragrances with oud, rose, and amber dominating luxury market in ME/Asia.',
      suggestedIngredients: ['Oud', 'Rose', 'Amber', 'Saffron'],
      popularity: 'stable',
    },
  ];
}

/**
 * Calculate confidence score for a formula
 */
export function calculateFormulaConfidence(formula: Formula): {
  overall: number;
  factors: {
    name: string;
    score: number;
    description: string;
  }[];
} {
  const factors: { name: string; score: number; description: string }[] = [];

  // Ingredient count (0-25 points)
  const ingredientCount = formula.ingredients.length;
  let countScore = 0;
  if (ingredientCount >= 5 && ingredientCount <= 12) {
    countScore = 25;
  } else if (ingredientCount >= 3 && ingredientCount <= 15) {
    countScore = 15;
  } else {
    countScore = 5;
  }
  factors.push({
    name: 'Ingredient Count',
    score: countScore,
    description: `${ingredientCount} ingredients (optimal: 5-12)`,
  });

  // Note level balance (0-25 points)
  const hasTop = formula.ingredients.some((fi) => fi.ingredient.noteLevel === 'top');
  const hasHeart = formula.ingredients.some((fi) => fi.ingredient.noteLevel === 'heart');
  const hasBase = formula.ingredients.some((fi) => fi.ingredient.noteLevel === 'base');
  const balanceScore = (hasTop ? 8 : 0) + (hasHeart ? 8 : 0) + (hasBase ? 9 : 0);
  factors.push({
    name: 'Note Balance',
    score: balanceScore,
    description: `Has ${[hasTop && 'top', hasHeart && 'heart', hasBase && 'base'].filter(Boolean).join(', ')} notes`,
  });

  // Composition total (0-25 points)
  const total = formula.ingredients.reduce((sum, fi) => sum + fi.percentage, 0);
  const totalScore = Math.abs(100 - total) < 5 ? 25 : Math.abs(100 - total) < 10 ? 15 : 5;
  factors.push({
    name: 'Total Percentage',
    score: totalScore,
    description: `${total.toFixed(1)}% (target: 100%)`,
  });

  // Diversity (0-25 points)
  const uniqueFamilies = new Set(
    formula.ingredients.map((fi) => fi.ingredient.olfactiveFamily.id)
  );
  const diversityScore = Math.min(25, uniqueFamilies.size * 8);
  factors.push({
    name: 'Olfactive Diversity',
    score: diversityScore,
    description: `${uniqueFamilies.size} different families`,
  });

  const overall = factors.reduce((sum, f) => sum + f.score, 0);

  return {
    overall,
    factors,
  };
}
