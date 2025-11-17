/**
 * Pre-composed Accords Library
 * Classic and modern perfumery accords for quick composition
 */

export interface Accord {
  id: string;
  name: string;
  type: 'Classic' | 'Modern' | 'Regional' | 'Seasonal';
  description: string;
  character: string;
  ingredients: {
    name: string;
    percentage: number;
    role: string;
  }[];
  totalPercentage: number;
  usageRecommendation: string;
  bestFor: string[];
}

export const CLASSIC_ACCORDS: Accord[] = [
  {
    id: 'chypre',
    name: 'Accord Chypre',
    type: 'Classic',
    description: 'Sophisticated woody-citrus accord with earthy undertones',
    character: 'Elegant, sophisticated, timeless',
    ingredients: [
      { name: 'Bergamot', percentage: 40, role: 'Fresh opening' },
      { name: 'Oakmoss', percentage: 30, role: 'Earthy depth' },
      { name: 'Labdanum', percentage: 20, role: 'Warm resin' },
      { name: 'Patchouli', percentage: 10, role: 'Woody base' },
    ],
    totalPercentage: 100,
    usageRecommendation: 'Use as 20-30% of total formula for sophisticated bases',
    bestFor: ['Unisex', 'Masculine', 'Evening wear'],
  },
  {
    id: 'fougere',
    name: 'Accord Fougère',
    type: 'Classic',
    description: 'Aromatic-woody accord with herbal lavender heart',
    character: 'Fresh, aromatic, masculine',
    ingredients: [
      { name: 'Lavender', percentage: 45, role: 'Aromatic heart' },
      { name: 'Coumarin', percentage: 25, role: 'Sweet hay note' },
      { name: 'Oakmoss', percentage: 20, role: 'Woody base' },
      { name: 'Geranium', percentage: 10, role: 'Floral facet' },
    ],
    totalPercentage: 100,
    usageRecommendation: 'Ideal for masculine fragrances at 25-35% of formula',
    bestFor: ['Masculine', 'Sport', 'Daily wear'],
  },
  {
    id: 'oriental',
    name: 'Accord Oriental',
    type: 'Classic',
    description: 'Warm, spicy-sweet accord with resinous depth',
    character: 'Warm, sensual, opulent',
    ingredients: [
      { name: 'Vanilla', percentage: 35, role: 'Sweet warmth' },
      { name: 'Benzoin', percentage: 30, role: 'Resinous depth' },
      { name: 'Incense', percentage: 20, role: 'Smoky mystique' },
      { name: 'Amber', percentage: 15, role: 'Golden warmth' },
    ],
    totalPercentage: 100,
    usageRecommendation: 'Rich base at 30-40% for luxurious fragrances',
    bestFor: ['Feminine', 'Evening', 'Winter'],
  },
  {
    id: 'floral-bouquet',
    name: 'Bouquet Floral',
    type: 'Classic',
    description: 'Classic floral heart with rose and jasmine',
    character: 'Romantic, elegant, feminine',
    ingredients: [
      { name: 'Rose', percentage: 40, role: 'Floral queen' },
      { name: 'Jasmine', percentage: 35, role: 'White flower' },
      { name: 'Ylang-ylang', percentage: 15, role: 'Creamy exotic' },
      { name: 'Lily of the Valley', percentage: 10, role: 'Green freshness' },
    ],
    totalPercentage: 100,
    usageRecommendation: 'Heart note at 30-50% for feminine florals',
    bestFor: ['Feminine', 'Romantic', 'Spring'],
  },
];

export const MODERN_ACCORDS: Accord[] = [
  {
    id: 'aquatic',
    name: 'Accord Aquatique',
    type: 'Modern',
    description: 'Fresh marine-ozonic accord evoking ocean breeze',
    character: 'Clean, fresh, modern',
    ingredients: [
      { name: 'Calone', percentage: 35, role: 'Marine ozone' },
      { name: 'Seaweed', percentage: 25, role: 'Aquatic facet' },
      { name: 'Mint', percentage: 25, role: 'Cool freshness' },
      { name: 'Ambergris', percentage: 15, role: 'Mineral depth' },
    ],
    totalPercentage: 100,
    usageRecommendation: 'Top-heart at 25-35% for fresh compositions',
    bestFor: ['Masculine', 'Unisex', 'Summer'],
  },
  {
    id: 'gourmand',
    name: 'Accord Gourmand',
    type: 'Modern',
    description: 'Sweet edible accord with caramel and tonka',
    character: 'Sweet, comforting, indulgent',
    ingredients: [
      { name: 'Caramel', percentage: 35, role: 'Sweet indulgence' },
      { name: 'Tonka Bean', percentage: 30, role: 'Almond-vanilla' },
      { name: 'Praline', percentage: 20, role: 'Nutty sweetness' },
      { name: 'Vanilla', percentage: 15, role: 'Creamy base' },
    ],
    totalPercentage: 100,
    usageRecommendation: 'Base at 20-30% for sweet fragrances',
    bestFor: ['Feminine', 'Youthful', 'Evening'],
  },
  {
    id: 'woody-amber',
    name: 'Woody Ambroxan',
    type: 'Modern',
    description: 'Contemporary woody-amber with clean musk',
    character: 'Modern, subtle, skin-like',
    ingredients: [
      { name: 'Ambroxan', percentage: 40, role: 'Amber radiance' },
      { name: 'Cedarwood', percentage: 30, role: 'Dry woods' },
      { name: 'White Musk', percentage: 20, role: 'Clean skin' },
      { name: 'Iso E Super', percentage: 10, role: 'Woody halo' },
    ],
    totalPercentage: 100,
    usageRecommendation: 'Base at 25-35% for modern elegance',
    bestFor: ['Unisex', 'Minimalist', 'Daily'],
  },
];

