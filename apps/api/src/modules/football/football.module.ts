import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Team,
  Player,
  Match,
  TrackingData,
  MatchEvent,
  TacticalAnalysis,
  Pattern,
  Prediction,
  TrainingPlan,
  SetPiece,
  MatchReport,
} from './entities';
import { FootballResolver } from './football.resolver';
import { FootballController } from './football.controller';
import {
  FootballService,
  FootballAiService,
  TrainingGeneratorService,
  ImportExportService,
} from './services';
import { AIModule } from '../ai/ai.module';
import { FootballSeedService } from '../../database/seeds/football-seed.service';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Team,
      Player,
      Match,
      TrackingData,
      MatchEvent,
      TacticalAnalysis,
      Pattern,
      Prediction,
      TrainingPlan,
      SetPiece,
      MatchReport,
      User,
    ]),
    AIModule, // Import AI module for LLM integration
  ],
  controllers: [FootballController],
  providers: [
    FootballResolver,
    FootballService,
    FootballAiService,
    TrainingGeneratorService,
    FootballSeedService,
    ImportExportService,
  ],
  exports: [
    FootballService,
    FootballAiService,
    TrainingGeneratorService,
    FootballSeedService,
    ImportExportService,
  ],
})
export class FootballModule {}
