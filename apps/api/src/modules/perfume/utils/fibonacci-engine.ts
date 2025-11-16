/**
 * FIBONACCI PERFUME ENGINE
 *
 * Revolutionary mathematical approach to perfume formulation using:
 * - Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...)
 * - Golden Ratio (φ ≈ 1.618033988749...)
 * - Harmonic proportions
 * - Fractal structures
 * - Spiral distributions
 *
 * Traditional pyramid: Top 20-30%, Heart 30-50%, Base 30-40%
 * Fibonacci approach: Top 3/(3+5+8) = 18.75%, Heart 5/16 = 31.25%, Base 8/16 = 50%
 */

export class FibonacciPerfumeEngine {
  // Golden ratio constant
  static readonly PHI = 1.618033988749894848204586834365638;

  // Fibonacci sequence (first 20 numbers)
  static readonly FIBONACCI_SEQUENCE = [
    0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181
  ];

  /**
   * Generate Fibonacci number at position n
   */
  static fibonacci(n: number): number {
    if (n < this.FIBONACCI_SEQUENCE.length) {
      return this.FIBONACCI_SEQUENCE[n];
    }
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  }

  /**
   * Calculate golden ratio distribution for pyramid structure
   * Uses Fibonacci ratios: 3:5:8 for Top:Heart:Base
   */
  static calculatePyramidRatios(complexity: 'simple' | 'medium' | 'complex' = 'medium'): {
    top: number;
    heart: number;
    base: number;
    ratio: string;
  } {
    let topFib: number, heartFib: number, baseFib: number;

    switch (complexity) {
      case 'simple':
        // 2:3:5 - simpler, more linear
        topFib = 2;
        heartFib = 3;
        baseFib = 5;
        break;
      case 'medium':
        // 3:5:8 - classic balanced
        topFib = 3;
        heartFib = 5;
        baseFib = 8;
        break;
      case 'complex':
        // 5:8:13 - more complex, deeper base
        topFib = 5;
        heartFib = 8;
        baseFib = 13;
        break;
    }

    const total = topFib + heartFib + baseFib;

    return {
      top: (topFib / total) * 100,
      heart: (heartFib / total) * 100,
      base: (baseFib / total) * 100,
      ratio: `${topFib}:${heartFib}:${baseFib}`,
    };
  }

  /**
   * Calculate golden ratio between two values
   */
  static goldenRatio(value: number, inverse: boolean = false): number {
    return inverse ? value / this.PHI : value * this.PHI;
  }

