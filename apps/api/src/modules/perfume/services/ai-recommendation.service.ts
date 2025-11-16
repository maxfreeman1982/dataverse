import { Injectable } from '@nestjs/common';
import { Ingredient, VolatilityLevel } from '../entities/ingredient.entity';
import { FormulaMood, FormulaStructureType } from '../entities/formula.entity';
import { FibonacciPerfumeEngine } from '../utils/fibonacci-engine';

export interface RecommendationRequest {
  mood?: FormulaMood;
  style?: string; // 'floral', 'woody', 'oriental', etc.
  region?: string; // 'africa', 'europe', 'asia', etc.
  olfactiveFamilies?: string[];
  existingIngredients?: string[];
  avoid?: string[]; // Ingredients to avoid
  naturalOnly?: boolean;
  budget?: 'low' | 'medium' | 'high' | 'luxury';
  complexity?: 'minimal' | 'simple' | 'medium' | 'complex' | 'very_complex';
}

export interface IngredientRecommendation {
  ingredient: Ingredient;
  score: number; // 0-100
  percentage: number; // Suggested percentage
  role: 'main' | 'supporting' | 'modifier' | 'booster' | 'fixer';
  reasoning: string[];
  synergies: string[];
  warnings?: string[];
}

export interface FormulaRecommendation {
  name: string;
  description: string;
  ingredients: IngredientRecommendation[];
  structure: FormulaStructureType;
  totalScore: number;
  olfactiveSignature: string;
  estimatedCost: number;
  moodAlignment: number; // How well it matches requested mood
}

