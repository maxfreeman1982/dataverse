import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity';
import { OlfactiveFamily } from '../entities/olfactive-family.entity';
import { Allergen } from '../entities/allergen.entity';
import { Formula } from '../entities/formula.entity';
import { FormulaIngredient } from '../entities/formula-ingredient.entity';
import { INGREDIENT_DATABASE, OLFACTIVE_FAMILIES_DATA, ALLERGENS_DATA } from '../data/ingredient-database';
import { FibonacciPerfumeEngine } from '../utils/fibonacci-engine';
import { FormulaCalculator } from '../utils/formula-calculator';
import { IFRAValidator, IFRACategory } from '../utils/ifra-validator';

@Injectable()
export class PerfumeService implements OnModuleInit {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(OlfactiveFamily)
    private olfactiveFamilyRepository: Repository<OlfactiveFamily>,
    @InjectRepository(Allergen)
    private allergenRepository: Repository<Allergen>,
    @InjectRepository(Formula)
    private formulaRepository: Repository<Formula>,
    @InjectRepository(FormulaIngredient)
    private formulaIngredientRepository: Repository<FormulaIngredient>,
  ) {}

  /**
   * Initialize database with seed data
   */
  async onModuleInit() {
    await this.seedDatabase();
  }

  /**
   * Seed database with comprehensive ingredient data
   */
  private async seedDatabase() {
    // Check if already seeded
    const ingredientCount = await this.ingredientRepository.count();
    if (ingredientCount > 0) {
      console.log('✓ Perfume database already seeded');
      return;
    }

    console.log('🌸 Seeding Perfume Architect Pro database...');

    try {
      // 1. Seed Olfactive Families
      const families = await Promise.all(
        OLFACTIVE_FAMILIES_DATA.map(familyData =>
          this.olfactiveFamilyRepository.save(
            this.olfactiveFamilyRepository.create(familyData)
          )
        )
      );
      console.log(`  ✓ Created ${families.length} olfactive families`);

      // 2. Seed Allergens
      const allergens = await Promise.all(
        ALLERGENS_DATA.map(allergenData =>
          this.allergenRepository.save(
            this.allergenRepository.create(allergenData)
          )
        )
      );
      console.log(`  ✓ Created ${allergens.length} allergens`);

      // 3. Seed Ingredients
      for (const ingredientData of INGREDIENT_DATABASE) {
        const family = families.find(f => f.name === ingredientData.olfactiveFamily);
        if (!family) {
          console.warn(`  ⚠ Family not found for ${ingredientData.name}: ${ingredientData.olfactiveFamily}`);
          continue;
        }

        // Extract allergens from ingredientData and exclude from spread
        const { allergens: allergenNames, olfactiveFamily: familyName, ...ingredientProps } = ingredientData;

        const ingredient = this.ingredientRepository.create({
          ...ingredientProps,
          olfactiveFamily: family,
        });

        // Add allergens if specified
        if (allergenNames) {
          ingredient.allergens = allergens.filter(a =>
            allergenNames.includes(a.name)
          );
        }

        await this.ingredientRepository.save(ingredient);
      }

      console.log(`  ✓ Created ${INGREDIENT_DATABASE.length} ingredients`);
      console.log('🎉 Perfume Architect Pro database seeded successfully!');
    } catch (error) {
      console.error('  ✗ Error seeding database:', error);
    }
  }

  /**
   * Get all ingredients
   */
  async getAllIngredients(): Promise<Ingredient[]> {
    return this.ingredientRepository.find({
      relations: ['olfactiveFamily', 'allergens'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Get ingredients by olfactive family
   */
  async getIngredientsByFamily(familyName: string): Promise<Ingredient[]> {
    return this.ingredientRepository.find({
      where: { olfactiveFamily: { name: familyName } },
      relations: ['olfactiveFamily', 'allergens'],
    });
  }

  /**
   * Get ingredients by region
   */
  async getIngredientsByRegion(region: string): Promise<Ingredient[]> {
    return this.ingredientRepository
      .createQueryBuilder('ingredient')
      .leftJoinAndSelect('ingredient.olfactiveFamily', 'family')
      .leftJoinAndSelect('ingredient.allergens', 'allergens')
      .where('ingredient.countryOfOrigin LIKE :region', { region: `%${region}%` })
      .orWhere('ingredient.culturalSignificance LIKE :region', { region: `%${region}%` })
      .getMany();
  }

  /**
   * Search ingredients
   */
  async searchIngredients(query: string): Promise<Ingredient[]> {
    return this.ingredientRepository
      .createQueryBuilder('ingredient')
      .leftJoinAndSelect('ingredient.olfactiveFamily', 'family')
      .where('ingredient.name LIKE :query', { query: `%${query}%` })
      .orWhere('ingredient.odorProfile LIKE :query', { query: `%${query}%` })
      .take(20)
      .getMany();
  }

  /**
   * Get all olfactive families
   */
  async getAllOlfactiveFamilies(): Promise<OlfactiveFamily[]> {
    return this.olfactiveFamilyRepository.find({
      order: { popularity: 'DESC' },
    });
  }

  /**
   * Create formula using Fibonacci engine
   */
  async createFibonacciFormula(
    name: string,
    ingredientIds: string[],
    complexity: 'simple' | 'medium' | 'complex' = 'medium'
  ): Promise<Formula> {
    const ingredients = await this.ingredientRepository.findByIds(ingredientIds);

    // Calculate Fibonacci ratios
    const pyramidRatios = FibonacciPerfumeEngine.calculatePyramidRatios(complexity);

    // Create formula
    const formula = this.formulaRepository.create({
      name,
      structureType: 'fibonacci' as any,
      topNotesPercentage: pyramidRatios.top,
      heartNotesPercentage: pyramidRatios.heart,
      baseNotesPercentage: pyramidRatios.base,
      fibonacciRatio: FibonacciPerfumeEngine.PHI,
      totalConcentration: 15, // Default EdP
      type: 'edp' as any,
    });

    await this.formulaRepository.save(formula);

    // Add ingredients with Fibonacci distribution
    const ingredientsByVolatility = {
      top: ingredients.filter(i => i.volatility === 'top' || i.volatility === 'top_heart'),
      heart: ingredients.filter(i => i.volatility === 'heart' || i.volatility === 'heart_base'),
      base: ingredients.filter(i => i.volatility === 'base'),
    };

    const topPercentages = FibonacciPerfumeEngine.spiralDistribution(
      ingredientsByVolatility.top.length,
      pyramidRatios.top,
      true
    );

    const heartPercentages = FibonacciPerfumeEngine.spiralDistribution(
      ingredientsByVolatility.heart.length,
      pyramidRatios.heart,
      false
    );

    const basePercentages = FibonacciPerfumeEngine.spiralDistribution(
      ingredientsByVolatility.base.length,
      pyramidRatios.base,
      true
    );

    let orderIndex = 0;

    // Add top notes
    for (let i = 0; i < ingredientsByVolatility.top.length; i++) {
      const formulaIngredient = this.formulaIngredientRepository.create({
        formula,
        ingredient: ingredientsByVolatility.top[i],
        percentage: topPercentages[i],
        weightInGrams: 0, // Will be calculated
        orderIndex: orderIndex++,
        role: i === 0 ? 'main' : 'supporting',
      });
      await this.formulaIngredientRepository.save(formulaIngredient);
    }

    // Add heart notes
    for (let i = 0; i < ingredientsByVolatility.heart.length; i++) {
      const formulaIngredient = this.formulaIngredientRepository.create({
        formula,
        ingredient: ingredientsByVolatility.heart[i],
        percentage: heartPercentages[i],
        weightInGrams: 0,
        orderIndex: orderIndex++,
        role: i === 0 ? 'main' : 'supporting',
      });
      await this.formulaIngredientRepository.save(formulaIngredient);
    }

    // Add base notes
    for (let i = 0; i < ingredientsByVolatility.base.length; i++) {
      const formulaIngredient = this.formulaIngredientRepository.create({
        formula,
        ingredient: ingredientsByVolatility.base[i],
        percentage: basePercentages[i],
        weightInGrams: 0,
        orderIndex: orderIndex++,
        role: i === 0 ? 'fixer' : 'supporting',
      });
      await this.formulaIngredientRepository.save(formulaIngredient);
    }

    return this.formulaRepository.findOne({
      where: { id: formula.id },
      relations: ['ingredients', 'ingredients.ingredient'],
    });
  }

  /**
   * Calculate batch for formula
   */
  async calculateFormulaBatch(
    formulaId: string,
    batchSizeML: number
  ) {
    const formula = await this.formulaRepository.findOne({
      where: { id: formulaId },
      relations: ['ingredients', 'ingredients.ingredient'],
    });

    if (!formula) {
      throw new Error('Formula not found');
    }

    const ingredientsCalc = formula.ingredients.map(fi => ({
      name: fi.ingredient.name,
      percentage: fi.percentage,
      dilution: fi.dilution,
      pricePerKg: fi.ingredient.pricePerKg,
    }));

    const batch = {
      batchSizeML,
      concentratePercentage: formula.totalConcentration,
      alcoholPercentage: formula.alcoholPercentage || 80,
      waterPercentage: formula.waterPercentage || 5,
    };

    return FormulaCalculator.calculateBatch(ingredientsCalc, batch);
  }

  /**
   * Validate formula against IFRA
   */
  async validateFormulaIFRA(
    formulaId: string,
    category: IFRACategory = IFRACategory.CATEGORY_4
  ) {
    const formula = await this.formulaRepository.findOne({
      where: { id: formulaId },
      relations: ['ingredients', 'ingredients.ingredient', 'ingredients.ingredient.allergens'],
    });

    if (!formula) {
      throw new Error('Formula not found');
    }

    const ingredientsIFRA = formula.ingredients.map(fi => ({
      name: fi.ingredient.name,
      casNumber: fi.ingredient.casNumber,
      percentage: fi.percentage,
      limits: {
        category1: fi.ingredient.ifraMaxCategory1,
        category2: fi.ingredient.ifraMaxCategory2,
        category3: fi.ingredient.ifraMaxCategory3,
        category4: fi.ingredient.ifraMaxCategory4,
        category5: fi.ingredient.ifraMaxCategory5,
        category6: fi.ingredient.ifraMaxCategory6,
        category7: fi.ingredient.ifraMaxCategory7,
        category8: fi.ingredient.ifraMaxCategory8,
        category9: fi.ingredient.ifraMaxCategory9,
        category10: fi.ingredient.ifraMaxCategory10,
        category11: fi.ingredient.ifraMaxCategory11,
      },
      allergens: fi.ingredient.allergens?.map(a => a.name),
    }));

    return IFRAValidator.validateFormula(
      ingredientsIFRA,
      category,
      formula.totalConcentration
    );
  }

  /**
   * Get all formulas
   */
  async getAllFormulas(): Promise<Formula[]> {
    return this.formulaRepository.find({
      relations: ['ingredients', 'ingredients.ingredient'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get formula by ID
   */
  async getFormulaById(id: string): Promise<Formula> {
    const formula = await this.formulaRepository.findOne({
      where: { id },
      relations: ['ingredients', 'ingredients.ingredient', 'ingredients.ingredient.olfactiveFamily'],
    });

    if (!formula) {
      throw new Error('Formula not found');
    }

    return formula;
  }
}
