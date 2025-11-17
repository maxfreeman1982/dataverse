/**
 * 10 PRE-BUILT PROFESSIONAL FLORAL FORMULAS
 *
 * Each formula includes:
 * - Standard version
 * - Budget-friendly alternative
 * - Luxury premium version
 * - Natural/COSMOS compliant version (where possible)
 * - Complete ingredient breakdown with percentages
 * - IFRA compliance notes
 * - Production notes
 */

export interface FloralFormulaIngredient {
  name: string;
  percentage: number;
  volatility: 'top' | 'heart' | 'base';
  role: string;
  dilution?: number;
}

export interface FloralFormula {
  name: string;
  description: string;
  style: string;
  olfactiveProfile: string[];
  mood: string[];
  structure: {
    top: number;
    heart: number;
    base: number;
  };
  standard: {
    ingredients: FloralFormulaIngredient[];
    estimatedCost: number;
    notes: string[];
  };
  budget: {
    ingredients: FloralFormulaIngredient[];
    estimatedCost: number;
    substitutions: string[];
  };
  luxury: {
    ingredients: FloralFormulaIngredient[];
    estimatedCost: number;
    upgrades: string[];
  };
  natural?: {
    ingredients: FloralFormulaIngredient[];
    estimatedCost: number;
    certifications: string[];
  };
  production: {
    macerationDays: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    tips: string[];
  };
  ifraCompliant: boolean;
  seasons: string[];
  occasions: string[];
}

