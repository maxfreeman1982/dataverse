import { Injectable } from '@nestjs/core';
import { Ingredient } from '../entities/ingredient.entity';

// ═══════════════════════════════════════════════════════════════════
// REVERSE ENGINEERING ANALYZER
// Analyzes existing perfumes and suggests formulation approaches
// Helps perfumers deconstruct and recreate famous fragrances
// ═══════════════════════════════════════════════════════════════════

export interface PerfumeAnalysisInput {
  perfumeName?: string;
  brand?: string;
  year?: number;
  concentration?: 'EdC' | 'EdT' | 'EdP' | 'Extrait';

  // User's sensory analysis
  topNotes?: string[];
  heartNotes?: string[];
  baseNotes?: string[];

  // Olfactive characteristics
  dominantFamily?: string;
  subFamilies?: string[];
  style?: string;
  mood?: string;

  // Performance
  longevity?: 'weak' | 'moderate' | 'long' | 'very long';
  sillage?: 'intimate' | 'moderate' | 'strong' | 'beast mode';
  projection?: 'skin scent' | 'arm\'s length' | 'room filling';

  // Additional analysis
  seasonality?: string[];
  occasions?: string[];
  gender?: 'masculine' | 'feminine' | 'unisex';
}

export interface ReconstructedFormula {
  formulaName: string;
  confidence: number; // 0-100% (how confident we are in the reconstruction)

  structure: {
    top: number;
    heart: number;
    base: number;
  };

  estimatedIngredients: Array<{
    name: string;
    estimatedPercentage: number;
    role: string;
    confidence: number; // 0-100%
    reasoning: string;
  }>;

  keyAccords: Array<{
    accordName: string;
    ingredients: string[];
    percentage: number;
  }>;

  alternatives: {
    exactReconstruction: ReconstructionVariant;
    budgetVersion: ReconstructionVariant;
    naturalVersion: ReconstructionVariant;
    modernInterpretation: ReconstructionVariant;
  };

  perfumerNotes: {
    challenges: string[];
    tips: string[];
    commonMistakes: string[];
    criticalIngredients: string[];
  };

  references: {
    similarFormulas: string[];
    inspirations: string[];
    perfumerKnowledge: string;
  };
}

export interface ReconstructionVariant {
  name: string;
  description: string;
  estimatedCost: number; // per 100ml
  ingredients: Array<{
    name: string;
    percentage: number;
    role: string;
  }>;
  substitutions?: Array<{
    original: string;
    replacement: string;
    reason: string;
  }>;
}

// Famous perfume database (simplified knowledge base)
interface KnownPerfumeData {
  name: string;
  brand: string;
  year: number;
  perfumer?: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  keyIngredients: string[];
  dominantAccords: string[];
  style: string;
  knownFacts: string[];
}

@Injectable()
export class ReverseEngineerService {
  // ═══════════════════════════════════════════════════════════════
  // FAMOUS PERFUME DATABASE
  // Reference data for known compositions
  // ═══════════════════════════════════════════════════════════════

