/**
 * MOOD COMPOSER SERVICE
 *
 * Revolutionary AI-powered mood-based perfume composition system.
 * Creates formulas that evoke specific emotions and psychological states.
 *
 * Based on:
 * - Olfactive psychology research
 * - Aromatherapy principles
 * - Emotional scent associations
 * - Cultural mood-scent mappings
 * - Neuroscience of smell and emotion
 */

import { Injectable } from '@nestjs/common';
import { Ingredient, VolatilityLevel } from '../entities/ingredient.entity';
import { FibonacciPerfumeEngine } from '../utils/fibonacci-engine';

export enum MoodCategory {
  SERENITY = 'serenity',         // Calm, peaceful, meditative
  ENERGY = 'energy',             // Uplifting, energizing, vibrant
  SENSUALITY = 'sensuality',     // Romantic, intimate, alluring
  ELEGANCE = 'elegance',         // Sophisticated, refined, graceful
  MYSTERY = 'mystery',           // Enigmatic, deep, intriguing
  JOY = 'joy',                   // Happy, bright, cheerful
  CONFIDENCE = 'confidence',     // Strong, assertive, powerful
  NOSTALGIA = 'nostalgia',       // Comforting, familiar, sentimental
  ADVENTURE = 'adventure',       // Exciting, bold, daring
  CALM = 'calm',                 // Soothing, relaxing, gentle
}

export interface MoodProfile {
  mood: MoodCategory;
  intensity: number; // 1-10
  timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night';
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  occasion?: string;
}

export interface MoodComposition {
  mood: MoodCategory;
  ingredients: Array<{
    ingredient: Ingredient;
    percentage: number;
    emotionalRole: string;
    psychologicalEffect: string;
  }>;
  olfactiveSignature: string;
  expectedEmotionalJourney: string[];
  aromatherapyNotes: string[];
}

@Injectable()
export class MoodComposerService {
  // Mood-to-ingredient mappings based on olfactive psychology
  private static readonly MOOD_INGREDIENT_MAP: Record<MoodCategory, {
    top: string[];
    heart: string[];
    base: string[];
    key_effects: string[];
  }> = {
    [MoodCategory.SERENITY]: {
      top: ['Bergamot Oil', 'Lavender Oil (French)', 'Neroli (Orange Blossom)'],
      heart: ['Rose Otto (Bulgarian Rose)', 'Jasmine Absolute', 'Chamomile'],
      base: ['Sandalwood Oil (Mysore)', 'Benzoin Resinoid', 'Vanilla Absolute'],
      key_effects: ['Stress reduction', 'Mental clarity', 'Inner peace', 'Meditation support'],
    },
    [MoodCategory.ENERGY]: {
      top: ['Lemon Oil', 'Grapefruit Oil', 'Bergamot Oil', 'Rosemary Oil'],
      heart: ['African Ginger CO2', 'Black Pepper Oil', 'Cardamom Oil'],
      base: ['Vetiver Oil (Haiti)', 'Cedarwood Virginia', 'Ambroxan'],
      key_effects: ['Mental alertness', 'Physical vitality', 'Motivation', 'Focus enhancement'],
    },
    [MoodCategory.SENSUALITY]: {
      top: ['Bergamot Oil', 'Neroli (Orange Blossom)'],
      heart: ['Jasmine Absolute', 'Tuberose Absolute', 'Ylang Ylang Complete'],
      base: ['Sandalwood Oil (Mysore)', 'Vanilla Absolute', 'Tonka Bean Absolute', 'Ambroxan'],
      key_effects: ['Intimacy', 'Warmth', 'Attraction', 'Confidence'],
    },
    [MoodCategory.ELEGANCE]: {
      top: ['Bergamot Oil', 'Neroli (Orange Blossom)'],
      heart: ['Rose Otto (Bulgarian Rose)', 'Iris Butter Absolute', 'Jasmine Absolute'],
      base: ['Sandalwood Oil (Mysore)', 'Patchouli Oil', 'Galaxolide'],
      key_effects: ['Sophistication', 'Grace', 'Refinement', 'Prestige'],
    },
    [MoodCategory.MYSTERY]: {
      top: ['Bergamot Oil', 'Black Pepper Oil'],
      heart: ['Frankincense Oil (Boswellia sacra)', 'Myrrh Oil'],
      base: ['Oud Oil (Agarwood)', 'Patchouli Oil', 'Labdanum Absolute', 'Iso E Super'],
      key_effects: ['Intrigue', 'Depth', 'Complexity', 'Allure'],
    },
    [MoodCategory.JOY]: {
      top: ['Bergamot Oil', 'Neroli (Orange Blossom)', 'Grapefruit Oil'],
      heart: ['Jasmine Absolute', 'Ylang Ylang Complete', 'Orange Blossom Absolute'],
      base: ['Vanilla Absolute', 'Tonka Bean Absolute', 'Ambroxan'],
      key_effects: ['Happiness', 'Optimism', 'Light-heartedness', 'Positivity'],
    },
    [MoodCategory.CONFIDENCE]: {
      top: ['Bergamot Oil', 'Grapefruit Oil', 'Black Pepper Oil'],
      heart: ['Cardamom Oil', 'Clove Bud Oil', 'Geranium'],
      base: ['Vetiver Oil (Haiti)', 'Patchouli Oil', 'Cedarwood Virginia', 'Iso E Super'],
      key_effects: ['Assertiveness', 'Strength', 'Leadership', 'Self-assurance'],
    },
    [MoodCategory.NOSTALGIA]: {
      top: ['Bergamot Oil', 'Lavender Oil (French)'],
      heart: ['Heliotropine', 'Rose Otto (Bulgarian Rose)', 'Violet Leaf Absolute'],
      base: ['Vanilla Absolute', 'Tonka Bean Absolute', 'Benzoin Resinoid'],
      key_effects: ['Comfort', 'Familiarity', 'Warmth', 'Sentimentality'],
    },
    [MoodCategory.ADVENTURE]: {
      top: ['Lemon Oil', 'Bergamot Oil', 'Ginger'],
      heart: ['Cardamom Oil', 'Black Pepper Oil', 'African Ginger CO2'],
      base: ['Vetiver Oil (Haiti)', 'Oud Oil (Agarwood)', 'Ambroxan'],
      key_effects: ['Excitement', 'Boldness', 'Exploration', 'Courage'],
    },
    [MoodCategory.CALM]: {
      top: ['Lavender Oil (French)', 'Bergamot Oil', 'Neroli (Orange Blossom)'],
      heart: ['Rose Otto (Bulgarian Rose)', 'Jasmine Absolute'],
      base: ['Sandalwood Oil (Mysore)', 'Benzoin Resinoid', 'Vanilla Absolute'],
      key_effects: ['Relaxation', 'Peace', 'Gentleness', 'Tranquility'],
    },
  };

