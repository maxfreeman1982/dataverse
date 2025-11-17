/**
 * PERFUME NAME GENERATOR
 *
 * AI-powered intelligent perfume name generator using:
 * - Linguistic patterns from famous perfumes
 * - Mood and olfactive family associations
 * - Regional and cultural influences
 * - Poetic and evocative language
 * - Multi-language support (French, English, Arabic, etc.)
 */

import { FormulaMood } from '../entities/formula.entity';

export interface NameGenerationRequest {
  mood?: FormulaMood;
  style?: string;
  region?: string;
  olfactiveFamilies?: string[];
  dominantIngredients?: string[];
  gender?: 'masculine' | 'feminine' | 'unisex';
  language?: 'french' | 'english' | 'arabic' | 'mixed';
  style_type?: 'classic' | 'modern' | 'poetic' | 'minimalist' | 'luxury';
}

export interface GeneratedName {
  name: string;
  language: string;
  style: string;
  reasoning: string;
  alternateSpellings?: string[];
}

export class PerfumeNameGenerator {
  // French luxury perfume vocabulary
  private static readonly FRENCH_LUXURY_WORDS = {
    feminine: ['Belle', 'Élégance', 'Lumière', 'Grâce', 'Étoile', 'Aurore', 'Céleste', 'Divine'],
    masculine: ['Noir', 'Intense', 'Absolu', 'Immortel', 'Sauvage', 'Ultime', 'Conquête', 'Triomphe'],
    unisex: ['Essence', 'Nuage', 'Voyage', 'Rêve', 'Mystère', 'Horizon', 'Évasion', 'Liberté'],
    florals: ['Rose', 'Jasmin', 'Iris', 'Pivoine', 'Magnolia', 'Tubéreuse', 'Violette'],
    woods: ['Bois', 'Cèdre', 'Santal', 'Oud', 'Vétiver', 'Patchouli'],
    nature: ['Jardin', 'Forêt', 'Océan', 'Terre', 'Ciel', 'Lune', 'Soleil'],
    emotions: ['Amour', 'Désir', 'Passion', 'Sérénité', 'Joie', 'Bonheur'],
  };

  // English classic perfume patterns
  private static readonly ENGLISH_CLASSIC_PATTERNS = {
    adjective_noun: ['Midnight', 'Golden', 'Wild', 'Pure', 'Eternal', 'Secret', 'Hidden', 'Sacred'],
    nouns: ['Dream', 'Whisper', 'Shadow', 'Light', 'Bloom', 'Essence', 'Spirit', 'Soul'],
    nature: ['Garden', 'Forest', 'Ocean', 'Moon', 'Sun', 'Star', 'Earth', 'Sky'],
    luxury: ['Royal', 'Imperial', 'Sovereign', 'Majestic', 'Divine', 'Supreme'],
  };

  // African-inspired names (Senegal, West Africa)
  private static readonly AFRICAN_INSPIRED = {
    wolof: ['Teranga', 'Jamm', 'Ngor', 'Yaye', 'Dara', 'Ndey', 'Jigéen'],
    nature: ['Baobab', 'Solom', 'Bissap', 'Sahel', 'Harmattan', 'Savane'],
    concepts: ['Ubuntu', 'Kora', 'Djembe', 'Griot', 'Sahara', 'Kasbah'],
  };

  // Mood-based name patterns
  private static readonly MOOD_PATTERNS: Record<string, string[]> = {
    serenity: ['Calm', 'Peace', 'Tranquility', 'Zen', 'Meditation', 'Quietude', 'Sérénité', 'Paix'],
    energy: ['Vitalité', 'Energy', 'Spark', 'Vibrant', 'Dynamic', 'Pulse', 'Élan'],
    sensuality: ['Désir', 'Passion', 'Temptation', 'Seduction', 'Velvet', 'Silk', 'Sensuel'],
    elegance: ['Grâce', 'Élégance', 'Sophistication', 'Refinement', 'Prestige', 'Distinction'],
    mystery: ['Mystère', 'Enigma', 'Shadow', 'Twilight', 'Secret', 'Obscur', 'Voile'],
    joy: ['Joie', 'Bonheur', 'Felicity', 'Delight', 'Radiance', 'Sunshine', 'Lumière'],
  };

