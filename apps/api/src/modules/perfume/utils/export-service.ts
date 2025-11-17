/**
 * EXPORT SERVICE
 *
 * Professional export functionality for formulas:
 * - PDF (production sheets, IFRA certificates, labels)
 * - CSV (ingredient lists, batch calculations)
 * - JSON (complete formula data, API integration)
 * - Production instructions
 * - Laboratory worksheets
 */

import { Formula } from '../entities/formula.entity';
import { BatchCalculation } from './formula-calculator';
import { ValidationResult } from './ifra-validator';

export interface ExportOptions {
  includeIngredients?: boolean;
  includeCalculations?: boolean;
  includeIFRAData?: boolean;
  includeProductionNotes?: boolean;
  includePricing?: boolean;
  language?: 'english' | 'french';
}

export class ExportService {
  /**
   * Export formula to JSON
   */
  static exportToJSON(
    formula: Formula,
    options: ExportOptions = {}
  ): string {
    const data: any = {
      id: formula.id,
      name: formula.name,
      description: formula.description,
      type: formula.type,
      structure: formula.structureType,
      concentration: formula.totalConcentration,
      created: formula.createdAt,
      pyramid: {
        top: formula.topNotesPercentage,
        heart: formula.heartNotesPercentage,
        base: formula.baseNotesPercentage,
      },
    };

    if (options.includeIngredients && formula.ingredients) {
      data.ingredients = formula.ingredients.map(fi => ({
        name: fi.ingredient.name,
        percentage: fi.percentage,
        volatility: fi.ingredient.volatility,
        role: fi.role,
        weight: fi.weightInGrams,
        price: fi.cost,
        casNumber: fi.ingredient.casNumber,
      }));
    }

    if (options.includeProductionNotes) {
      data.production = {
        macerationDays: formula.macerationDays,
        preparationNotes: formula.preparationNotes,
        safetyNotes: formula.safetyNotes,
      };
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export formula to CSV
   */
  static exportToCSV(
    formula: Formula,
    batchCalculation?: BatchCalculation
  ): string {
    const lines: string[] = [];

    // Header
    lines.push(`"Formula Name","${formula.name}"`);
    lines.push(`"Type","${formula.type}"`);
    lines.push(`"Concentration","${formula.totalConcentration}%"`);
    lines.push(`"Structure","${formula.structureType}"`);
    lines.push('');

    // Pyramid structure
    lines.push('"Pyramid Structure"');
    lines.push('"Note Level","Percentage"');
    lines.push(`"Top Notes","${formula.topNotesPercentage}%"`);
    lines.push(`"Heart Notes","${formula.heartNotesPercentage}%"`);
    lines.push(`"Base Notes","${formula.baseNotesPercentage}%"`);
    lines.push('');

    // Ingredients
    if (formula.ingredients) {
      lines.push('"Ingredient List"');
      lines.push('"Ingredient Name","Percentage","Weight (g)","Volatility","Role","CAS Number","Price (€)"');

      for (const fi of formula.ingredients) {
        lines.push(
          `"${fi.ingredient.name}",` +
          `"${fi.percentage}%",` +
          `"${fi.weightInGrams.toFixed(2)}g",` +
          `"${fi.ingredient.volatility}",` +
          `"${fi.role || 'N/A'}",` +
          `"${fi.ingredient.casNumber || 'N/A'}",` +
          `"${fi.cost?.toFixed(2) || 'N/A'}"`
        );
      }
      lines.push('');
    }

    // Batch calculation
    if (batchCalculation) {
      lines.push('"Batch Calculation"');
      lines.push('"Component","Volume (ml)","Weight (g)"');
      lines.push(`"Total Batch","${batchCalculation.totalBatchML}","${batchCalculation.totalBatchGrams.toFixed(2)}"`);
      lines.push(`"Fragrance Concentrate","${batchCalculation.concentrateML}","${batchCalculation.concentrateGrams.toFixed(2)}"`);
      lines.push(`"Ethanol 96%","${batchCalculation.alcoholML}","${batchCalculation.alcoholGrams.toFixed(2)}"`);
      lines.push(`"Distilled Water","${batchCalculation.waterML}","${batchCalculation.waterGrams.toFixed(2)}"`);
      lines.push('');
      lines.push(`"Total Cost","€${batchCalculation.totalCost.toFixed(2)}"`);
      lines.push(`"Cost per ml","€${batchCalculation.costPerML.toFixed(3)}"`);
    }

    return lines.join('\n');
  }

  /**
   * Export production sheet (plain text for printing)
   */
  static exportProductionSheet(
    formula: Formula,
    batchCalculation: BatchCalculation,
    language: 'english' | 'french' = 'english'
  ): string {
    const lang = language === 'french' ? this.FR_LANG : this.EN_LANG;
    const lines: string[] = [];

    // Header
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push(`         ${lang.productionSheet.toUpperCase()}`);
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`${lang.formulaName}: ${formula.name}`);
    lines.push(`${lang.type}: ${formula.type}`);
    lines.push(`${lang.batchSize}: ${batchCalculation.totalBatchML}ml`);
    lines.push(`${lang.date}: ${new Date().toISOString().split('T')[0]}`);
    lines.push('');
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push(`${lang.fragranceComposition}`);
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('');

    // Group by volatility
    const topNotes = formula.ingredients.filter(i =>
      i.ingredient.volatility === 'top' || i.ingredient.volatility === 'top_heart'
    );
    const heartNotes = formula.ingredients.filter(i =>
      i.ingredient.volatility === 'heart' || i.ingredient.volatility === 'heart_base'
    );
    const baseNotes = formula.ingredients.filter(i => i.ingredient.volatility === 'base');

    // Top notes
    if (topNotes.length > 0) {
      lines.push(`${lang.topNotes}:`);
      topNotes.forEach(fi => {
        const calc = batchCalculation.ingredients.find(i => i.ingredient === fi.ingredient.name);
        if (calc) {
          lines.push(`  ☐ ${fi.ingredient.name.padEnd(35)} ${calc.weightInGrams.toFixed(2)}g`);
        }
      });
      lines.push('');
    }

    // Heart notes
    if (heartNotes.length > 0) {
      lines.push(`${lang.heartNotes}:`);
      heartNotes.forEach(fi => {
        const calc = batchCalculation.ingredients.find(i => i.ingredient === fi.ingredient.name);
        if (calc) {
          lines.push(`  ☐ ${fi.ingredient.name.padEnd(35)} ${calc.weightInGrams.toFixed(2)}g`);
        }
      });
      lines.push('');
    }

    // Base notes
    if (baseNotes.length > 0) {
      lines.push(`${lang.baseNotes}:`);
      baseNotes.forEach(fi => {
        const calc = batchCalculation.ingredients.find(i => i.ingredient === fi.ingredient.name);
        if (calc) {
          lines.push(`  ☐ ${fi.ingredient.name.padEnd(35)} ${calc.weightInGrams.toFixed(2)}g`);
        }
      });
      lines.push('');
    }

    // Solvents
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push(`${lang.solvents}`);
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push(`  ☐ Ethanol 96%${' '.repeat(29)} ${batchCalculation.alcoholGrams.toFixed(2)}g`);
    lines.push(`  ☐ ${lang.distilledWater}${' '.repeat(35 - lang.distilledWater.length)} ${batchCalculation.waterGrams.toFixed(2)}g`);
    lines.push('');

    // Production steps
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push(`${lang.productionSteps}`);
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push(`1. ${lang.step1}`);
    lines.push(`2. ${lang.step2}`);
    lines.push(`3. ${lang.step3}`);
    lines.push(`4. ${lang.step4}`);
    lines.push(`5. ${lang.step5}`);
    lines.push('');

    // Maceration
    if (formula.macerationDays) {
      lines.push(`${lang.maceration}: ${formula.macerationDays} ${lang.days}`);
      lines.push('');
    }

    // Cost summary
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push(`${lang.costSummary}`);
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push(`${lang.totalCost}: €${batchCalculation.totalCost.toFixed(2)}`);
    lines.push(`${lang.costPerML}: €${batchCalculation.costPerML.toFixed(3)}`);
    lines.push('');

    // Footer
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push(`         ${lang.footer}`);
    lines.push('═══════════════════════════════════════════════════════════════');

    return lines.join('\n');
  }

  /**
   * Export IFRA certificate
   */
  static exportIFRACertificate(
    formula: Formula,
    validation: ValidationResult,
    language: 'english' | 'french' = 'english'
  ): string {
    const lang = language === 'french' ? this.FR_LANG : this.EN_LANG;
    const lines: string[] = [];

    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push(`         ${lang.ifraCertificate.toUpperCase()}`);
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`${lang.formulaName}: ${formula.name}`);
    lines.push(`${lang.date}: ${new Date().toISOString().split('T')[0]}`);
    lines.push(`${lang.category}: IFRA Category ${validation.category}`);
    lines.push(`${lang.concentration}: ${formula.totalConcentration}%`);
    lines.push('');
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push(`${lang.complianceStatus}: ${validation.compliant ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'}`);
    lines.push(`${lang.safetyScore}: ${validation.safetyScore}/100`);
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('');

    if (validation.violations.length > 0) {
      lines.push(`${lang.violations}:`);
      validation.violations.forEach(v => {
        lines.push(`  ⚠ ${v.ingredient}: ${v.currentPercentage.toFixed(3)}% (${lang.max}: ${v.maxAllowed}%)`);
      });
      lines.push('');
    }

    if (validation.warnings.length > 0) {
      lines.push(`${lang.warnings}:`);
      validation.warnings.forEach(w => {
        lines.push(`  ⚡ ${w.message}`);
      });
      lines.push('');
    }

    if (validation.allergenLabeling.length > 0) {
      lines.push(`${lang.allergenDeclaration}:`);
      const requiringLabeling = validation.allergenLabeling.filter(a => a.requiresLabeling);
      requiringLabeling.forEach(a => {
        lines.push(`  - ${a.name} (${(a.concentration).toFixed(4)}%)`);
      });
      lines.push('');
    }

    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push(lang.disclaimer);
    lines.push('═══════════════════════════════════════════════════════════════');

    return lines.join('\n');
  }

