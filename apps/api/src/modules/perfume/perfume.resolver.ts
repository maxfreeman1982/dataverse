import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PerfumeService } from './services/perfume.service';
import { AIRecommendationService, RecommendationRequest } from './services/ai-recommendation.service';
import { MoodComposerService } from './services/mood-composer.service';
import { SeasonalOptimizerService } from './services/seasonal-optimizer.service';
import { SkinChemistryService } from './services/skin-chemistry.service';
import { ReverseEngineerService } from './services/reverse-engineer.service';
import { OlfactoryMapService } from './services/olfactory-map.service';
import { Ingredient } from './entities/ingredient.entity';
import { OlfactiveFamily } from './entities/olfactive-family.entity';
import { Formula } from './entities/formula.entity';
import { IFRACategory } from './utils/ifra-validator';

@Resolver()
export class PerfumeResolver {
  constructor(
    private perfumeService: PerfumeService,
    private aiRecommendationService: AIRecommendationService,
    private moodComposerService: MoodComposerService,
    private seasonalOptimizerService: SeasonalOptimizerService,
    private skinChemistryService: SkinChemistryService,
    private reverseEngineerService: ReverseEngineerService,
    private olfactoryMapService: OlfactoryMapService,
  ) {}

  // ═══════════════════════════════════════════════════════════════
  // INGREDIENT QUERIES
  // ═══════════════════════════════════════════════════════════════

  @Query(() => [Ingredient])
  async getAllIngredients(): Promise<Ingredient[]> {
    return this.perfumeService.getAllIngredients();
  }

  @Query(() => [Ingredient])
  async getIngredientsByFamily(
    @Args('familyName') familyName: string,
  ): Promise<Ingredient[]> {
    return this.perfumeService.getIngredientsByFamily(familyName);
  }

  @Query(() => [Ingredient])
  async getIngredientsByRegion(
    @Args('region') region: string,
  ): Promise<Ingredient[]> {
    return this.perfumeService.getIngredientsByRegion(region);
  }

  @Query(() => [Ingredient])
  async searchIngredients(
    @Args('query') query: string,
  ): Promise<Ingredient[]> {
    return this.perfumeService.searchIngredients(query);
  }

  // ═══════════════════════════════════════════════════════════════
  // OLFACTIVE FAMILY QUERIES
  // ═══════════════════════════════════════════════════════════════

  @Query(() => [OlfactiveFamily])
  async getAllOlfactiveFamilies(): Promise<OlfactiveFamily[]> {
    return this.perfumeService.getAllOlfactiveFamilies();
  }

  // ═══════════════════════════════════════════════════════════════
  // FORMULA QUERIES
  // ═══════════════════════════════════════════════════════════════

  @Query(() => [Formula])
  async getAllFormulas(): Promise<Formula[]> {
    return this.perfumeService.getAllFormulas();
  }

