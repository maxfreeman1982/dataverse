/**
 * FORMULA CALCULATOR
 *
 * Handles all calculations for perfume formulations:
 * - Percentage to weight conversions
 * - Dilution calculations
 * - Cost estimations
 * - Alcohol/water ratios
 * - Batch scaling
 */

export interface FormulaIngredientCalc {
  name: string;
  percentage: number; // % in concentrate
  dilution?: number; // Optional dilution (e.g., 10% in alcohol)
  pricePerKg?: number;
}

export interface FormulaBatchCalc {
  batchSizeML: number;
  concentratePercentage: number; // Total fragrance % (e.g., 15% for EdP)
  alcoholPercentage: number;
  waterPercentage: number;
}

export interface CalculationResult {
  ingredient: string;
  percentageInConcentrate: number;
  percentageInFinalProduct: number;
  weightInGrams: number;
  volumeInML: number;
  cost: number;
  dilutionRequired: boolean;
  dilutedWeightNeeded: number;
  pureWeightNeeded: number;
}

export interface BatchCalculation {
  totalBatchML: number;
  totalBatchGrams: number;
  concentrateML: number;
  concentrateGrams: number;
  alcoholML: number;
  alcoholGrams: number;
  waterML: number;
  waterGrams: number;
  ingredients: CalculationResult[];
  totalCost: number;
  costPerML: number;
}

export class FormulaCalculator {
  // Standard densities (g/mL)
  static readonly DENSITY_ETHANOL = 0.789;
  static readonly DENSITY_WATER = 1.0;
  static readonly DENSITY_AVERAGE_FRAGRANCE = 0.95; // Average for most perfume materials

  /**
   * Calculate complete batch with all ingredients
   */
  static calculateBatch(
    ingredients: FormulaIngredientCalc[],
    batch: FormulaBatchCalc
  ): BatchCalculation {
    const { batchSizeML, concentratePercentage, alcoholPercentage, waterPercentage } = batch;

    // Validate total percentages
    const totalPercentage = concentratePercentage + alcoholPercentage + waterPercentage;
    if (Math.abs(totalPercentage - 100) > 0.1) {
      throw new Error(`Total percentages must equal 100% (currently ${totalPercentage}%)`);
    }

    // Calculate concentrate, alcohol, and water volumes
    const concentrateML = (concentratePercentage / 100) * batchSizeML;
    const alcoholML = (alcoholPercentage / 100) * batchSizeML;
    const waterML = (waterPercentage / 100) * batchSizeML;

    // Calculate weights
    const concentrateGrams = concentrateML * this.DENSITY_AVERAGE_FRAGRANCE;
    const alcoholGrams = alcoholML * this.DENSITY_ETHANOL;
    const waterGrams = waterML * this.DENSITY_WATER;
    const totalBatchGrams = concentrateGrams + alcoholGrams + waterGrams;

    // Calculate each ingredient
    const ingredientResults: CalculationResult[] = [];
    let totalCost = 0;

    for (const ingredient of ingredients) {
      const result = this.calculateIngredient(
        ingredient,
        concentrateGrams,
        concentrateML
      );
      ingredientResults.push(result);
      totalCost += result.cost;
    }

    return {
      totalBatchML: batchSizeML,
      totalBatchGrams,
      concentrateML,
      concentrateGrams,
      alcoholML,
      alcoholGrams,
      waterML,
      waterGrams,
      ingredients: ingredientResults,
      totalCost,
      costPerML: totalCost / batchSizeML,
    };
  }

  /**
   * Calculate single ingredient in formula
   */
  static calculateIngredient(
    ingredient: FormulaIngredientCalc,
    totalConcentrateGrams: number,
    totalConcentrateML: number
  ): CalculationResult {
    const { name, percentage, dilution, pricePerKg } = ingredient;

    // Weight of this ingredient in the concentrate
    const weightInGrams = (percentage / 100) * totalConcentrateGrams;
    const volumeInML = weightInGrams / this.DENSITY_AVERAGE_FRAGRANCE;

    // If diluted, calculate actual pure material needed
    const dilutionRequired = dilution !== undefined && dilution < 100;
    const pureWeightNeeded = dilutionRequired
      ? weightInGrams * (dilution! / 100)
      : weightInGrams;
    const dilutedWeightNeeded = weightInGrams;

    // Calculate cost
    const cost = pricePerKg
      ? (pureWeightNeeded / 1000) * pricePerKg
      : 0;

    return {
      ingredient: name,
      percentageInConcentrate: percentage,
      percentageInFinalProduct: percentage, // Simplified - could be calculated more precisely
      weightInGrams,
      volumeInML,
      cost,
      dilutionRequired,
      dilutedWeightNeeded,
      pureWeightNeeded,
    };
  }