  /**
   * Compose perfume based on mood profile
   */
  async composeMoodPerfume(
    profile: MoodProfile,
    availableIngredients: Ingredient[]
  ): Promise<MoodComposition> {
    const moodMap = MoodComposerService.MOOD_INGREDIENT_MAP[profile.mood];

    // Filter ingredients by mood mapping
    const topIngredients = this.filterIngredientsByNames(availableIngredients, moodMap.top);
    const heartIngredients = this.filterIngredientsByNames(availableIngredients, moodMap.heart);
    const baseIngredients = this.filterIngredientsByNames(availableIngredients, moodMap.base);

    // Calculate Fibonacci ratios based on intensity
    const pyramidRatios = FibonacciPerfumeEngine.calculatePyramidRatios(
      profile.intensity > 7 ? 'complex' : profile.intensity > 4 ? 'medium' : 'simple'
    );

    // Distribute ingredients using Fibonacci spiral
    const topPercentages = FibonacciPerfumeEngine.spiralDistribution(
      topIngredients.length,
      pyramidRatios.top,
      true
    );

    const heartPercentages = FibonacciPerfumeEngine.spiralDistribution(
      heartIngredients.length,
      pyramidRatios.heart,
      false
    );

    const basePercentages = FibonacciPerfumeEngine.spiralDistribution(
      baseIngredients.length,
      pyramidRatios.base,
      true
    );

    // Build composition
    const composition: MoodComposition['ingredients'] = [];

    // Add top notes with emotional roles
    topIngredients.forEach((ing, i) => {
      composition.push({
        ingredient: ing,
        percentage: topPercentages[i],
        emotionalRole: this.getEmotionalRole(ing, 'top', profile.mood),
        psychologicalEffect: this.getPsychologicalEffect(ing, profile.mood),
      });
    });

    // Add heart notes
    heartIngredients.forEach((ing, i) => {
      composition.push({
        ingredient: ing,
        percentage: heartPercentages[i],
        emotionalRole: this.getEmotionalRole(ing, 'heart', profile.mood),
        psychologicalEffect: this.getPsychologicalEffect(ing, profile.mood),
      });
    });

    // Add base notes
    baseIngredients.forEach((ing, i) => {
      composition.push({
        ingredient: ing,
        percentage: basePercentages[i],
        emotionalRole: this.getEmotionalRole(ing, 'base', profile.mood),
        psychologicalEffect: this.getPsychologicalEffect(ing, profile.mood),
      });
    });

    // Generate olfactive signature
    const topNotes = topIngredients.map(i => i.odorProfile[0]).slice(0, 2).join('-');
    const heartNotes = heartIngredients.map(i => i.odorProfile[0]).slice(0, 2).join('-');
    const baseNotes = baseIngredients.map(i => i.odorProfile[0]).slice(0, 2).join('-');

    return {
      mood: profile.mood,
      ingredients: composition,
      olfactiveSignature: `${topNotes} / ${heartNotes} / ${baseNotes}`,
      expectedEmotionalJourney: this.generateEmotionalJourney(profile.mood, profile.timeOfDay),
      aromatherapyNotes: moodMap.key_effects,
    };
  }

