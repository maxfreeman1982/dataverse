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
import {
  FootballService,
  FootballAiService,
  TrainingGeneratorService,
} from './services';
import { AiModule } from '../ai/ai.module';

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
    ]),
    AiModule, // Import AI module for LLM integration
  ],
  providers: [
    FootballResolver,
    FootballService,
    FootballAiService,
    TrainingGeneratorService,
  ],
  exports: [FootballService, FootballAiService, TrainingGeneratorService],
})
export class FootballModule {}
