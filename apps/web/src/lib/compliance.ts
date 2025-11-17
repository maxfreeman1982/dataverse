/**
 * Compliance Calculator Utility
 * Calculates allergen concentrations and validates against regulatory limits
 */

import type { Ingredient, Allergen } from '@/graphql/perfume';

export interface FormulaIngredientInput {
  ingredient: Ingredient;
  percentage: number;
}

export interface AllergenCompliance {
  allergen: Allergen;
  totalPercentage: number;
  regulatoryLimit: number;
  isCompliant: boolean;
  exceedsBy: number | null;
  affectedIngredients: {
    ingredient: Ingredient;
    contributedPercentage: number;
  }[];
}

export interface ComplianceReport {
  isFullyCompliant: boolean;
  allergenReports: AllergenCompliance[];
  warnings: string[];
  totalAllergenCount: number;
  violationCount: number;
}

/**
 * Calculate the total percentage of a specific allergen in a formula
 */
export function calculateAllergenPercentage(
  formulaIngredients: FormulaIngredientInput[],
  allergenId: string
): number {
  let totalPercentage = 0;

  for (const item of formulaIngredients) {
    const hasAllergen = item.ingredient.allergens.some((a) => a.id === allergenId);
    if (hasAllergen) {
      // The allergen percentage is the ingredient percentage
      // (assuming 100% concentration of allergen in ingredient for now)
      totalPercentage += item.percentage;
    }
  }

  return Math.round(totalPercentage * 100) / 100; // Round to 2 decimals
}

/**
 * Get all unique allergens present in the formula
 */
export function getAllergensInFormula(
  formulaIngredients: FormulaIngredientInput[]
): Allergen[] {
  const allergenMap = new Map<string, Allergen>();

  for (const item of formulaIngredients) {
    for (const allergen of item.ingredient.allergens) {
      if (!allergenMap.has(allergen.id)) {
        allergenMap.set(allergen.id, allergen);
      }
    }
  }

  return Array.from(allergenMap.values());
}

/**
 * Check compliance for a specific allergen
 */
export function checkAllergenCompliance(
  formulaIngredients: FormulaIngredientInput[],
  allergen: Allergen
): AllergenCompliance {
  const affectedIngredients: {
    ingredient: Ingredient;
    contributedPercentage: number;
  }[] = [];

  let totalPercentage = 0;

  for (const item of formulaIngredients) {
    const hasAllergen = item.ingredient.allergens.some((a) => a.id === allergen.id);
    if (hasAllergen) {
      totalPercentage += item.percentage;
      affectedIngredients.push({
        ingredient: item.ingredient,
        contributedPercentage: item.percentage,
      });
    }
  }

  totalPercentage = Math.round(totalPercentage * 100) / 100;
  const isCompliant = totalPercentage <= allergen.regulatoryLimit;
  const exceedsBy = isCompliant ? null : totalPercentage - allergen.regulatoryLimit;

  return {
    allergen,
    totalPercentage,
    regulatoryLimit: allergen.regulatoryLimit,
    isCompliant,
    exceedsBy: exceedsBy ? Math.round(exceedsBy * 100) / 100 : null,
    affectedIngredients,
  };
}

/**
 * Generate a comprehensive compliance report for a formula
 */
export function generateComplianceReport(
  formulaIngredients: FormulaIngredientInput[]
): ComplianceReport {
  const allergens = getAllergensInFormula(formulaIngredients);
  const allergenReports: AllergenCompliance[] = [];
  const warnings: string[] = [];
  let violationCount = 0;

  for (const allergen of allergens) {
    const compliance = checkAllergenCompliance(formulaIngredients, allergen);
    allergenReports.push(compliance);

    if (!compliance.isCompliant) {
      violationCount++;
      warnings.push(
        `${allergen.name} exceeds limit by ${compliance.exceedsBy}% (${compliance.totalPercentage}% / ${compliance.regulatoryLimit}% max)`
      );
    }
  }

  const isFullyCompliant = violationCount === 0;

  return {
    isFullyCompliant,
    allergenReports,
    warnings,
    totalAllergenCount: allergens.length,
    violationCount,
  };
}

/**
 * Get compliance status as a simple badge variant
 */
export function getComplianceStatus(report: ComplianceReport): {
  status: 'compliant' | 'warning' | 'violation';
  label: string;
  variant: 'default' | 'secondary' | 'destructive';
} {
  if (report.isFullyCompliant) {
    return {
      status: 'compliant',
      label: 'Compliant',
      variant: 'default',
    };
  }

  return {
    status: 'violation',
    label: `${report.violationCount} Violation${report.violationCount > 1 ? 's' : ''}`,
    variant: 'destructive',
  };
}

/**
 * Get color for compliance percentage display
 */
export function getComplianceColor(
  percentage: number,
  limit: number
): 'green' | 'orange' | 'red' {
  const ratio = percentage / limit;
  if (ratio <= 0.8) return 'green';
  if (ratio < 1) return 'orange';
  return 'red';
}
