import { Injectable } from '@nestjs/common';
import { Ingredient } from '../entities/ingredient.entity';
import { Formula } from '../entities/formula.entity';

// ═══════════════════════════════════════════════════════════════════
// SEASONAL OPTIMIZATION ENGINE
// Adjusts perfume formulas based on temperature, humidity, and season
// ═══════════════════════════════════════════════════════════════════

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
}

export enum Climate {
  TROPICAL = 'tropical',           // Hot & humid (25-35°C, 70-90% humidity)
  MEDITERRANEAN = 'mediterranean', // Warm & dry (20-30°C, 40-60% humidity)
  TEMPERATE = 'temperate',        // Moderate (10-20°C, 50-70% humidity)
  CONTINENTAL = 'continental',    // Cold & dry (-5-15°C, 30-50% humidity)
  POLAR = 'polar',               // Very cold (-20-5°C, 20-40% humidity)
}

export interface EnvironmentalConditions {
  temperature: number;      // °C
  humidity: number;         // % (0-100)
  season?: Season;
  climate?: Climate;
  altitude?: number;        // meters (affects air pressure and evaporation)
  activityLevel?: 'resting' | 'moderate' | 'active'; // Affects skin temperature
}

export interface OptimizationResult {
  originalFormula: {
    name: string;
    concentration: number;
  };
  optimizedFormula: {
    adjustedConcentration: number;
    adjustedIngredients: Array<{
      name: string;
      originalPercentage: number;
      optimizedPercentage: number;
      adjustment: number;
      reason: string;
    }>;
    projectionMultiplier: number;
    longevityMultiplier: number;
    sillageMultiplier: number;
  };
  recommendations: {
    applicationTips: string[];
    storageAdvice: string[];
    wearDuration: string;
    reapplicationNeeded: boolean;
  };
  scientificExplanation: {
    evaporationRate: number;      // Relative to 20°C, 50% humidity (baseline = 1.0)
    diffusionRate: number;         // How fast molecules spread
    volatilityImpact: string;
    humidityEffect: string;
    temperatureEffect: string;
  };
}

export interface SeasonalProfile {
  season: Season;
  recommendedFamilies: string[];
  recommendedNotes: string[];
  avoidNotes: string[];
  idealConcentration: { min: number; max: number };
  characteristics: string[];
}

@Injectable()
export class SeasonalOptimizerService {
  // ═══════════════════════════════════════════════════════════════
  // SCIENTIFIC CONSTANTS
  // ═══════════════════════════════════════════════════════════════

  private static readonly BASELINE_TEMP = 20;      // °C (baseline for calculations)
  private static readonly BASELINE_HUMIDITY = 50;  // % (baseline)
  private static readonly BASELINE_PRESSURE = 1013.25; // hPa (sea level)

  // Evaporation increases ~3-5% per degree Celsius above baseline
  private static readonly EVAPORATION_TEMP_COEFFICIENT = 0.04;

  // Humidity affects diffusion (higher humidity = slower evaporation)
  private static readonly HUMIDITY_COEFFICIENT = 0.006;

  // Altitude affects air pressure (lower pressure = faster evaporation)
  private static readonly ALTITUDE_COEFFICIENT = 0.12; // per 1000m

  // ═══════════════════════════════════════════════════════════════
  // SEASONAL PROFILES
  // ═══════════════════════════════════════════════════════════════

