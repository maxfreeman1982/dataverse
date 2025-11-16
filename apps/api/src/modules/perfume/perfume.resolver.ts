import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PerfumeService } from './services/perfume.service';
import { AIRecommendationService, RecommendationRequest } from './services/ai-recommendation.service';
import { Ingredient } from './entities/ingredient.entity';
import { OlfactiveFamily } from './entities/olfactive-family.entity';
import { Formula } from './entities/formula.entity';
import { IFRACategory } from './utils/ifra-validator';

@Resolver()
export class PerfumeResolver {
  constructor(
    private perfumeService: PerfumeService,
    private aiRecommendationService: AIRecommendationService,
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
}