  /**
   * Generate emotional journey description
   */
  private generateEmotionalJourney(mood: MoodCategory, timeOfDay?: string): string[] {
    const journeys: Record<MoodCategory, string[]> = {
      [MoodCategory.SERENITY]: [
        'Initial spray: Instant calming wave washes over',
        'After 15 min: Mental clarity begins to emerge',
        'After 1 hour: Deep inner peace settles in',
        'After 4 hours: Gentle meditation continues',
      ],
      [MoodCategory.ENERGY]: [
        'Initial spray: Invigorating burst of vitality',
        'After 15 min: Mental alertness heightens',
        'After 1 hour: Sustained focus and motivation',
        'After 4 hours: Grounded, energetic presence',
      ],
      [MoodCategory.SENSUALITY]: [
        'Initial spray: Alluring warmth awakens',
        'After 15 min: Intimate confidence emerges',
        'After 1 hour: Deep sensual richness',
        'After 4 hours: Lingering seductive trail',
      ],
      [MoodCategory.ELEGANCE]: [
        'Initial spray: Refined sophistication announces',
        'After 15 min: Graceful presence develops',
        'After 1 hour: Timeless elegance unfolds',
        'After 4 hours: Distinguished aura remains',
      ],
      [MoodCategory.MYSTERY]: [
        'Initial spray: Enigmatic intrigue captivates',
        'After 15 min: Depths reveal slowly',
        'After 1 hour: Complex layers emerge',
        'After 4 hours: Mysterious allure persists',
      ],
      [MoodCategory.JOY]: [
        'Initial spray: Bright happiness radiates',
        'After 15 min: Cheerful optimism blooms',
        'After 1 hour: Sustained joyful mood',
        'After 4 hours: Lingering light-heartedness',
      ],
      [MoodCategory.CONFIDENCE]: [
        'Initial spray: Bold assertiveness emerges',
        'After 15 min: Strong self-assurance builds',
        'After 1 hour: Commanding presence establishes',
        'After 4 hours: Powerful aura continues',
      ],
      [MoodCategory.NOSTALGIA]: [
        'Initial spray: Familiar comfort envelops',
        'After 15 min: Sweet memories surface',
        'After 1 hour: Warm sentimentality deepens',
        'After 4 hours: Gentle nostalgia lingers',
      ],
      [MoodCategory.ADVENTURE]: [
        'Initial spray: Exciting rush begins',
        'After 15 min: Daring spirit awakens',
        'After 1 hour: Bold exploration continues',
        'After 4 hours: Adventurous essence remains',
      ],
      [MoodCategory.CALM]: [
        'Initial spray: Peaceful tranquility descends',
        'After 15 min: Gentle relaxation spreads',
        'After 1 hour: Deep calmness settles',
        'After 4 hours: Serene quietude persists',
      ],
    };

    return journeys[mood] || [];
  }

  /**
   * Get emotional role of ingredient
   */
  private getEmotionalRole(ing: Ingredient, layer: string, mood: MoodCategory): string {
    const roles = {
      top: {
        [MoodCategory.SERENITY]: 'Instant calming opener',
        [MoodCategory.ENERGY]: 'Invigorating spark',
        [MoodCategory.SENSUALITY]: 'Alluring invitation',
        [MoodCategory.ELEGANCE]: 'Refined introduction',
        [MoodCategory.MYSTERY]: 'Enigmatic veil',
        [MoodCategory.JOY]: 'Bright happiness burst',
        [MoodCategory.CONFIDENCE]: 'Bold statement',
        [MoodCategory.NOSTALGIA]: 'Familiar comfort',
        [MoodCategory.ADVENTURE]: 'Exciting rush',
        [MoodCategory.CALM]: 'Peaceful opening',
      },
      heart: {
        [MoodCategory.SERENITY]: 'Meditative core',
        [MoodCategory.ENERGY]: 'Vital essence',
        [MoodCategory.SENSUALITY]: 'Intimate heart',
        [MoodCategory.ELEGANCE]: 'Graceful soul',
        [MoodCategory.MYSTERY]: 'Deep enigma',
        [MoodCategory.JOY]: 'Joyful spirit',
        [MoodCategory.CONFIDENCE]: 'Powerful center',
        [MoodCategory.NOSTALGIA]: 'Sentimental core',
        [MoodCategory.ADVENTURE]: 'Daring essence',
        [MoodCategory.CALM]: 'Tranquil heart',
      },
      base: {
        [MoodCategory.SERENITY]: 'Grounding peace',
        [MoodCategory.ENERGY]: 'Sustained vitality',
        [MoodCategory.SENSUALITY]: 'Lingering warmth',
        [MoodCategory.ELEGANCE]: 'Timeless foundation',
        [MoodCategory.MYSTERY]: 'Lasting intrigue',
        [MoodCategory.JOY]: 'Enduring happiness',
        [MoodCategory.CONFIDENCE]: 'Commanding presence',
        [MoodCategory.NOSTALGIA]: 'Comforting embrace',
        [MoodCategory.ADVENTURE]: 'Brave spirit',
        [MoodCategory.CALM]: 'Deep serenity',
      },
    };

    return roles[layer]?.[mood] || 'Supporting note';
  }