  private static readonly SEASONAL_PROFILES: Record<Season, SeasonalProfile> = {
    [Season.SPRING]: {
      season: Season.SPRING,
      recommendedFamilies: ['floral', 'green', 'fresh', 'citrus', 'aquatic'],
      recommendedNotes: ['rose', 'lily', 'freesia', 'green notes', 'bergamot', 'neroli', 'petitgrain'],
      avoidNotes: ['heavy vanilla', 'thick amber', 'oud', 'leather'],
      idealConcentration: { min: 8, max: 15 },
      characteristics: ['fresh', 'light', 'optimistic', 'blooming', 'dewy'],
    },
    [Season.SUMMER]: {
      season: Season.SUMMER,
      recommendedFamilies: ['citrus', 'aquatic', 'fresh', 'light floral', 'marine'],
      recommendedNotes: ['lemon', 'grapefruit', 'mint', 'sea notes', 'calone', 'watermelon', 'coconut'],
      avoidNotes: ['vanilla', 'tonka', 'heavy woods', 'sweet gourmand', 'thick musks'],
      idealConcentration: { min: 5, max: 10 },
      characteristics: ['refreshing', 'light', 'transparent', 'breezy', 'cooling'],
    },
    [Season.AUTUMN]: {
      season: Season.AUTUMN,
      recommendedFamilies: ['woody', 'spicy', 'oriental', 'amber', 'chypre'],
      recommendedNotes: ['cinnamon', 'clove', 'sandalwood', 'patchouli', 'oakmoss', 'tobacco', 'dried fruits'],
      avoidNotes: ['light citrus only', 'watery notes', 'fresh green'],
      idealConcentration: { min: 12, max: 20 },
      characteristics: ['warm', 'spicy', 'earthy', 'rich', 'comforting'],
    },
    [Season.WINTER]: {
      season: Season.WINTER,
      recommendedFamilies: ['oriental', 'gourmand', 'woody', 'amber', 'resinous'],
      recommendedNotes: ['vanilla', 'tonka', 'benzoin', 'amber', 'oud', 'incense', 'chocolate', 'coffee'],
      avoidNotes: ['light citrus', 'aquatic', 'fresh green', 'calone'],
      idealConcentration: { min: 15, max: 25 },
      characteristics: ['rich', 'warm', 'enveloping', 'comforting', 'long-lasting'],
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // MAIN OPTIMIZATION FUNCTION
  // ═══════════════════════════════════════════════════════════════

  optimizeForConditions(
    formula: Formula,
    baseConcentration: number,
    conditions: EnvironmentalConditions,
  ): OptimizationResult {
    // Calculate environmental impact factors
    const evaporationRate = this.calculateEvaporationRate(conditions);
    const diffusionRate = this.calculateDiffusionRate(conditions);

    // Adjust overall concentration
    const adjustedConcentration = this.adjustConcentration(
      baseConcentration,
      evaporationRate,
      conditions,
    );

    // Adjust individual ingredients based on volatility
    const adjustedIngredients = this.adjustIngredients(
      formula,
      conditions,
      evaporationRate,
    );

    // Calculate performance multipliers
    const projectionMultiplier = this.calculateProjection(conditions, diffusionRate);
    const longevityMultiplier = this.calculateLongevity(conditions, evaporationRate);
    const sillageMultiplier = this.calculateSillage(conditions, diffusionRate);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      conditions,
      evaporationRate,
      longevityMultiplier,
    );

    // Scientific explanation
    const scientificExplanation = this.generateScientificExplanation(
      conditions,
      evaporationRate,
      diffusionRate,
    );

    return {
      originalFormula: {
        name: formula.name,
        concentration: baseConcentration,
      },
      optimizedFormula: {
        adjustedConcentration,
        adjustedIngredients,
        projectionMultiplier,
        longevityMultiplier,
        sillageMultiplier,
      },
      recommendations,
      scientificExplanation,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // EVAPORATION RATE CALCULATION
  // ═══════════════════════════════════════════════════════════════

  private calculateEvaporationRate(conditions: EnvironmentalConditions): number {
    let rate = 1.0; // Baseline

    // Temperature effect (exponential relationship)
    const tempDelta = conditions.temperature - SeasonalOptimizerService.BASELINE_TEMP;
    rate *= Math.exp(tempDelta * SeasonalOptimizerService.EVAPORATION_TEMP_COEFFICIENT);

    // Humidity effect (inverse relationship - higher humidity slows evaporation)
    const humidityDelta = conditions.humidity - SeasonalOptimizerService.BASELINE_HUMIDITY;
    rate *= (1 - humidityDelta * SeasonalOptimizerService.HUMIDITY_COEFFICIENT);

    // Altitude effect (lower air pressure = faster evaporation)
    if (conditions.altitude) {
      const altitudeKm = conditions.altitude / 1000;
      rate *= (1 + altitudeKm * SeasonalOptimizerService.ALTITUDE_COEFFICIENT);
    }

    // Activity level effect (body heat)
    if (conditions.activityLevel === 'active') {
      rate *= 1.3; // 30% faster evaporation with active body heat
    } else if (conditions.activityLevel === 'moderate') {
      rate *= 1.15; // 15% faster
    }

    return Math.max(0.3, Math.min(3.0, rate)); // Clamp between 0.3x and 3.0x
  }

  // ═══════════════════════════════════════════════════════════════
  // DIFFUSION RATE CALCULATION
  // ═══════════════════════════════════════════════════════════════

  private calculateDiffusionRate(conditions: EnvironmentalConditions): number {
    let rate = 1.0;

    // Higher temperature = faster molecular movement = better diffusion
    const tempDelta = conditions.temperature - SeasonalOptimizerService.BASELINE_TEMP;
    rate *= (1 + tempDelta * 0.025);

    // Higher humidity = molecules travel slower through humid air
    const humidityDelta = conditions.humidity - SeasonalOptimizerService.BASELINE_HUMIDITY;
    rate *= (1 - humidityDelta * 0.003);

    return Math.max(0.5, Math.min(2.0, rate));
  }

  // ═══════════════════════════════════════════════════════════════
  // CONCENTRATION ADJUSTMENT
  // ═══════════════════════════════════════════════════════════════

  private adjustConcentration(
    baseConcentration: number,
    evaporationRate: number,
    conditions: EnvironmentalConditions,
  ): number {
    let adjusted = baseConcentration;

    // If evaporation is fast, increase concentration to compensate
    if (evaporationRate > 1.3) {
      adjusted *= 1.2; // Increase by 20%
    } else if (evaporationRate > 1.6) {
      adjusted *= 1.4; // Increase by 40% for very hot conditions
    }

    // For summer or tropical climates, reduce concentration (less is more)
    if (conditions.season === Season.SUMMER || conditions.climate === Climate.TROPICAL) {
      adjusted *= 0.85; // Reduce by 15%
    }

    // For winter or cold climates, increase concentration
    if (conditions.season === Season.WINTER || conditions.climate === Climate.POLAR) {
      adjusted *= 1.25; // Increase by 25%
    }

    return Math.round(adjusted * 10) / 10; // Round to 1 decimal
  }

  // ═══════════════════════════════════════════════════════════════
  // INGREDIENT ADJUSTMENT
  // ═══════════════════════════════════════════════════════════════

  private adjustIngredients(
    formula: Formula,
    conditions: EnvironmentalConditions,
    evaporationRate: number,
  ): Array<{
    name: string;
    originalPercentage: number;
    optimizedPercentage: number;
    adjustment: number;
    reason: string;
  }> {
    if (!formula.ingredients || formula.ingredients.length === 0) {
      return [];
    }

    return formula.ingredients.map((fi) => {
      const ingredient = fi.ingredient;
      let adjustment = 1.0;
      let reason = 'No adjustment needed';

      // HOT CONDITIONS (fast evaporation)
      if (evaporationRate > 1.3) {
        // Reduce top notes (they'll evaporate too quickly)
        if (ingredient.volatility === 'top') {
          adjustment = 0.7; // Reduce by 30%
          reason = 'Top notes evaporate too quickly in heat - reduced';
        }
        // Increase heart and base notes (to compensate)
        else if (ingredient.volatility === 'heart') {
          adjustment = 1.15; // Increase by 15%
          reason = 'Heart notes boosted to maintain presence';
        } else if (ingredient.volatility === 'base') {
          adjustment = 1.3; // Increase by 30%
          reason = 'Base notes increased for longevity in heat';
        }
      }

      // COLD CONDITIONS (slow evaporation)
      else if (evaporationRate < 0.8) {
        // Increase top notes (they need help projecting)
        if (ingredient.volatility === 'top') {
          adjustment = 1.4; // Increase by 40%
          reason = 'Top notes boosted for better projection in cold';
        }
        // Reduce base notes slightly (they'll last forever anyway)
        else if (ingredient.volatility === 'base') {
          adjustment = 0.85; // Reduce by 15%
          reason = 'Base notes already long-lasting in cold - reduced';
        }
      }

      // HIGH HUMIDITY
      if (conditions.humidity > 70) {
        // Fresh/aquatic notes work better
        if (ingredient.odorProfile?.some(note =>
          ['aquatic', 'marine', 'watery', 'fresh', 'green'].includes(note)
        )) {
          adjustment *= 1.2;
          reason += ' | Fresh notes enhanced for humid conditions';
        }
      }

      // LOW HUMIDITY (dry air)
      if (conditions.humidity < 40) {
        // Rich, warm notes work better
        if (ingredient.odorProfile?.some(note =>
          ['amber', 'woody', 'resinous', 'balsamic', 'warm'].includes(note)
        )) {
          adjustment *= 1.15;
          reason += ' | Warm notes enhanced for dry air';
        }
      }

      const originalPercentage = fi.percentage;
      const optimizedPercentage = Math.round(originalPercentage * adjustment * 100) / 100;

      return {
        name: ingredient.name,
        originalPercentage,
        optimizedPercentage,
        adjustment: Math.round((adjustment - 1) * 100), // % change
        reason,
      };
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PERFORMANCE CALCULATIONS
  // ═══════════════════════════════════════════════════════════════

  private calculateProjection(
    conditions: EnvironmentalConditions,
    diffusionRate: number,
  ): number {
    // Projection = how far the scent travels from your body
    let multiplier = diffusionRate;

    // Hot weather = better projection
    if (conditions.temperature > 25) {
      multiplier *= 1.3;
    }

    // Activity increases projection (body heat + air movement)
    if (conditions.activityLevel === 'active') {
      multiplier *= 1.4;
    }

    return Math.round(multiplier * 100) / 100;
  }

  private calculateLongevity(
    conditions: EnvironmentalConditions,
    evaporationRate: number,
  ): number {
    // Longevity = how long the perfume lasts
    // Inverse of evaporation rate
    let multiplier = 1 / evaporationRate;

    // Cold weather = longer lasting
    if (conditions.temperature < 10) {
      multiplier *= 1.4;
    }

    // High humidity = slower evaporation = longer lasting
    if (conditions.humidity > 70) {
      multiplier *= 1.2;
    }

    return Math.round(multiplier * 100) / 100;
  }

  private calculateSillage(
    conditions: EnvironmentalConditions,
    diffusionRate: number,
  ): number {
    // Sillage = the trail left behind
    let multiplier = diffusionRate;

    // Temperature affects sillage
    if (conditions.temperature > 25) {
      multiplier *= 1.25; // Hot weather = better sillage
    } else if (conditions.temperature < 10) {
      multiplier *= 0.75; // Cold weather = reduced sillage
    }

    return Math.round(multiplier * 100) / 100;
  }

  // ═══════════════════════════════════════════════════════════════
  // RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════

  private generateRecommendations(
    conditions: EnvironmentalConditions,
    evaporationRate: number,
    longevityMultiplier: number,
  ): {
    applicationTips: string[];
    storageAdvice: string[];
    wearDuration: string;
    reapplicationNeeded: boolean;
  } {
    const tips: string[] = [];
    const storage: string[] = [];
    let wearDuration = '6-8 hours';
    let reapplication = false;

    // HOT WEATHER TIPS
    if (conditions.temperature > 25) {
      tips.push('Apply to pulse points (wrists, neck, behind ears)');
      tips.push('Avoid over-application - heat amplifies projection');
      tips.push('Consider applying to clothing for longer lasting scent');
      tips.push('Spray on hair (if alcohol-free) for subtle sillage');
      storage.push('Store in cool, dark place - heat degrades perfume');
      storage.push('Keep in refrigerator for maximum preservation');
      wearDuration = '3-5 hours';
      reapplication = true;
    }

    // COLD WEATHER TIPS
    if (conditions.temperature < 10) {
      tips.push('Apply more generously - cold reduces projection');
      tips.push('Layer with matching body lotion for better longevity');
      tips.push('Apply to warm areas: chest, inner elbows');
      tips.push('Spray before going outside (body heat helps diffusion)');
      wearDuration = '10-12 hours';
      reapplication = false;
    }

    // HIGH HUMIDITY TIPS
    if (conditions.humidity > 70) {
      tips.push('Fresh, aquatic scents work best in humid weather');
      tips.push('Avoid heavy, sweet fragrances (can become cloying)');
      storage.push('Use dehumidifier in storage area');
    }

    // LOW HUMIDITY TIPS
    if (conditions.humidity < 40) {
      tips.push('Moisturize skin before application (perfume lasts longer)');
      tips.push('Rich, warm fragrances perform better in dry air');
      storage.push('Normal room storage is fine for dry climates');
    }

    // HIGH ALTITUDE TIPS
    if (conditions.altitude && conditions.altitude > 2000) {
      tips.push('Perfumes evaporate faster at high altitude');
      tips.push('Apply 20-30% more than usual');
      reapplication = true;
    }

    // ACTIVITY LEVEL TIPS
    if (conditions.activityLevel === 'active') {
      tips.push('Use lighter concentrations for sports/gym');
      tips.push('Apply to clothing rather than skin (less mixing with sweat)');
      tips.push('Avoid heavy fragrances during physical activity');
      wearDuration = '2-3 hours';
      reapplication = true;
    }

    // General storage advice
    storage.push('Keep bottles tightly closed when not in use');
    storage.push('Avoid direct sunlight exposure');
    storage.push('Store upright to prevent leakage');

    return {
      applicationTips: tips,
      storageAdvice: storage,
      wearDuration,
      reapplicationNeeded: reapplication,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // SCIENTIFIC EXPLANATION
  // ═══════════════════════════════════════════════════════════════

  private generateScientificExplanation(
    conditions: EnvironmentalConditions,
    evaporationRate: number,
    diffusionRate: number,
  ): {
    evaporationRate: number;
    diffusionRate: number;
    volatilityImpact: string;
    humidityEffect: string;
    temperatureEffect: string;
  } {
    let volatilityImpact = '';
    let humidityEffect = '';
    let temperatureEffect = '';

    // Evaporation analysis
    if (evaporationRate > 1.5) {
      volatilityImpact = 'Very fast evaporation - top notes will disappear within 30 minutes, base notes within 4 hours. Formula needs adjustment for heat.';
    } else if (evaporationRate > 1.2) {
      volatilityImpact = 'Accelerated evaporation - top notes last 1 hour, overall longevity reduced by 30-40%.';
    } else if (evaporationRate < 0.8) {
      volatilityImpact = 'Slow evaporation - perfume will last 50% longer but projection is reduced. Top notes linger for 3-4 hours.';
    } else {
      volatilityImpact = 'Normal evaporation rate - perfume performs as designed. Standard longevity expected.';
    }

    // Humidity analysis
    if (conditions.humidity > 70) {
      humidityEffect = 'High humidity slows evaporation and reduces projection. Water molecules in air compete with perfume molecules. Fresh scents work better.';
    } else if (conditions.humidity < 40) {
      humidityEffect = 'Low humidity accelerates evaporation. Dry air allows molecules to disperse freely. Warm, rich scents perform well.';
    } else {
      humidityEffect = 'Optimal humidity range for balanced performance. Perfume molecules diffuse naturally without interference.';
    }

    // Temperature analysis
    if (conditions.temperature > 28) {
      temperatureEffect = 'High temperature increases molecular kinetic energy, causing rapid evaporation. Top notes disappear quickly but projection is excellent. Risk of olfactory fatigue.';
    } else if (conditions.temperature < 12) {
      temperatureEffect = 'Low temperature reduces molecular movement. Evaporation is slow, longevity is excellent, but projection and sillage are diminished. Warmth needed for activation.';
    } else {
      temperatureEffect = 'Ideal temperature range (12-28°C) for balanced evaporation, projection, and longevity. Perfume performs as formulated.';
    }

    return {
      evaporationRate: Math.round(evaporationRate * 100) / 100,
      diffusionRate: Math.round(diffusionRate * 100) / 100,
      volatilityImpact,
      humidityEffect,
      temperatureEffect,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // SEASONAL PROFILE QUERIES
  // ═══════════════════════════════════════════════════════════════

  getSeasonalProfile(season: Season): SeasonalProfile {
    return SeasonalOptimizerService.SEASONAL_PROFILES[season];
  }

  getAllSeasonalProfiles(): SeasonalProfile[] {
    return Object.values(SeasonalOptimizerService.SEASONAL_PROFILES);
  }

  // ═══════════════════════════════════════════════════════════════
  // CLIMATE RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════

  getClimateRecommendations(climate: Climate): {
    climate: Climate;
    bestFamilies: string[];
    bestNotes: string[];
    avoidNotes: string[];
    tips: string[];
  } {
    const recommendations = {
      [Climate.TROPICAL]: {
        climate: Climate.TROPICAL,
        bestFamilies: ['citrus', 'aquatic', 'fresh', 'green', 'light floral'],
        bestNotes: ['lemon', 'bergamot', 'grapefruit', 'sea notes', 'green tea', 'bamboo', 'coconut'],
        avoidNotes: ['heavy vanilla', 'thick amber', 'oud', 'tobacco', 'leather', 'patchouli'],
        tips: [
          'Use EdT or EdC concentrations (5-10%)',
          'Apply sparingly - heat amplifies everything',
          'Fresh, transparent scents work best',
          'Reapply every 3-4 hours',
        ],
      },
      [Climate.MEDITERRANEAN]: {
        climate: Climate.MEDITERRANEAN,
        bestFamilies: ['citrus', 'aromatic', 'chypre', 'light oriental'],
        bestNotes: ['lavender', 'rosemary', 'bergamot', 'neroli', 'oakmoss', 'herbs'],
        avoidNotes: ['very sweet gourmand', 'heavy musks'],
        tips: [
          'EdT concentration (8-15%) works perfectly',
          'Aromatic Mediterranean herbs shine here',
          'Balance freshness with depth',
        ],
      },
      [Climate.TEMPERATE]: {
        climate: Climate.TEMPERATE,
        bestFamilies: ['all families work well'],
        bestNotes: ['versatile - seasonal variation recommended'],
        avoidNotes: ['none - adjust by season'],
        tips: [
          'Most versatile climate for perfumery',
          'Adjust by season rather than climate',
          'EdP concentration (15-20%) is ideal',
        ],
      },
      [Climate.CONTINENTAL]: {
        climate: Climate.CONTINENTAL,
        bestFamilies: ['oriental', 'woody', 'chypre', 'amber', 'spicy'],
        bestNotes: ['sandalwood', 'cedar', 'amber', 'vanilla', 'spices', 'resins'],
        avoidNotes: ['light citrus only', 'aquatic', 'very fresh'],
        tips: [
          'Rich, warm fragrances perform best',
          'EdP or Extrait (15-25%) recommended',
          'Apply generously for projection',
          'Longevity is excellent in cold, dry air',
        ],
      },
      [Climate.POLAR]: {
        climate: Climate.POLAR,
        bestFamilies: ['oriental', 'gourmand', 'amber', 'resinous'],
        bestNotes: ['vanilla', 'tonka', 'benzoin', 'amber', 'balsams', 'incense'],
        avoidNotes: ['fresh', 'aquatic', 'citrus only', 'green'],
        tips: [
          'Maximum concentration needed (20-30%)',
          'Very rich, enveloping fragrances only',
          'Apply to chest area (needs body heat)',
          'Extremely long-lasting but low projection',
        ],
      },
    };

    return recommendations[climate];
  }

  // ═══════════════════════════════════════════════════════════════
  // AUTO-DETECT SEASON FROM CONDITIONS
  // ═══════════════════════════════════════════════════════════════

  detectSeasonFromConditions(conditions: EnvironmentalConditions): Season {
    if (conditions.season) {
      return conditions.season;
    }

    // Auto-detect from temperature
    const temp = conditions.temperature;

    if (temp >= 25) return Season.SUMMER;
    if (temp >= 15) return Season.SPRING;
    if (temp >= 5) return Season.AUTUMN;
    return Season.WINTER;
  }
}