  @Query(() => Formula)
  async getFormulaById(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Formula> {
    return this.perfumeService.getFormulaById(id);
  }

  // ═══════════════════════════════════════════════════════════════
  // FORMULA MUTATIONS
  // ═══════════════════════════════════════════════════════════════

  @Mutation(() => Formula)
  async createFibonacciFormula(
    @Args('name') name: string,
    @Args('ingredientIds', { type: () => [ID] }) ingredientIds: string[],
    @Args('complexity', { defaultValue: 'medium' }) complexity: 'simple' | 'medium' | 'complex',
  ): Promise<Formula> {
    return this.perfumeService.createFibonacciFormula(name, ingredientIds, complexity);
  }

  // ═══════════════════════════════════════════════════════════════
  // CALCULATION & VALIDATION QUERIES
  // ═══════════════════════════════════════════════════════════════

  @Query(() => String)
  async calculateFormulaBatch(
    @Args('formulaId', { type: () => ID }) formulaId: string,
    @Args('batchSizeML') batchSizeML: number,
  ): Promise<string> {
    const result = await this.perfumeService.calculateFormulaBatch(formulaId, batchSizeML);
    return JSON.stringify(result, null, 2);
  }

  @Query(() => String)
  async validateFormulaIFRA(
    @Args('formulaId', { type: () => ID }) formulaId: string,
    @Args('category', { defaultValue: IFRACategory.CATEGORY_4 }) category: IFRACategory,
  ): Promise<string> {
    const result = await this.perfumeService.validateFormulaIFRA(formulaId, category);
    return JSON.stringify(result, null, 2);
  }

  // ═══════════════════════════════════════════════════════════════
  // AI RECOMMENDATION QUERIES
  // ═══════════════════════════════════════════════════════════════

  @Query(() => String)
  async getAIRecommendations(
    @Args('mood', { nullable: true }) mood?: string,
    @Args('style', { nullable: true }) style?: string,
    @Args('region', { nullable: true }) region?: string,
    @Args('naturalOnly', { defaultValue: false }) naturalOnly?: boolean,
    @Args('complexity', { defaultValue: 'medium' }) complexity?: 'minimal' | 'simple' | 'medium' | 'complex' | 'very_complex',
  ): Promise<string> {
    const request: RecommendationRequest = {
      mood: mood as any,
      style,
      region,
      naturalOnly,
      complexity,
    };

    const ingredients = await this.perfumeService.getAllIngredients();
    const recommendations = await this.aiRecommendationService.generateRecommendations(
      request,
      ingredients,
    );

    return JSON.stringify(recommendations, null, 2);
  }

  @Query(() => String)
  async detectConflicts(
    @Args('ingredientIds', { type: () => [ID] }) ingredientIds: string[],
  ): Promise<string> {
    const ingredients = await this.perfumeService.getAllIngredients();
    const selectedIngredients = ingredients.filter(i => ingredientIds.includes(i.id));
    const conflicts = this.aiRecommendationService.detectConflicts(selectedIngredients);
    return JSON.stringify(conflicts, null, 2);
  }

  // ═══════════════════════════════════════════════════════════════
  // FIBONACCI ENGINE UTILITIES
  // ═══════════════════════════════════════════════════════════════

  @Query(() => String)
  async calculateFibonacciRatios(
    @Args('complexity', { defaultValue: 'medium' }) complexity: 'simple' | 'medium' | 'complex',
  ): Promise<string> {
    const { FibonacciPerfumeEngine } = require('./utils/fibonacci-engine');
    const ratios = FibonacciPerfumeEngine.calculatePyramidRatios(complexity);
    return JSON.stringify(ratios, null, 2);
  }

  // ═══════════════════════════════════════════════════════════════
  // PERFUME NAME GENERATOR
  // ═══════════════════════════════════════════════════════════════

  @Query(() => String)
  async generatePerfumeNames(
    @Args('mood', { nullable: true }) mood?: string,
    @Args('style', { nullable: true }) style?: string,
    @Args('region', { nullable: true }) region?: string,
    @Args('language', { defaultValue: 'mixed' }) language?: string,
    @Args('styleType', { defaultValue: 'luxury' }) styleType?: string,
  ): Promise<string> {
    const { PerfumeNameGenerator } = require('./utils/name-generator');

    const request = {
      mood: mood as any,
      style,
      region,
      language: language as any,
      style_type: styleType as any,
    };

    const names = PerfumeNameGenerator.generateNames(request);
    return JSON.stringify(names, null, 2);
  }

  @Query(() => String)
  async generateNameFromIngredients(
    @Args('ingredientNames', { type: () => [String] }) ingredientNames: string[],
  ): Promise<string> {
    const { PerfumeNameGenerator } = require('./utils/name-generator');
    const names = PerfumeNameGenerator.generateFromIngredients(ingredientNames);
    return JSON.stringify(names, null, 2);
  }

  // ═══════════════════════════════════════════════════════════════
  // EXPORT FUNCTIONALITY
  // ═══════════════════════════════════════════════════════════════

  @Query(() => String)
  async exportFormulaToJSON(
    @Args('formulaId', { type: () => ID }) formulaId: string,
    @Args('includeIngredients', { defaultValue: true }) includeIngredients?: boolean,
    @Args('includeIFRAData', { defaultValue: true }) includeIFRAData?: boolean,
  ): Promise<string> {
    const { ExportService } = require('./utils/export-service');
    const formula = await this.perfumeService.getFormulaById(formulaId);

    return ExportService.exportToJSON(formula, {
      includeIngredients,
      includeIFRAData,
      includeProductionNotes: true,
      includePricing: true,
    });
  }

  @Query(() => String)
  async exportFormulaToCSV(
    @Args('formulaId', { type: () => ID }) formulaId: string,
    @Args('batchSizeML', { nullable: true }) batchSizeML?: number,
  ): Promise<string> {
    const { ExportService } = require('./utils/export-service');
    const formula = await this.perfumeService.getFormulaById(formulaId);

    let batchCalc;
    if (batchSizeML) {
      batchCalc = await this.perfumeService.calculateFormulaBatch(formulaId, batchSizeML);
    }

    return ExportService.exportToCSV(formula, batchCalc);
  }

  @Query(() => String)
  async exportProductionSheet(
    @Args('formulaId', { type: () => ID }) formulaId: string,
    @Args('batchSizeML') batchSizeML: number,
    @Args('language', { defaultValue: 'english' }) language?: string,
  ): Promise<string> {
    const { ExportService } = require('./utils/export-service');
    const formula = await this.perfumeService.getFormulaById(formulaId);
    const batchCalc = await this.perfumeService.calculateFormulaBatch(formulaId, batchSizeML);

    return ExportService.exportProductionSheet(formula, batchCalc, language as any);
  }

  @Query(() => String)
  async exportIFRACertificate(
    @Args('formulaId', { type: () => ID }) formulaId: string,
    @Args('category', { defaultValue: IFRACategory.CATEGORY_4 }) category?: IFRACategory,
    @Args('language', { defaultValue: 'english' }) language?: string,
  ): Promise<string> {
    const { ExportService } = require('./utils/export-service');
    const formula = await this.perfumeService.getFormulaById(formulaId);
    const validation = await this.perfumeService.validateFormulaIFRA(formulaId, category);

    return ExportService.exportIFRACertificate(formula, validation, language as any);
  }

  @Query(() => String)
  async exportQuickReference(
    @Args('formulaId', { type: () => ID }) formulaId: string,
  ): Promise<string> {
    const { ExportService } = require('./utils/export-service');
    const formula = await this.perfumeService.getFormulaById(formulaId);

    return ExportService.exportQuickReference(formula);
  }

  // ═══════════════════════════════════════════════════════════════
  // MOOD COMPOSER
  // ═══════════════════════════════════════════════════════════════

  @Query(() => String)
  async composeMoodPerfume(
    @Args('mood') mood: string,
    @Args('intensity', { defaultValue: 5 }) intensity: number,
    @Args('timeOfDay', { nullable: true }) timeOfDay?: string,
    @Args('season', { nullable: true }) season?: string,
  ): Promise<string> {
    const ingredients = await this.perfumeService.getAllIngredients();

    const profile = {
      mood: mood as any,
      intensity,
      timeOfDay: timeOfDay as any,
      season: season as any,
    };

    const composition = await this.moodComposerService.composeMoodPerfume(
      profile,
      ingredients
    );

    return JSON.stringify(composition, null, 2);
  }

  @Query(() => String)
  async getMoodRecommendations(
    @Args('timeOfDay') timeOfDay: string,
    @Args('season') season: string,
  ): Promise<string> {
    const { MoodComposerService } = require('./services/mood-composer.service');
    const recommendations = MoodComposerService.getMoodRecommendations(timeOfDay, season);
    return JSON.stringify(recommendations, null, 2);
  }

  // ═══════════════════════════════════════════════════════════════
  // SEASONAL OPTIMIZATION
  // ═══════════════════════════════════════════════════════════════

  @Query(() => String)
  async optimizeFormulaForSeasonalConditions(
    @Args('formulaId', { type: () => ID }) formulaId: string,
    @Args('baseConcentration') baseConcentration: number,
    @Args('temperature') temperature: number,
    @Args('humidity') humidity: number,
    @Args('season', { nullable: true }) season?: string,
    @Args('climate', { nullable: true }) climate?: string,
    @Args('altitude', { nullable: true }) altitude?: number,
  ): Promise<string> {
    const formula = await this.perfumeService.getFormulaById(formulaId);

    const conditions = {
      temperature,
      humidity,
      season: season as any,
      climate: climate as any,
      altitude,
    };

    const optimization = this.seasonalOptimizerService.optimizeForConditions(
      formula,
      baseConcentration,
      conditions,
    );

    return JSON.stringify(optimization, null, 2);
  }

  @Query(() => String)
  async getSeasonalProfile(
    @Args('season') season: string,
  ): Promise<string> {
    const profile = this.seasonalOptimizerService.getSeasonalProfile(season as any);
    return JSON.stringify(profile, null, 2);
  }

  @Query(() => String)
  async getClimateRecommendations(
    @Args('climate') climate: string,
  ): Promise<string> {
    const recommendations = this.seasonalOptimizerService.getClimateRecommendations(climate as any);
    return JSON.stringify(recommendations, null, 2);
  }

  // ═══════════════════════════════════════════════════════════════
  // SKIN CHEMISTRY SIMULATION
  // ═══════════════════════════════════════════════════════════════

  @Query(() => String)
  async simulateSkinChemistry(
    @Args('formulaId', { type: () => ID }) formulaId: string,
    @Args('skinType') skinType: string,
    @Args('skinpH') skinpH: string,
    @Args('skinTemperature', { nullable: true }) skinTemperature?: string,
    @Args('moistureLevel', { nullable: true }) moistureLevel?: number,
  ): Promise<string> {
    const formula = await this.perfumeService.getFormulaById(formulaId);

    const skinProfile = {
      skinType: skinType as any,
      pH: skinpH as any,
      skinTemperature: skinTemperature as any,
      moistureLevel,
    };

    const simulation = this.skinChemistryService.simulateSkinInteraction(formula, skinProfile);
    return JSON.stringify(simulation, null, 2);
  }

  // ═══════════════════════════════════════════════════════════════
  // REVERSE ENGINEERING
  // ═══════════════════════════════════════════════════════════════

  @Query(() => String)
  async reverseEngineerPerfume(
    @Args('perfumeName', { nullable: true }) perfumeName?: string,
    @Args('brand', { nullable: true }) brand?: string,
    @Args('topNotes', { type: () => [String], nullable: true }) topNotes?: string[],
    @Args('heartNotes', { type: () => [String], nullable: true }) heartNotes?: string[],
    @Args('baseNotes', { type: () => [String], nullable: true }) baseNotes?: string[],
    @Args('dominantFamily', { nullable: true }) dominantFamily?: string,
    @Args('style', { nullable: true }) style?: string,
  ): Promise<string> {
    const ingredients = await this.perfumeService.getAllIngredients();

    const analysisInput = {
      perfumeName,
      brand,
      topNotes,
      heartNotes,
      baseNotes,
      dominantFamily,
      style,
    };

    const reconstruction = await this.reverseEngineerService.analyzeAndReconstruct(
      analysisInput,
      ingredients,
    );

    return JSON.stringify(reconstruction, null, 2);
  }

  @Query(() => String)
  async getKnownPerfumes(): Promise<string> {
    const perfumes = this.reverseEngineerService.getAllKnownPerfumes();
    return JSON.stringify(perfumes, null, 2);
  }

  @Query(() => String)
  async searchKnownPerfumes(
    @Args('query') query: string,
  ): Promise<string> {
    const perfumes = this.reverseEngineerService.searchKnownPerfumes(query);
    return JSON.stringify(perfumes, null, 2);
  }

  // ═══════════════════════════════════════════════════════════════
  // 3D OLFACTORY MAPPING
  // ═══════════════════════════════════════════════════════════════

  @Query(() => String)
  async generateOlfactoryMap(): Promise<string> {
    const ingredients = await this.perfumeService.getAllIngredients();
    const map = this.olfactoryMapService.generateOlfactoryMap(ingredients);
    return JSON.stringify(map, null, 2);
  }

  @Query(() => String)
  async findSimilarIngredients(
    @Args('ingredientName') ingredientName: string,
    @Args('limit', { defaultValue: 10 }) limit?: number,
  ): Promise<string> {
    const ingredients = await this.perfumeService.getAllIngredients();
    const targetIngredient = ingredients.find(i =>
      i.name.toLowerCase().includes(ingredientName.toLowerCase())
    );

    if (!targetIngredient) {
      return JSON.stringify({ error: 'Ingredient not found' }, null, 2);
    }

    const similar = this.olfactoryMapService.findSimilarIngredients(
      targetIngredient,
      ingredients,
      limit,
    );

    return JSON.stringify(similar, null, 2);
  }

  @Query(() => String)
  async findOppositeIngredients(
    @Args('ingredientName') ingredientName: string,
    @Args('limit', { defaultValue: 10 }) limit?: number,
  ): Promise<string> {
    const ingredients = await this.perfumeService.getAllIngredients();
    const targetIngredient = ingredients.find(i =>
      i.name.toLowerCase().includes(ingredientName.toLowerCase())
    );

    if (!targetIngredient) {
      return JSON.stringify({ error: 'Ingredient not found' }, null, 2);
    }

    const opposites = this.olfactoryMapService.findOppositeIngredients(
      targetIngredient,
      ingredients,
      limit,
    );

    return JSON.stringify(opposites, null, 2);
  }
}