  /**
   * Get psychological effect of ingredient
   */
  private getPsychologicalEffect(ing: Ingredient, mood: MoodCategory): string {
    // Simplified - in real app would have comprehensive database
    const effects: Record<string, string> = {
      'Lavender': 'Reduces anxiety and promotes relaxation',
      'Bergamot': 'Uplifts mood and reduces stress',
      'Jasmine': 'Enhances confidence and sensuality',
      'Rose': 'Promotes emotional well-being',
      'Sandalwood': 'Grounds and centers',
      'Vanilla': 'Comforts and soothes',
      'Patchouli': 'Grounds and stabilizes',
      'Vetiver': 'Calms and focuses',
      'Ylang Ylang': 'Enhances sensuality and joy',
      'Frankincense': 'Promotes meditation and clarity',
    };

    const name = ing.name.split(' ')[0];
    return effects[name] || 'Supports emotional balance';
  }

  /**
   * Filter ingredients by names
   */
  private filterIngredientsByNames(ingredients: Ingredient[], names: string[]): Ingredient[] {
    return ingredients.filter(ing =>
      names.some(name => ing.name.includes(name) || name.includes(ing.name.split(' ')[0]))
    );
  }

  /**
   * Get mood recommendations based on time and season
   */
  static getMoodRecommendations(timeOfDay: string, season: string): MoodCategory[] {
    const recommendations: Record<string, MoodCategory[]> = {
      'dawn_spring': [MoodCategory.SERENITY, MoodCategory.JOY, MoodCategory.CALM],
      'day_spring': [MoodCategory.ENERGY, MoodCategory.JOY, MoodCategory.ELEGANCE],
      'dusk_spring': [MoodCategory.ELEGANCE, MoodCategory.SENSUALITY, MoodCategory.CALM],
      'night_spring': [MoodCategory.SENSUALITY, MoodCategory.MYSTERY, MoodCategory.NOSTALGIA],

      'dawn_summer': [MoodCategory.ENERGY, MoodCategory.JOY, MoodCategory.ADVENTURE],
      'day_summer': [MoodCategory.JOY, MoodCategory.ENERGY, MoodCategory.CONFIDENCE],
      'dusk_summer': [MoodCategory.SENSUALITY, MoodCategory.ADVENTURE, MoodCategory.JOY],
      'night_summer': [MoodCategory.SENSUALITY, MoodCategory.MYSTERY, MoodCategory.ADVENTURE],

      'dawn_autumn': [MoodCategory.CALM, MoodCategory.NOSTALGIA, MoodCategory.SERENITY],
      'day_autumn': [MoodCategory.ELEGANCE, MoodCategory.CONFIDENCE, MoodCategory.NOSTALGIA],
      'dusk_autumn': [MoodCategory.MYSTERY, MoodCategory.ELEGANCE, MoodCategory.NOSTALGIA],
      'night_autumn': [MoodCategory.MYSTERY, MoodCategory.SENSUALITY, MoodCategory.NOSTALGIA],

      'dawn_winter': [MoodCategory.SERENITY, MoodCategory.CALM, MoodCategory.NOSTALGIA],
      'day_winter': [MoodCategory.CONFIDENCE, MoodCategory.ELEGANCE, MoodCategory.CALM],
      'dusk_winter': [MoodCategory.MYSTERY, MoodCategory.ELEGANCE, MoodCategory.SENSUALITY],
      'night_winter': [MoodCategory.SENSUALITY, MoodCategory.MYSTERY, MoodCategory.NOSTALGIA],
    };

    const key = `${timeOfDay}_${season}`;
    return recommendations[key] || [MoodCategory.ELEGANCE, MoodCategory.JOY, MoodCategory.CALM];
  }
}