  /**
   * Scale formula up or down
   */
  static scaleFormula(
    originalBatch: BatchCalculation,
    newSizeML: number
  ): BatchCalculation {
    const scaleFactor = newSizeML / originalBatch.totalBatchML;

    const scaledIngredients: CalculationResult[] = originalBatch.ingredients.map(ing => ({
      ...ing,
      weightInGrams: ing.weightInGrams * scaleFactor,
      volumeInML: ing.volumeInML * scaleFactor,
      cost: ing.cost * scaleFactor,
      dilutedWeightNeeded: ing.dilutedWeightNeeded * scaleFactor,
      pureWeightNeeded: ing.pureWeightNeeded * scaleFactor,
    }));

    return {
      totalBatchML: newSizeML,
      totalBatchGrams: originalBatch.totalBatchGrams * scaleFactor,
      concentrateML: originalBatch.concentrateML * scaleFactor,
      concentrateGrams: originalBatch.concentrateGrams * scaleFactor,
      alcoholML: originalBatch.alcoholML * scaleFactor,
      alcoholGrams: originalBatch.alcoholGrams * scaleFactor,
      waterML: originalBatch.waterML * scaleFactor,
      waterGrams: originalBatch.waterGrams * scaleFactor,
      ingredients: scaledIngredients,
      totalCost: originalBatch.totalCost * scaleFactor,
      costPerML: originalBatch.costPerML,
    };
  }

  /**
   * Convert concentrate percentage to final product type
   */
  static getRecommendedConcentration(type: string): {
    concentrate: number;
    alcohol: number;
    water: number;
    name: string;
  } {
    const concentrations: Record<string, any> = {
      extrait: { concentrate: 20, alcohol: 75, water: 5, name: 'Parfum/Extrait' },
      edp: { concentrate: 15, alcohol: 80, water: 5, name: 'Eau de Parfum' },
      edt: { concentrate: 10, alcohol: 85, water: 5, name: 'Eau de Toilette' },
      edc: { concentrate: 5, alcohol: 90, water: 5, name: 'Eau de Cologne' },
      splash: { concentrate: 3, alcohol: 92, water: 5, name: 'Splash Cologne' },
      body_spray: { concentrate: 2, alcohol: 93, water: 5, name: 'Body Spray' },
    };

    return concentrations[type] || concentrations.edp;
  }

  /**
   * Calculate how much alcohol needed to dilute a material
   */
  static calculateDilution(
    pureWeightGrams: number,
    targetConcentration: number
  ): {
    pureWeightGrams: number;
    alcoholNeeded: number;
    totalDilutedWeight: number;
    targetConcentration: number;
  } {
    const totalDilutedWeight = pureWeightGrams / (targetConcentration / 100);
    const alcoholNeeded = totalDilutedWeight - pureWeightGrams;

    return {
      pureWeightGrams,
      alcoholNeeded,
      totalDilutedWeight,
      targetConcentration,
    };
  }

  /**
   * Adjust formula to fit IFRA limits
   */
  static adjustForIFRA(
    ingredients: FormulaIngredientCalc[],
    ifraLimits: Map<string, number> // ingredient name -> max %
  ): {
    adjusted: FormulaIngredientCalc[];
    warnings: string[];
    adjustmentsMade: boolean;
  } {
    const adjusted: FormulaIngredientCalc[] = [];
    const warnings: string[] = [];
    let adjustmentsMade = false;

    for (const ingredient of ingredients) {
      const limit = ifraLimits.get(ingredient.name);

      if (limit !== undefined && ingredient.percentage > limit) {
        adjusted.push({
          ...ingredient,
          percentage: limit,
        });
        warnings.push(
          `${ingredient.name} reduced from ${ingredient.percentage}% to ${limit}% (IFRA limit)`
        );
        adjustmentsMade = true;
      } else {
        adjusted.push(ingredient);
      }
    }

    // Normalize percentages to maintain 100%
    if (adjustmentsMade) {
      const total = adjusted.reduce((sum, ing) => sum + ing.percentage, 0);
      const factor = 100 / total;
      adjusted.forEach(ing => {
        ing.percentage *= factor;
      });
    }

    return { adjusted, warnings, adjustmentsMade };
  }

  /**
   * Calculate maceration time recommendation
   */
  static recommendMacerationTime(
    ingredients: Array<{ volatility: string; isNatural: boolean }>
  ): {
    minimumDays: number;
    optimalDays: number;
    reasoning: string;
  } {
    const hasNaturals = ingredients.some(i => i.isNatural);
    const hasBasenotes = ingredients.some(i => i.volatility === 'base');
    const baseCount = ingredients.filter(i => i.volatility === 'base').length;

    let minimumDays = 7;
    let optimalDays = 14;
    let reasoning = '';

    if (hasNaturals && hasBasenotes) {
      minimumDays = 14;
      optimalDays = 30;
      reasoning = 'Natural base notes require extended maceration for full integration';
    } else if (hasNaturals) {
      minimumDays = 10;
      optimalDays = 21;
      reasoning = 'Natural ingredients benefit from longer maceration';
    } else if (hasBasenotes) {
      minimumDays = 7;
      optimalDays = 14;
      reasoning = 'Base notes need time to fully develop';
    } else {
      minimumDays = 3;
      optimalDays = 7;
      reasoning = 'Light formula with primarily top and heart notes';
    }

    if (baseCount > 5) {
      optimalDays += 14;
      reasoning += '. Complex base structure benefits from extended maturation.';
    }

    return { minimumDays, optimalDays, reasoning };
  }

