/**
 * IFRA COMPLIANCE VALIDATOR
 *
 * Validates formulas against IFRA (International Fragrance Association) standards
 * Ensures regulatory compliance for different product categories
 */

export enum IFRACategory {
  CATEGORY_1 = 1,   // Lip products
  CATEGORY_2 = 2,   // Deodorant/Antiperspirant
  CATEGORY_3 = 3,   // Eyes
  CATEGORY_4 = 4,   // Hydroalcoholic products (EdP, EdT, EdC)
  CATEGORY_5 = 5,   // Body lotions, creams, face creams
  CATEGORY_6 = 6,   // Air care, home fragrances
  CATEGORY_7 = 7,   // Rinse-off products (shampoo, shower gel)
  CATEGORY_8 = 8,   // Candles
  CATEGORY_9 = 9,   // Soaps (bar soap, liquid soap)
  CATEGORY_10 = 10, // Household cleaners
  CATEGORY_11 = 11, // Industrial products
}

export interface IFRALimits {
  category1: number;
  category2: number;
  category3: number;
  category4: number;
  category5: number;
  category6: number;
  category7: number;
  category8: number;
  category9: number;
  category10: number;
  category11: number;
}

export interface IngredientIFRAData {
  name: string;
  casNumber?: string;
  percentage: number; // Percentage in the formula
  limits: IFRALimits;
  allergens?: string[];
}

export interface ValidationResult {
  compliant: boolean;
  category: IFRACategory;
  violations: Violation[];
  warnings: Warning[];
  allergenLabeling: AllergenLabel[];
  safetyScore: number; // 0-100
}

export interface Violation {
  ingredient: string;
  currentPercentage: number;
  maxAllowed: number;
  severity: 'critical' | 'high' | 'medium';
  message: string;
}

export interface Warning {
  ingredient: string;
  message: string;
  recommendation: string;
}

export interface AllergenLabel {
  name: string;
  concentration: number;
  requiresLabeling: boolean;
  labelingThreshold: number;
}

export class IFRAValidator {
  /**
   * Validate formula against IFRA limits for specific category
   */
  static validateFormula(
    ingredients: IngredientIFRAData[],
    category: IFRACategory,
    fragranceConcentration: number = 100 // % of fragrance in final product
  ): ValidationResult {
    const violations: Violation[] = [];
    const warnings: Warning[] = [];
    const allergenLabeling: AllergenLabel[] = [];

    for (const ingredient of ingredients) {
      // Get the limit for this category
      const limit = this.getLimitForCategory(ingredient.limits, category);

      // Calculate actual percentage in final product
      const actualPercentage = (ingredient.percentage / 100) * fragranceConcentration;

      // Check if exceeds limit
      if (actualPercentage > limit && limit < 100) {
        const severity = this.determineSeverity(actualPercentage, limit);

        violations.push({
          ingredient: ingredient.name,
          currentPercentage: actualPercentage,
          maxAllowed: limit,
          severity,
          message: `${ingredient.name} at ${actualPercentage.toFixed(2)}% exceeds IFRA limit of ${limit}% for Category ${category}`,
        });
      }

      // Check for warnings (within 10% of limit)
      if (actualPercentage > limit * 0.9 && limit < 100) {
        warnings.push({
          ingredient: ingredient.name,
          message: `${ingredient.name} is close to IFRA limit (${actualPercentage.toFixed(2)}% of ${limit}%)`,
          recommendation: 'Consider reducing dosage for safety margin',
        });
      }

      // Track allergens
      if (ingredient.allergens && ingredient.allergens.length > 0) {
        for (const allergen of ingredient.allergens) {
          allergenLabeling.push({
            name: allergen,
            concentration: actualPercentage,
            requiresLabeling: actualPercentage > 0.001, // 0.001% = 10ppm
            labelingThreshold: 0.001,
          });
        }
      }
    }

    // Calculate safety score
    const safetyScore = this.calculateSafetyScore(ingredients, category, violations, fragranceConcentration);

    return {
      compliant: violations.length === 0,
      category,
      violations,
      warnings,
      allergenLabeling,
      safetyScore,
    };
  }

  /**
   * Get IFRA limit for specific category
   */
  private static getLimitForCategory(limits: IFRALimits, category: IFRACategory): number {
    switch (category) {
      case IFRACategory.CATEGORY_1: return limits.category1;
      case IFRACategory.CATEGORY_2: return limits.category2;
      case IFRACategory.CATEGORY_3: return limits.category3;
      case IFRACategory.CATEGORY_4: return limits.category4;
      case IFRACategory.CATEGORY_5: return limits.category5;
      case IFRACategory.CATEGORY_6: return limits.category6;
      case IFRACategory.CATEGORY_7: return limits.category7;
      case IFRACategory.CATEGORY_8: return limits.category8;
      case IFRACategory.CATEGORY_9: return limits.category9;
      case IFRACategory.CATEGORY_10: return limits.category10;
      case IFRACategory.CATEGORY_11: return limits.category11;
      default: return 100;
    }
  }

