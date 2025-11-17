import { Injectable } from '@nestjs/common';
import { Ingredient } from '../entities/ingredient.entity';

// ═══════════════════════════════════════════════════════════════════
// 3D OLFACTORY MAPPING SYSTEM
// Maps ingredients in 3D space based on olfactive properties
// Helps visualize relationships and discover unexpected pairings
// ═══════════════════════════════════════════════════════════════════

export interface OlfactoryCoordinates {
  x: number; // Fresh (negative) ↔ Warm (positive)  [-100, +100]
  y: number; // Light (negative) ↔ Heavy (positive) [-100, +100]
  z: number; // Simple (negative) ↔ Complex (positive) [-100, +100]
}

export interface MappedIngredient {
  ingredient: Ingredient;
  coordinates: OlfactoryCoordinates;
  family: string;
  quadrant: string;
  neighbors: Array<{
    ingredient: string;
    distance: number;
    similarity: number; // 0-100%
  }>;
}

export interface OlfactoryCluster {
  clusterName: string;
  centerCoordinates: OlfactoryCoordinates;
  ingredients: string[];
  dominantCharacteristics: string[];
  description: string;
}

export interface UnexpectedPairing {
  ingredient1: string;
  ingredient2: string;
  distance: number;
  geometricRelationship: string;
  whyInteresting: string;
  suggestedRatio: string;
  expectedEffect: string;
  confidenceLevel: number; // 0-100%
}

export interface OlfactoryMapResult {
  totalIngredients: number;
  mappedIngredients: MappedIngredient[];
  clusters: OlfactoryCluster[];
  unexpectedPairings: UnexpectedPairing[];
  dimensions: {
    xAxis: { name: string; negative: string; positive: string };
    yAxis: { name: string; negative: string; positive: string };
    zAxis: { name: string; negative: string; positive: string };
  };
  statistics: {
    mostFresh: string;
    mostWarm: string;
    mostLight: string;
    mostHeavy: string;
    mostSimple: string;
    mostComplex: string;
    centerOfMass: OlfactoryCoordinates;
  };
}

@Injectable()
export class OlfactoryMapService {
  // ═══════════════════════════════════════════════════════════════
  // DIMENSION DEFINITIONS
  // ═══════════════════════════════════════════════════════════════