  /**
   * Generate production instructions
   */
  static generateProductionInstructions(batch: BatchCalculation): string[] {
    const instructions: string[] = [];

    instructions.push('PRODUCTION INSTRUCTIONS');
    instructions.push('═══════════════════════════════════════');
    instructions.push('');
    instructions.push('1. PREPARATION');
    instructions.push('   - Clean and sterilize all equipment');
    instructions.push('   - Prepare accurate scale (0.01g precision)');
    instructions.push('   - Have clean glass beakers ready');
    instructions.push('   - Work in well-ventilated area');
    instructions.push('');
    instructions.push('2. WEIGHING FRAGRANCES (in order)');

    // Sort by percentage (heaviest first for accuracy)
    const sortedIngredients = [...batch.ingredients].sort(
      (a, b) => b.weightInGrams - a.weightInGrams
    );

    sortedIngredients.forEach((ing, index) => {
      const dilutionNote = ing.dilutionRequired
        ? ` (${ing.pureWeightNeeded.toFixed(2)}g pure + alcohol to ${ing.dilutedWeightNeeded.toFixed(2)}g)`
        : '';
      instructions.push(
        `   ${(index + 1).toString().padStart(2, '0')}. ${ing.ingredient}: ${ing.weightInGrams.toFixed(2)}g${dilutionNote}`
      );
    });

    instructions.push('');
    instructions.push('3. MIXING');
    instructions.push(`   - Add ${batch.alcoholGrams.toFixed(2)}g (${batch.alcoholML.toFixed(2)}ml) ethanol 96%`);
    instructions.push('   - Stir gently but thoroughly');
    instructions.push(`   - Add ${batch.waterGrams.toFixed(2)}g (${batch.waterML.toFixed(2)}ml) distilled water`);
    instructions.push('   - Stir until fully integrated');
    instructions.push('');
    instructions.push('4. MATURATION');
    instructions.push('   - Transfer to amber glass bottle');
    instructions.push('   - Label with formula name and date');
    instructions.push('   - Store in cool, dark place');
    instructions.push('   - Shake gently daily for first week');
    instructions.push('   - Allow to macerate for recommended time');
    instructions.push('');
    instructions.push('5. FILTERING & BOTTLING');
    instructions.push('   - Filter through coffee filter if needed');
    instructions.push('   - Bottle in final containers');
    instructions.push('   - Label with all required information');
    instructions.push('');
    instructions.push(`Total Production: ${batch.totalBatchML.toFixed(0)}ml / ${batch.totalBatchGrams.toFixed(2)}g`);
    instructions.push(`Estimated Cost: €${batch.totalCost.toFixed(2)} (€${batch.costPerML.toFixed(3)}/ml)`);

    return instructions;
  }

  /**
   * Calculate solubility issues
   */
  static checkSolubility(
    ingredients: Array<{ name: string; percentage: number; solubilityInAlcohol: number }>,
    alcoholPercentage: number
  ): { soluble: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let soluble = true;

    for (const ingredient of ingredients) {
      if (ingredient.solubilityInAlcohol < 90 && alcoholPercentage < 80) {
        warnings.push(
          `${ingredient.name} has limited solubility (${ingredient.solubilityInAlcohol}%) - may cause turbidity`
        );
        soluble = false;
      }
    }

    if (!soluble) {
      warnings.push('Consider: increasing alcohol %, adding solubilizer, or using emulsifier');
    }

    return { soluble, warnings };
  }

  /**
   * Convert between units
   */
  static convert(value: number, from: string, to: string): number {
    const conversions: Record<string, Record<string, number>> = {
      'g': { 'kg': 0.001, 'mg': 1000, 'oz': 0.035274, 'g': 1 },
      'ml': { 'l': 0.001, 'fl_oz': 0.033814, 'ml': 1 },
      'drops': { 'ml': 0.05, 'drops': 1 }, // Approximate: 1 drop ≈ 0.05ml
    };

    const fromUnit = conversions[from];
    if (!fromUnit) throw new Error(`Unknown unit: ${from}`);

    const conversionFactor = fromUnit[to];
    if (conversionFactor === undefined) throw new Error(`Cannot convert ${from} to ${to}`);

    return value * conversionFactor;
  }
}