  /**
   * Generate perfume names based on request parameters
   */
  static generateNames(request: NameGenerationRequest): GeneratedName[] {
    const names: GeneratedName[] = [];

    // Generate different style variations
    if (request.language === 'french' || request.language === 'mixed') {
      names.push(...this.generateFrenchNames(request));
    }

    if (request.language === 'english' || request.language === 'mixed') {
      names.push(...this.generateEnglishNames(request));
    }

    if (request.region?.toLowerCase().includes('afri') || request.language === 'mixed') {
      names.push(...this.generateAfricanInspiredNames(request));
    }

    // Sort by quality score (simple heuristic: shorter names often better)
    return names.sort((a, b) => a.name.length - b.name.length).slice(0, 10);
  }

  /**
   * Generate French luxury names
   */
  private static generateFrenchNames(request: NameGenerationRequest): GeneratedName[] {
    const names: GeneratedName[] = [];

    // Pattern: [Adjective] + [Noun]
    if (request.mood) {
      const moodWords = this.MOOD_PATTERNS[request.mood] || [];
      const frenchMood = moodWords.filter(w => this.isFrenchWord(w));

      if (request.olfactiveFamilies?.includes('Floral')) {
        const florals = this.FRENCH_LUXURY_WORDS.florals;
        florals.forEach(floral => {
          frenchMood.forEach(mood => {
            names.push({
              name: `${floral} ${mood}`,
              language: 'French',
              style: 'Luxury Floral',
              reasoning: `Combines floral elegance (${floral}) with mood (${mood})`,
            });
          });
        });
      }

      // Pattern: [Emotion] + de + [Element]
      if (request.style === 'floral') {
        names.push({
          name: `Jardin de ${frenchMood[0]}`,
          language: 'French',
          style: 'Poetic Garden',
          reasoning: 'Classic French "Jardin de..." pattern evoking a garden of emotion',
        });
      }
    }

    // Pattern: L'[Noun]
    if (request.gender === 'feminine') {
      const femWords = this.FRENCH_LUXURY_WORDS.feminine;
      femWords.forEach(word => {
        names.push({
          name: `L'${word}`,
          language: 'French',
          style: 'Classic Feminine',
          reasoning: `Elegant French article construction with feminine quality`,
        });
      });
    }

    // Pattern: [Ingredient] + Noir/Blanc
    if (request.dominantIngredients && request.dominantIngredients.length > 0) {
      const ingredient = request.dominantIngredients[0].split(' ')[0];
      names.push(
        {
          name: `${ingredient} Noir`,
          language: 'French',
          style: 'Dark Luxury',
          reasoning: 'Dark, intense interpretation of main ingredient',
        },
        {
          name: `${ingredient} Blanc`,
          language: 'French',
          style: 'Pure Luxury',
          reasoning: 'Pure, clean interpretation of main ingredient',
        }
      );
    }

    // African-French fusion
    if (request.region?.toLowerCase().includes('africa') || request.region?.toLowerCase().includes('senegal')) {
      names.push(
        {
          name: 'Teranga Précieuse',
          language: 'French-Wolof',
          style: 'African Luxury',
          reasoning: 'Teranga (Senegalese hospitality) + Precious',
        },
        {
          name: 'Solom Doré',
          language: 'French-African',
          style: 'Golden Acacia',
          reasoning: 'Solom (Acacia) + Golden - Senegalese botanical',
        }
      );
    }

    return names;
  }

