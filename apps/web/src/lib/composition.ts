/**
 * Advanced Composition Techniques for Perfume Formulation
 * Mathematical and artistic approaches to creating harmonious fragrances
 */

// Golden Ratio constant
export const PHI = 1.618033988749895;
export const PHI_INVERSE = 1 / PHI; // ≈ 0.618

// Fibonacci sequence up to reasonable perfume percentages
export const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

export interface CompositionTemplate {
  id: string;
  name: string;
  description: string;
  technique: string;
  topNotes: number;
  heartNotes: number;
  baseNotes: number;
  rationale: string;
}

/**
 * Generate Fibonacci-based percentages that sum to 100
 */
export function generateFibonacciComposition(noteCount: number): number[] {
  if (noteCount < 2 || noteCount > FIBONACCI_SEQUENCE.length) {
    throw new Error(`Note count must be between 2 and ${FIBONACCI_SEQUENCE.length}`);
  }

  // Take the first n Fibonacci numbers
  const fibNumbers = FIBONACCI_SEQUENCE.slice(0, noteCount);
  const sum = fibNumbers.reduce((a, b) => a + b, 0);

  // Normalize to percentages
  const percentages = fibNumbers.map((fib) => (fib / sum) * 100);

  return percentages.map((p) => Math.round(p * 100) / 100);
}

/**
 * Calculate Golden Ratio proportions for 2 notes
 * Larger note: ~61.8%, Smaller note: ~38.2%
 */
export function goldenRatioTwoNotes(): { major: number; minor: number } {
  const major = PHI_INVERSE * 100; // ~61.8%
  const minor = (1 - PHI_INVERSE) * 100; // ~38.2%

  return {
    major: Math.round(major * 100) / 100,
    minor: Math.round(minor * 100) / 100,
  };
}

/**
 * Calculate Golden Ratio proportions for 3 notes (pyramid)
 * Based on phi^2, phi, 1
 */
export function goldenRatioThreeNotes(): { first: number; second: number; third: number } {
  const phi2 = PHI * PHI;
  const sum = phi2 + PHI + 1;

  const first = (phi2 / sum) * 100; // ~46.98%
  const second = (PHI / sum) * 100; // ~36.33%
  const third = (1 / sum) * 100; // ~22.46%

  return {
    first: Math.round(first * 100) / 100,
    second: Math.round(second * 100) / 100,
    third: Math.round(third * 100) / 100,
  };
}

/**
 * Calculate Golden Spiral distribution for multiple notes
 */
export function goldenSpiralDistribution(noteCount: number): number[] {
  if (noteCount < 2) {
    throw new Error('Need at least 2 notes');
  }

  const percentages: number[] = [];
  let remaining = 100;

  for (let i = 0; i < noteCount - 1; i++) {
    const portion = remaining * PHI_INVERSE;
    percentages.push(Math.round(portion * 100) / 100);
    remaining -= portion;
  }

  // Last note gets the remaining percentage
  percentages.push(Math.round(remaining * 100) / 100);

  return percentages;
}

/**
 * Pre-defined composition templates based on perfumery traditions and mathematics
 */
export const COMPOSITION_TEMPLATES: CompositionTemplate[] = [
  {
    id: 'golden-ratio-classic',
    name: 'Golden Ratio Classic',
    description: 'Based on the divine proportion (φ = 1.618)',
    technique: 'Golden Ratio',
    topNotes: 23.6,
    heartNotes: 38.2,
    baseNotes: 38.2,
    rationale: 'Heart and Base in golden ratio to Top notes, creating natural harmony',
  },
  {
    id: 'golden-ratio-pyramid',
    name: 'Golden Pyramid',
    description: 'Ascending golden proportions from Base to Top',
    technique: 'Golden Ratio',
    topNotes: 46.98,
    heartNotes: 29.04,
    baseNotes: 23.98,
    rationale: 'Each level in golden ratio to the next: φ² : φ : 1',
  },
  {
    id: 'fibonacci-balanced',
    name: 'Fibonacci Balance',
    description: 'Natural progression using Fibonacci sequence',
    technique: 'Fibonacci',
    topNotes: 27.27,
    heartNotes: 36.36,
    baseNotes: 36.36,
    rationale: 'Using Fibonacci numbers 3:4:4 for balanced composition',
  },
  {
    id: 'fibonacci-ascending',
    name: 'Fibonacci Crescendo',
    description: 'Ascending intensity from Top to Base',
    technique: 'Fibonacci',
    topNotes: 23.08,
    heartNotes: 30.77,
    baseNotes: 46.15,
    rationale: 'Using Fibonacci 3:4:6 for building depth',
  },
  {
    id: 'rule-of-thirds',
    name: 'Rule of Thirds',
    description: 'Classic artistic composition principle',
    technique: 'Traditional',
    topNotes: 33.33,
    heartNotes: 33.33,
    baseNotes: 33.34,
    rationale: 'Equal distribution across all three note levels',
  },
  {
    id: 'classic-french',
    name: 'French Classic',
    description: 'Traditional French haute perfumery',
    technique: 'Traditional',
    topNotes: 20,
    heartNotes: 50,
    baseNotes: 30,
    rationale: 'Heart-dominant composition for rich, complex character',
  },
  {
    id: 'modern-fresh',
    name: 'Modern Fresh',
    description: 'Contemporary fresh fragrance structure',
    technique: 'Traditional',
    topNotes: 50,
    heartNotes: 30,
    baseNotes: 20,
    rationale: 'Top-heavy for immediate impact and freshness',
  },
  {
    id: 'oriental-luxury',
    name: 'Oriental Luxury',
    description: 'Rich, long-lasting oriental style',
    technique: 'Traditional',
    topNotes: 15,
    heartNotes: 35,
    baseNotes: 50,
    rationale: 'Base-dominant for depth, warmth, and longevity',
  },
  {
    id: 'fibonacci-5-notes',
    name: 'Fibonacci 5-Note Harmony',
    description: 'Complex composition using 5 Fibonacci proportions',
    technique: 'Fibonacci',
    topNotes: 34.09, // 3+4+8 = 15
    heartNotes: 31.82, // 3+4+7 = 14
    baseNotes: 34.09, // 3+4+8 = 15
    rationale: 'Advanced Fibonacci distribution: 1,1,2,3,5,8,13 creating natural flow',
  },
];