export const SEASONAL_ACCORDS: Accord[] = [
  {
    id: 'spring-garden',
    name: 'Jardin de Printemps',
    type: 'Seasonal',
    description: 'Fresh floral-green accord for spring awakening',
    character: 'Fresh, green, blooming',
    ingredients: [
      { name: 'Freesia', percentage: 30, role: 'Spring flower' },
      { name: 'Green Tea', percentage: 25, role: 'Fresh green' },
      { name: 'Peony', percentage: 25, role: 'Soft floral' },
      { name: 'Magnolia', percentage: 20, role: 'Delicate white' },
    ],
    totalPercentage: 100,
    usageRecommendation: 'Heart at 30-40% for spring fragrances',
    bestFor: ['Spring', 'Feminine', 'Daytime'],
  },
  {
    id: 'summer-citrus',
    name: 'Agrumes d\'Été',
    type: 'Seasonal',
    description: 'Sparkling citrus blend for summer freshness',
    character: 'Bright, zesty, energizing',
    ingredients: [
      { name: 'Lemon', percentage: 35, role: 'Bright zest' },
      { name: 'Grapefruit', percentage: 30, role: 'Bitter fresh' },
      { name: 'Mandarin', percentage: 25, role: 'Sweet citrus' },
      { name: 'Neroli', percentage: 10, role: 'Floral lift' },
    ],
    totalPercentage: 100,
    usageRecommendation: 'Top at 40-50% for fresh summer scents',
    bestFor: ['Summer', 'Unisex', 'Morning'],
  },
  {
    id: 'autumn-spice',
    name: 'Épices d\'Automne',
    type: 'Seasonal',
    description: 'Warm spicy accord for autumn comfort',
    character: 'Warm, spicy, cozy',
    ingredients: [
      { name: 'Cinnamon', percentage: 30, role: 'Warm spice' },
      { name: 'Cardamom', percentage: 25, role: 'Green spice' },
      { name: 'Nutmeg', percentage: 25, role: 'Sweet spice' },
      { name: 'Clove', percentage: 20, role: 'Rich depth' },
    ],
    totalPercentage: 100,
    usageRecommendation: 'Heart-base at 15-25% for warmth',
    bestFor: ['Autumn', 'Unisex', 'Evening'],
  },
  {
    id: 'winter-warmth',
    name: 'Chaleur Hivernale',
    type: 'Seasonal',
    description: 'Rich balsamic accord for winter comfort',
    character: 'Rich, comforting, enveloping',
    ingredients: [
      { name: 'Peru Balsam', percentage: 35, role: 'Sweet resin' },
      { name: 'Frankincense', percentage: 30, role: 'Sacred smoke' },
      { name: 'Myrrh', percentage: 20, role: 'Bitter warmth' },
      { name: 'Sandalwood', percentage: 15, role: 'Creamy wood' },
    ],
    totalPercentage: 100,
    usageRecommendation: 'Base at 25-35% for winter richness',
    bestFor: ['Winter', 'Evening', 'Luxury'],
  },
];

export const ALL_ACCORDS = [
  ...CLASSIC_ACCORDS,
  ...MODERN_ACCORDS,
  ...SEASONAL_ACCORDS,
];

/**
 * Get accords by type
 */
export function getAccordsByType(type: Accord['type']): Accord[] {
  return ALL_ACCORDS.filter((accord) => accord.type === type);
}

/**
 * Search accords by name or character
 */
export function searchAccords(query: string): Accord[] {
  const lowerQuery = query.toLowerCase();
  return ALL_ACCORDS.filter(
    (accord) =>
      accord.name.toLowerCase().includes(lowerQuery) ||
      accord.character.toLowerCase().includes(lowerQuery) ||
      accord.description.toLowerCase().includes(lowerQuery)
  );
}