  /**
   * Generate English classic names
   */
  private static generateEnglishNames(request: NameGenerationRequest): GeneratedName[] {
    const names: GeneratedName[] = [];

    // Pattern: [Adjective] + [Noun]
    const adjectives = this.ENGLISH_CLASSIC_PATTERNS.adjective_noun;
    const nouns = this.ENGLISH_CLASSIC_PATTERNS.nouns;

    adjectives.slice(0, 3).forEach(adj => {
      nouns.slice(0, 2).forEach(noun => {
        names.push({
          name: `${adj} ${noun}`,
          language: 'English',
          style: 'Classic',
          reasoning: `Classic English luxury perfume pattern`,
        });
      });
    });

    // Pattern: [Ingredient] + [Emotion]
    if (request.dominantIngredients && request.mood) {
      const ingredient = request.dominantIngredients[0].split(' ')[0];
      const moodWords = this.MOOD_PATTERNS[request.mood];
      const englishMood = moodWords.filter(w => !this.isFrenchWord(w));

      names.push({
        name: `${ingredient} ${englishMood[0]}`,
        language: 'English',
        style: 'Ingredient-Focused',
        reasoning: `Highlights star ingredient with emotional character`,
      });
    }

    // Pattern: The + [Noun]
    if (request.style_type === 'classic') {
      nouns.forEach(noun => {
        names.push({
          name: `The ${noun}`,
          language: 'English',
          style: 'Prestige',
          reasoning: 'Prestigious "The..." construction implies exclusivity',
        });
      });
    }

    // Minimalist one-word names
    if (request.style_type === 'minimalist') {
      names.push(
        { name: 'Essence', language: 'English', style: 'Minimalist', reasoning: 'Pure, essential quality' },
        { name: 'Origin', language: 'English', style: 'Minimalist', reasoning: 'Return to source' },
        { name: 'Singular', language: 'English', style: 'Minimalist', reasoning: 'Unique, one-of-a-kind' }
      );
    }

    return names;
  }

  /**
   * Generate African-inspired names
   */
  private static generateAfricanInspiredNames(request: NameGenerationRequest): GeneratedName[] {
    const names: GeneratedName[] = [];

    // Wolof-inspired
    this.AFRICAN_INSPIRED.wolof.forEach(word => {
      names.push({
        name: word,
        language: 'Wolof',
        style: 'Senegalese',
        reasoning: `Authentic Wolof word with cultural significance`,
        alternateSpellings: this.generateWolofAlternatives(word),
      });
    });

    // African nature + English/French
    this.AFRICAN_INSPIRED.nature.forEach(nature => {
      names.push(
        {
          name: `${nature} Mystique`,
          language: 'French-African',
          style: 'Exotic Luxury',
          reasoning: `African botanical with French luxury`,
        },
        {
          name: `Spirit of ${nature}`,
          language: 'English-African',
          style: 'Poetic African',
          reasoning: `Evokes spiritual connection to African nature`,
        }
      );
    });

    // Senegal-specific
    if (request.region?.toLowerCase().includes('senegal')) {
      names.push(
        {
          name: 'Dakar Nocturne',
          language: 'French-Senegalese',
          style: 'Urban Chic',
          reasoning: 'Evokes nighttime elegance of Dakar',
        },
        {
          name: 'Île de Gorée',
          language: 'French',
          style: 'Historical',
          reasoning: 'References iconic Senegalese island',
        },
        {
          name: 'Sahel Dreams',
          language: 'English',
          style: 'Poetic Regional',
          reasoning: 'Evokes the Sahel landscape',
        }
      );
    }

    // Concept-based
    names.push(
      {
        name: 'Ubuntu Essence',
        language: 'African-English',
        style: 'Philosophical',
        reasoning: 'Ubuntu philosophy: "I am because we are"',
      },
      {
        name: 'Kora Sonata',
        language: 'African-Musical',
        style: 'Artistic',
        reasoning: 'Kora (West African harp) + musical term',
      }
    );

    return names;
  }