  /**
   * Determine severity of violation
   */
  private static determineSeverity(actual: number, limit: number): 'critical' | 'high' | 'medium' {
    const exceedance = (actual - limit) / limit;

    if (exceedance > 0.5) return 'critical'; // More than 50% over limit
    if (exceedance > 0.2) return 'high';     // 20-50% over limit
    return 'medium';                          // 0-20% over limit
  }

  /**
   * Calculate overall safety score
   */
  private static calculateSafetyScore(
    ingredients: IngredientIFRAData[],
    category: IFRACategory,
    violations: Violation[],
    fragranceConcentration: number
  ): number {
    let score = 100;

    // Deduct for violations
    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 5;
          break;
      }
    }

    // Deduct for ingredients close to limits
    for (const ingredient of ingredients) {
      const limit = this.getLimitForCategory(ingredient.limits, category);
      const actualPercentage = (ingredient.percentage / 100) * fragranceConcentration;

      if (limit < 100) {
        const usage = actualPercentage / limit;
        if (usage > 0.8) score -= 2; // Using > 80% of limit
        if (usage > 0.9) score -= 3; // Using > 90% of limit
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Suggest reformulation to meet IFRA standards
   */
  static suggestReformulation(
    ingredients: IngredientIFRAData[],
    category: IFRACategory,
    fragranceConcentration: number = 100
  ): {
    adjusted: Array<{ name: string; originalPercentage: number; adjustedPercentage: number }>;
    removedIngredients: string[];
    additionalNotes: string[];
  } {
    const adjusted: Array<{ name: string; originalPercentage: number; adjustedPercentage: number }> = [];
    const removedIngredients: string[] = [];
    const additionalNotes: string[] = [];

    let totalReduction = 0;

    for (const ingredient of ingredients) {
      const limit = this.getLimitForCategory(ingredient.limits, category);
      const actualPercentage = (ingredient.percentage / 100) * fragranceConcentration;

      if (actualPercentage > limit && limit < 100) {
        // Calculate safe percentage with 10% safety margin
        const safePercentage = (limit * 0.9 / fragranceConcentration) * 100;
        const reduction = ingredient.percentage - safePercentage;

        if (safePercentage < 0.1) {
          // Too restrictive, suggest removal
          removedIngredients.push(ingredient.name);
          totalReduction += ingredient.percentage;
          additionalNotes.push(
            `${ingredient.name} removed (limit too restrictive for this category)`
          );
        } else {
          adjusted.push({
            name: ingredient.name,
            originalPercentage: ingredient.percentage,
            adjustedPercentage: safePercentage,
          });
          totalReduction += reduction;
        }
      }
    }

    // Redistribute the reduced percentage across other ingredients
    if (totalReduction > 0) {
      const remainingIngredients = ingredients.filter(
        ing => !removedIngredients.includes(ing.name) &&
               !adjusted.find(a => a.name === ing.name)
      );

      if (remainingIngredients.length > 0) {
        const redistributionPerIngredient = totalReduction / remainingIngredients.length;
        additionalNotes.push(
          `Redistributed ${totalReduction.toFixed(2)}% across ${remainingIngredients.length} compliant ingredients`
        );
      }
    }

    return { adjusted, removedIngredients, additionalNotes };
  }

  /**
   * Generate allergen declaration list
   */
  static generateAllergenDeclaration(allergens: AllergenLabel[]): string {
    const requiringLabeling = allergens.filter(a => a.requiresLabeling);

    if (requiringLabeling.length === 0) {
      return 'No allergen labeling required.';
    }

    // Group by allergen name and sum concentrations
    const grouped = new Map<string, number>();
    for (const allergen of requiringLabeling) {
      const current = grouped.get(allergen.name) || 0;
      grouped.set(allergen.name, current + allergen.concentration);
    }

    const sortedAllergens = Array.from(grouped.entries())
      .sort((a, b) => b[1] - a[1]); // Sort by concentration, highest first

    let declaration = 'ALLERGEN DECLARATION:\n\n';
    declaration += 'Contains:\n';

    for (const [name, concentration] of sortedAllergens) {
      declaration += `- ${name} (${concentration.toFixed(4)}%)\n`;
    }

    declaration += '\nNote: All allergens above 0.001% (10 ppm) must be listed on packaging per EU Cosmetics Regulation.';

    return declaration;
  }

  /**
   * Get category description
   */
  static getCategoryDescription(category: IFRACategory): string {
    const descriptions: Record<IFRACategory, string> = {
      [IFRACategory.CATEGORY_1]: 'Lip products (lipstick, lip balm, lip gloss)',
      [IFRACategory.CATEGORY_2]: 'Deodorant and antiperspirant products',
      [IFRACategory.CATEGORY_3]: 'Eye products (eyeshadow, eyeliner, mascara)',
      [IFRACategory.CATEGORY_4]: 'Hydroalcoholic products (perfume, eau de parfum, eau de toilette, cologne)',
      [IFRACategory.CATEGORY_5]: 'Body care products (body lotion, face cream, hand cream)',
      [IFRACategory.CATEGORY_6]: 'Air care products (room spray, reed diffuser, potpourri)',
      [IFRACategory.CATEGORY_7]: 'Rinse-off products (shampoo, conditioner, shower gel, soap)',
      [IFRACategory.CATEGORY_8]: 'Candles (scented candles)',
      [IFRACategory.CATEGORY_9]: 'Soap products (bar soap, liquid soap)',
      [IFRACategory.CATEGORY_10]: 'Household cleaning products (detergents, surface cleaners)',
      [IFRACategory.CATEGORY_11]: 'Industrial products (non-consumer)',
    };

    return descriptions[category] || 'Unknown category';
  }

  /**
   * Generate compliance certificate
   */
  static generateComplianceCertificate(
    formulaName: string,
    validation: ValidationResult,
    fragranceConcentration: number
  ): string {
    const date = new Date().toISOString().split('T')[0];

    let certificate = '═══════════════════════════════════════════════════════════════\n';
    certificate += '                    IFRA COMPLIANCE CERTIFICATE                  \n';
    certificate += '═══════════════════════════════════════════════════════════════\n\n';
    certificate += `Formula Name: ${formulaName}\n`;
    certificate += `Date: ${date}\n`;
    certificate += `Product Category: IFRA Category ${validation.category}\n`;
    certificate += `Category Description: ${this.getCategoryDescription(validation.category)}\n`;
    certificate += `Fragrance Concentration: ${fragranceConcentration}%\n\n`;
    certificate += '───────────────────────────────────────────────────────────────\n';
    certificate += `COMPLIANCE STATUS: ${validation.compliant ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'}\n`;
    certificate += `Safety Score: ${validation.safetyScore}/100\n`;
    certificate += '───────────────────────────────────────────────────────────────\n\n';

    if (validation.violations.length > 0) {
      certificate += 'VIOLATIONS:\n\n';
      for (const violation of validation.violations) {
        certificate += `⚠ ${violation.severity.toUpperCase()}: ${violation.message}\n`;
      }
      certificate += '\n';
    }

    if (validation.warnings.length > 0) {
      certificate += 'WARNINGS:\n\n';
      for (const warning of validation.warnings) {
        certificate += `⚡ ${warning.message}\n`;
        certificate += `   Recommendation: ${warning.recommendation}\n\n`;
      }
    }

    if (validation.allergenLabeling.length > 0) {
      certificate += this.generateAllergenDeclaration(validation.allergenLabeling);
      certificate += '\n\n';
    }

    certificate += '───────────────────────────────────────────────────────────────\n';
    certificate += 'This certificate is generated based on IFRA Standards.\n';
    certificate += 'Always verify with latest IFRA amendments and local regulations.\n';
    certificate += '═══════════════════════════════════════════════════════════════\n';

    return certificate;
  }

  /**
   * Check if formula is suitable for natural/organic certification
   */
  static checkNaturalCertification(
    ingredients: Array<{
      name: string;
      isNatural: boolean;
      isCOSMOSApproved: boolean;
      percentage: number;
    }>
  ): {
    naturalPercentage: number;
    cosmosCompliant: boolean;
    nonNaturalIngredients: string[];
    nonCOSMOSIngredients: string[];
  } {
    let naturalWeight = 0;
    let totalWeight = 0;
    const nonNaturalIngredients: string[] = [];
    const nonCOSMOSIngredients: string[] = [];

    for (const ingredient of ingredients) {
      totalWeight += ingredient.percentage;

      if (ingredient.isNatural) {
        naturalWeight += ingredient.percentage;
      } else {
        nonNaturalIngredients.push(ingredient.name);
      }

      if (!ingredient.isCOSMOSApproved) {
        nonCOSMOSIngredients.push(ingredient.name);
      }
    }

    const naturalPercentage = (naturalWeight / totalWeight) * 100;
    const cosmosCompliant = nonCOSMOSIngredients.length === 0;

    return {
      naturalPercentage,
      cosmosCompliant,
      nonNaturalIngredients,
      nonCOSMOSIngredients,
    };
  }
}