export const FLORAL_FORMULAS: FloralFormula[] = [
  // ═══════════════════════════════════════════════════════════════
  // 1. BOUQUET FLORAL LUMINEUX
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Bouquet Floral Lumineux',
    description: 'A radiant, multi-floral bouquet with sparkling citrus opening and creamy heart. Fresh, feminine, and universally appealing.',
    style: 'Fresh Floral',
    olfactiveProfile: ['floral', 'fresh', 'radiant', 'citrus', 'creamy'],
    mood: ['joy', 'elegance', 'optimism'],
    structure: {
      top: 25,
      heart: 45,
      base: 30,
    },
    standard: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 15, volatility: 'top', role: 'opening' },
        { name: 'Neroli (Orange Blossom)', percentage: 8, volatility: 'top', role: 'freshness' },
        { name: 'Hedione', percentage: 18, volatility: 'heart', role: 'radiance & diffusion' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 12, volatility: 'heart', role: 'main floral' },
        { name: 'Jasmine Absolute', percentage: 10, volatility: 'heart', role: 'richness' },
        { name: 'Ylang Ylang Complete', percentage: 4, volatility: 'heart', role: 'tropical facet' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 15, volatility: 'base', role: 'creamy base' },
        { name: 'Vanilla Absolute', percentage: 8, volatility: 'base', role: 'sweetness' },
        { name: 'Galaxolide', percentage: 10, volatility: 'base', role: 'clean musk' },
      ],
      estimatedCost: 125.50,
      notes: [
        'Classic fresh floral structure',
        'Hedione amplifies and radiates the florals',
        'Sandalwood provides creamy, milky base',
        'Musk adds modern cleanness',
      ],
    },
    budget: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 15, volatility: 'top', role: 'opening' },
        { name: 'Linalool', percentage: 8, volatility: 'top', role: 'neroli substitute' },
        { name: 'Hedione', percentage: 18, volatility: 'heart', role: 'radiance' },
        { name: 'Geranium', percentage: 12, volatility: 'heart', role: 'rose substitute' },
        { name: 'Methyl Dihydrojasmonate', percentage: 10, volatility: 'heart', role: 'jasmine substitute' },
        { name: 'Ylang Ylang Complete', percentage: 4, volatility: 'heart', role: 'tropical' },
        { name: 'Cedarwood Virginia', percentage: 15, volatility: 'base', role: 'woody base' },
        { name: 'Vanillin', percentage: 8, volatility: 'base', role: 'sweetness' },
        { name: 'Galaxolide', percentage: 10, volatility: 'base', role: 'musk' },
      ],
      estimatedCost: 18.75,
      substitutions: [
        'Geranium replaces rose otto (much cheaper)',
        'Linalool replaces neroli',
        'Cedarwood replaces sandalwood',
        'Vanillin replaces vanilla absolute',
      ],
    },
    luxury: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 12, volatility: 'top', role: 'opening' },
        { name: 'Neroli (Orange Blossom)', percentage: 10, volatility: 'top', role: 'freshness' },
        { name: 'Hedione', percentage: 15, volatility: 'heart', role: 'radiance' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 15, volatility: 'heart', role: 'premium rose' },
        { name: 'Jasmine Absolute', percentage: 12, volatility: 'heart', role: 'richness' },
        { name: 'Tuberose Absolute', percentage: 3, volatility: 'heart', role: 'narcotic depth' },
        { name: 'Ylang Ylang Complete', percentage: 5, volatility: 'heart', role: 'tropical' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 18, volatility: 'base', role: 'premium wood' },
        { name: 'Vanilla Absolute', percentage: 5, volatility: 'base', role: 'sweetness' },
        { name: 'Ambroxan', percentage: 5, volatility: 'base', role: 'modern amber' },
      ],
      estimatedCost: 285.00,
      upgrades: [
        'Added tuberose for narcotic luxury',
        'Increased rose and jasmine quality',
        'Ambroxan for transparent depth',
        'Premium Mysore sandalwood',
      ],
    },
    natural: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 15, volatility: 'top', role: 'opening' },
        { name: 'Neroli (Orange Blossom)', percentage: 10, volatility: 'top', role: 'freshness' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 15, volatility: 'heart', role: 'main floral' },
        { name: 'Jasmine Absolute', percentage: 12, volatility: 'heart', role: 'richness' },
        { name: 'Ylang Ylang Complete', percentage: 8, volatility: 'heart', role: 'tropical' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 20, volatility: 'base', role: 'wood base' },
        { name: 'Vanilla Absolute', percentage: 10, volatility: 'base', role: 'sweetness' },
        { name: 'Benzoin Resinoid', percentage: 10, volatility: 'base', role: 'balsamic fixative' },
      ],
      estimatedCost: 195.00,
      certifications: ['COSMOS Natural compliant', '100% natural ingredients'],
    },
    production: {
      macerationDays: 21,
      difficulty: 'intermediate',
      tips: [
        'Add ingredients from lightest to heaviest for best integration',
        'Hedione should be added early to help carry the florals',
        'Allow jasmine and rose to marry for 48h before adding base',
        'Shake gently daily during first week',
      ],
    },
    ifraCompliant: true,
    seasons: ['spring', 'summer'],
    occasions: ['day', 'romantic', 'wedding', 'casual'],
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. JASMINE ABSOLUTE ROYAL
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Jasmine Absolute Royal',
    description: 'A jasmine-dominant composition showcasing the queen of white florals. Heady, indolic, with green and fruity nuances.',
    style: 'White Floral',
    olfactiveProfile: ['white floral', 'jasmine', 'indolic', 'green', 'fruity'],
    mood: ['sensuality', 'luxury', 'night'],
    structure: {
      top: 18,
      heart: 52,
      base: 30,
    },
    standard: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 10, volatility: 'top', role: 'brightness' },
        { name: 'Neroli (Orange Blossom)', percentage: 6, volatility: 'top', role: 'orange blossom bridge' },
        { name: 'Jasmine Absolute', percentage: 30, volatility: 'heart', role: 'star ingredient' },
        { name: 'Hedione', percentage: 15, volatility: 'heart', role: 'jasmine amplifier' },
        { name: 'Ylang Ylang Complete', percentage: 5, volatility: 'heart', role: 'tropical richness' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 18, volatility: 'base', role: 'creamy support' },
        { name: 'Vanilla Absolute', percentage: 8, volatility: 'base', role: 'soft sweetness' },
        { name: 'Iso E Super', percentage: 8, volatility: 'base', role: 'woody halo' },
      ],
      estimatedCost: 195.00,
      notes: [
        'Jasmine at 30% - maximum expression',
        'Hedione enhances and diffuses jasmine',
        'Sandalwood complements without overpowering',
        'Minimalist approach to let jasmine shine',
      ],
    },
    budget: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 10, volatility: 'top', role: 'brightness' },
        { name: 'Linalool', percentage: 6, volatility: 'top', role: 'floral freshness' },
        { name: 'Methyl Dihydrojasmonate', percentage: 25, volatility: 'heart', role: 'jasmine note' },
        { name: 'Hedione', percentage: 20, volatility: 'heart', role: 'radiance' },
        { name: 'Ylang Ylang Complete', percentage: 5, volatility: 'heart', role: 'tropical' },
        { name: 'Cedarwood Virginia', percentage: 18, volatility: 'base', role: 'wood' },
        { name: 'Vanillin', percentage: 8, volatility: 'base', role: 'sweetness' },
        { name: 'Iso E Super', percentage: 8, volatility: 'base', role: 'woody halo' },
      ],
      estimatedCost: 22.50,
      substitutions: [
        'Methyl dihydrojasmonate replaces jasmine absolute',
        'Increased hedione for better diffusion',
        'Cedarwood instead of sandalwood',
        'Vanillin instead of vanilla absolute',
      ],
    },
    luxury: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 8, volatility: 'top', role: 'brightness' },
        { name: 'Neroli (Orange Blossom)', percentage: 8, volatility: 'top', role: 'orange blossom' },
        { name: 'Jasmine Absolute', percentage: 35, volatility: 'heart', role: 'star - premium grade' },
        { name: 'Tuberose Absolute', percentage: 5, volatility: 'heart', role: 'white floral depth' },
        { name: 'Hedione', percentage: 10, volatility: 'heart', role: 'radiance' },
        { name: 'Ylang Ylang Complete', percentage: 4, volatility: 'heart', role: 'tropical' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 20, volatility: 'base', role: 'premium wood' },
        { name: 'Vanilla Absolute', percentage: 5, volatility: 'base', role: 'subtle sweetness' },
        { name: 'Ambroxan', percentage: 5, volatility: 'base', role: 'transparent warmth' },
      ],
      estimatedCost: 425.00,
      upgrades: [
        'Premium grade jasmine at 35%',
        'Added tuberose for ultra-luxe white floral',
        'Mysore sandalwood for creaminess',
        'Ambroxan for modern sophistication',
      ],
    },
    natural: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 10, volatility: 'top', role: 'brightness' },
        { name: 'Neroli (Orange Blossom)', percentage: 8, volatility: 'top', role: 'orange blossom' },
        { name: 'Jasmine Absolute', percentage: 32, volatility: 'heart', role: 'star ingredient' },
        { name: 'Ylang Ylang Complete', percentage: 8, volatility: 'heart', role: 'tropical' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 5, volatility: 'heart', role: 'floral support' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 22, volatility: 'base', role: 'creamy base' },
        { name: 'Vanilla Absolute', percentage: 10, volatility: 'base', role: 'sweetness' },
        { name: 'Benzoin Resinoid', percentage: 5, volatility: 'base', role: 'fixative' },
      ],
      estimatedCost: 285.00,
      certifications: ['COSMOS Natural', '100% natural'],
    },
    production: {
      macerationDays: 30,
      difficulty: 'advanced',
      tips: [
        'Jasmine needs 30+ days to fully bloom',
        'Keep away from light to preserve indolic character',
        'Best at 15-20% concentration for EdP',
        'Will improve significantly after 2-3 months',
      ],
    },
    ifraCompliant: true,
    seasons: ['spring', 'summer', 'autumn'],
    occasions: ['night', 'formal', 'romantic', 'luxury'],
  },

  // ═══════════════════════════════════════════════════════════════
  // 3. ROSE DAMASCENA DORÉE (Golden Damascus Rose)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Rose Damascena Dorée',
    description: 'A golden, honeyed rose composition with spicy and woody facets. Deep, romantic, and timeless.',
    style: 'Rose Floral',
    olfactiveProfile: ['rose', 'honeyed', 'spicy', 'woody', 'deep'],
    mood: ['romance', 'elegance', 'confidence'],
    structure: {
      top: 20,
      heart: 50,
      base: 30,
    },
    standard: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 12, volatility: 'top', role: 'citrus lift' },
        { name: 'Black Pepper Oil', percentage: 2, volatility: 'top', role: 'spicy kick' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 25, volatility: 'heart', role: 'star rose' },
        { name: 'Geranium', percentage: 12, volatility: 'heart', role: 'rose support' },
        { name: 'Clove Bud Oil', percentage: 1, volatility: 'heart', role: 'spicy depth', dilution: 10 },
        { name: 'Patchouli Oil', percentage: 12, volatility: 'base', role: 'earthy depth' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 15, volatility: 'base', role: 'creamy wood' },
        { name: 'Labdanum Absolute', percentage: 8, volatility: 'base', role: 'amber warmth' },
        { name: 'Vanilla Absolute', percentage: 5, volatility: 'base', role: 'sweetness' },
        { name: 'Ambroxan', percentage: 8, volatility: 'base', role: 'modern amber' },
      ],
      estimatedCost: 145.00,
      notes: [
        'Rose otto at 25% for full expression',
        'Geranium reinforces and extends rose',
        'Clove adds golden, honeyed spice (use diluted)',
        'Patchouli and labdanum create oriental depth',
      ],
    },
    budget: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 12, volatility: 'top', role: 'citrus' },
        { name: 'Black Pepper Oil', percentage: 2, volatility: 'top', role: 'spice' },
        { name: 'Geranium', percentage: 30, volatility: 'heart', role: 'rose substitute' },
        { name: 'Phenylethyl Alcohol', percentage: 8, volatility: 'heart', role: 'rose booster' },
        { name: 'Eugenol', percentage: 1, volatility: 'heart', role: 'clove note', dilution: 10 },
        { name: 'Patchouli Oil', percentage: 12, volatility: 'base', role: 'earth' },
        { name: 'Cedarwood Virginia', percentage: 15, volatility: 'base', role: 'wood' },
        { name: 'Labdanum Absolute', percentage: 8, volatility: 'base', role: 'amber' },
        { name: 'Vanillin', percentage: 5, volatility: 'base', role: 'sweetness' },
        { name: 'Ambroxan', percentage: 7, volatility: 'base', role: 'amber' },
      ],
      estimatedCost: 28.50,
      substitutions: [
        'Geranium + phenylethyl alcohol replace rose otto',
        'Eugenol replaces clove oil',
        'Cedarwood replaces sandalwood',
        'Vanillin replaces vanilla absolute',
      ],
    },
    luxury: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 10, volatility: 'top', role: 'citrus' },
        { name: 'Cardamom Oil', percentage: 3, volatility: 'top', role: 'aromatic spice' },
        { name: 'Black Pepper Oil', percentage: 2, volatility: 'top', role: 'peppery kick' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 30, volatility: 'heart', role: 'premium rose' },
        { name: 'Rose Absolute', percentage: 5, volatility: 'heart', role: 'rose depth' },
        { name: 'Clove Bud Oil', percentage: 1, volatility: 'heart', role: 'golden spice', dilution: 10 },
        { name: 'Saffron Tincture', percentage: 2, volatility: 'heart', role: 'luxe spice', dilution: 10 },
        { name: 'Oud Oil (Agarwood)', percentage: 3, volatility: 'base', role: 'precious wood', dilution: 10 },
        { name: 'Sandalwood Oil (Mysore)', percentage: 18, volatility: 'base', role: 'creamy wood' },
        { name: 'Labdanum Absolute', percentage: 10, volatility: 'base', role: 'amber' },
        { name: 'Vanilla Absolute', percentage: 8, volatility: 'base', role: 'sweetness' },
        { name: 'Ambroxan', percentage: 8, volatility: 'base', role: 'radiant amber' },
      ],
      estimatedCost: 485.00,
      upgrades: [
        'Rose otto + rose absolute for maximum rose',
        'Added cardamom and saffron for luxury spice',
        'Oud for precious oriental depth',
        'Premium Mysore sandalwood',
      ],
    },
    natural: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 12, volatility: 'top', role: 'citrus' },
        { name: 'Black Pepper Oil', percentage: 2, volatility: 'top', role: 'spice' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 28, volatility: 'heart', role: 'star rose' },
        { name: 'Geranium', percentage: 10, volatility: 'heart', role: 'rose support' },
        { name: 'Clove Bud Oil', percentage: 1, volatility: 'heart', role: 'spice', dilution: 10 },
        { name: 'Patchouli Oil', percentage: 15, volatility: 'base', role: 'earth' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 18, volatility: 'base', role: 'wood' },
        { name: 'Labdanum Absolute', percentage: 8, volatility: 'base', role: 'amber' },
        { name: 'Vanilla Absolute', percentage: 6, volatility: 'base', role: 'sweetness' },
      ],
      estimatedCost: 215.00,
      certifications: ['COSMOS Natural', '100% natural'],
    },
    production: {
      macerationDays: 28,
      difficulty: 'intermediate',
      tips: [
        'Dilute clove oil to 10% before using (very strong)',
        'Rose needs time to develop honeyed facets',
        'Patchouli improves with age',
        'Best at 15-18% for EdP concentration',
      ],
    },
    ifraCompliant: true,
    seasons: ['autumn', 'winter'],
    occasions: ['romantic', 'formal', 'night', 'luxury'],
  },

  // ═══════════════════════════════════════════════════════════════
  // 4. MAGNOLIA & BOIS BLANC (Magnolia & White Woods)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Magnolia & Bois Blanc',
    description: 'A delicate magnolia composition with clean white woods. Fresh, soft, and modern.',
    style: 'Fresh Floral Woody',
    olfactiveProfile: ['floral', 'magnolia', 'clean', 'woody', 'soft'],
    mood: ['serenity', 'elegance', 'modern'],
    structure: {
      top: 22,
      heart: 48,
      base: 30,
    },
    standard: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 12, volatility: 'top', role: 'citrus freshness' },
        { name: 'Neroli (Orange Blossom)', percentage: 8, volatility: 'top', role: 'petitgrain facet' },
        { name: 'Hedione', percentage: 20, volatility: 'heart', role: 'magnolia effect' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 8, volatility: 'heart', role: 'floral support' },
        { name: 'Jasmine Absolute', percentage: 12, volatility: 'heart', role: 'white floral' },
        { name: 'Ylang Ylang Complete', percentage: 3, volatility: 'heart', role: 'creamy touch' },
        { name: 'Iso E Super', percentage: 15, volatility: 'base', role: 'white wood' },
        { name: 'Cashmeran', percentage: 8, volatility: 'base', role: 'soft wood' },
        { name: 'Ambroxan', percentage: 8, volatility: 'base', role: 'clean amber' },
        { name: 'Galaxolide', percentage: 6, volatility: 'base', role: 'clean musk' },
      ],
      estimatedCost: 85.00,
      notes: [
        'Hedione at 20% creates magnolia illusion',
        'Iso E Super for white wood effect',
        'Very modern, clean composition',
        'Cashmeran adds cashmere softness',
      ],
    },
    budget: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 12, volatility: 'top', role: 'citrus' },
        { name: 'Linalool', percentage: 8, volatility: 'top', role: 'floral freshness' },
        { name: 'Hedione', percentage: 25, volatility: 'heart', role: 'magnolia' },
        { name: 'Geranium', percentage: 8, volatility: 'heart', role: 'rose substitute' },
        { name: 'Methyl Dihydrojasmonate', percentage: 10, volatility: 'heart', role: 'jasmine' },
        { name: 'Linalyl Acetate', percentage: 3, volatility: 'heart', role: 'lavender touch' },
        { name: 'Iso E Super', percentage: 18, volatility: 'base', role: 'white wood' },
        { name: 'Cashmeran', percentage: 8, volatility: 'base', role: 'soft wood' },
        { name: 'Ambroxan', percentage: 8, volatility: 'base', role: 'amber' },
      ],
      estimatedCost: 28.00,
      substitutions: [
        'Increased hedione for magnolia effect',
        'Geranium replaces rose otto',
        'Synthetic jasmine substitute',
        'No musk to reduce cost',
      ],
    },
    luxury: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 10, volatility: 'top', role: 'citrus' },
        { name: 'Neroli (Orange Blossom)', percentage: 10, volatility: 'top', role: 'orange blossom' },
        { name: 'Hedione', percentage: 18, volatility: 'heart', role: 'magnolia radiance' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 10, volatility: 'heart', role: 'premium rose' },
        { name: 'Jasmine Absolute', percentage: 15, volatility: 'heart', role: 'white floral' },
        { name: 'Tuberose Absolute', percentage: 2, volatility: 'heart', role: 'creamy depth' },
        { name: 'Ylang Ylang Complete', percentage: 3, volatility: 'heart', role: 'tropical' },
        { name: 'Iso E Super', percentage: 12, volatility: 'base', role: 'white wood' },
        { name: 'Cashmeran', percentage: 10, volatility: 'base', role: 'cashmere' },
        { name: 'Ambroxan', percentage: 10, volatility: 'base', role: 'radiant amber' },
      ],
      estimatedCost: 225.00,
      upgrades: [
        'Premium florals at higher concentration',
        'Added tuberose for creamy luxury',
        'Increased ambroxan for radiance',
      ],
    },
    natural: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 15, volatility: 'top', role: 'citrus' },
        { name: 'Neroli (Orange Blossom)', percentage: 10, volatility: 'top', role: 'orange blossom' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 12, volatility: 'heart', role: 'rose' },
        { name: 'Jasmine Absolute', percentage: 15, volatility: 'heart', role: 'jasmine' },
        { name: 'Ylang Ylang Complete', percentage: 8, volatility: 'heart', role: 'tropical' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 25, volatility: 'base', role: 'creamy white wood' },
        { name: 'Cedarwood Virginia', percentage: 10, volatility: 'base', role: 'clean wood' },
        { name: 'Benzoin Resinoid', percentage: 5, volatility: 'base', role: 'fixative' },
      ],
      estimatedCost: 185.00,
      certifications: ['COSMOS Natural', '100% natural'],
    },
    production: {
      macerationDays: 14,
      difficulty: 'beginner',
      tips: [
        'Very easy to make - modern synthetics blend easily',
        'Hedione needs 24h to fully diffuse',
        'Clean, linear development',
        'Perfect for beginners learning modern perfumery',
      ],
    },
    ifraCompliant: true,
    seasons: ['spring', 'summer'],
    occasions: ['day', 'office', 'casual', 'modern'],
  },

  // ═══════════════════════════════════════════════════════════════
  // 5. FLEUR D'ORANGER AMBROXAN (Orange Blossom Ambroxan)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Fleur d\'Oranger Ambroxan',
    description: 'Radiant orange blossom lifted by ambroxan. Fresh, clean, and incredibly diffusive.',
    style: 'Fresh Floral Amber',
    olfactiveProfile: ['orange blossom', 'fresh', 'radiant', 'amber', 'marine'],
    mood: ['joy', 'freshness', 'radiance'],
    structure: {
      top: 28,
      heart: 42,
      base: 30,
    },
    standard: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 15, volatility: 'top', role: 'citrus sparkle' },
        { name: 'Lemon Oil', percentage: 8, volatility: 'top', role: 'freshness' },
        { name: 'Neroli (Orange Blossom)', percentage: 25, volatility: 'heart', role: 'star ingredient' },
        { name: 'Hedione', percentage: 12, volatility: 'heart', role: 'radiance' },
        { name: 'Petitgrain', percentage: 5, volatility: 'heart', role: 'green facet' },
        { name: 'Ambroxan', percentage: 20, volatility: 'base', role: 'radiant amber' },
        { name: 'Iso E Super', percentage: 8, volatility: 'base', role: 'woody support' },
        { name: 'Galaxolide', percentage: 7, volatility: 'base', role: 'clean musk' },
      ],
      estimatedCost: 65.00,
      notes: [
        'Neroli at 25% - full expression',
        'Ambroxan at 20% creates incredible sillage',
        'Very modern, clean, radiant',
        'Unisex appeal',
      ],
    },
    budget: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 15, volatility: 'top', role: 'citrus' },
        { name: 'Lemon Oil', percentage: 8, volatility: 'top', role: 'freshness' },
        { name: 'Linalool', percentage: 20, volatility: 'heart', role: 'neroli substitute' },
        { name: 'Linalyl Acetate', percentage: 10, volatility: 'heart', role: 'floral' },
        { name: 'Hedione', percentage: 12, volatility: 'heart', role: 'radiance' },
        { name: 'Ambroxan', percentage: 20, volatility: 'base', role: 'amber' },
        { name: 'Iso E Super', percentage: 8, volatility: 'base', role: 'wood' },
        { name: 'Galaxolide', percentage: 7, volatility: 'base', role: 'musk' },
      ],
      estimatedCost: 32.00,
      substitutions: [
        'Linalool + linalyl acetate replace neroli',
        'Maintained ambroxan for radiance',
      ],
    },
    luxury: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 12, volatility: 'top', role: 'citrus' },
        { name: 'Neroli (Orange Blossom)', percentage: 30, volatility: 'heart', role: 'premium neroli' },
        { name: 'Orange Blossom Absolute', percentage: 5, volatility: 'heart', role: 'depth' },
        { name: 'Hedione', percentage: 15, volatility: 'heart', role: 'radiance' },
        { name: 'Petitgrain', percentage: 5, volatility: 'heart', role: 'green' },
        { name: 'Ambroxan', percentage: 20, volatility: 'base', role: 'radiant amber' },
        { name: 'Cashmeran', percentage: 5, volatility: 'base', role: 'soft wood' },
        { name: 'Iso E Super', percentage: 8, volatility: 'base', role: 'woody halo' },
      ],
      estimatedCost: 145.00,
      upgrades: [
        'Neroli at 30% for maximum expression',
        'Added orange blossom absolute for depth',
        'Cashmeran for softness',
      ],
    },
    natural: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 18, volatility: 'top', role: 'citrus' },
        { name: 'Lemon Oil', percentage: 10, volatility: 'top', role: 'freshness' },
        { name: 'Neroli (Orange Blossom)', percentage: 30, volatility: 'heart', role: 'star' },
        { name: 'Orange Blossom Absolute', percentage: 5, volatility: 'heart', role: 'depth' },
        { name: 'Petitgrain', percentage: 8, volatility: 'heart', role: 'green' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 15, volatility: 'base', role: 'creamy wood' },
        { name: 'Benzoin Resinoid', percentage: 10, volatility: 'base', role: 'sweet balsam' },
        { name: 'Vanilla Absolute', percentage: 4, volatility: 'base', role: 'sweetness' },
      ],
      estimatedCost: 125.00,
      certifications: ['COSMOS Natural', '100% natural'],
    },
    production: {
      macerationDays: 14,
      difficulty: 'beginner',
      tips: [
        'Very straightforward composition',
        'Ambroxan needs 48h to fully activate',
        'Incredible projection and sillage',
        'Best at 12-15% concentration',
      ],
    },
    ifraCompliant: true,
    seasons: ['spring', 'summer'],
    occasions: ['day', 'fresh', 'casual', 'unisex'],
  },

  // I'll continue with formulas 6-10...
  // ═══════════════════════════════════════════════════════════════
  // 6. GARDENIA TROPICAL
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Gardenia Tropical',
    description: 'Lush gardenia reconstruction with creamy coconut and tropical ylang. Heady, creamy, and exotic.',
    style: 'Tropical White Floral',
    olfactiveProfile: ['gardenia', 'creamy', 'tropical', 'coconut', 'white floral'],
    mood: ['sensuality', 'exotic', 'vacation'],
    structure: {
      top: 15,
      heart: 55,
      base: 30,
    },
    standard: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 8, volatility: 'top', role: 'lift' },
        { name: 'Neroli (Orange Blossom)', percentage: 5, volatility: 'top', role: 'freshness' },
        { name: 'Jasmine Absolute', percentage: 20, volatility: 'heart', role: 'gardenia base' },
        { name: 'Tuberose Absolute', percentage: 12, volatility: 'heart', role: 'creamy gardenia' },
        { name: 'Ylang Ylang Complete', percentage: 15, volatility: 'heart', role: 'tropical richness' },
        { name: 'Coconut CO2', percentage: 6, volatility: 'heart', role: 'coconut creaminess' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 18, volatility: 'base', role: 'creamy wood' },
        { name: 'Vanilla Absolute', percentage: 8, volatility: 'base', role: 'sweetness' },
        { name: 'Tonka Bean Absolute', percentage: 5, volatility: 'base', role: 'coumarinic warmth' },
        { name: 'Galaxolide', percentage: 3, volatility: 'base', role: 'soft musk' },
      ],
      estimatedCost: 185.00,
      notes: [
        'Gardenia is a reconstruction (no true gardenia oil exists)',
        'Jasmine + tuberose create gardenia effect',
        'Ylang and coconut add tropical creaminess',
        'Very heady and sensual',
      ],
    },
    budget: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 8, volatility: 'top', role: 'lift' },
        { name: 'Linalool', percentage: 5, volatility: 'top', role: 'freshness' },
        { name: 'Methyl Dihydrojasmonate', percentage: 18, volatility: 'heart', role: 'jasmine' },
        { name: 'Phenylethyl Alcohol', percentage: 10, volatility: 'heart', role: 'rose/gardenia' },
        { name: 'Ylang Ylang Complete', percentage: 15, volatility: 'heart', role: 'tropical' },
        { name: 'Coconut Fragrance Base', percentage: 8, volatility: 'heart', role: 'coconut' },
        { name: 'Cedarwood Virginia', percentage: 18, volatility: 'base', role: 'wood' },
        { name: 'Vanillin', percentage: 10, volatility: 'base', role: 'sweetness' },
        { name: 'Coumarin', percentage: 5, volatility: 'base', role: 'warmth' },
        { name: 'Galaxolide', percentage: 3, volatility: 'base', role: 'musk' },
      ],
      estimatedCost: 35.00,
      substitutions: [
        'Synthetic jasmine and rose notes',
        'Cedarwood instead of sandalwood',
        'Vanillin + coumarin replace naturals',
      ],
    },
    luxury: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 6, volatility: 'top', role: 'lift' },
        { name: 'Neroli (Orange Blossom)', percentage: 6, volatility: 'top', role: 'freshness' },
        { name: 'Jasmine Absolute', percentage: 22, volatility: 'heart', role: 'premium jasmine' },
        { name: 'Tuberose Absolute', percentage: 15, volatility: 'heart', role: 'luxe tuberose' },
        { name: 'Ylang Ylang Complete', percentage: 12, volatility: 'heart', role: 'tropical' },
        { name: 'Coconut CO2', percentage: 5, volatility: 'heart', role: 'coconut' },
        { name: 'Tiaré Absolute', percentage: 3, volatility: 'heart', role: 'exotic floral' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 20, volatility: 'base', role: 'premium wood' },
        { name: 'Vanilla Absolute', percentage: 8, volatility: 'base', role: 'sweetness' },
        { name: 'Tonka Bean Absolute', percentage: 3, volatility: 'base', role: 'warmth' },
      ],
      estimatedCost: 385.00,
      upgrades: [
        'Premium jasmine and tuberose',
        'Added tiaré for authentic tropical touch',
        'Mysore sandalwood',
      ],
    },
    production: {
      macerationDays: 21,
      difficulty: 'intermediate',
      tips: [
        'Gardenia is a fantasy accord - no real gardenia oil',
        'Jasmine + tuberose is the classic gardenia reconstruction',
        'Ylang adds tropical creaminess',
        'Very potent - use at 12-15% max',
      ],
    },
    ifraCompliant: true,
    seasons: ['summer', 'tropical'],
    occasions: ['night', 'vacation', 'exotic', 'romantic'],
  },

  // ═══════════════════════════════════════════════════════════════
  // 7. PIVOINE FRAÎCHE (Fresh Peony)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Pivoine Fraîche',
    description: 'A fresh, dewy peony accord with watery notes and soft musk. Light, airy, and modern.',
    style: 'Fresh Floral Aquatic',
    olfactiveProfile: ['peony', 'fresh', 'watery', 'dewy', 'soft'],
    mood: ['freshness', 'innocence', 'spring'],
    structure: {
      top: 30,
      heart: 45,
      base: 25,
    },
    standard: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 15, volatility: 'top', role: 'sparkle' },
        { name: 'Lemon Oil', percentage: 10, volatility: 'top', role: 'zest' },
        { name: 'Calone', percentage: 3, volatility: 'top', role: 'watery note', dilution: 10 },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 18, volatility: 'heart', role: 'peony base' },
        { name: 'Hedione', percentage: 15, volatility: 'heart', role: 'freshness & lift' },
        { name: 'Neroli (Orange Blossom)', percentage: 8, volatility: 'heart', role: 'dewy floral' },
        { name: 'Geranium', percentage: 6, volatility: 'heart', role: 'green rose' },
        { name: 'Iso E Super', percentage: 10, volatility: 'base', role: 'transparent wood' },
        { name: 'Ambroxan', percentage: 8, volatility: 'base', role: 'clean amber' },
        { name: 'Galaxolide', percentage: 7, volatility: 'base', role: 'soft musk' },
      ],
      estimatedCost: 95.00,
      notes: [
        'Peony is a reconstruction (no true peony absolute)',
        'Rose + hedione + watery notes create peony illusion',
        'Calone must be diluted to 10% (very powerful)',
        'Very fresh and modern',
      ],
    },
    budget: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 15, volatility: 'top', role: 'sparkle' },
        { name: 'Lemon Oil', percentage: 10, volatility: 'top', role: 'zest' },
        { name: 'Calone', percentage: 3, volatility: 'top', role: 'watery', dilution: 10 },
        { name: 'Geranium', percentage: 20, volatility: 'heart', role: 'rose substitute' },
        { name: 'Hedione', percentage: 18, volatility: 'heart', role: 'radiance' },
        { name: 'Linalool', percentage: 6, volatility: 'heart', role: 'floral' },
        { name: 'Iso E Super', percentage: 12, volatility: 'base', role: 'wood' },
        { name: 'Ambroxan', percentage: 8, volatility: 'base', role: 'amber' },
        { name: 'Galaxolide', percentage: 8, volatility: 'base', role: 'musk' },
      ],
      estimatedCost: 32.00,
      substitutions: [
        'Geranium replaces rose otto',
        'Linalool adds floral freshness',
        'Maintained calone for authentic watery effect',
      ],
    },
    luxury: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 12, volatility: 'top', role: 'sparkle' },
        { name: 'Lemon Oil', percentage: 8, volatility: 'top', role: 'zest' },
        { name: 'Grapefruit Oil', percentage: 5, volatility: 'top', role: 'juiciness' },
        { name: 'Calone', percentage: 3, volatility: 'top', role: 'watery', dilution: 10 },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 20, volatility: 'heart', role: 'premium rose' },
        { name: 'Hedione', percentage: 15, volatility: 'heart', role: 'radiance' },
        { name: 'Neroli (Orange Blossom)', percentage: 10, volatility: 'heart', role: 'dewy' },
        { name: 'Geranium', percentage: 5, volatility: 'heart', role: 'green' },
        { name: 'Iso E Super', percentage: 10, volatility: 'base', role: 'wood' },
        { name: 'Ambroxan', percentage: 10, volatility: 'base', role: 'radiant amber' },
        { name: 'Cashmeran', percentage: 2, volatility: 'base', role: 'softness' },
      ],
      estimatedCost: 165.00,
      upgrades: [
        'Premium rose otto at higher concentration',
        'Added grapefruit for juicy freshness',
        'Cashmeran for ultimate softness',
      ],
    },
    natural: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 18, volatility: 'top', role: 'sparkle' },
        { name: 'Lemon Oil', percentage: 12, volatility: 'top', role: 'zest' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 22, volatility: 'heart', role: 'peony' },
        { name: 'Neroli (Orange Blossom)', percentage: 12, volatility: 'heart', role: 'dewy' },
        { name: 'Geranium', percentage: 10, volatility: 'heart', role: 'green rose' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 15, volatility: 'base', role: 'creamy wood' },
        { name: 'Cedarwood Virginia', percentage: 8, volatility: 'base', role: 'dry wood' },
        { name: 'Benzoin Resinoid', percentage: 3, volatility: 'base', role: 'fixative' },
      ],
      estimatedCost: 145.00,
      certifications: ['COSMOS Natural', '100% natural'],
    },
    production: {
      macerationDays: 10,
      difficulty: 'beginner',
      tips: [
        'Very easy formula - mostly synthetics',
        'Dilute calone to 10% before use (overpowering at 100%)',
        'Fresh and linear - perfect for spring',
        'Works beautifully at 10-12% EdT concentration',
      ],
    },
    ifraCompliant: true,
    seasons: ['spring', 'summer'],
    occasions: ['day', 'office', 'casual', 'fresh'],
  },

  // ═══════════════════════════════════════════════════════════════
  // 8. TIARÉ POLYNÉSIEN (Polynesian Tiaré)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Tiaré Polynésien',
    description: 'Exotic tiaré flower with coconut and vanilla. Evokes white sand beaches and tropical paradise.',
    style: 'Tropical Solar Floral',
    olfactiveProfile: ['tiare', 'coconut', 'tropical', 'solar', 'vanilla'],
    mood: ['vacation', 'exotic', 'happiness'],
    structure: {
      top: 20,
      heart: 50,
      base: 30,
    },
    standard: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 10, volatility: 'top', role: 'freshness' },
        { name: 'Neroli (Orange Blossom)', percentage: 8, volatility: 'top', role: 'petitgrain facet' },
        { name: 'Jasmine Absolute', percentage: 15, volatility: 'heart', role: 'tiaré base' },
        { name: 'Ylang Ylang Complete', percentage: 20, volatility: 'heart', role: 'tropical richness' },
        { name: 'Tuberose Absolute', percentage: 8, volatility: 'heart', role: 'creamy white floral' },
        { name: 'Coconut CO2', percentage: 8, volatility: 'heart', role: 'coconut' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 15, volatility: 'base', role: 'creamy wood' },
        { name: 'Vanilla Absolute', percentage: 10, volatility: 'base', role: 'sweet vanilla' },
        { name: 'Tonka Bean Absolute', percentage: 4, volatility: 'base', role: 'warmth' },
        { name: 'Benzoin Resinoid', percentage: 2, volatility: 'base', role: 'balsamic depth' },
      ],
      estimatedCost: 195.00,
      notes: [
        'Tiaré flower (Gardenia taitensis) from Tahiti',
        'Ylang ylang at 20% for maximum tropical character',
        'Coconut adds authentic Polynesian touch',
        'Solar, beach vacation vibe',
      ],
    },
    budget: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 10, volatility: 'top', role: 'freshness' },
        { name: 'Linalool', percentage: 8, volatility: 'top', role: 'floral' },
        { name: 'Methyl Dihydrojasmonate', percentage: 12, volatility: 'heart', role: 'jasmine' },
        { name: 'Ylang Ylang Complete', percentage: 20, volatility: 'heart', role: 'tropical' },
        { name: 'Phenylethyl Alcohol', percentage: 8, volatility: 'heart', role: 'rose/floral' },
        { name: 'Coconut Fragrance Base', percentage: 10, volatility: 'heart', role: 'coconut' },
        { name: 'Cedarwood Virginia', percentage: 15, volatility: 'base', role: 'wood' },
        { name: 'Vanillin', percentage: 12, volatility: 'base', role: 'vanilla' },
        { name: 'Coumarin', percentage: 5, volatility: 'base', role: 'warmth' },
      ],
      estimatedCost: 38.00,
      substitutions: [
        'Synthetic jasmine and rose notes',
        'Coconut fragrance base instead of CO2',
        'Vanillin + coumarin replace naturals',
        'Maintained ylang for authenticity',
      ],
    },
    luxury: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 8, volatility: 'top', role: 'freshness' },
        { name: 'Neroli (Orange Blossom)', percentage: 10, volatility: 'top', role: 'orange blossom' },
        { name: 'Jasmine Absolute', percentage: 18, volatility: 'heart', role: 'premium jasmine' },
        { name: 'Tiaré Absolute', percentage: 5, volatility: 'heart', role: 'authentic tiaré' },
        { name: 'Ylang Ylang Complete', percentage: 18, volatility: 'heart', role: 'tropical' },
        { name: 'Tuberose Absolute', percentage: 10, volatility: 'heart', role: 'white floral' },
        { name: 'Coconut CO2', percentage: 6, volatility: 'heart', role: 'coconut' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 18, volatility: 'base', role: 'premium wood' },
        { name: 'Vanilla Absolute', percentage: 5, volatility: 'base', role: 'vanilla' },
        { name: 'Ambroxan', percentage: 2, volatility: 'base', role: 'radiance' },
      ],
      estimatedCost: 425.00,
      upgrades: [
        'Authentic tiaré absolute (very rare)',
        'Premium Mysore sandalwood',
        'Increased jasmine and tuberose',
        'Ambroxan for solar radiance',
      ],
    },
    production: {
      macerationDays: 21,
      difficulty: 'intermediate',
      tips: [
        'Tiaré absolute is rare - ylang + jasmine + coconut works well',
        'Very tropical and heady',
        'Best for summer or vacation wear',
        'Use at 12-15% for EdP',
      ],
    },
    ifraCompliant: true,
    seasons: ['summer', 'tropical'],
    occasions: ['vacation', 'beach', 'exotic', 'casual'],
  },

  // ═══════════════════════════════════════════════════════════════
  // 9. HÉLIOTROPE SUCRE VANILLÉ (Sweet Heliotrope Vanilla)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Héliotrope Sucre Vanillé',
    description: 'Powdery heliotrope with almond, vanilla, and marzipan notes. Sweet, comforting, and gourmand.',
    style: 'Floral Gourmand',
    olfactiveProfile: ['heliotrope', 'almond', 'vanilla', 'powdery', 'sweet'],
    mood: ['comfort', 'sweetness', 'nostalgia'],
    structure: {
      top: 18,
      heart: 42,
      base: 40,
    },
    standard: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 10, volatility: 'top', role: 'brightness' },
        { name: 'Neroli (Orange Blossom)', percentage: 6, volatility: 'top', role: 'floral freshness' },
        { name: 'Heliotropine', percentage: 15, volatility: 'heart', role: 'heliotrope' },
        { name: 'Jasmine Absolute', percentage: 8, volatility: 'heart', role: 'white floral' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 6, volatility: 'heart', role: 'rose touch' },
        { name: 'Bitter Almond (Benzaldehyde)', percentage: 5, volatility: 'heart', role: 'almond', dilution: 10 },
        { name: 'Vanilla Absolute', percentage: 20, volatility: 'base', role: 'main vanilla' },
        { name: 'Tonka Bean Absolute', percentage: 12, volatility: 'base', role: 'coumarin sweetness' },
        { name: 'Benzoin Resinoid', percentage: 10, volatility: 'base', role: 'balsamic vanilla' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 8, volatility: 'base', role: 'creamy support' },
      ],
      estimatedCost: 165.00,
      notes: [
        'Heliotropine (piperonal) is the key ingredient',
        'Almond note must be diluted (very strong)',
        'Tonka adds coumarin sweetness',
        'Very comforting and powdery',
      ],
    },
    budget: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 10, volatility: 'top', role: 'brightness' },
        { name: 'Linalool', percentage: 6, volatility: 'top', role: 'freshness' },
        { name: 'Heliotropine', percentage: 18, volatility: 'heart', role: 'heliotrope' },
        { name: 'Methyl Dihydrojasmonate', percentage: 8, volatility: 'heart', role: 'jasmine' },
        { name: 'Geranium', percentage: 6, volatility: 'heart', role: 'rose' },
        { name: 'Benzaldehyde', percentage: 5, volatility: 'heart', role: 'almond', dilution: 10 },
        { name: 'Vanillin', percentage: 22, volatility: 'base', role: 'vanilla' },
        { name: 'Coumarin', percentage: 12, volatility: 'base', role: 'sweet hay' },
        { name: 'Benzoin Resinoid', percentage: 8, volatility: 'base', role: 'balsam' },
        { name: 'Cedarwood Virginia', percentage: 5, volatility: 'base', role: 'wood' },
      ],
      estimatedCost: 28.00,
      substitutions: [
        'Vanillin replaces vanilla absolute',
        'Coumarin replaces tonka bean',
        'Geranium replaces rose',
        'Maintained heliotropine for authenticity',
      ],
    },
    luxury: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 8, volatility: 'top', role: 'brightness' },
        { name: 'Neroli (Orange Blossom)', percentage: 8, volatility: 'top', role: 'floral' },
        { name: 'Heliotropine', percentage: 12, volatility: 'heart', role: 'heliotrope' },
        { name: 'Jasmine Absolute', percentage: 10, volatility: 'heart', role: 'white floral' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 8, volatility: 'heart', role: 'rose' },
        { name: 'Bitter Almond Oil', percentage: 4, volatility: 'heart', role: 'almond', dilution: 10 },
        { name: 'Vanilla Absolute', percentage: 25, volatility: 'base', role: 'premium vanilla' },
        { name: 'Tonka Bean Absolute', percentage: 15, volatility: 'base', role: 'tonka' },
        { name: 'Benzoin Resinoid', percentage: 5, volatility: 'base', role: 'balsam' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 5, volatility: 'base', role: 'creamy wood' },
      ],
      estimatedCost: 285.00,
      upgrades: [
        'Vanilla at 25% for maximum expression',
        'Premium tonka bean',
        'Increased jasmine and rose',
      ],
    },
    natural: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 12, volatility: 'top', role: 'brightness' },
        { name: 'Neroli (Orange Blossom)', percentage: 8, volatility: 'top', role: 'floral' },
        { name: 'Jasmine Absolute', percentage: 10, volatility: 'heart', role: 'white floral' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 8, volatility: 'heart', role: 'rose' },
        { name: 'Vanilla Absolute', percentage: 28, volatility: 'base', role: 'vanilla' },
        { name: 'Tonka Bean Absolute', percentage: 18, volatility: 'base', role: 'tonka' },
        { name: 'Benzoin Resinoid', percentage: 12, volatility: 'base', role: 'balsam' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 4, volatility: 'base', role: 'wood' },
      ],
      estimatedCost: 195.00,
      certifications: ['COSMOS Natural', '100% natural', 'Note: No heliotropine (synthetic)'],
    },
    production: {
      macerationDays: 30,
      difficulty: 'intermediate',
      tips: [
        'Heliotropine (piperonal) is the signature note',
        'Benzaldehyde must be diluted to 10%',
        'Improves significantly after 30+ days',
        'Very sweet - use at 12-18% EdP concentration',
      ],
    },
    ifraCompliant: true,
    seasons: ['autumn', 'winter'],
    occasions: ['cozy', 'evening', 'comfort', 'gourmand'],
  },

  // ═══════════════════════════════════════════════════════════════
  // 10. IRIS BEURRE & MUSC CLAIR (Buttery Iris & Clean Musk)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Iris Beurre & Musc Clair',
    description: 'Elegant iris butter with clean musks and violet facets. Powdery, sophisticated, and ethereal.',
    style: 'Powdery Floral Musk',
    olfactiveProfile: ['iris', 'buttery', 'powdery', 'violet', 'clean musk'],
    mood: ['elegance', 'sophistication', 'refinement'],
    structure: {
      top: 20,
      heart: 45,
      base: 35,
    },
    standard: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 12, volatility: 'top', role: 'citrus lift' },
        { name: 'Neroli (Orange Blossom)', percentage: 6, volatility: 'top', role: 'floral freshness' },
        { name: 'Iris Butter Absolute', percentage: 18, volatility: 'heart', role: 'star ingredient' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 8, volatility: 'heart', role: 'rose support' },
        { name: 'Violet Leaf Absolute', percentage: 5, volatility: 'heart', role: 'green violet' },
        { name: 'Jasmine Absolute', percentage: 6, volatility: 'heart', role: 'floral depth' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 15, volatility: 'base', role: 'creamy wood' },
        { name: 'Cedarwood Virginia', percentage: 8, volatility: 'base', role: 'dry wood' },
        { name: 'Galaxolide', percentage: 15, volatility: 'base', role: 'clean musk' },
        { name: 'Ambroxan', percentage: 7, volatility: 'base', role: 'transparent warmth' },
      ],
      estimatedCost: 245.00,
      notes: [
        'Iris butter (orris) is extremely expensive',
        'Powdery, sophisticated character',
        'Clean musks (galaxolide + ambroxan) are key',
        'Very elegant and refined',
      ],
    },
    budget: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 12, volatility: 'top', role: 'citrus' },
        { name: 'Linalool', percentage: 6, volatility: 'top', role: 'freshness' },
        { name: 'Iris Base (synthetic)', percentage: 15, volatility: 'heart', role: 'iris accord' },
        { name: 'Geranium', percentage: 8, volatility: 'heart', role: 'rose' },
        { name: 'Violet Leaf Absolute', percentage: 5, volatility: 'heart', role: 'violet' },
        { name: 'Methyl Ionone', percentage: 8, volatility: 'heart', role: 'violet/iris' },
        { name: 'Cedarwood Virginia', percentage: 18, volatility: 'base', role: 'wood' },
        { name: 'Galaxolide', percentage: 20, volatility: 'base', role: 'musk' },
        { name: 'Ambroxan', percentage: 8, volatility: 'base', role: 'amber' },
      ],
      estimatedCost: 42.00,
      substitutions: [
        'Synthetic iris base instead of butter',
        'Methyl ionone for violet/iris character',
        'Geranium replaces rose',
        'Cedarwood replaces sandalwood',
      ],
    },
    luxury: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 10, volatility: 'top', role: 'citrus' },
        { name: 'Neroli (Orange Blossom)', percentage: 8, volatility: 'top', role: 'floral' },
        { name: 'Iris Butter Absolute', percentage: 25, volatility: 'heart', role: 'premium iris' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 10, volatility: 'heart', role: 'rose' },
        { name: 'Violet Leaf Absolute', percentage: 6, volatility: 'heart', role: 'violet' },
        { name: 'Jasmine Absolute', percentage: 5, volatility: 'heart', role: 'floral' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 18, volatility: 'base', role: 'premium wood' },
        { name: 'Cedarwood Virginia', percentage: 5, volatility: 'base', role: 'dry wood' },
        { name: 'Galaxolide', percentage: 10, volatility: 'base', role: 'clean musk' },
        { name: 'Ambroxan', percentage: 3, volatility: 'base', role: 'transparency' },
      ],
      estimatedCost: 685.00,
      upgrades: [
        'Iris butter at 25% (ultra-luxury)',
        'Premium Mysore sandalwood',
        'Increased rose and violet',
        'Most expensive formula in the collection',
      ],
    },
    natural: {
      ingredients: [
        { name: 'Bergamot Oil', percentage: 15, volatility: 'top', role: 'citrus' },
        { name: 'Neroli (Orange Blossom)', percentage: 10, volatility: 'top', role: 'floral' },
        { name: 'Iris Butter Absolute', percentage: 22, volatility: 'heart', role: 'iris' },
        { name: 'Rose Otto (Bulgarian Rose)', percentage: 12, volatility: 'heart', role: 'rose' },
        { name: 'Violet Leaf Absolute', percentage: 6, volatility: 'heart', role: 'violet' },
        { name: 'Sandalwood Oil (Mysore)', percentage: 20, volatility: 'base', role: 'wood' },
        { name: 'Cedarwood Virginia', percentage: 10, volatility: 'base', role: 'dry wood' },
        { name: 'Benzoin Resinoid', percentage: 5, volatility: 'base', role: 'fixative' },
      ],
      estimatedCost: 485.00,
      certifications: ['COSMOS Natural', '100% natural', 'Note: No synthetic musks'],
    },
    production: {
      macerationDays: 45,
      difficulty: 'expert',
      tips: [
        'Iris butter is one of the most expensive perfume materials',
        'Requires 45+ days maceration for full development',
        'Very powdery and sophisticated',
        'Best at 15-20% EdP concentration',
        'This is a masterpiece formula - expensive but extraordinary',
      ],
    },
    ifraCompliant: true,
    seasons: ['autumn', 'winter', 'spring'],
    occasions: ['formal', 'luxury', 'sophisticated', 'art gallery'],
  },
];

// Export formula names for easy reference
export const FLORAL_FORMULA_NAMES = FLORAL_FORMULAS.map(f => f.name);