/**
 * Calculate optimal ingredient percentages based on a template
 */
export function applyTemplateToIngredients(
  template: CompositionTemplate,
  topCount: number,
  heartCount: number,
  baseCount: number
): {
  topPercentages: number[];
  heartPercentages: number[];
  basePercentages: number[];
} {
  const distributeEvenly = (totalPercent: number, count: number): number[] => {
    if (count === 0) return [];
    const base = Math.floor((totalPercent / count) * 100) / 100;
    const remainder = Math.round((totalPercent - base * count) * 100) / 100;
    const percentages = Array(count).fill(base);
    if (remainder > 0) {
      percentages[0] += remainder;
    }
    return percentages;
  };

  return {
    topPercentages: distributeEvenly(template.topNotes, topCount),
    heartPercentages: distributeEvenly(template.heartNotes, heartCount),
    basePercentages: distributeEvenly(template.baseNotes, baseCount),
  };
}

/**
 * Suggest composition adjustments to achieve golden ratio
 */
export function suggestGoldenRatioAdjustment(
  currentTop: number,
  currentHeart: number,
  currentBase: number
): {
  suggestion: string;
  adjustedTop: number;
  adjustedHeart: number;
  adjustedBase: number;
  reasoning: string;
} {
  const total = currentTop + currentHeart + currentBase;

  if (Math.abs(total - 100) > 0.01) {
    return {
      suggestion: 'Normalize to 100%',
      adjustedTop: (currentTop / total) * 100,
      adjustedHeart: (currentHeart / total) * 100,
      adjustedBase: (currentBase / total) * 100,
      reasoning: 'Current percentages do not sum to 100%',
    };
  }

  // Calculate what golden ratio would suggest
  const golden = goldenRatioThreeNotes();

  // Find which is dominant
  const max = Math.max(currentTop, currentHeart, currentBase);

  if (max === currentHeart) {
    // Heart-dominant: use golden pyramid
    return {
      suggestion: 'Golden Pyramid (Heart-dominant)',
      adjustedTop: golden.first,
      adjustedHeart: golden.second,
      adjustedBase: golden.third,
      reasoning: 'Your formula is heart-dominant. Golden ratio suggests emphasizing top notes while maintaining harmony.',
    };
  } else if (max === currentBase) {
    // Base-dominant: reverse golden pyramid
    return {
      suggestion: 'Reverse Golden Pyramid (Base-dominant)',
      adjustedTop: golden.third,
      adjustedHeart: golden.second,
      adjustedBase: golden.first,
      reasoning: 'Your formula is base-dominant. Golden ratio suggests building depth from a strong foundation.',
    };
  } else {
    // Top-dominant: standard golden pyramid
    return {
      suggestion: 'Standard Golden Pyramid (Top-dominant)',
      adjustedTop: golden.first,
      adjustedHeart: golden.second,
      adjustedBase: golden.third,
      reasoning: 'Your formula is top-dominant. Golden ratio suggests fresh, impactful opening with harmonious development.',
    };
  }
}

/**
 * Calculate harmony score (0-100) based on how close composition is to golden ratio
 */
export function calculateHarmonyScore(
  topPercent: number,
  heartPercent: number,
  basePercent: number
): {
  score: number;
  level: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Perfect';
  feedback: string;
} {
  const golden = goldenRatioThreeNotes();

  // Calculate deviation from ideal golden ratios
  const topDev = Math.abs(topPercent - golden.first);
  const heartDev = Math.abs(heartPercent - golden.second);
  const baseDev = Math.abs(basePercent - golden.third);

  const avgDeviation = (topDev + heartDev + baseDev) / 3;

  // Score: 100 - deviation (max deviation is ~33.33, so we scale)
  const score = Math.max(0, Math.round(100 - avgDeviation * 3));

  let level: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Perfect';
  let feedback: string;

  if (score >= 95) {
    level = 'Perfect';
    feedback = 'Your composition achieves golden ratio harmony! The proportions create natural balance.';
  } else if (score >= 80) {
    level = 'Excellent';
    feedback = 'Very harmonious composition, close to golden ratio principles. Minor adjustments could perfect it.';
  } else if (score >= 65) {
    level = 'Good';
    feedback = 'Good balance with room for refinement. Consider adjusting proportions toward golden ratio.';
  } else if (score >= 50) {
    level = 'Fair';
    feedback = 'Functional composition but lacks mathematical harmony. Try a composition template for better balance.';
  } else {
    level = 'Poor';
    feedback = 'Unbalanced composition. Strongly recommend using a composition template or golden ratio principles.';
  }

  return { score, level, feedback };
}