@Injectable()
export class AIRecommendationService {
  /**
   * Generate AI-powered formula recommendations
   */
  async generateRecommendations(
    request: RecommendationRequest,
    availableIngredients: Ingredient[]
  ): Promise<FormulaRecommendation[]> {
    // Filter ingredients based on constraints
    let candidates = this.filterIngredients(availableIngredients, request);

    // Score each ingredient based on request
    const scoredIngredients = this.scoreIngredients(candidates, request);

    // Generate multiple formula variations
    const formulas: FormulaRecommendation[] = [];

    // Generate traditional pyramid structure
    formulas.push(
      await this.generateTraditionalFormula(scoredIngredients, request)
    );

    // Generate Fibonacci-based structure
    formulas.push(
      await this.generateFibonacciFormula(scoredIngredients, request)
    );

    // Generate golden ratio structure
    formulas.push(
      await this.generateGoldenRatioFormula(scoredIngredients, request)
    );

    return formulas.sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Filter ingredients based on request constraints
   */
  private filterIngredients(
    ingredients: Ingredient[],
    request: RecommendationRequest
  ): Ingredient[] {
    return ingredients.filter(ing => {
      // Filter by natural only
      if (request.naturalOnly && !ing.isNatural) return false;

      // Filter by avoid list
      if (request.avoid?.includes(ing.name)) return false;

      // Filter by budget
      if (request.budget && ing.pricePerKg) {
        const budgetRanges = {
          low: [0, 100],
          medium: [0, 500],
          high: [0, 2000],
          luxury: [0, Infinity],
        };
        const [min, max] = budgetRanges[request.budget];
        if (ing.pricePerKg < min || ing.pricePerKg > max) return false;
      }

      return true;
    });
  }

  /**
   * Score ingredients based on how well they match the request
   */
  private scoreIngredients(
    ingredients: Ingredient[],
    request: RecommendationRequest
  ): Array<{ ingredient: Ingredient; score: number; reasoning: string[] }> {
    return ingredients.map(ing => {
      let score = 50; // Base score
      const reasoning: string[] = [];

      // Score by olfactive family match
      if (request.olfactiveFamilies?.includes(ing.olfactiveFamily.name)) {
        score += 20;
        reasoning.push(`Matches requested family: ${ing.olfactiveFamily.name}`);
      }

      // Score by region
      if (request.region && ing.countryOfOrigin) {
        const regionMatch = this.checkRegionMatch(request.region, ing.countryOfOrigin);
        if (regionMatch) {
          score += 15;
          reasoning.push(`Regional match: ${ing.countryOfOrigin}`);
        }
      }

      // Score by cultural significance
      if (ing.culturalSignificance && ing.culturalSignificance.length > 0) {
        score += 10;
        reasoning.push('Has cultural significance');
      }

      // Score by synergies with existing ingredients
      if (request.existingIngredients) {
        const synergyCount = ing.synergiesWith?.filter(s =>
          request.existingIngredients!.includes(s)
        ).length || 0;

        if (synergyCount > 0) {
          score += synergyCount * 5;
          reasoning.push(`Synergizes with ${synergyCount} existing ingredients`);
        }
      }

      // Score by strength and diffusion (prefer balanced)
      const balance = Math.abs(ing.strength - ing.diffusion);
      if (balance <= 2) {
        score += 5;
        reasoning.push('Well-balanced strength and diffusion');
      }

      // Eco-responsible bonus
      if (ing.isEcoResponsible) {
        score += 5;
        reasoning.push('Eco-responsible source');
      }

      return { ingredient: ing, score, reasoning };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Generate traditional pyramid formula
   */
  private async generateTraditionalFormula(
    scoredIngredients: Array<{ ingredient: Ingredient; score: number; reasoning: string[] }>,
    request: RecommendationRequest
  ): Promise<FormulaRecommendation> {
    const complexity = request.complexity || 'medium';
    const optimalCount = FibonacciPerfumeEngine.optimalIngredientCount(complexity);

    const recommendations: IngredientRecommendation[] = [];

    // Select top notes
    const topNotes = scoredIngredients
      .filter(si => si.ingredient.volatility === VolatilityLevel.TOP ||
                    si.ingredient.volatility === VolatilityLevel.TOP_HEART)
      .slice(0, optimalCount.top);

    const topPercentages = FibonacciPerfumeEngine.spiralDistribution(
      topNotes.length,
      25, // 25% for top notes
      true
    );

    topNotes.forEach((si, i) => {
      recommendations.push({
        ingredient: si.ingredient,
        score: si.score,
        percentage: topPercentages[i],
        role: i === 0 ? 'main' : 'supporting',
        reasoning: si.reasoning,
        synergies: si.ingredient.synergiesWith || [],
      });
    });

    // Select heart notes
    const heartNotes = scoredIngredients
      .filter(si => si.ingredient.volatility === VolatilityLevel.HEART ||
                    si.ingredient.volatility === VolatilityLevel.HEART_BASE ||
                    si.ingredient.volatility === VolatilityLevel.TOP_HEART)
      .slice(0, optimalCount.heart);

    const heartPercentages = FibonacciPerfumeEngine.spiralDistribution(
      heartNotes.length,
      40, // 40% for heart notes
      false
    );

    heartNotes.forEach((si, i) => {
      recommendations.push({
        ingredient: si.ingredient,
        score: si.score,
        percentage: heartPercentages[i],
        role: i === 0 ? 'main' : 'supporting',
        reasoning: si.reasoning,
        synergies: si.ingredient.synergiesWith || [],
      });
    });

    // Select base notes
    const baseNotes = scoredIngredients
      .filter(si => si.ingredient.volatility === VolatilityLevel.BASE ||
                    si.ingredient.volatility === VolatilityLevel.HEART_BASE)
      .slice(0, optimalCount.base);

    const basePercentages = FibonacciPerfumeEngine.spiralDistribution(
      baseNotes.length,
      35, // 35% for base notes
      true
    );

    baseNotes.forEach((si, i) => {
      recommendations.push({
        ingredient: si.ingredient,
        score: si.score,
        percentage: basePercentages[i],
        role: i === 0 ? 'fixer' : 'supporting',
        reasoning: si.reasoning,
        synergies: si.ingredient.synergiesWith || [],
      });
    });

    const totalScore = this.calculateFormulaScore(recommendations);
    const estimatedCost = this.estimateCost(recommendations);

    return {
      name: this.generateFormulaName(request, 'Traditional'),
      description: 'Classic pyramid structure with harmonious top, heart, and base notes',
      ingredients: recommendations,
      structure: FormulaStructureType.TRADITIONAL_PYRAMID,
      totalScore,
      olfactiveSignature: this.generateOlfactiveSignature(recommendations),
      estimatedCost,
      moodAlignment: this.calculateMoodAlignment(recommendations, request.mood),
    };
  }

  /**
   * Generate Fibonacci-based formula
   */
  private async generateFibonacciFormula(
    scoredIngredients: Array<{ ingredient: Ingredient; score: number; reasoning: string[] }>,
    request: RecommendationRequest
  ): Promise<FormulaRecommendation> {
    const complexity = request.complexity || 'medium';
    const pyramidRatios = FibonacciPerfumeEngine.calculatePyramidRatios(
      complexity as 'simple' | 'medium' | 'complex'
    );
    const optimalCount = FibonacciPerfumeEngine.optimalIngredientCount(complexity);

    const recommendations: IngredientRecommendation[] = [];

    // Top notes using Fibonacci ratio
    const topNotes = scoredIngredients
      .filter(si => si.ingredient.volatility === VolatilityLevel.TOP ||
                    si.ingredient.volatility === VolatilityLevel.TOP_HEART)
      .slice(0, optimalCount.top);

    const topPercentages = FibonacciPerfumeEngine.spiralDistribution(
      topNotes.length,
      pyramidRatios.top,
      true
    );

    topNotes.forEach((si, i) => {
      recommendations.push({
        ingredient: si.ingredient,
        score: si.score,
        percentage: topPercentages[i],
        role: i === 0 ? 'main' : 'supporting',
        reasoning: [...si.reasoning, 'Fibonacci-distributed for harmonic balance'],
        synergies: si.ingredient.synergiesWith || [],
      });
    });

    // Heart notes
    const heartNotes = scoredIngredients
      .filter(si => si.ingredient.volatility === VolatilityLevel.HEART ||
                    si.ingredient.volatility === VolatilityLevel.HEART_BASE)
      .slice(0, optimalCount.heart);

    const heartPercentages = FibonacciPerfumeEngine.spiralDistribution(
      heartNotes.length,
      pyramidRatios.heart,
      false
    );

    heartNotes.forEach((si, i) => {
      recommendations.push({
        ingredient: si.ingredient,
        score: si.score,
        percentage: heartPercentages[i],
        role: 'main',
        reasoning: [...si.reasoning, 'Fibonacci spiral distribution'],
        synergies: si.ingredient.synergiesWith || [],
      });
    });

    // Base notes
    const baseNotes = scoredIngredients
      .filter(si => si.ingredient.volatility === VolatilityLevel.BASE)
      .slice(0, optimalCount.base);

    const basePercentages = FibonacciPerfumeEngine.spiralDistribution(
      baseNotes.length,
      pyramidRatios.base,
      true
    );

    baseNotes.forEach((si, i) => {
      recommendations.push({
        ingredient: si.ingredient,
        score: si.score,
        percentage: basePercentages[i],
        role: i === 0 ? 'fixer' : 'supporting',
        reasoning: [...si.reasoning, 'Fibonacci base structure'],
        synergies: si.ingredient.synergiesWith || [],
      });
    });

    const totalScore = this.calculateFormulaScore(recommendations);
    const estimatedCost = this.estimateCost(recommendations);

    return {
      name: this.generateFormulaName(request, 'Fibonacci'),
      description: `Mathematically optimized using Fibonacci sequence (${pyramidRatios.ratio}) for natural harmony`,
      ingredients: recommendations,
      structure: FormulaStructureType.FIBONACCI,
      totalScore,
      olfactiveSignature: this.generateOlfactiveSignature(recommendations),
      estimatedCost,
      moodAlignment: this.calculateMoodAlignment(recommendations, request.mood),
    };
  }

  /**
   * Generate golden ratio formula
   */
  private async generateGoldenRatioFormula(
    scoredIngredients: Array<{ ingredient: Ingredient; score: number; reasoning: string[] }>,
    request: RecommendationRequest
  ): Promise<FormulaRecommendation> {
    const complexity = request.complexity || 'medium';
    const optimalCount = FibonacciPerfumeEngine.optimalIngredientCount(complexity);

    const recommendations: IngredientRecommendation[] = [];

    // Use radial distribution based on golden angle
    const allSelected = [
      ...scoredIngredients.filter(si =>
        si.ingredient.volatility === VolatilityLevel.TOP ||
        si.ingredient.volatility === VolatilityLevel.TOP_HEART
      ).slice(0, optimalCount.top),
      ...scoredIngredients.filter(si =>
        si.ingredient.volatility === VolatilityLevel.HEART
      ).slice(0, optimalCount.heart),
      ...scoredIngredients.filter(si =>
        si.ingredient.volatility === VolatilityLevel.BASE
      ).slice(0, optimalCount.base),
    ];

    const radialPercentages = FibonacciPerfumeEngine.radialDistribution(
      allSelected.length,
      100
    );

    allSelected.forEach((si, i) => {
      let role: 'main' | 'supporting' | 'modifier' | 'booster' | 'fixer' = 'supporting';

      if (i === 0) role = 'main';
      else if (si.ingredient.volatility === VolatilityLevel.BASE) role = 'fixer';
      else if (si.ingredient.strength > 8) role = 'modifier';

      recommendations.push({
        ingredient: si.ingredient,
        score: si.score,
        percentage: radialPercentages[i],
        role,
        reasoning: [...si.reasoning, 'Golden angle radial distribution'],
        synergies: si.ingredient.synergiesWith || [],
      });
    });

    const totalScore = this.calculateFormulaScore(recommendations);
    const estimatedCost = this.estimateCost(recommendations);

    return {
      name: this.generateFormulaName(request, 'Golden Ratio'),
      description: 'Distributed using the golden angle (φ ≈ 1.618) for maximum diffusion and harmony',
      ingredients: recommendations,
      structure: FormulaStructureType.GOLDEN_RATIO,
      totalScore,
      olfactiveSignature: this.generateOlfactiveSignature(recommendations),
      estimatedCost,
      moodAlignment: this.calculateMoodAlignment(recommendations, request.mood),
    };
  }

  /**
   * Detect conflicts between ingredients
   */
  detectConflicts(ingredients: Ingredient[]): Array<{ ingredient1: string; ingredient2: string; reason: string }> {
    const conflicts: Array<{ ingredient1: string; ingredient2: string; reason: string }> = [];

    for (let i = 0; i < ingredients.length; i++) {
      for (let j = i + 1; j < ingredients.length; j++) {
        const ing1 = ingredients[i];
        const ing2 = ingredients[j];

        // Check explicit conflicts
        if (ing1.conflictsWith?.includes(ing2.name)) {
          conflicts.push({
            ingredient1: ing1.name,
            ingredient2: ing2.name,
            reason: 'Known incompatibility',
          });
        }

        // Check strength imbalance (very strong + very weak)
        if (Math.abs(ing1.strength - ing2.strength) > 6) {
          conflicts.push({
            ingredient1: ing1.name,
            ingredient2: ing2.name,
            reason: `Strength imbalance (${ing1.strength} vs ${ing2.strength})`,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Check region match
   */
  private checkRegionMatch(requestedRegion: string, origin: string): boolean {
    const regionMapping: Record<string, string[]> = {
      africa: ['Senegal', 'Mali', 'Burkina Faso', 'Ghana', 'Nigeria', 'Egypt', 'Morocco', 'Tunisia'],
      europe: ['France', 'Italy', 'Spain', 'Bulgaria', 'Russia'],
      asia: ['India', 'China', 'Thailand', 'Indonesia', 'Cambodia', 'Malaysia'],
      americas: ['USA', 'Brazil', 'Venezuela', 'Mexico', 'Guatemala'],
    };

    const regionCountries = regionMapping[requestedRegion.toLowerCase()] || [];
    return regionCountries.some(country => origin.includes(country));
  }

  /**
   * Calculate formula score
   */
  private calculateFormulaScore(recommendations: IngredientRecommendation[]): number {
    const avgScore = recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length;

    // Bonus for synergies
    let synergyBonus = 0;
    for (const rec of recommendations) {
      const synergyCount = rec.synergies.filter(s =>
        recommendations.some(r => r.ingredient.name === s)
      ).length;
      synergyBonus += synergyCount * 2;
    }

    return Math.min(100, avgScore + synergyBonus);
  }

  /**
   * Estimate formula cost
   */
  private estimateCost(recommendations: IngredientRecommendation[]): number {
    let totalCost = 0;
    for (const rec of recommendations) {
      if (rec.ingredient.pricePerKg) {
        const weightKg = (rec.percentage / 100) * 0.1; // Assuming 100g batch
        totalCost += weightKg * rec.ingredient.pricePerKg;
      }
    }
    return totalCost;
  }

  /**
   * Generate formula name
   */
  private generateFormulaName(request: RecommendationRequest, structure: string): string {
    const parts: string[] = [];

    if (request.mood) {
      parts.push(request.mood.charAt(0).toUpperCase() + request.mood.slice(1));
    }

    if (request.style) {
      parts.push(request.style.charAt(0).toUpperCase() + request.style.slice(1));
    }

    if (request.region) {
      parts.push(request.region.charAt(0).toUpperCase() + request.region.slice(1));
    }

    parts.push(structure);

    return parts.join(' ');
  }

  /**
   * Generate olfactive signature
   */
  private generateOlfactiveSignature(recommendations: IngredientRecommendation[]): string {
    const topNotes = recommendations
      .filter(r => r.ingredient.volatility === VolatilityLevel.TOP)
      .map(r => r.ingredient.odorProfile[0])
      .slice(0, 2);

    const heartNotes = recommendations
      .filter(r => r.ingredient.volatility === VolatilityLevel.HEART)
      .map(r => r.ingredient.odorProfile[0])
      .slice(0, 2);

    const baseNotes = recommendations
      .filter(r => r.ingredient.volatility === VolatilityLevel.BASE)
      .map(r => r.ingredient.odorProfile[0])
      .slice(0, 2);

    return `${topNotes.join('-')} / ${heartNotes.join('-')} / ${baseNotes.join('-')}`;
  }

  /**
   * Calculate mood alignment
   */
  private calculateMoodAlignment(
    recommendations: IngredientRecommendation[],
    targetMood?: FormulaMood
  ): number {
    if (!targetMood) return 50;

    // This would be more sophisticated with a mood-ingredient mapping database
    // For now, return a base score
    return 75;
  }
}
