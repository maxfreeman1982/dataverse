import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { OlfactiveFamily } from './entities/olfactive-family.entity';
import { Allergen } from './entities/allergen.entity';
import { Formula } from './entities/formula.entity';
import { FormulaIngredient } from './entities/formula-ingredient.entity';
import { PerfumeService } from './services/perfume.service';
import { AIRecommendationService } from './services/ai-recommendation.service';
import { PerfumeResolver } from './perfume.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ingredient,
      OlfactiveFamily,
      Allergen,
      Formula,
      FormulaIngredient,
    ]),
  ],
  providers: [
    PerfumeService,
    AIRecommendationService,
    PerfumeResolver,
  ],
  exports: [PerfumeService, AIRecommendationService],
})
export class PerfumeModule {}