  /**
   * Generate single word name from formula characteristics
   */
  static generateSingleWordName(characteristics: {
    isDark?: boolean;
    isSweet?: boolean;
    isPowdery?: boolean;
    isFresh?: boolean;
    isWoody?: boolean;
  }): string {
    if (characteristics.isDark) return 'Obscura';
    if (characteristics.isSweet) return 'Dolce';
    if (characteristics.isPowdery) return 'Velours';
    if (characteristics.isFresh) return 'Fraîche';
    if (characteristics.isWoody) return 'Sylva';
    return 'Essence';
  }

  /**
   * Generate name from dominant ingredients
   */
  static generateFromIngredients(ingredients: string[]): GeneratedName[] {
    const names: GeneratedName[] = [];

    if (ingredients.length === 0) return names;

    const main = ingredients[0].split(' ')[0]; // Get first word of first ingredient

    // Single ingredient focus
    names.push({
      name: `Pur ${main}`,
      language: 'French',
      style: 'Pure Focus',
      reasoning: `Highlights purity of ${main}`,
    });

    // Duo formula
    if (ingredients.length >= 2) {
      const second = ingredients[1].split(' ')[0];
      names.push(
        {
          name: `${main} & ${second}`,
          language: 'English',
          style: 'Duo',
          reasoning: `Emphasizes the partnership of two key ingredients`,
        },
        {
          name: `Entre ${main} et ${second}`,
          language: 'French',
          style: 'Poetic Duo',
          reasoning: `Poetic "Between" construction`,
        }
      );
    }

    // Trio formula
    if (ingredients.length >= 3) {
      const third = ingredients[2].split(' ')[0];
      names.push({
        name: `Trilogie ${main}`,
        language: 'French',
        style: 'Trilogy',
        reasoning: `Complex trilogy centered on ${main}`,
      });
    }

    return names;
  }

  /**
   * Check if word is French
   */
  private static isFrenchWord(word: string): boolean {
    return /[àâäéèêëïîôùûüÿæœç]/i.test(word) ||
           ['de', 'la', 'le', 'les', 'du'].some(article => word.includes(article));
  }

  /**
   * Generate Wolof alternative spellings
   */
  private static generateWolofAlternatives(word: string): string[] {
    // Simplified - in real app would have full phonetic mapping
    return [`${word} (ˈ${word.toLowerCase()})`];
  }

  /**
   * Generate name based on time of day
   */
  static generateTimeBasedName(timeOfDay: 'dawn' | 'day' | 'dusk' | 'night'): GeneratedName {
    const timeNames = {
      dawn: { fr: 'Aurore', en: 'Dawn', meaning: 'Fresh morning light' },
      day: { fr: 'Soleil', en: 'Daylight', meaning: 'Bright radiant sun' },
      dusk: { fr: 'Crépuscule', en: 'Twilight', meaning: 'Mysterious transition' },
      night: { fr: 'Nocturne', en: 'Midnight', meaning: 'Deep night elegance' },
    };

    const time = timeNames[timeOfDay];
    return {
      name: time.fr,
      language: 'French',
      style: 'Time-Based',
      reasoning: time.meaning,
      alternateSpellings: [time.en],
    };
  }

  /**
   * Generate seasonal name
   */
  static generateSeasonalName(season: 'spring' | 'summer' | 'autumn' | 'winter'): GeneratedName {
    const seasonNames = {
      spring: { fr: 'Printemps Éternel', en: 'Eternal Spring', mood: 'rebirth' },
      summer: { fr: 'Été Radieux', en: 'Radiant Summer', mood: 'joy' },
      autumn: { fr: 'Automne Doré', en: 'Golden Autumn', mood: 'nostalgia' },
      winter: { fr: 'Hiver Précieux', en: 'Precious Winter', mood: 'intimacy' },
    };

    const s = seasonNames[season];
    return {
      name: s.fr,
      language: 'French',
      style: 'Seasonal',
      reasoning: `Evokes ${s.mood} of ${season}`,
      alternateSpellings: [s.en],
    };
  }
}