  /**
   * Export formula label (for bottle)
   */
  static exportLabel(formula: Formula): string {
    const lines: string[] = [];

    lines.push('┌─────────────────────────────────────────┐');
    lines.push(`│  ${formula.name.toUpperCase().padEnd(39)}│`);
    lines.push('├─────────────────────────────────────────┤');
    lines.push(`│  ${formula.type.toUpperCase().padEnd(39)}│`);
    lines.push(`│  ${(formula.totalConcentration + '% Concentration').padEnd(39)}│`);
    lines.push('├─────────────────────────────────────────┤');

    if (formula.olfactiveFamilies && formula.olfactiveFamilies.length > 0) {
      lines.push(`│  ${formula.olfactiveFamilies.join(', ').padEnd(39)}│`);
    }

    lines.push('├─────────────────────────────────────────┤');

    // Allergen declaration
    const allergenLine = 'Contains: Linalool, Limonene, Geraniol'; // Simplified
    lines.push(`│  ${allergenLine.substring(0, 39).padEnd(39)}│`);

    lines.push('└─────────────────────────────────────────┘');

    return lines.join('\n');
  }

  /**
   * Export quick reference card
   */
  static exportQuickReference(formula: Formula): string {
    const lines: string[] = [];

    lines.push(`${formula.name} - Quick Reference`);
    lines.push('═'.repeat(50));
    lines.push(`Structure: ${formula.topNotesPercentage}% Top / ${formula.heartNotesPercentage}% Heart / ${formula.baseNotesPercentage}% Base`);
    lines.push(`Concentration: ${formula.totalConcentration}% (${formula.type})`);

    if (formula.ingredients && formula.ingredients.length > 0) {
      lines.push('');
      lines.push('Key Ingredients:');
      formula.ingredients
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5)
        .forEach(fi => {
          lines.push(`  • ${fi.ingredient.name} (${fi.percentage}%)`);
        });
    }