  private readonly KNOWN_PERFUMES: KnownPerfumeData[] = [
    {
      name: 'Shalimar',
      brand: 'Guerlain',
      year: 1925,
      perfumer: 'Jacques Guerlain',
      topNotes: ['bergamot', 'lemon', 'mandarin'],
      heartNotes: ['jasmine', 'rose', 'iris', 'patchouli'],
      baseNotes: ['vanilla', 'tonka bean', 'opoponax', 'benzoin', 'labdanum'],
      keyIngredients: ['bergamot', 'jasmine', 'vanilla', 'tonka bean', 'benzoin', 'ethyl vanillin'],
      dominantAccords: ['vanilla', 'balsamic', 'amber', 'oriental'],
      style: 'Oriental Ambery',
      knownFacts: [
        'First major oriental perfume',
        'Based on Guerlinade accord (vanilla-tonka-bergamot)',
        'Heavy use of ethyl vanillin (synthetic vanilla)',
        'Bergamot-vanilla contrast is signature',
      ],
    },
    {
      name: 'Chanel N°5',
      brand: 'Chanel',
      year: 1921,
      perfumer: 'Ernest Beaux',
      topNotes: ['aldehydes', 'bergamot', 'lemon', 'neroli'],
      heartNotes: ['jasmine', 'rose', 'ylang ylang', 'iris'],
      baseNotes: ['sandalwood', 'vetiver', 'vanilla', 'amber', 'musk'],
      keyIngredients: ['aldehydes C10-C12', 'jasmine absolute', 'rose de mai', 'ylang ylang'],
      dominantAccords: ['aldehydic', 'floral', 'powdery'],
      style: 'Floral Aldehydic',
      knownFacts: [
        'Revolutionary use of aldehydes (1% of formula)',
        'Aldehydes C10, C11, C12 create soapy-waxy sparkle',
        'Jasmine Grasse at very high concentration (>10%)',
        'Muguet (lily of the valley) reconstruction with hydroxycitronellal',
      ],
    },
    {
      name: 'Terre d\'Hermès',
      brand: 'Hermès',
      year: 2006,
      perfumer: 'Jean-Claude Ellena',
      topNotes: ['orange', 'grapefruit'],
      heartNotes: ['pepper', 'pelargonium', 'flint'],
      baseNotes: ['vetiver', 'cedar', 'patchouli', 'benzoin'],
      keyIngredients: ['orange', 'grapefruit', 'iso E super', 'vetiver', 'cedar'],
      dominantAccords: ['woody', 'earthy', 'citrus', 'mineral'],
      style: 'Woody Spicy',
      knownFacts: [
        'Minimalist formula (~50 ingredients)',
        'Heavy use of Iso E Super for transparent woodiness',
        'Flint/mineral note is reconstruction (Calone + ambroxan + vetiver)',
        'Orange-vetiver contrast is signature',
      ],
    },
    {
      name: 'Aventus',
      brand: 'Creed',
      year: 2010,
      perfumer: 'Olivier Creed & Erwin Creed',
      topNotes: ['pineapple', 'bergamot', 'blackcurrant', 'apple'],
      heartNotes: ['birch', 'jasmine', 'patchouli', 'rose'],
      baseNotes: ['musk', 'oakmoss', 'ambergris', 'vanilla'],
      keyIngredients: ['pineapple', 'birch tar', 'ambroxan', 'oakmoss', 'patchouli'],
      dominantAccords: ['fruity', 'woody', 'smoky', 'fresh'],
      style: 'Fruity Chypre',
      knownFacts: [
        'Pineapple is allyl amyl glycolate + ethyl maltol',
        'Birch tar creates smoky-leathery note',
        'Heavy ambroxan use (5-8%)',
        'Modern chypre (post-IFRA oakmoss restrictions)',
      ],
    },
    {
      name: 'Sauvage',
      brand: 'Dior',
      year: 2015,
      perfumer: 'François Demachy',
      topNotes: ['bergamot', 'pepper'],
      heartNotes: ['sichuan pepper', 'lavender', 'pink pepper', 'vetiver', 'patchouli', 'geranium', 'elemi'],
      baseNotes: ['ambroxan', 'cedar', 'labdanum'],
      keyIngredients: ['calabrian bergamot', 'ambroxan', 'sichuan pepper', 'geranium'],
      dominantAccords: ['fresh', 'spicy', 'woody', 'amber'],
      style: 'Fresh Spicy',
      knownFacts: [
        'Ambroxan-dominant base (reportedly 8-12%)',
        'Reggio bergamot at very high concentration',
        'Pepper trilogy: black, pink, sichuan',
        'Very linear structure - ambroxan throughout',
      ],
    },
    {
      name: 'Black Opium',
      brand: 'Yves Saint Laurent',
      year: 2014,
      perfumer: 'Nathalie Lorson, Marie Salamagne, Honorine Blanc, Olivier Cresp',
      topNotes: ['pink pepper', 'orange blossom', 'pear'],
      heartNotes: ['coffee', 'jasmine', 'bitter almond', 'licorice'],
      baseNotes: ['vanilla', 'patchouli', 'cedar', 'cashmere wood'],
      keyIngredients: ['coffee absolute', 'vanilla', 'patchouli', 'orange blossom', 'pink pepper'],
      dominantAccords: ['coffee', 'vanilla', 'gourmand', 'floral'],
      style: 'Oriental Gourmand',
      knownFacts: [
        'Coffee absolute at 3-5% (very high for coffee)',
        'Ethyl vanillin for sweet vanilla base',
        'Patchouli fraction (dark, earthy)',
        'Orange blossom absolute for white floral contrast',
      ],
    },
    {
      name: 'La Vie Est Belle',
      brand: 'Lancôme',
      year: 2012,
      perfumer: 'Olivier Polge, Dominique Ropion, Anne Flipo',
      topNotes: ['blackcurrant', 'pear'],
      heartNotes: ['iris', 'jasmine', 'orange blossom'],
      baseNotes: ['praline', 'vanilla', 'patchouli', 'tonka bean'],
      keyIngredients: ['iris', 'praline accord', 'vanilla', 'patchouli', 'orange blossom'],
      dominantAccords: ['iris', 'gourmand', 'floral', 'sweet'],
      style: 'Floral Gourmand',
      knownFacts: [
        'Iris butter at significant concentration (5-8%)',
        'Praline accord is synthetic (maltol + vanillin + coumarin)',
        'Patchouli Coeur (clean fraction)',
        'Signature "Lancôme rose" (phenylethyl alcohol)',
      ],
    },
  ];