  private readonly DIMENSIONS = {
    xAxis: {
      name: 'Temperature Character',
      negative: 'Fresh / Cool / Bright',
      positive: 'Warm / Hot / Spicy',
    },
    yAxis: {
      name: 'Density',
      negative: 'Light / Airy / Transparent',
      positive: 'Heavy / Dense / Rich',
    },
    zAxis: {
      name: 'Complexity',
      negative: 'Simple / Linear / Pure',
      positive: 'Complex / Faceted / Multidimensional',
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // MAIN MAPPING FUNCTION
  // ═══════════════════════════════════════════════════════════════

  generateOlfactoryMap(ingredients: Ingredient[]): OlfactoryMapResult {
    // Map each ingredient to 3D coordinates
    const mappedIngredients = ingredients.map(ing => this.mapIngredient(ing, ingredients));

    // Identify clusters
    const clusters = this.identifyClusters(mappedIngredients);

    // Find unexpected pairings
    const unexpectedPairings = this.findUnexpectedPairings(mappedIngredients);

    // Calculate statistics
    const statistics = this.calculateStatistics(mappedIngredients);

    return {
      totalIngredients: ingredients.length,
      mappedIngredients,
      clusters,
      unexpectedPairings,
      dimensions: this.DIMENSIONS,
      statistics,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // INGREDIENT MAPPING TO 3D SPACE
  // ═══════════════════════════════════════════════════════════════

  private mapIngredient(ingredient: Ingredient, allIngredients: Ingredient[]): MappedIngredient {
    const coordinates = this.calculateCoordinates(ingredient);
    const quadrant = this.determineQuadrant(coordinates);
    const neighbors = this.findNeighbors(ingredient, coordinates, allIngredients);

    return {
      ingredient,
      coordinates,
      family: ingredient.olfactiveFamily?.name || 'Unknown',
      quadrant,
      neighbors,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // COORDINATE CALCULATION
  // ═══════════════════════════════════════════════════════════════

  private calculateCoordinates(ingredient: Ingredient): OlfactoryCoordinates {
    let x = 0; // Fresh ↔ Warm
    let y = 0; // Light ↔ Heavy
    let z = 0; // Simple ↔ Complex

    // ─────────────────────────────────────────────────────────────
    // X-AXIS: FRESH/COOL (-) ↔ WARM/HOT (+)
    // ─────────────────────────────────────────────────────────────

    // Fresh/cool notes (negative X)
    if (ingredient.odorProfile?.some(note =>
      ['citrus', 'fresh', 'mint', 'eucalyptus', 'aquatic', 'marine', 'watery', 'green', 'herbal'].includes(note)
    )) {
      x -= 40;
    }

    if (ingredient.name.match(/lemon|bergamot|grapefruit|lime|mint|eucalyptus/i)) {
      x -= 30;
    }

    // Warm/hot notes (positive X)
    if (ingredient.odorProfile?.some(note =>
      ['warm', 'spicy', 'oriental', 'amber', 'resinous', 'balsamic', 'honey'].includes(note)
    )) {
      x += 40;
    }

    if (ingredient.name.match(/cinnamon|clove|pepper|ginger|amber|benzoin|labdanum|oud/i)) {
      x += 30;
    }

    // ─────────────────────────────────────────────────────────────
    // Y-AXIS: LIGHT/AIRY (-) ↔ HEAVY/DENSE (+)
    // ─────────────────────────────────────────────────────────────

    // Volatility-based weight (top = light, base = heavy)
    if (ingredient.volatility === 'top') {
      y -= 40;
    } else if (ingredient.volatility === 'top_heart') {
      y -= 20;
    } else if (ingredient.volatility === 'heart') {
      y += 0; // Neutral
    } else if (ingredient.volatility === 'heart_base') {
      y += 20;
    } else if (ingredient.volatility === 'base') {
      y += 40;
    }

    // Density by note type
    if (ingredient.odorProfile?.some(note =>
      ['transparent', 'airy', 'light', 'ethereal', 'delicate'].includes(note)
    )) {
      y -= 30;
    }

    if (ingredient.odorProfile?.some(note =>
      ['heavy', 'dense', 'thick', 'animalic', 'leathery', 'gourmand', 'chocolate'].includes(note)
    )) {
      y += 35;
    }

    // Specific heavy materials
    if (ingredient.name.match(/vanilla|tonka|benzoin|oud|leather|musk|patchouli|vetiver/i)) {
      y += 25;
    }

    // ─────────────────────────────────────────────────────────────
    // Z-AXIS: SIMPLE/LINEAR (-) ↔ COMPLEX/FACETED (+)
    // ─────────────────────────────────────────────────────────────

    // Number of odor profiles indicates complexity
    const profileCount = ingredient.odorProfile?.length || 0;
    if (profileCount <= 2) {
      z -= 30; // Simple
    } else if (profileCount >= 5) {
      z += 40; // Complex
    } else {
      z += profileCount * 5; // Moderate complexity
    }

    // Naturally complex materials
    if (ingredient.name.match(/rose|jasmine|ylang|oud|patchouli|oakmoss|iris/i)) {
      z += 35; // Highly faceted naturals
    }

    // Simple synthetic molecules
    if (ingredient.name.match(/iso e super|ambroxan|galaxolide|hedione|calone/i)) {
      z -= 25; // Linear synthetics
    }

    // Complex accords
    if (ingredient.odorProfile?.some(note =>
      ['complex', 'multifaceted', 'rich', 'sophisticated'].includes(note)
    )) {
      z += 30;
    }

    // Clamp values to [-100, +100]
    x = Math.max(-100, Math.min(100, x));
    y = Math.max(-100, Math.min(100, y));
    z = Math.max(-100, Math.min(100, z));

    return { x, y, z };
  }

  // ═══════════════════════════════════════════════════════════════
  // QUADRANT DETERMINATION
  // ═══════════════════════════════════════════════════════════════

  private determineQuadrant(coords: OlfactoryCoordinates): string {
    const xLabel = coords.x < 0 ? 'Fresh' : 'Warm';
    const yLabel = coords.y < 0 ? 'Light' : 'Heavy';
    const zLabel = coords.z < 0 ? 'Simple' : 'Complex';

    return `${xLabel}-${yLabel}-${zLabel}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // NEIGHBOR FINDING (Euclidean distance in 3D space)
  // ═══════════════════════════════════════════════════════════════

  private findNeighbors(
    ingredient: Ingredient,
    coordinates: OlfactoryCoordinates,
    allIngredients: Ingredient[],
  ): Array<{ ingredient: string; distance: number; similarity: number }> {
    const neighbors: Array<{ ingredient: string; distance: number; similarity: number }> = [];

    allIngredients.forEach(other => {
      if (other.id === ingredient.id) return; // Skip self

      const otherCoords = this.calculateCoordinates(other);
      const distance = this.calculateEuclideanDistance(coordinates, otherCoords);

      // Only include neighbors within reasonable distance
      if (distance < 100) {
        const similarity = Math.round((1 - distance / 200) * 100); // Convert distance to similarity %

        neighbors.push({
          ingredient: other.name,
          distance: Math.round(distance * 10) / 10,
          similarity,
        });
      }
    });

    // Sort by distance (closest first) and return top 10
    return neighbors
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  }

  // ═══════════════════════════════════════════════════════════════
  // EUCLIDEAN DISTANCE CALCULATION
  // ═══════════════════════════════════════════════════════════════

  private calculateEuclideanDistance(
    coords1: OlfactoryCoordinates,
    coords2: OlfactoryCoordinates,
  ): number {
    const dx = coords1.x - coords2.x;
    const dy = coords1.y - coords2.y;
    const dz = coords1.z - coords2.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // ═══════════════════════════════════════════════════════════════
  // CLUSTER IDENTIFICATION
  // ═══════════════════════════════════════════════════════════════

  private identifyClusters(mappedIngredients: MappedIngredient[]): OlfactoryCluster[] {
    const clusters: OlfactoryCluster[] = [];

    // Predefined cluster regions based on known perfumery families
    const clusterDefinitions = [
      {
        name: 'Fresh Citrus Cluster',
        center: { x: -60, y: -50, z: -20 },
        radius: 40,
        description: 'Bright, zesty, uplifting citrus notes',
      },
      {
        name: 'White Floral Cluster',
        center: { x: -10, y: 10, z: 50 },
        radius: 45,
        description: 'Rich, indolic, complex white flowers',
      },
      {
        name: 'Woody Amber Cluster',
        center: { x: 60, y: 50, z: 30 },
        radius: 50,
        description: 'Warm, resinous, long-lasting woody-amber notes',
      },
      {
        name: 'Green Herbal Cluster',
        center: { x: -40, y: -20, z: 10 },
        radius: 35,
        description: 'Fresh, aromatic, natural green notes',
      },
      {
        name: 'Gourmand Cluster',
        center: { x: 40, y: 60, z: 40 },
        radius: 45,
        description: 'Sweet, edible, comforting gourmand notes',
      },
      {
        name: 'Transparent Musk Cluster',
        center: { x: 0, y: -30, z: -40 },
        radius: 35,
        description: 'Clean, linear, modern synthetic musks',
      },
      {
        name: 'Spicy Oriental Cluster',
        center: { x: 70, y: 40, z: 50 },
        radius: 40,
        description: 'Hot, complex, exotic spicy notes',
      },
      {
        name: 'Aquatic Marine Cluster',
        center: { x: -70, y: -60, z: -30 },
        radius: 35,
        description: 'Ozonic, watery, transparent aquatic notes',
      },
    ];

    clusterDefinitions.forEach(clusterDef => {
      const membersInCluster = mappedIngredients.filter(mapped => {
        const distance = this.calculateEuclideanDistance(mapped.coordinates, clusterDef.center);
        return distance <= clusterDef.radius;
      });

      if (membersInCluster.length > 0) {
        // Extract dominant characteristics
        const allProfiles = membersInCluster
          .flatMap(m => m.ingredient.odorProfile || []);

        const profileCounts = new Map<string, number>();
        allProfiles.forEach(profile => {
          profileCounts.set(profile, (profileCounts.get(profile) || 0) + 1);
        });

        const dominantCharacteristics = Array.from(profileCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([profile]) => profile);

        clusters.push({
          clusterName: clusterDef.name,
          centerCoordinates: clusterDef.center,
          ingredients: membersInCluster.map(m => m.ingredient.name),
          dominantCharacteristics,
          description: clusterDef.description,
        });
      }
    });

    return clusters;
  }

  // ═══════════════════════════════════════════════════════════════
  // UNEXPECTED PAIRINGS
  // ═══════════════════════════════════════════════════════════════

  private findUnexpectedPairings(mappedIngredients: MappedIngredient[]): UnexpectedPairing[] {
    const pairings: UnexpectedPairing[] = [];

    // Look for ingredients that are:
    // 1. Far apart in space (different quadrants)
    // 2. But share some olfactive characteristics
    // These create interesting contrasts

    for (let i = 0; i < mappedIngredients.length; i++) {
      for (let j = i + 1; j < mappedIngredients.length; j++) {
        const ing1 = mappedIngredients[i];
        const ing2 = mappedIngredients[j];

        const distance = this.calculateEuclideanDistance(ing1.coordinates, ing2.coordinates);

        // Interesting pairings are moderately far (60-120 units)
        if (distance >= 60 && distance <= 120) {
          // Check if they share any odor profiles (unexpected commonality)
          const sharedProfiles = ing1.ingredient.odorProfile?.filter(p =>
            ing2.ingredient.odorProfile?.includes(p)
          ) || [];

          if (sharedProfiles.length > 0) {
            const relationship = this.describeGeometricRelationship(
              ing1.coordinates,
              ing2.coordinates,
            );

            const whyInteresting = this.explainWhyInteresting(
              ing1,
              ing2,
              distance,
              sharedProfiles,
            );

            const suggestedRatio = this.suggestRatio(ing1, ing2);
            const expectedEffect = this.predictEffect(ing1, ing2, relationship);

            pairings.push({
              ingredient1: ing1.ingredient.name,
              ingredient2: ing2.ingredient.name,
              distance: Math.round(distance * 10) / 10,
              geometricRelationship: relationship,
              whyInteresting,
              suggestedRatio,
              expectedEffect,
              confidenceLevel: Math.min(90, Math.round((120 - distance) + sharedProfiles.length * 10)),
            });
          }
        }
      }
    }

    // Return top 20 most interesting pairings
    return pairings
      .sort((a, b) => b.confidenceLevel - a.confidenceLevel)
      .slice(0, 20);
  }

  // ═══════════════════════════════════════════════════════════════
  // GEOMETRIC RELATIONSHIP DESCRIPTION
  // ═══════════════════════════════════════════════════════════════

  private describeGeometricRelationship(
    coords1: OlfactoryCoordinates,
    coords2: OlfactoryCoordinates,
  ): string {
    const dx = Math.abs(coords2.x - coords1.x);
    const dy = Math.abs(coords2.y - coords1.y);
    const dz = Math.abs(coords2.z - coords1.z);

    // Determine primary axis of difference
    const maxDiff = Math.max(dx, dy, dz);

    if (maxDiff === dx) {
      return coords2.x > coords1.x
        ? 'Fresh-to-Warm Contrast (Temperature Opposition)'
        : 'Warm-to-Fresh Contrast (Temperature Opposition)';
    } else if (maxDiff === dy) {
      return coords2.y > coords1.y
        ? 'Light-to-Heavy Contrast (Density Opposition)'
        : 'Heavy-to-Light Contrast (Density Opposition)';
    } else {
      return coords2.z > coords1.z
        ? 'Simple-to-Complex Contrast (Complexity Opposition)'
        : 'Complex-to-Simple Contrast (Complexity Opposition)';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // EXPLAIN WHY PAIRING IS INTERESTING
  // ═══════════════════════════════════════════════════════════════

  private explainWhyInteresting(
    ing1: MappedIngredient,
    ing2: MappedIngredient,
    distance: number,
    sharedProfiles: string[],
  ): string {
    let explanation = `Despite being in different olfactive regions (${ing1.quadrant} vs ${ing2.quadrant}), `;
    explanation += `these ingredients share ${sharedProfiles.length} common characteristic(s): ${sharedProfiles.join(', ')}. `;
    explanation += `This creates an unexpected bridge between contrasting families.`;

    return explanation;
  }

  // ═══════════════════════════════════════════════════════════════
  // SUGGEST RATIO
  // ═══════════════════════════════════════════════════════════════

  private suggestRatio(ing1: MappedIngredient, ing2: MappedIngredient): string {
    const strength1 = ing1.ingredient.strength;
    const strength2 = ing2.ingredient.strength;

    // Balance by strength (stronger ingredient gets lower percentage)
    if (strength1 > strength2 + 2) {
      return `${ing1.ingredient.name}:${ing2.ingredient.name} = 1:3 (balance strong ${ing1.ingredient.name})`;
    } else if (strength2 > strength1 + 2) {
      return `${ing1.ingredient.name}:${ing2.ingredient.name} = 3:1 (balance strong ${ing2.ingredient.name})`;
    } else {
      return `${ing1.ingredient.name}:${ing2.ingredient.name} = 1:1 (equal strength)`;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PREDICT EFFECT
  // ═══════════════════════════════════════════════════════════════

  private predictEffect(
    ing1: MappedIngredient,
    ing2: MappedIngredient,
    relationship: string,
  ): string {
    if (relationship.includes('Temperature')) {
      return 'Creates dynamic tension between warmth and freshness. The contrast will make both notes more vivid and prevent monotony.';
    } else if (relationship.includes('Density')) {
      return 'Adds depth dimension - light notes provide lift while heavy notes provide foundation. Creates vertical structure.';
    } else if (relationship.includes('Complexity')) {
      return 'Balances intricacy with clarity. Complex note provides interest while simple note provides focus and wearability.';
    }

    return 'Creates unexpected harmony through contrast. May result in a unique signature accord.';
  }

  // ═══════════════════════════════════════════════════════════════
  // STATISTICS CALCULATION
  // ═══════════════════════════════════════════════════════════════

  private calculateStatistics(mappedIngredients: MappedIngredient[]): {
    mostFresh: string;
    mostWarm: string;
    mostLight: string;
    mostHeavy: string;
    mostSimple: string;
    mostComplex: string;
    centerOfMass: OlfactoryCoordinates;
  } {
    // Find extremes
    let mostFresh = mappedIngredients[0];
    let mostWarm = mappedIngredients[0];
    let mostLight = mappedIngredients[0];
    let mostHeavy = mappedIngredients[0];
    let mostSimple = mappedIngredients[0];
    let mostComplex = mappedIngredients[0];

    mappedIngredients.forEach(mapped => {
      if (mapped.coordinates.x < mostFresh.coordinates.x) mostFresh = mapped;
      if (mapped.coordinates.x > mostWarm.coordinates.x) mostWarm = mapped;
      if (mapped.coordinates.y < mostLight.coordinates.y) mostLight = mapped;
      if (mapped.coordinates.y > mostHeavy.coordinates.y) mostHeavy = mapped;
      if (mapped.coordinates.z < mostSimple.coordinates.z) mostSimple = mapped;
      if (mapped.coordinates.z > mostComplex.coordinates.z) mostComplex = mapped;
    });

    // Calculate center of mass
    const avgX = mappedIngredients.reduce((sum, m) => sum + m.coordinates.x, 0) / mappedIngredients.length;
    const avgY = mappedIngredients.reduce((sum, m) => sum + m.coordinates.y, 0) / mappedIngredients.length;
    const avgZ = mappedIngredients.reduce((sum, m) => sum + m.coordinates.z, 0) / mappedIngredients.length;

    return {
      mostFresh: mostFresh.ingredient.name,
      mostWarm: mostWarm.ingredient.name,
      mostLight: mostLight.ingredient.name,
      mostHeavy: mostHeavy.ingredient.name,
      mostSimple: mostSimple.ingredient.name,
      mostComplex: mostComplex.ingredient.name,
      centerOfMass: {
        x: Math.round(avgX * 10) / 10,
        y: Math.round(avgY * 10) / 10,
        z: Math.round(avgZ * 10) / 10,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // QUERY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════

  findSimilarIngredients(
    targetIngredient: Ingredient,
    allIngredients: Ingredient[],
    limit: number = 10,
  ): Array<{ ingredient: string; similarity: number; distance: number }> {
    const targetCoords = this.calculateCoordinates(targetIngredient);

    const similarities = allIngredients
      .filter(ing => ing.id !== targetIngredient.id)
      .map(ing => {
        const coords = this.calculateCoordinates(ing);
        const distance = this.calculateEuclideanDistance(targetCoords, coords);
        const similarity = Math.round((1 - distance / 200) * 100);

        return {
          ingredient: ing.name,
          similarity,
          distance: Math.round(distance * 10) / 10,
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return similarities;
  }

  findOppositeIngredients(
    targetIngredient: Ingredient,
    allIngredients: Ingredient[],
    limit: number = 10,
  ): Array<{ ingredient: string; oppositeScore: number; distance: number }> {
    const targetCoords = this.calculateCoordinates(targetIngredient);

    const opposites = allIngredients
      .filter(ing => ing.id !== targetIngredient.id)
      .map(ing => {
        const coords = this.calculateCoordinates(ing);
        const distance = this.calculateEuclideanDistance(targetCoords, coords);
        const oppositeScore = Math.round((distance / 200) * 100); // Higher distance = more opposite

        return {
          ingredient: ing.name,
          oppositeScore,
          distance: Math.round(distance * 10) / 10,
        };
      })
      .sort((a, b) => b.distance - a.distance) // Most distant first
      .slice(0, limit);

    return opposites;
  }
}