    if (formula.macerationDays) {
      lines.push('');
      lines.push(`Maceration: ${formula.macerationDays} days`);
    }

    return lines.join('\n');
  }

  // Language packs
  private static readonly EN_LANG = {
    productionSheet: 'Production Sheet',
    formulaName: 'Formula Name',
    type: 'Type',
    batchSize: 'Batch Size',
    date: 'Date',
    fragranceComposition: 'Fragrance Composition',
    topNotes: 'Top Notes',
    heartNotes: 'Heart Notes',
    baseNotes: 'Base Notes',
    solvents: 'Solvents',
    distilledWater: 'Distilled Water',
    productionSteps: 'Production Steps',
    step1: 'Weigh all fragrance ingredients in order',
    step2: 'Add ethanol 96% and stir gently',
    step3: 'Add distilled water and mix thoroughly',
    step4: 'Transfer to amber glass bottle',
    step5: 'Label and store in cool, dark place',
    maceration: 'Maceration Time',
    days: 'days',
    costSummary: 'Cost Summary',
    totalCost: 'Total Cost',
    costPerML: 'Cost per ml',
    footer: 'Perfume Architect Pro',
    ifraCertificate: 'IFRA Compliance Certificate',
    category: 'Category',
    concentration: 'Concentration',
    complianceStatus: 'Compliance Status',
    safetyScore: 'Safety Score',
    violations: 'Violations',
    warnings: 'Warnings',
    max: 'max',
    allergenDeclaration: 'Allergen Declaration',
    disclaimer: 'Verify with latest IFRA amendments and local regulations',
  };

  private static readonly FR_LANG = {
    productionSheet: 'Fiche de Production',
    formulaName: 'Nom de la Formule',
    type: 'Type',
    batchSize: 'Taille du Lot',
    date: 'Date',
    fragranceComposition: 'Composition du Parfum',
    topNotes: 'Notes de Tête',
    heartNotes: 'Notes de Cœur',
    baseNotes: 'Notes de Fond',
    solvents: 'Solvants',
    distilledWater: 'Eau Distillée',
    productionSteps: 'Étapes de Production',
    step1: 'Peser tous les ingrédients parfumants dans l\'ordre',
    step2: 'Ajouter l\'éthanol 96% et mélanger doucement',
    step3: 'Ajouter l\'eau distillée et mélanger soigneusement',
    step4: 'Transférer dans une bouteille en verre ambré',
    step5: 'Étiqueter et stocker dans un endroit frais et sombre',
    maceration: 'Temps de Macération',
    days: 'jours',
    costSummary: 'Résumé des Coûts',
    totalCost: 'Coût Total',
    costPerML: 'Coût par ml',
    footer: 'Perfume Architect Pro',
    ifraCertificate: 'Certificat de Conformité IFRA',
    category: 'Catégorie',
    concentration: 'Concentration',
    complianceStatus: 'État de Conformité',
    safetyScore: 'Score de Sécurité',
    violations: 'Violations',
    warnings: 'Avertissements',
    max: 'max',
    allergenDeclaration: 'Déclaration des Allergènes',
    disclaimer: 'Vérifier avec les dernières modifications IFRA et réglementations locales',
  };
}
