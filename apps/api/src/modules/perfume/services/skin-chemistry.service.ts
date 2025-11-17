import { Injectable } from '@nestjs/core';
import { Ingredient } from '../entities/ingredient.entity';
import { Formula } from '../entities/formula.entity';

// ═══════════════════════════════════════════════════════════════════
// SKIN CHEMISTRY SIMULATOR
// Simulates how perfumes evolve on different skin types
// Predicts dry-down, amplification, and longevity based on skin chemistry
// ═══════════════════════════════════════════════════════════════════

export enum SkinType {
  OILY = 'oily',
  DRY = 'dry',
  NORMAL = 'normal',
  COMBINATION = 'combination',
  SENSITIVE = 'sensitive',
}

export enum SkinpH {
  VERY_ACIDIC = 'very_acidic',     // pH 4.0-4.5 (rare)
  ACIDIC = 'acidic',               // pH 4.5-5.0
  NORMAL = 'normal',               // pH 5.0-5.5 (optimal)
  SLIGHTLY_ALKALINE = 'slightly_alkaline', // pH 5.5-6.0
  ALKALINE = 'alkaline',           // pH 6.0-7.0 (problematic)
}

export interface SkinProfile {
  skinType: SkinType;
  pH: SkinpH;
  skinTemperature?: 'cool' | 'normal' | 'warm'; // Affects evaporation
  moistureLevel?: number; // 1-10 (1=very dry, 10=very moist)
  dietType?: 'meat-heavy' | 'balanced' | 'vegetarian' | 'vegan';
  hormonalFactors?: {
    pregnancy?: boolean;
    menstrualCycle?: 'follicular' | 'ovulation' | 'luteal' | 'menstruation';
    menopause?: boolean;
    hormonalMedication?: boolean;
  };
  lifestyle?: {
    smoking?: boolean;
    heavyExercise?: boolean;
    stressLevel?: 'low' | 'medium' | 'high';
  };
  medications?: {
    antibiotics?: boolean;
    hormonalBirthControl?: boolean;
    bloodPressureMeds?: boolean;
  };
}

export interface DryDownPhase {
  timeElapsed: string;
  dominantNotes: string[];
  intensity: number; // 1-10
  projection: number; // 1-10
  description: string;
  ingredients: Array<{
    name: string;
    presence: number; // 0-100%
    character: string;
  }>;
}

export interface SkinCompatibilityResult {
  skinProfile: SkinProfile;
  overallCompatibility: number; // 0-100
  compatibilityRating: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';

  dryDownJourney: {
    opening: DryDownPhase;      // 0-5 minutes
    development: DryDownPhase;  // 30 minutes - 1 hour
    heart: DryDownPhase;        // 2-4 hours
    dryDown: DryDownPhase;      // 6-8 hours
    finalTrail: DryDownPhase;   // 10-12 hours (if still present)
  };

  amplifiedNotes: Array<{
    note: string;
    reason: string;
    amplificationFactor: number; // e.g., 1.5 = 50% stronger
  }>;

  diminishedNotes: Array<{
    note: string;
    reason: string;
    reductionFactor: number; // e.g., 0.6 = 40% weaker
  }>;

  mutatedNotes: Array<{
    note: string;
    originalCharacter: string;
    newCharacter: string;
    reason: string;
  }>;

  expectedLongevity: {
    hours: number;
    projectionRadius: string; // e.g., "arm's length", "intimate", "far-reaching"
    sillageStrength: 'subtle' | 'moderate' | 'strong' | 'very strong';
  };

  recommendations: {
    applicationTips: string[];
    layeringAdvice: string[];
    skinPreparation: string[];
    warnings: string[];
  };

  scientificExplanation: {
    pHEffect: string;
    temperatureEffect: string;
    moistureEffect: string;
    chemicalReactions: string[];
  };
}

@Injectable()
export class SkinChemistryService {
  // ═══════════════════════════════════════════════════════════════
  // SKIN pH VALUES (numeric)
  // ═══════════════════════════════════════════════════════════════