  /**
   * Distribute ingredients across a formula using Fibonacci spiral
   * Creates a "spiral" distribution where each ingredient's percentage
   * relates to others via golden ratio
   */
  static spiralDistribution(
    ingredientCount: number,
    totalPercentage: number,
    reverse: boolean = false
  ): number[] {
    if (ingredientCount === 0) return [];
    if (ingredientCount === 1) return [totalPercentage];

    const percentages: number[] = [];
    let remainingPercentage = totalPercentage;

    // Generate Fibonacci-based weights
    const weights: number[] = [];
    for (let i = 0; i < ingredientCount; i++) {
      const fibIndex = reverse ? ingredientCount - i + 1 : i + 2;
      weights.push(this.fibonacci(fibIndex));
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // Distribute percentages based on weights
    for (let i = 0; i < ingredientCount; i++) {
      const percentage = (weights[i] / totalWeight) * totalPercentage;
      percentages.push(percentage);
      remainingPercentage -= percentage;
    }

    // Distribute any remainder due to rounding
    if (remainingPercentage > 0.01) {
      percentages[0] += remainingPercentage;
    }

    return percentages;
  }

  /**
   * Create fractal accord - micro-accords that repeat the macro structure
   * Each section (top/heart/base) mirrors the overall pyramid structure
   */
  static fractalAccordDistribution(
    ingredients: { volatility: 'top' | 'heart' | 'base'; weight?: number }[],
    totalPercentage: number = 100
  ): Map<number, number> {
    const distribution = new Map<number, number>();

    // Group by volatility
    const grouped = {
      top: ingredients.filter(i => i.volatility === 'top'),
      heart: ingredients.filter(i => i.volatility === 'heart'),
      base: ingredients.filter(i => i.volatility === 'base'),
    };

    // Get main pyramid ratios (3:5:8)
    const pyramidRatios = this.calculatePyramidRatios('medium');

    // Calculate percentage for each section
    const topPercentage = (pyramidRatios.top / 100) * totalPercentage;
    const heartPercentage = (pyramidRatios.heart / 100) * totalPercentage;
    const basePercentage = (pyramidRatios.base / 100) * totalPercentage;

    // Within each section, apply fibonacci spiral distribution
    let currentIndex = 0;

    // Top notes - descending spiral (brightest first)
    const topDistribution = this.spiralDistribution(grouped.top.length, topPercentage, true);
    grouped.top.forEach((_, i) => {
      distribution.set(currentIndex++, topDistribution[i]);
    });

    // Heart notes - ascending spiral (builds complexity)
    const heartDistribution = this.spiralDistribution(grouped.heart.length, heartPercentage, false);
    grouped.heart.forEach((_, i) => {
      distribution.set(currentIndex++, heartDistribution[i]);
    });

    // Base notes - descending spiral (strongest fixatives first)
    const baseDistribution = this.spiralDistribution(grouped.base.length, basePercentage, true);
    grouped.base.forEach((_, i) => {
      distribution.set(currentIndex++, baseDistribution[i]);
    });

    return distribution;
  }

  /**
   * Calculate harmonic series for ingredient distribution
   * Uses harmonic mean instead of arithmetic mean
   */
  static harmonicDistribution(
    ingredientCount: number,
    totalPercentage: number
  ): number[] {
    if (ingredientCount === 0) return [];
    if (ingredientCount === 1) return [totalPercentage];

    const harmonics: number[] = [];
    let harmonicSum = 0;

    // Generate harmonic series: 1, 1/2, 1/3, 1/4, ...
    for (let i = 1; i <= ingredientCount; i++) {
      const harmonic = 1 / i;
      harmonics.push(harmonic);
      harmonicSum += harmonic;
    }

    // Distribute based on harmonic weights
    return harmonics.map(h => (h / harmonicSum) * totalPercentage);
  }

  /**
   * Generate optimal ingredient count based on complexity level
   * Using Fibonacci numbers as natural ingredient counts
   */
  static optimalIngredientCount(complexity: 'minimal' | 'simple' | 'medium' | 'complex' | 'very_complex'): {
    total: number;
    top: number;
    heart: number;
    base: number;
  } {
    switch (complexity) {
      case 'minimal':
        // 3 total (1 top, 1 heart, 1 base)
        return { total: 3, top: 1, heart: 1, base: 1 };
      case 'simple':
        // 5 total (1 top, 2 heart, 2 base)
        return { total: 5, top: 1, heart: 2, base: 2 };
      case 'medium':
        // 8 total (2 top, 3 heart, 3 base)
        return { total: 8, top: 2, heart: 3, base: 3 };
      case 'complex':
        // 13 total (3 top, 5 heart, 5 base)
        return { total: 13, top: 3, heart: 5, base: 5 };
      case 'very_complex':
        // 21 total (5 top, 8 heart, 8 base)
        return { total: 21, top: 5, heart: 8, base: 8 };
    }
  }

  /**
   * Create golden spiral curve for gradual transitions
   * Useful for smooth volatility curves
   */
  static goldenSpiralCurve(points: number): number[] {
    const curve: number[] = [];
    const angleIncrement = 2 * Math.PI / this.PHI;

    for (let i = 0; i < points; i++) {
      const angle = i * angleIncrement;
      const radius = Math.pow(this.PHI, angle / (2 * Math.PI));
      curve.push(radius);
    }

    // Normalize to 0-1 range
    const max = Math.max(...curve);
    return curve.map(v => v / max);
  }

  /**
   * Calculate synergy score between ingredients using golden ratio
   * Higher score when ratios between strength values approach PHI
   */
  static calculateSynergyScore(
    strength1: number,
    strength2: number,
    diffusion1: number,
    diffusion2: number
  ): number {
    const strengthRatio = Math.max(strength1, strength2) / Math.min(strength1, strength2);
    const diffusionRatio = Math.max(diffusion1, diffusion2) / Math.min(diffusion1, diffusion2);

    // Calculate how close ratios are to golden ratio
    const strengthScore = 1 - Math.abs(strengthRatio - this.PHI) / this.PHI;
    const diffusionScore = 1 - Math.abs(diffusionRatio - this.PHI) / this.PHI;

    // Average the scores
    return ((strengthScore + diffusionScore) / 2) * 100;
  }

  /**
   * Generate Fibonacci-based dilution series
   * For creating dilution scales: 1%, 1.618%, 2.618%, 4.236%, etc.
   */
  static fibonacciDilutionSeries(baseConcentration: number, steps: number = 5): number[] {
    const series: number[] = [baseConcentration];

    for (let i = 1; i < steps; i++) {
      const nextConcentration = series[i - 1] * this.PHI;
      series.push(Number(nextConcentration.toFixed(3)));
    }

    return series;
  }

  /**
   * Calculate complexity score of a formula based on Fibonacci principles
   */
  static calculateComplexityScore(
    ingredientCount: number,
    uniqueFamilies: number,
    layerDepth: number
  ): number {
    // Find closest Fibonacci numbers
    const closestFibIndex = this.FIBONACCI_SEQUENCE.findIndex(f => f >= ingredientCount);
    const fibonacciScore = (closestFibIndex / this.FIBONACCI_SEQUENCE.length) * 40;

    const familyScore = Math.min((uniqueFamilies / 8) * 30, 30); // Max 8 families
    const depthScore = Math.min((layerDepth / 5) * 30, 30); // Max 5 layers

    return Math.round(fibonacciScore + familyScore + depthScore);
  }

  /**
   * Generate radial distribution (like petals of a flower)
   * Ingredients distributed in circular/radial pattern using golden angle
   */
  static radialDistribution(ingredientCount: number, totalPercentage: number): number[] {
    if (ingredientCount === 0) return [];
    if (ingredientCount === 1) return [totalPercentage];

    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ≈ 137.5 degrees
    const percentages: number[] = [];
    let totalRadius = 0;

    // Calculate radius for each ingredient using golden angle
    const radii: number[] = [];
    for (let i = 0; i < ingredientCount; i++) {
      const angle = i * goldenAngle;
      const radius = Math.sqrt(i + 1); // Square root spiral
      radii.push(radius);
      totalRadius += radius;
    }

    // Convert radii to percentages
    for (let i = 0; i < ingredientCount; i++) {
      percentages.push((radii[i] / totalRadius) * totalPercentage);
    }

    return percentages;
  }

  /**
   * Create balanced accord using golden ratio proportions
   * Ensures main note and supporting notes are in PHI relationship
   */
  static createBalancedAccord(
    mainNotePercentage: number,
    supportingNotesCount: number
  ): { main: number; supporting: number[] } {
    // Main note takes PHI proportion of total
    const total = mainNotePercentage;
    const mainPercentage = total / this.PHI;
    const supportingTotal = total - mainPercentage;

    // Distribute supporting notes using Fibonacci spiral
    const supportingPercentages = this.spiralDistribution(
      supportingNotesCount,
      supportingTotal,
      true
    );

    return {
      main: mainPercentage,
      supporting: supportingPercentages,
    };
  }

  /**
   * Generate natural variation using Fibonacci perturbation
   * Adds slight variations while maintaining harmonic relationships
   */
  static addNaturalVariation(
    basePercentage: number,
    variationLevel: 'subtle' | 'moderate' | 'significant' = 'subtle'
  ): number {
    const variationFactors = {
      subtle: 0.02,      // ±2%
      moderate: 0.05,    // ±5%
      significant: 0.1,  // ±10%
    };

    const factor = variationFactors[variationLevel];
    const variation = (Math.random() - 0.5) * 2 * factor * basePercentage;

    // Apply golden ratio to variation for more natural feel
    const naturalVariation = variation / this.PHI;

    return basePercentage + naturalVariation;
  }

  /**
   * Optimize formula percentages to approach golden ratio relationships
   */
  static optimizeToGoldenRatio(percentages: number[]): number[] {
    if (percentages.length < 2) return percentages;

    const sorted = [...percentages].sort((a, b) => b - a);
    const optimized: number[] = [];

    optimized.push(sorted[0]);

    for (let i = 1; i < sorted.length; i++) {
      // Try to make each subsequent percentage relate to previous via PHI
      const idealPercentage = optimized[i - 1] / this.PHI;
      const currentPercentage = sorted[i];

      // Blend between ideal and current (80% ideal, 20% current)
      const blended = idealPercentage * 0.8 + currentPercentage * 0.2;
      optimized.push(blended);
    }

    // Normalize to maintain total
    const originalTotal = percentages.reduce((sum, p) => sum + p, 0);
    const optimizedTotal = optimized.reduce((sum, p) => sum + p, 0);
    const normalizationFactor = originalTotal / optimizedTotal;

    return optimized.map(p => p * normalizationFactor);
  }
}