  // ═══════════════════════════════════════════════════════════════
  // MAIN ANALYSIS FUNCTION
  // ═══════════════════════════════════════════════════════════════

  async analyzeAndReconstruct(
    input: PerfumeAnalysisInput,
    availableIngredients: Ingredient[],
  ): Promise<ReconstructedFormula> {
    // Try to find known perfume
    const knownPerfume = this.findKnownPerfume(input);

    let formulaName = input.perfumeName || 'Unknown Fragrance';
    let confidence = 50; // Default confidence

    if (knownPerfume) {
      formulaName = `${knownPerfume.brand} ${knownPerfume.name} Reconstruction`;
      confidence = 85; // High confidence with known data
    }

    // Determine structure (top:heart:base ratio)
    const structure = this.estimateStructure(input, knownPerfume);

    // Estimate ingredients
    const estimatedIngredients = this.estimateIngredients(
      input,
      knownPerfume,
      availableIngredients,
      structure,
    );

    // Identify key accords
    const keyAccords = this.identifyAccords(input, knownPerfume, estimatedIngredients);

    // Generate alternative formulations
    const alternatives = this.generateAlternatives(
      formulaName,
      estimatedIngredients,
      availableIngredients,
    );

    // Perfumer notes
    const perfumerNotes = this.generatePerfumerNotes(input, knownPerfume);

    // References
    const references = this.generateReferences(input, knownPerfume);

    return {
      formulaName,
      confidence,
      structure,
      estimatedIngredients,
      keyAccords,
      alternatives,
      perfumerNotes,
      references,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // KNOWN PERFUME MATCHING
  // ═══════════════════════════════════════════════════════════════

  private findKnownPerfume(input: PerfumeAnalysisInput): KnownPerfumeData | null {
    if (!input.perfumeName && !input.brand) {
      return null;
    }

    return this.KNOWN_PERFUMES.find(p => {
      const nameMatch = input.perfumeName
        ? p.name.toLowerCase().includes(input.perfumeName.toLowerCase()) ||
          input.perfumeName.toLowerCase().includes(p.name.toLowerCase())
        : false;

      const brandMatch = input.brand
        ? p.brand.toLowerCase().includes(input.brand.toLowerCase())
        : false;

      return nameMatch || brandMatch;
    }) || null;
  }

  // ═══════════════════════════════════════════════════════════════
  // STRUCTURE ESTIMATION
  // ═══════════════════════════════════════════════════════════════

  private estimateStructure(
    input: PerfumeAnalysisInput,
    knownPerfume?: KnownPerfumeData | null,
  ): { top: number; heart: number; base: number } {
    // Default structure
    let top = 25;
    let heart = 40;
    let base = 35;

    // Adjust based on style/family
    if (input.dominantFamily === 'citrus' || input.style?.includes('fresh')) {
      top = 35;
      heart = 35;
      base = 30;
    } else if (input.dominantFamily === 'oriental' || input.style?.includes('oriental')) {
      top = 15;
      heart = 35;
      base = 50;
    } else if (input.style?.includes('floral')) {
      top = 20;
      heart = 50;
      base = 30;
    }

    // Adjust based on longevity
    if (input.longevity === 'very long') {
      base += 10;
      top -= 5;
      heart -= 5;
    } else if (input.longevity === 'weak') {
      top += 10;
      base -= 10;
    }

    // Adjust based on sillage
    if (input.sillage === 'beast mode' || input.sillage === 'strong') {
      base += 5; // More base notes for projection
    }

    // Normalize to 100%
    const total = top + heart + base;
    top = Math.round((top / total) * 100);
    heart = Math.round((heart / total) * 100);
    base = 100 - top - heart;

    return { top, heart, base };
  }

  // ═══════════════════════════════════════════════════════════════
  // INGREDIENT ESTIMATION
  // ═══════════════════════════════════════════════════════════════

  private estimateIngredients(
    input: PerfumeAnalysisInput,
    knownPerfume: KnownPerfumeData | null,
    availableIngredients: Ingredient[],
    structure: { top: number; heart: number; base: number },
  ): Array<{
    name: string;
    estimatedPercentage: number;
    role: string;
    confidence: number;
    reasoning: string;
  }> {
    const estimated: Array<{
      name: string;
      estimatedPercentage: number;
      role: string;
      confidence: number;
      reasoning: string;
    }> = [];

    // Use known data if available
    if (knownPerfume) {
      // Map known ingredients
      knownPerfume.keyIngredients.forEach(ingredientName => {
        const ingredient = availableIngredients.find(i =>
          i.name.toLowerCase().includes(ingredientName.toLowerCase())
        );

        if (ingredient) {
          // Estimate percentage based on volatility and role
          let percentage = 5;
          let role = 'supporting';
          let confidence = 85;

          // Dominant ingredients get higher percentage
          if (knownPerfume.dominantAccords.some(accord =>
            ingredient.odorProfile?.includes(accord)
          )) {
            percentage = 15;
            role = 'dominant';
            confidence = 90;
          }

          estimated.push({
            name: ingredient.name,
            estimatedPercentage: percentage,
            role,
            confidence,
            reasoning: `Known ingredient in ${knownPerfume.brand} ${knownPerfume.name}`,
          });
        }
      });
    }

    // Add ingredients based on user's sensory analysis
    if (input.topNotes) {
      input.topNotes.forEach(note => {
        const ingredient = this.findIngredientByNote(note, availableIngredients, 'top');
        if (ingredient && !estimated.find(e => e.name === ingredient.name)) {
          estimated.push({
            name: ingredient.name,
            estimatedPercentage: 10,
            role: 'top note',
            confidence: 70,
            reasoning: `User detected "${note}" in top notes`,
          });
        }
      });
    }

    if (input.heartNotes) {
      input.heartNotes.forEach(note => {
        const ingredient = this.findIngredientByNote(note, availableIngredients, 'heart');
        if (ingredient && !estimated.find(e => e.name === ingredient.name)) {
          estimated.push({
            name: ingredient.name,
            estimatedPercentage: 12,
            role: 'heart note',
            confidence: 70,
            reasoning: `User detected "${note}" in heart notes`,
          });
        }
      });
    }

    if (input.baseNotes) {
      input.baseNotes.forEach(note => {
        const ingredient = this.findIngredientByNote(note, availableIngredients, 'base');
        if (ingredient && !estimated.find(e => e.name === ingredient.name)) {
          estimated.push({
            name: ingredient.name,
            estimatedPercentage: 15,
            role: 'base note',
            confidence: 70,
            reasoning: `User detected "${note}" in base notes`,
          });
        }
      });
    }

    // Normalize percentages to 100%
    const total = estimated.reduce((sum, ing) => sum + ing.estimatedPercentage, 0);
    if (total > 0) {
      estimated.forEach(ing => {
        ing.estimatedPercentage = Math.round((ing.estimatedPercentage / total) * 100 * 10) / 10;
      });
    }

    return estimated.sort((a, b) => b.estimatedPercentage - a.estimatedPercentage);
  }

  // ═══════════════════════════════════════════════════════════════
  // ACCORD IDENTIFICATION
  // ═══════════════════════════════════════════════════════════════

  private identifyAccords(
    input: PerfumeAnalysisInput,
    knownPerfume: KnownPerfumeData | null,
    estimatedIngredients: Array<{ name: string; estimatedPercentage: number }>,
  ): Array<{ accordName: string; ingredients: string[]; percentage: number }> {
    const accords: Array<{ accordName: string; ingredients: string[]; percentage: number }> = [];

    // Known accords from database
    if (knownPerfume) {
      knownPerfume.dominantAccords.forEach(accord => {
        const relatedIngredients = estimatedIngredients
          .filter(ing => ing.name.toLowerCase().includes(accord))
          .map(ing => ing.name);

        if (relatedIngredients.length > 0) {
          const totalPercentage = estimatedIngredients
            .filter(ing => relatedIngredients.includes(ing.name))
            .reduce((sum, ing) => sum + ing.estimatedPercentage, 0);

          accords.push({
            accordName: `${accord} accord`,
            ingredients: relatedIngredients,
            percentage: Math.round(totalPercentage * 10) / 10,
          });
        }
      });
    }

    // Common accord detection
    const citrusIngredients = estimatedIngredients.filter(ing =>
      ing.name.toLowerCase().match(/bergamot|lemon|orange|grapefruit|citrus/)
    );
    if (citrusIngredients.length >= 2) {
      accords.push({
        accordName: 'Citrus accord',
        ingredients: citrusIngredients.map(i => i.name),
        percentage: citrusIngredients.reduce((sum, i) => sum + i.estimatedPercentage, 0),
      });
    }

    const floralIngredients = estimatedIngredients.filter(ing =>
      ing.name.toLowerCase().match(/rose|jasmine|ylang|neroli|iris|violet/)
    );
    if (floralIngredients.length >= 2) {
      accords.push({
        accordName: 'Floral accord',
        ingredients: floralIngredients.map(i => i.name),
        percentage: floralIngredients.reduce((sum, i) => sum + i.estimatedPercentage, 0),
      });
    }

    const woodyIngredients = estimatedIngredients.filter(ing =>
      ing.name.toLowerCase().match(/cedar|sandalwood|vetiver|wood|patchouli/)
    );
    if (woodyIngredients.length >= 2) {
      accords.push({
        accordName: 'Woody accord',
        ingredients: woodyIngredients.map(i => i.name),
        percentage: woodyIngredients.reduce((sum, i) => sum + i.estimatedPercentage, 0),
      });
    }

    const vanillaIngredients = estimatedIngredients.filter(ing =>
      ing.name.toLowerCase().match(/vanilla|tonka|benzoin|coumarin/)
    );
    if (vanillaIngredients.length >= 2) {
      accords.push({
        accordName: 'Vanilla/Gourmand accord',
        ingredients: vanillaIngredients.map(i => i.name),
        percentage: vanillaIngredients.reduce((sum, i) => sum + i.estimatedPercentage, 0),
      });
    }

    return accords;
  }

  // ═══════════════════════════════════════════════════════════════
  // ALTERNATIVE FORMULATIONS
  // ═══════════════════════════════════════════════════════════════

  private generateAlternatives(
    formulaName: string,
    estimatedIngredients: Array<{ name: string; estimatedPercentage: number; role: string }>,
    availableIngredients: Ingredient[],
  ): {
    exactReconstruction: ReconstructionVariant;
    budgetVersion: ReconstructionVariant;
    naturalVersion: ReconstructionVariant;
    modernInterpretation: ReconstructionVariant;
  } {
    // EXACT RECONSTRUCTION
    const exactReconstruction: ReconstructionVariant = {
      name: `${formulaName} - Exact Reconstruction`,
      description: 'Best attempt at exact replication using available ingredients',
      estimatedCost: this.calculateCost(estimatedIngredients, availableIngredients),
      ingredients: estimatedIngredients.map(ing => ({
        name: ing.name,
        percentage: ing.estimatedPercentage,
        role: ing.role,
      })),
    };

    // BUDGET VERSION
    const budgetVersion: ReconstructionVariant = {
      name: `${formulaName} - Budget Version`,
      description: 'Affordable alternative using synthetic/cheaper ingredients',
      estimatedCost: exactReconstruction.estimatedCost * 0.3,
      ingredients: estimatedIngredients.map(ing => {
        const ingredient = availableIngredients.find(i => i.name === ing.name);
        const isCostly = ingredient && ingredient.pricePerKg > 500;

        return {
          name: ing.name,
          percentage: ing.estimatedPercentage,
          role: isCostly ? `${ing.role} (consider cheaper alternative)` : ing.role,
        };
      }),
      substitutions: this.generateBudgetSubstitutions(estimatedIngredients, availableIngredients),
    };

    // NATURAL VERSION
    const naturalVersion: ReconstructionVariant = {
      name: `${formulaName} - Natural Version`,
      description: '100% natural ingredients (some notes may be impossible to recreate naturally)',
      estimatedCost: exactReconstruction.estimatedCost * 1.8,
      ingredients: estimatedIngredients
        .filter(ing => {
          const ingredient = availableIngredients.find(i => i.name === ing.name);
          return ingredient && ingredient.isNatural;
        })
        .map(ing => ({
          name: ing.name,
          percentage: ing.estimatedPercentage * 1.2, // Adjust percentages
          role: ing.role,
        })),
      substitutions: [
        {
          original: 'Synthetic musks',
          replacement: 'Natural musks (ambrette, angelica)',
          reason: 'Natural alternative to synthetic musks',
        },
        {
          original: 'Iso E Super',
          replacement: 'Cedarwood + Sandalwood blend',
          reason: 'Natural woody notes replace synthetic transparent woods',
        },
      ],
    };

    // MODERN INTERPRETATION
    const modernInterpretation: ReconstructionVariant = {
      name: `${formulaName} - Modern Interpretation`,
      description: 'Updated with modern ingredients and techniques',
      estimatedCost: exactReconstruction.estimatedCost * 1.1,
      ingredients: estimatedIngredients.map(ing => ({
        name: ing.name,
        percentage: ing.estimatedPercentage,
        role: ing.role,
      })),
      substitutions: [
        {
          original: 'Traditional musks',
          replacement: 'Galaxolide, Ambroxan',
          reason: 'Modern clean musks with better performance',
        },
        {
          original: 'Natural oakmoss',
          replacement: 'Oakmoss absolute (IFRA compliant) + Evernyl',
          reason: 'IFRA-compliant chypre base',
        },
      ],
    };

    return {
      exactReconstruction,
      budgetVersion,
      naturalVersion,
      modernInterpretation,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // PERFUMER NOTES
  // ═══════════════════════════════════════════════════════════════

  private generatePerfumerNotes(
    input: PerfumeAnalysisInput,
    knownPerfume: KnownPerfumeData | null,
  ): {
    challenges: string[];
    tips: string[];
    commonMistakes: string[];
    criticalIngredients: string[];
  } {
    const challenges: string[] = [];
    const tips: string[] = [];
    const commonMistakes: string[] = [];
    const criticalIngredients: string[] = [];

    if (knownPerfume) {
      // Known perfume-specific notes
      switch (knownPerfume.name) {
        case 'Shalimar':
          challenges.push('Balancing bergamot freshness with heavy vanilla base');
          tips.push('Use ethyl vanillin for authentic Shalimar vanilla character');
          tips.push('Bergamot must be at least 10% to cut through vanilla');
          criticalIngredients.push('Ethyl Vanillin', 'Bergamot Oil', 'Tonka Bean Absolute');
          commonMistakes.push('Using only natural vanilla (too subtle)');
          break;

        case 'Chanel N°5':
          challenges.push('Achieving the right aldehydic sparkle without soapiness');
          challenges.push('Balancing jasmine-rose duo at high concentration');
          tips.push('Use aldehydes C10, C11, C12 at 0.5-1% total');
          tips.push('Jasmine and rose should be at 8-12% combined');
          criticalIngredients.push('Aldehyde C10', 'Aldehyde C11', 'Jasmine Absolute', 'Rose Otto');
          commonMistakes.push('Too much aldehyde (becomes soapy)');
          commonMistakes.push('Skimping on jasmine (loses character)');
          break;

        case 'Aventus':
          challenges.push('Creating realistic pineapple note without being synthetic');
          challenges.push('Balancing smoke (birch tar) with freshness');
          tips.push('Pineapple: allyl amyl glycolate + ethyl maltol + apple note');
          tips.push('Birch tar at 2-3% for smoke without overwhelming');
          criticalIngredients.push('Allyl Amyl Glycolate', 'Birch Tar', 'Ambroxan', 'Patchouli');
          commonMistakes.push('Too much birch tar (becomes too smoky)');
          break;

        case 'Sauvage':
          challenges.push('Achieving the signature clean, fresh character');
          tips.push('Ambroxan at 8-12% is key to Sauvage DNA');
          tips.push('Use high-quality Calabrian bergamot at 15-20%');
          criticalIngredients.push('Ambroxan', 'Bergamot Oil', 'Sichuan Pepper');
          commonMistakes.push('Not enough ambroxan (loses signature character)');
          break;
      }
    }

    // General tips based on style
    if (input.style?.includes('oriental') || input.dominantFamily === 'oriental') {
      tips.push('Macerate for at least 30 days for oriental fragrances');
      tips.push('Use fixatives (benzoin, labdanum) at 3-5% minimum');
    }

    if (input.style?.includes('fresh') || input.dominantFamily === 'citrus') {
      tips.push('Fresh fragrances benefit from shorter maceration (7-14 days)');
      commonMistakes.push('Over-macerating fresh fragrances (dulls brightness)');
    }

    return {
      challenges,
      tips,
      commonMistakes,
      criticalIngredients,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // REFERENCES
  // ═══════════════════════════════════════════════════════════════

  private generateReferences(
    input: PerfumeAnalysisInput,
    knownPerfume: KnownPerfumeData | null,
  ): {
    similarFormulas: string[];
    inspirations: string[];
    perfumerKnowledge: string;
  } {
    const similarFormulas: string[] = [];
    const inspirations: string[] = [];
    let perfumerKnowledge = '';

    if (knownPerfume) {
      perfumerKnowledge = knownPerfume.knownFacts.join(' | ');

      // Find similar perfumes
      this.KNOWN_PERFUMES.forEach(p => {
        if (p.name !== knownPerfume.name) {
          const sharedAccords = p.dominantAccords.filter(accord =>
            knownPerfume.dominantAccords.includes(accord)
          );

          if (sharedAccords.length >= 2) {
            similarFormulas.push(`${p.brand} ${p.name} (${p.year})`);
          }
        }
      });

      inspirations.push(`Perfumer: ${knownPerfume.perfumer || 'Unknown'}`);
      inspirations.push(`Year: ${knownPerfume.year}`);
      inspirations.push(`Style: ${knownPerfume.style}`);
    }

    return {
      similarFormulas,
      inspirations,
      perfumerKnowledge,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════

  private findIngredientByNote(
    note: string,
    ingredients: Ingredient[],
    preferredVolatility?: string,
  ): Ingredient | null {
    // Direct name match
    let found = ingredients.find(ing =>
      ing.name.toLowerCase().includes(note.toLowerCase())
    );

    if (found) return found;

    // Odor profile match
    found = ingredients.find(ing =>
      ing.odorProfile?.some(profile => profile.toLowerCase().includes(note.toLowerCase()))
    );

    if (found && preferredVolatility) {
      // Try to find with matching volatility
      const withVolatility = ingredients.find(ing =>
        ing.odorProfile?.some(profile => profile.toLowerCase().includes(note.toLowerCase())) &&
        ing.volatility.includes(preferredVolatility)
      );

      return withVolatility || found;
    }

    return found || null;
  }

  private calculateCost(
    ingredients: Array<{ name: string; estimatedPercentage: number }>,
    availableIngredients: Ingredient[],
  ): number {
    let totalCost = 0;

    ingredients.forEach(ing => {
      const ingredient = availableIngredients.find(i => i.name === ing.name);
      if (ingredient) {
        // Cost for 100ml at estimated percentage
        const costPer100ml = (ingredient.pricePerKg / 1000) * (ing.estimatedPercentage / 100) * 100;
        totalCost += costPer100ml;
      }
    });

    return Math.round(totalCost * 100) / 100;
  }

  private generateBudgetSubstitutions(
    ingredients: Array<{ name: string; estimatedPercentage: number }>,
    availableIngredients: Ingredient[],
  ): Array<{ original: string; replacement: string; reason: string }> {
    const substitutions: Array<{ original: string; replacement: string; reason: string }> = [];

    ingredients.forEach(ing => {
      const ingredient = availableIngredients.find(i => i.name === ing.name);

      if (ingredient && ingredient.pricePerKg > 500) {
        // Suggest cheaper alternatives
        if (ingredient.name.includes('Rose Otto')) {
          substitutions.push({
            original: 'Rose Otto',
            replacement: 'Geranium + Phenylethyl Alcohol',
            reason: 'Budget-friendly rose substitute (1/20th the cost)',
          });
        } else if (ingredient.name.includes('Jasmine Absolute')) {
          substitutions.push({
            original: 'Jasmine Absolute',
            replacement: 'Methyl Dihydrojasmonate (Hedione)',
            reason: 'Synthetic jasmine note at fraction of cost',
          });
        } else if (ingredient.name.includes('Iris')) {
          substitutions.push({
            original: 'Iris Butter',
            replacement: 'Methyl Ionone + Iris Base',
            reason: 'Synthetic iris reconstruction (much cheaper)',
          });
        } else if (ingredient.name.includes('Vanilla Absolute')) {
          substitutions.push({
            original: 'Vanilla Absolute',
            replacement: 'Vanillin + Ethyl Vanillin',
            reason: 'Synthetic vanilla at 1/50th the cost',
          });
        } else if (ingredient.name.includes('Sandalwood')) {
          substitutions.push({
            original: 'Sandalwood Oil (Mysore)',
            replacement: 'Australian Sandalwood or Javanol (synthetic)',
            reason: 'Cheaper sandalwood alternatives',
          });
        }
      }
    });

    return substitutions;
  }

  // ═══════════════════════════════════════════════════════════════
  // GET ALL KNOWN PERFUMES
  // ═══════════════════════════════════════════════════════════════

  getAllKnownPerfumes(): KnownPerfumeData[] {
    return this.KNOWN_PERFUMES;
  }

  searchKnownPerfumes(query: string): KnownPerfumeData[] {
    const lowerQuery = query.toLowerCase();

    return this.KNOWN_PERFUMES.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.brand.toLowerCase().includes(lowerQuery) ||
      p.style.toLowerCase().includes(lowerQuery) ||
      p.dominantAccords.some(accord => accord.includes(lowerQuery))
    );
  }
}