  private static readonly PH_VALUES: Record<SkinpH, number> = {
    [SkinpH.VERY_ACIDIC]: 4.25,
    [SkinpH.ACIDIC]: 4.75,
    [SkinpH.NORMAL]: 5.25,
    [SkinpH.SLIGHTLY_ALKALINE]: 5.75,
    [SkinpH.ALKALINE]: 6.5,
  };

  // ═══════════════════════════════════════════════════════════════
  // MAIN SIMULATION FUNCTION
  // ═══════════════════════════════════════════════════════════════

  simulateSkinInteraction(
    formula: Formula,
    skinProfile: SkinProfile,
  ): SkinCompatibilityResult {
    // Calculate overall compatibility
    const compatibility = this.calculateCompatibility(formula, skinProfile);

    // Simulate dry-down journey
    const dryDownJourney = this.simulateDryDown(formula, skinProfile);

    // Identify amplified/diminished/mutated notes
    const amplifiedNotes = this.identifyAmplifiedNotes(formula, skinProfile);
    const diminishedNotes = this.identifyDiminishedNotes(formula, skinProfile);
    const mutatedNotes = this.identifyMutatedNotes(formula, skinProfile);

    // Calculate expected longevity
    const expectedLongevity = this.calculateLongevity(formula, skinProfile);

    // Generate recommendations
    const recommendations = this.generateRecommendations(skinProfile, compatibility);

    // Scientific explanation
    const scientificExplanation = this.generateScientificExplanation(
      formula,
      skinProfile,
      amplifiedNotes,
      diminishedNotes,
    );

    return {
      skinProfile,
      overallCompatibility: compatibility.score,
      compatibilityRating: compatibility.rating,
      dryDownJourney,
      amplifiedNotes,
      diminishedNotes,
      mutatedNotes,
      expectedLongevity,
      recommendations,
      scientificExplanation,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // COMPATIBILITY CALCULATION
  // ═══════════════════════════════════════════════════════════════

  private calculateCompatibility(
    formula: Formula,
    skinProfile: SkinProfile,
  ): { score: number; rating: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor' } {
    let score = 70; // Base compatibility

    // pH COMPATIBILITY
    const pHValue = SkinChemistryService.PH_VALUES[skinProfile.pH];

    if (skinProfile.pH === SkinpH.NORMAL) {
      score += 10; // Optimal pH
    } else if (skinProfile.pH === SkinpH.ACIDIC || skinProfile.pH === SkinpH.SLIGHTLY_ALKALINE) {
      score += 5; // Good pH
    } else if (skinProfile.pH === SkinpH.ALKALINE) {
      score -= 15; // Alkaline skin problematic (accelerates degradation)
    } else if (skinProfile.pH === SkinpH.VERY_ACIDIC) {
      score -= 10; // Very acidic can alter fragrance
    }

    // SKIN TYPE COMPATIBILITY
    if (skinProfile.skinType === SkinType.OILY) {
      score += 10; // Oily skin = longer lasting perfumes
      // But some notes don't work well (heavy musks, animalic notes)
      if (formula.ingredients?.some(fi =>
        fi.ingredient.odorProfile?.some(note =>
          ['musk', 'animalic', 'cumin', 'civet'].includes(note)
        )
      )) {
        score -= 5; // Musky notes can go rancid on oily skin
      }
    } else if (skinProfile.skinType === SkinType.DRY) {
      score -= 10; // Dry skin = faster evaporation
    } else if (skinProfile.skinType === SkinType.NORMAL) {
      score += 5; // Balanced skin is good
    }

    // SKIN TEMPERATURE
    if (skinProfile.skinTemperature === 'warm') {
      score += 5; // Warm skin = better diffusion
    } else if (skinProfile.skinTemperature === 'cool') {
      score -= 5; // Cool skin = reduced projection
    }

    // MOISTURE LEVEL
    if (skinProfile.moistureLevel) {
      if (skinProfile.moistureLevel >= 7) {
        score += 10; // Well-moisturized skin holds perfume better
      } else if (skinProfile.moistureLevel <= 3) {
        score -= 10; // Very dry skin = poor longevity
      }
    }

    // DIET IMPACT
    if (skinProfile.dietType) {
      if (skinProfile.dietType === 'meat-heavy') {
        score -= 5; // Meat-heavy diet can make skin more acidic
      } else if (skinProfile.dietType === 'vegan' || skinProfile.dietType === 'vegetarian') {
        score += 3; // Plant-based diet often = better skin pH
      }
    }

    // LIFESTYLE FACTORS
    if (skinProfile.lifestyle) {
      if (skinProfile.lifestyle.smoking) {
        score -= 15; // Smoking drastically alters perfume smell
      }
      if (skinProfile.lifestyle.heavyExercise) {
        score -= 5; // Sweat interferes with perfume
      }
      if (skinProfile.lifestyle.stressLevel === 'high') {
        score -= 5; // Stress affects skin chemistry
      }
    }

    // HORMONAL FACTORS
    if (skinProfile.hormonalFactors) {
      if (skinProfile.hormonalFactors.pregnancy) {
        score -= 10; // Pregnancy drastically changes scent perception and skin chemistry
      }
      if (skinProfile.hormonalFactors.menstrualCycle === 'menstruation') {
        score -= 5; // Hormonal fluctuations during menstruation
      }
      if (skinProfile.hormonalFactors.menopause) {
        score -= 8; // Menopause affects skin chemistry
      }
    }

    // MEDICATIONS
    if (skinProfile.medications) {
      if (skinProfile.medications.antibiotics) {
        score -= 8; // Antibiotics alter skin microbiome
      }
      if (skinProfile.medications.hormonalBirthControl) {
        score -= 5; // Hormonal changes
      }
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Determine rating
    let rating: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
    if (score >= 85) rating = 'Excellent';
    else if (score >= 70) rating = 'Very Good';
    else if (score >= 55) rating = 'Good';
    else if (score >= 40) rating = 'Fair';
    else rating = 'Poor';

    return { score, rating };
  }

  // ═══════════════════════════════════════════════════════════════
  // DRY-DOWN SIMULATION
  // ═══════════════════════════════════════════════════════════════

  private simulateDryDown(
    formula: Formula,
    skinProfile: SkinProfile,
  ): {
    opening: DryDownPhase;
    development: DryDownPhase;
    heart: DryDownPhase;
    dryDown: DryDownPhase;
    finalTrail: DryDownPhase;
  } {
    if (!formula.ingredients || formula.ingredients.length === 0) {
      const emptyPhase: DryDownPhase = {
        timeElapsed: '0 min',
        dominantNotes: [],
        intensity: 0,
        projection: 0,
        description: 'No ingredients',
        ingredients: [],
      };
      return {
        opening: emptyPhase,
        development: emptyPhase,
        heart: emptyPhase,
        dryDown: emptyPhase,
        finalTrail: emptyPhase,
      };
    }

    const evaporationMultiplier = this.calculateEvaporationMultiplier(skinProfile);

    // OPENING (0-5 minutes) - Top notes dominate
    const opening: DryDownPhase = {
      timeElapsed: '0-5 minutes',
      dominantNotes: this.extractNotesByVolatility(formula, 'top'),
      intensity: this.calculateIntensity(10, skinProfile),
      projection: this.calculateProjection(9, skinProfile),
      description: 'Initial spray - bright, fresh, explosive. Top notes at maximum intensity.',
      ingredients: this.getIngredientPresence(formula, 'opening', skinProfile),
    };

    // DEVELOPMENT (30 min - 1 hour) - Top notes fading, heart emerging
    const development: DryDownPhase = {
      timeElapsed: '30 minutes - 1 hour',
      dominantNotes: [
        ...this.extractNotesByVolatility(formula, 'top_heart'),
        ...this.extractNotesByVolatility(formula, 'heart'),
      ],
      intensity: this.calculateIntensity(8, skinProfile),
      projection: this.calculateProjection(7, skinProfile),
      description: 'Top notes softening, heart notes emerging. The perfume begins to settle and blend with skin chemistry.',
      ingredients: this.getIngredientPresence(formula, 'development', skinProfile),
    };

    // HEART (2-4 hours) - Heart notes dominate
    const heart: DryDownPhase = {
      timeElapsed: '2-4 hours',
      dominantNotes: [
        ...this.extractNotesByVolatility(formula, 'heart'),
        ...this.extractNotesByVolatility(formula, 'heart_base'),
      ],
      intensity: this.calculateIntensity(6, skinProfile),
      projection: this.calculateProjection(5, skinProfile),
      description: 'The true character of the perfume. Heart notes are fully expressed, blended with skin.',
      ingredients: this.getIngredientPresence(formula, 'heart', skinProfile),
    };

    // DRY-DOWN (6-8 hours) - Base notes dominate
    const dryDown: DryDownPhase = {
      timeElapsed: '6-8 hours',
      dominantNotes: [
        ...this.extractNotesByVolatility(formula, 'heart_base'),
        ...this.extractNotesByVolatility(formula, 'base'),
      ],
      intensity: this.calculateIntensity(4, skinProfile),
      projection: this.calculateProjection(3, skinProfile),
      description: 'The dry-down phase. Only base notes remain, intimate and close to skin.',
      ingredients: this.getIngredientPresence(formula, 'drydown', skinProfile),
    };

    // FINAL TRAIL (10-12 hours)
    const finalTrail: DryDownPhase = {
      timeElapsed: '10-12 hours',
      dominantNotes: this.extractNotesByVolatility(formula, 'base'),
      intensity: this.calculateIntensity(2, skinProfile),
      projection: this.calculateProjection(1, skinProfile),
      description: 'The final whisper. Only the most tenacious base notes remain.',
      ingredients: this.getIngredientPresence(formula, 'final', skinProfile),
    };

    return { opening, development, heart, dryDown, finalTrail };
  }

  // ═══════════════════════════════════════════════════════════════
  // AMPLIFIED NOTES (Enhanced by skin chemistry)
  // ═══════════════════════════════════════════════════════════════

  private identifyAmplifiedNotes(
    formula: Formula,
    skinProfile: SkinProfile,
  ): Array<{ note: string; reason: string; amplificationFactor: number }> {
    const amplified: Array<{ note: string; reason: string; amplificationFactor: number }> = [];

    if (!formula.ingredients) return amplified;

    // OILY SKIN amplifies certain notes
    if (skinProfile.skinType === SkinType.OILY) {
      formula.ingredients.forEach(fi => {
        const ingredient = fi.ingredient;

        // Woody notes amplified on oily skin
        if (ingredient.odorProfile?.some(note => ['woody', 'cedar', 'sandalwood'].includes(note))) {
          amplified.push({
            note: ingredient.name,
            reason: 'Oily skin enhances woody notes and increases longevity',
            amplificationFactor: 1.4,
          });
        }

        // Spicy notes amplified
        if (ingredient.odorProfile?.some(note => ['spicy', 'cinnamon', 'pepper'].includes(note))) {
          amplified.push({
            note: ingredient.name,
            reason: 'Skin oils intensify spicy notes',
            amplificationFactor: 1.3,
          });
        }
      });
    }

    // WARM SKIN TEMPERATURE amplifies projection
    if (skinProfile.skinTemperature === 'warm') {
      formula.ingredients.forEach(fi => {
        const ingredient = fi.ingredient;

        if (ingredient.volatility === 'top' || ingredient.volatility === 'top_heart') {
          amplified.push({
            note: ingredient.name,
            reason: 'Warm skin temperature accelerates diffusion of top notes',
            amplificationFactor: 1.5,
          });
        }
      });
    }

    // ACIDIC pH amplifies citrus
    if (skinProfile.pH === SkinpH.ACIDIC || skinProfile.pH === SkinpH.VERY_ACIDIC) {
      formula.ingredients.forEach(fi => {
        const ingredient = fi.ingredient;

        if (ingredient.odorProfile?.some(note => ['citrus', 'lemon', 'bergamot', 'grapefruit'].includes(note))) {
          amplified.push({
            note: ingredient.name,
            reason: 'Acidic skin pH enhances citrus freshness',
            amplificationFactor: 1.25,
          });
        }
      });
    }

    // ALKALINE pH amplifies florals and sweet notes
    if (skinProfile.pH === SkinpH.ALKALINE || skinProfile.pH === SkinpH.SLIGHTLY_ALKALINE) {
      formula.ingredients.forEach(fi => {
        const ingredient = fi.ingredient;

        if (ingredient.odorProfile?.some(note => ['floral', 'rose', 'jasmine', 'sweet'].includes(note))) {
          amplified.push({
            note: ingredient.name,
            reason: 'Alkaline skin enhances floral and sweet notes',
            amplificationFactor: 1.35,
          });
        }
      });
    }

    return amplified;
  }

  // ═══════════════════════════════════════════════════════════════
  // DIMINISHED NOTES (Weakened by skin chemistry)
  // ═══════════════════════════════════════════════════════════════

  private identifyDiminishedNotes(
    formula: Formula,
    skinProfile: SkinProfile,
  ): Array<{ note: string; reason: string; reductionFactor: number }> {
    const diminished: Array<{ note: string; reason: string; reductionFactor: number }> = [];

    if (!formula.ingredients) return diminished;

    // DRY SKIN reduces longevity of all notes
    if (skinProfile.skinType === SkinType.DRY) {
      formula.ingredients.forEach(fi => {
        diminished.push({
          note: fi.ingredient.name,
          reason: 'Dry skin absorbs perfume quickly, reducing longevity',
          reductionFactor: 0.6,
        });
      });
    }

    // COOL SKIN reduces projection
    if (skinProfile.skinTemperature === 'cool') {
      formula.ingredients.forEach(fi => {
        const ingredient = fi.ingredient;

        if (ingredient.volatility === 'top') {
          diminished.push({
            note: ingredient.name,
            reason: 'Cool skin temperature reduces evaporation and projection',
            reductionFactor: 0.7,
          });
        }
      });
    }

    // SMOKING diminishes delicate notes
    if (skinProfile.lifestyle?.smoking) {
      formula.ingredients.forEach(fi => {
        const ingredient = fi.ingredient;

        if (ingredient.odorProfile?.some(note => ['floral', 'delicate', 'fresh', 'green'].includes(note))) {
          diminished.push({
            note: ingredient.name,
            reason: 'Smoking interferes with delicate floral and fresh notes',
            reductionFactor: 0.5,
          });
        }
      });
    }

    // ALKALINE pH degrades citrus faster
    if (skinProfile.pH === SkinpH.ALKALINE) {
      formula.ingredients.forEach(fi => {
        const ingredient = fi.ingredient;

        if (ingredient.odorProfile?.some(note => ['citrus', 'lemon', 'bergamot'].includes(note))) {
          diminished.push({
            note: ingredient.name,
            reason: 'Alkaline pH accelerates degradation of citrus notes',
            reductionFactor: 0.55,
          });
        }
      });
    }

    return diminished;
  }

  // ═══════════════════════════════════════════════════════════════
  // MUTATED NOTES (Changed character by skin chemistry)
  // ═══════════════════════════════════════════════════════════════

  private identifyMutatedNotes(
    formula: Formula,
    skinProfile: SkinProfile,
  ): Array<{ note: string; originalCharacter: string; newCharacter: string; reason: string }> {
    const mutated: Array<{ note: string; originalCharacter: string; newCharacter: string; reason: string }> = [];

    if (!formula.ingredients) return mutated;

    // OILY SKIN + MUSK = sour/rancid
    if (skinProfile.skinType === SkinType.OILY) {
      formula.ingredients.forEach(fi => {
        const ingredient = fi.ingredient;

        if (ingredient.odorProfile?.some(note => ['musk', 'animalic'].includes(note))) {
          mutated.push({
            note: ingredient.name,
            originalCharacter: 'Clean, soft, powdery musk',
            newCharacter: 'Sour, rancid, or overly animalic',
            reason: 'Oily skin chemistry reacts with musky compounds, creating sour notes',
          });
        }
      });
    }

    // ALKALINE pH + VANILLA = caramelized/burnt
    if (skinProfile.pH === SkinpH.ALKALINE) {
      formula.ingredients.forEach(fi => {
        const ingredient = fi.ingredient;

        if (ingredient.odorProfile?.some(note => ['vanilla', 'sweet'].includes(note))) {
          mutated.push({
            note: ingredient.name,
            originalCharacter: 'Sweet, creamy vanilla',
            newCharacter: 'Caramelized, burnt sugar character',
            reason: 'Alkaline pH accelerates Maillard-like reactions with vanilla',
          });
        }
      });
    }

    // ACIDIC pH + ROSE = more lemony/rosy
    if (skinProfile.pH === SkinpH.VERY_ACIDIC || skinProfile.pH === SkinpH.ACIDIC) {
      formula.ingredients.forEach(fi => {
        const ingredient = fi.ingredient;

        if (ingredient.odorProfile?.some(note => ['rose'].includes(note))) {
          mutated.push({
            note: ingredient.name,
            originalCharacter: 'Classic rose, honeyed',
            newCharacter: 'Lemony, citronellol-forward rose',
            reason: 'Acidic pH emphasizes citronellol component in rose',
          });
        }
      });
    }

    // PREGNANCY + many notes = altered perception
    if (skinProfile.hormonalFactors?.pregnancy) {
      mutated.push({
        note: 'All notes',
        originalCharacter: 'As formulated',
        newCharacter: 'Amplified, distorted, or unpleasant',
        reason: 'Pregnancy drastically alters scent perception - fragrances may smell completely different',
      });
    }

    return mutated;
  }

  // ═══════════════════════════════════════════════════════════════
  // LONGEVITY CALCULATION
  // ═══════════════════════════════════════════════════════════════

  private calculateLongevity(
    formula: Formula,
    skinProfile: SkinProfile,
  ): {
    hours: number;
    projectionRadius: string;
    sillageStrength: 'subtle' | 'moderate' | 'strong' | 'very strong';
  } {
    let baseHours = 6; // Average EdP longevity

    // Skin type impact
    if (skinProfile.skinType === SkinType.OILY) {
      baseHours *= 1.5; // 9 hours
    } else if (skinProfile.skinType === SkinType.DRY) {
      baseHours *= 0.6; // 3.6 hours
    } else if (skinProfile.skinType === SkinType.NORMAL) {
      baseHours *= 1.0; // 6 hours
    }

    // Moisture level impact
    if (skinProfile.moistureLevel) {
      if (skinProfile.moistureLevel >= 7) {
        baseHours *= 1.3;
      } else if (skinProfile.moistureLevel <= 3) {
        baseHours *= 0.7;
      }
    }

    // Temperature impact
    if (skinProfile.skinTemperature === 'warm') {
      baseHours *= 0.85; // Faster evaporation
    } else if (skinProfile.skinTemperature === 'cool') {
      baseHours *= 1.15; // Slower evaporation
    }

    // Lifestyle impact
    if (skinProfile.lifestyle?.smoking) {
      baseHours *= 0.7; // Smoking reduces longevity
    }
    if (skinProfile.lifestyle?.heavyExercise) {
      baseHours *= 0.5; // Sweat drastically reduces longevity
    }

    baseHours = Math.round(baseHours * 10) / 10;

    // Projection radius
    let projectionRadius = "arm's length";
    if (baseHours >= 8) {
      projectionRadius = 'far-reaching (3-4 feet)';
    } else if (baseHours <= 3) {
      projectionRadius = 'intimate (6-12 inches)';
    }

    // Sillage strength
    let sillageStrength: 'subtle' | 'moderate' | 'strong' | 'very strong' = 'moderate';
    if (skinProfile.skinType === SkinType.OILY && skinProfile.skinTemperature === 'warm') {
      sillageStrength = 'very strong';
    } else if (skinProfile.skinType === SkinType.DRY && skinProfile.skinTemperature === 'cool') {
      sillageStrength = 'subtle';
    } else if (skinProfile.skinType === SkinType.OILY || skinProfile.skinTemperature === 'warm') {
      sillageStrength = 'strong';
    }

    return {
      hours: baseHours,
      projectionRadius,
      sillageStrength,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════

  private calculateEvaporationMultiplier(skinProfile: SkinProfile): number {
    let multiplier = 1.0;

    if (skinProfile.skinType === SkinType.OILY) multiplier *= 0.7;
    if (skinProfile.skinType === SkinType.DRY) multiplier *= 1.5;
    if (skinProfile.skinTemperature === 'warm') multiplier *= 1.3;
    if (skinProfile.skinTemperature === 'cool') multiplier *= 0.8;

    return multiplier;
  }

  private extractNotesByVolatility(formula: Formula, volatility: string): string[] {
    if (!formula.ingredients) return [];

    return formula.ingredients
      .filter(fi => fi.ingredient.volatility === volatility)
      .map(fi => fi.ingredient.name)
      .slice(0, 5); // Top 5 notes
  }

  private calculateIntensity(baseIntensity: number, skinProfile: SkinProfile): number {
    let intensity = baseIntensity;

    if (skinProfile.skinType === SkinType.OILY) intensity *= 1.2;
    if (skinProfile.skinType === SkinType.DRY) intensity *= 0.7;

    return Math.round(Math.max(1, Math.min(10, intensity)));
  }

  private calculateProjection(baseProjection: number, skinProfile: SkinProfile): number {
    let projection = baseProjection;

    if (skinProfile.skinTemperature === 'warm') projection *= 1.3;
    if (skinProfile.skinTemperature === 'cool') projection *= 0.7;

    return Math.round(Math.max(1, Math.min(10, projection)));
  }

  private getIngredientPresence(
    formula: Formula,
    phase: string,
    skinProfile: SkinProfile,
  ): Array<{ name: string; presence: number; character: string }> {
    if (!formula.ingredients) return [];

    return formula.ingredients.map(fi => {
      const ingredient = fi.ingredient;
      let presence = 0;

      // Calculate presence based on phase and volatility
      if (phase === 'opening') {
        if (ingredient.volatility === 'top') presence = 100;
        else if (ingredient.volatility === 'top_heart') presence = 60;
        else if (ingredient.volatility === 'heart') presence = 20;
      } else if (phase === 'development') {
        if (ingredient.volatility === 'top') presence = 40;
        else if (ingredient.volatility === 'top_heart') presence = 100;
        else if (ingredient.volatility === 'heart') presence = 70;
        else if (ingredient.volatility === 'heart_base') presence = 30;
      } else if (phase === 'heart') {
        if (ingredient.volatility === 'heart') presence = 100;
        else if (ingredient.volatility === 'heart_base') presence = 80;
        else if (ingredient.volatility === 'base') presence = 40;
      } else if (phase === 'drydown') {
        if (ingredient.volatility === 'heart_base') presence = 60;
        else if (ingredient.volatility === 'base') presence = 100;
      } else if (phase === 'final') {
        if (ingredient.volatility === 'base') presence = 100;
      }

      return {
        name: ingredient.name,
        presence,
        character: ingredient.odorProfile?.join(', ') || 'complex',
      };
    }).filter(i => i.presence > 0)
      .sort((a, b) => b.presence - a.presence)
      .slice(0, 8); // Top 8 ingredients
  }

  // ═══════════════════════════════════════════════════════════════
  // RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════

  private generateRecommendations(
    skinProfile: SkinProfile,
    compatibility: { score: number; rating: string },
  ): {
    applicationTips: string[];
    layeringAdvice: string[];
    skinPreparation: string[];
    warnings: string[];
  } {
    const tips: string[] = [];
    const layering: string[] = [];
    const prep: string[] = [];
    const warnings: string[] = [];

    // DRY SKIN recommendations
    if (skinProfile.skinType === SkinType.DRY) {
      prep.push('Moisturize skin 5-10 minutes before applying perfume');
      prep.push('Use unscented lotion or petroleum jelly on pulse points');
      tips.push('Apply to naturally oily areas: behind ears, inner elbows');
      layering.push('Layer with matching body lotion for better longevity');
    }

    // OILY SKIN recommendations
    if (skinProfile.skinType === SkinType.OILY) {
      tips.push('Apply sparingly - oily skin amplifies projection');
      tips.push('Avoid musky/animalic fragrances (can go sour)');
      warnings.push('Warning: Musk notes may smell rancid on very oily skin');
    }

    // pH recommendations
    if (skinProfile.pH === SkinpH.ALKALINE) {
      prep.push('Consider using pH-balancing toner before perfume application');
      warnings.push('Alkaline skin may alter citrus and vanilla notes');
    }

    // SMOKING warnings
    if (skinProfile.lifestyle?.smoking) {
      warnings.push('Smoking significantly alters perfume smell - avoid delicate florals');
      tips.push('Choose robust, woody, or spicy fragrances that withstand smoke');
    }

    // PREGNANCY warnings
    if (skinProfile.hormonalFactors?.pregnancy) {
      warnings.push('IMPORTANT: Pregnancy dramatically alters scent perception');
      warnings.push('Fragrances may smell completely different or unpleasant');
      tips.push('Test perfumes on blotter first before applying to skin');
      tips.push('Avoid strong fragrances if experiencing morning sickness');
    }

    // General tips
    tips.push('Apply to pulse points where blood vessels are close to skin surface');
    tips.push('Spray perfume from 6-8 inches away for even distribution');

    return {
      applicationTips: tips,
      layeringAdvice: layering,
      skinPreparation: prep,
      warnings,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // SCIENTIFIC EXPLANATION
  // ═══════════════════════════════════════════════════════════════

  private generateScientificExplanation(
    formula: Formula,
    skinProfile: SkinProfile,
    amplifiedNotes: any[],
    diminishedNotes: any[],
  ): {
    pHEffect: string;
    temperatureEffect: string;
    moistureEffect: string;
    chemicalReactions: string[];
  } {
    const pHValue = SkinChemistryService.PH_VALUES[skinProfile.pH];

    const pHEffect = `Your skin pH is ${pHValue} (${skinProfile.pH}). ` +
      (skinProfile.pH === SkinpH.NORMAL
        ? 'This is optimal for perfume performance. Fragrance molecules remain stable.'
        : skinProfile.pH === SkinpH.ALKALINE
        ? 'Alkaline skin accelerates ester hydrolysis, breaking down citrus and some floral notes faster. Sweet notes may caramelize.'
        : 'Acidic skin enhances citrus freshness but may alter rose notes to emphasize citronellol (lemony facet).');

    const temperatureEffect = skinProfile.skinTemperature === 'warm'
      ? 'Warm skin increases molecular kinetic energy, accelerating evaporation and enhancing diffusion. This creates better projection but reduces longevity.'
      : skinProfile.skinTemperature === 'cool'
      ? 'Cool skin slows molecular movement, reducing evaporation rate. This increases longevity but decreases projection and sillage.'
      : 'Normal skin temperature provides balanced evaporation and diffusion.';

    const moistureEffect = skinProfile.skinType === SkinType.OILY
      ? 'Oily skin contains sebum (fatty acids, squalene, wax esters) that mix with perfume oils, slowing evaporation significantly. This increases longevity but can cause chemical reactions with certain notes (musks, aldehydes).'
      : skinProfile.skinType === SkinType.DRY
      ? 'Dry skin lacks lipid barrier, causing perfume to absorb rapidly into stratum corneum. This drastically reduces longevity - perfume evaporates 40-60% faster.'
      : 'Normal skin moisture provides optimal balance between absorption and evaporation.';

    const reactions: string[] = [];

    if (skinProfile.skinType === SkinType.OILY) {
      reactions.push('Sebum fatty acids react with aldehydes, creating metallic or soapy notes');
      reactions.push('Musk compounds undergo oxidation in presence of skin oils, creating rancid character');
    }

    if (skinProfile.pH === SkinpH.ALKALINE) {
      reactions.push('Base-catalyzed ester hydrolysis degrades citrus terpenes (limonene → p-cymene)');
      reactions.push('Maillard-like reactions with vanilla (vanillin) create caramel/burnt notes');
    }

    if (skinProfile.pH === SkinpH.ACIDIC || skinProfile.pH === SkinpH.VERY_ACIDIC) {
      reactions.push('Acid-catalyzed reactions enhance acetylation of rose alcohols (citronellol)');
    }

    if (skinProfile.lifestyle?.smoking) {
      reactions.push('Nicotine and tar residues on skin interfere with delicate floral molecules');
      reactions.push('Smoke particles bind to perfume molecules, creating ashy/burnt undertones');
    }

    return {
      pHEffect,
      temperatureEffect,
      moistureEffect,
      chemicalReactions: reactions,
    };
  }
}
