import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  Team,
  Player,
  Match,
  TrackingData,
  MatchEvent,
  TacticalAnalysis,
  TrainingPlan,
  SetPiece,
  MatchReport,
} from './entities';
import {
  CreateTeamInput,
  CreatePlayerInput,
  CreateMatchInput,
  AnalyzeMatchInput,
  GenerateTrainingInput,
} from './dto';
import { FootballService } from './services/football.service';
import { FootballAiService } from './services/football-ai.service';
import { TrainingGeneratorService } from './services/training-generator.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class FootballResolver {
  constructor(
    private footballService: FootballService,
    private footballAiService: FootballAiService,
    private trainingGenerator: TrainingGeneratorService,
  ) {}

  // ================== TEAMS ==================

  @Query(() => [Team])
  async teams(@CurrentUser() user: User): Promise<Team[]> {
    return this.footballService.getTeams(user.id);
  }

  @Query(() => Team)
  async team(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Team> {
    return this.footballService.getTeam(user.id, id);
  }

  @Mutation(() => Team)
  async createTeam(
    @CurrentUser() user: User,
    @Args('input') input: CreateTeamInput,
  ): Promise<Team> {
    return this.footballService.createTeam(user.id, input);
  }

  @Mutation(() => Team)
  async updateTeam(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CreateTeamInput,
  ): Promise<Team> {
    return this.footballService.updateTeam(user.id, id, input);
  }

  @Mutation(() => Boolean)
  async deleteTeam(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.footballService.deleteTeam(user.id, id);
  }

  // ================== PLAYERS ==================

  @Query(() => [Player])
  async players(
    @CurrentUser() user: User,
    @Args('teamId', { type: () => ID, nullable: true }) teamId?: string,
  ): Promise<Player[]> {
    return this.footballService.getPlayers(user.id, teamId);
  }

  @Query(() => Player)
  async player(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Player> {
    return this.footballService.getPlayer(user.id, id);
  }

  @Mutation(() => Player)
  async createPlayer(
    @CurrentUser() user: User,
    @Args('input') input: CreatePlayerInput,
  ): Promise<Player> {
    return this.footballService.createPlayer(user.id, input);
  }

  @Mutation(() => Player)
  async updatePlayer(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CreatePlayerInput,
  ): Promise<Player> {
    return this.footballService.updatePlayer(user.id, id, input);
  }

  @Mutation(() => Boolean)
  async deletePlayer(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.footballService.deletePlayer(user.id, id);
  }

  // ================== MATCHES ==================

  @Query(() => [Match])
  async matches(
    @CurrentUser() user: User,
    @Args('teamId', { type: () => ID, nullable: true }) teamId?: string,
  ): Promise<Match[]> {
    return this.footballService.getMatches(user.id, teamId);
  }

  @Query(() => Match)
  async match(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Match> {
    return this.footballService.getMatch(user.id, id);
  }

  @Mutation(() => Match)
  async createMatch(
    @CurrentUser() user: User,
    @Args('input') input: CreateMatchInput,
  ): Promise<Match> {
    return this.footballService.createMatch(user.id, input);
  }

  @Mutation(() => Match)
  async updateMatch(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CreateMatchInput,
  ): Promise<Match> {
    return this.footballService.updateMatch(user.id, id, input);
  }

  @Mutation(() => Boolean)
  async deleteMatch(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.footballService.deleteMatch(user.id, id);
  }

  // ================== MATCH EVENTS ==================

  @Query(() => [MatchEvent])
  async matchEvents(
    @CurrentUser() user: User,
    @Args('matchId', { type: () => ID }) matchId: string,
    @Args('eventType', { nullable: true }) eventType?: string,
  ): Promise<MatchEvent[]> {
    return this.footballService.getMatchEvents(user.id, matchId, eventType);
  }

  // ================== TRACKING DATA ==================

  @Query(() => [TrackingData])
  async trackingData(
    @CurrentUser() user: User,
    @Args('matchId', { type: () => ID }) matchId: string,
    @Args('startTime', { nullable: true }) startTime?: number,
    @Args('endTime', { nullable: true }) endTime?: number,
  ): Promise<TrackingData[]> {
    return this.footballService.getTrackingData(
      user.id,
      matchId,
      startTime,
      endTime,
    );
  }

  // ================== AI ANALYSIS ==================

  @Mutation(() => TacticalAnalysis)
  async analyzeMatch(
    @CurrentUser() user: User,
    @Args('input') input: AnalyzeMatchInput,
  ): Promise<TacticalAnalysis> {
    const result = await this.footballAiService.analyzeMatch(
      input.matchId,
      user.id,
      {
        phase: input.phase,
        focus: input.focus,
        specificInstructions: input.specificInstructions,
        includeTrainingRecommendations: input.includeTrainingRecommendations,
        includeCrossSportInnovation: input.includeCrossSportInnovation,
        includeSetPieceAnalysis: input.includeSetPieceAnalysis,
        generateFullReport: input.generateFullReport,
      },
    );

    return result.analysis;
  }

  @Query(() => [TacticalAnalysis])
  async analyses(
    @CurrentUser() user: User,
    @Args('matchId', { type: () => ID }) matchId: string,
  ): Promise<TacticalAnalysis[]> {
    return this.footballService.getAnalyses(user.id, matchId);
  }

  @Query(() => TacticalAnalysis)
  async analysis(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<TacticalAnalysis> {
    return this.footballService.getAnalysis(user.id, id);
  }

  // ================== PREDICTIONS ==================

  @Query(() => String)
  async generatePredictions(
    @CurrentUser() user: User,
    @Args('matchId', { type: () => ID }) matchId: string,
    @Args('currentTimestamp') currentTimestamp: number,
  ): Promise<string> {
    const predictions = await this.footballAiService.generateMicroPredictions(
      matchId,
      user.id,
      currentTimestamp,
    );
    return JSON.stringify(predictions);
  }

  // ================== REPORTS ==================

  @Query(() => [MatchReport])
  async matchReports(
    @CurrentUser() user: User,
    @Args('matchId', { type: () => ID }) matchId: string,
  ): Promise<MatchReport[]> {
    return this.footballService.getReports(user.id, matchId);
  }

  @Query(() => MatchReport)
  async matchReport(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MatchReport> {
    return this.footballService.getReport(user.id, id);
  }

  // ================== TRAINING PLANS ==================

  @Query(() => [TrainingPlan])
  async trainingPlans(
    @CurrentUser() user: User,
    @Args('teamId', { type: () => ID, nullable: true }) teamId?: string,
  ): Promise<TrainingPlan[]> {
    return this.footballService.getTrainingPlans(user.id, teamId);
  }

  @Query(() => TrainingPlan)
  async trainingPlan(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<TrainingPlan> {
    return this.footballService.getTrainingPlan(user.id, id);
  }

  @Mutation(() => TrainingPlan)
  async generateTraining(
    @CurrentUser() user: User,
    @Args('input') input: GenerateTrainingInput,
  ): Promise<TrainingPlan> {
    return this.trainingGenerator.generateTrainingPlan(user.id, input);
  }

  @Mutation(() => TrainingPlan)
  async completeTraining(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('feedback') feedback: string,
    @Args('actualMetrics', { type: () => String }) actualMetrics: string,
  ): Promise<TrainingPlan> {
    return this.trainingGenerator.completeTrainingPlan(
      user.id,
      id,
      feedback,
      JSON.parse(actualMetrics),
    );
  }

  // ================== SET PIECES ==================

  @Query(() => [SetPiece])
  async setPieces(
    @CurrentUser() user: User,
    @Args('teamId', { type: () => ID, nullable: true }) teamId?: string,
  ): Promise<SetPiece[]> {
    return this.footballService.getSetPieces(user.id, teamId);
  }

  @Query(() => SetPiece)
  async setPiece(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SetPiece> {
    return this.footballService.getSetPiece(user.id, id);
  }
}
