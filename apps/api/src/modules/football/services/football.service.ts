import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
} from '../entities';
import {
  CreateTeamInput,
  CreatePlayerInput,
  CreateMatchInput,
} from '../dto';

@Injectable()
export class FootballService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(TrackingData)
    private trackingRepository: Repository<TrackingData>,
    @InjectRepository(MatchEvent)
    private eventRepository: Repository<MatchEvent>,
    @InjectRepository(TacticalAnalysis)
    private analysisRepository: Repository<TacticalAnalysis>,
    @InjectRepository(Pattern)
    private patternRepository: Repository<Pattern>,
    @InjectRepository(Prediction)
    private predictionRepository: Repository<Prediction>,
    @InjectRepository(TrainingPlan)
    private trainingRepository: Repository<TrainingPlan>,
    @InjectRepository(SetPiece)
    private setPieceRepository: Repository<SetPiece>,
    @InjectRepository(MatchReport)
    private reportRepository: Repository<MatchReport>,
  ) {}

  // ================== TEAMS ==================

  async createTeam(userId: string, input: CreateTeamInput): Promise<Team> {
    const team = this.teamRepository.create({
      ...input,
      userId,
    });
    return await this.teamRepository.save(team);
  }

  async getTeams(userId: string): Promise<Team[]> {
    return await this.teamRepository.find({
      where: { userId },
      relations: ['players'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTeam(userId: string, teamId: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId, userId },
      relations: ['players', 'homeMatches', 'awayMatches'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async updateTeam(
    userId: string,
    teamId: string,
    input: Partial<CreateTeamInput>,
  ): Promise<Team> {
    const team = await this.getTeam(userId, teamId);
    Object.assign(team, input);
    return await this.teamRepository.save(team);
  }

  async deleteTeam(userId: string, teamId: string): Promise<boolean> {
    const team = await this.getTeam(userId, teamId);
    await this.teamRepository.remove(team);
    return true;
  }

  // ================== PLAYERS ==================

  async createPlayer(userId: string, input: CreatePlayerInput): Promise<Player> {
    // Verify team ownership if teamId provided
    if (input.teamId) {
      await this.getTeam(userId, input.teamId);
    }

    const player = this.playerRepository.create(input);
    return await this.playerRepository.save(player);
  }

  async getPlayers(userId: string, teamId?: string): Promise<Player[]> {
    const where: any = {};

    if (teamId) {
      // Verify team ownership
      await this.getTeam(userId, teamId);
      where.teamId = teamId;
    }

    return await this.playerRepository.find({
      where,
      relations: ['team'],
      order: { name: 'ASC' },
    });
  }

  async getPlayer(userId: string, playerId: string): Promise<Player> {
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
      relations: ['team'],
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    // Verify ownership through team
    if (player.teamId) {
      await this.getTeam(userId, player.teamId);
    }

    return player;
  }

  async updatePlayer(
    userId: string,
    playerId: string,
    input: Partial<CreatePlayerInput>,
  ): Promise<Player> {
    const player = await this.getPlayer(userId, playerId);
    Object.assign(player, input);
    return await this.playerRepository.save(player);
  }

  async deletePlayer(userId: string, playerId: string): Promise<boolean> {
    const player = await this.getPlayer(userId, playerId);
    await this.playerRepository.remove(player);
    return true;
  }

  // ================== MATCHES ==================

  async createMatch(userId: string, input: CreateMatchInput): Promise<Match> {
    // Verify team ownership
    await this.getTeam(userId, input.homeTeamId);
    await this.getTeam(userId, input.awayTeamId);

    const match = this.matchRepository.create({
      ...input,
      userId,
      status: 'scheduled',
    });

    return await this.matchRepository.save(match);
  }

  async getMatches(userId: string, teamId?: string): Promise<Match[]> {
    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .where('match.userId = :userId', { userId });

    if (teamId) {
      // Verify team ownership
      await this.getTeam(userId, teamId);
      queryBuilder.andWhere(
        '(match.homeTeamId = :teamId OR match.awayTeamId = :teamId)',
        { teamId },
      );
    }

    return await queryBuilder
      .orderBy('match.date', 'DESC')
      .getMany();
  }

  async getMatch(userId: string, matchId: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId, userId },
      relations: [
        'homeTeam',
        'awayTeam',
        'trackingData',
        'events',
        'analyses',
        'reports',
      ],
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return match;
  }

  async updateMatch(
    userId: string,
    matchId: string,
    input: Partial<CreateMatchInput>,
  ): Promise<Match> {
    const match = await this.getMatch(userId, matchId);
    Object.assign(match, input);
    return await this.matchRepository.save(match);
  }

  async deleteMatch(userId: string, matchId: string): Promise<boolean> {
    const match = await this.getMatch(userId, matchId);
    await this.matchRepository.remove(match);
    return true;
  }

  // ================== TRACKING DATA ==================

  async addTrackingData(
    userId: string,
    matchId: string,
    trackingData: Partial<TrackingData>[],
  ): Promise<TrackingData[]> {
    // Verify match ownership
    await this.getMatch(userId, matchId);

    const trackingEntities = trackingData.map((data) =>
      this.trackingRepository.create({
        ...data,
        matchId,
      }),
    );

    return await this.trackingRepository.save(trackingEntities);
  }

  async getTrackingData(
    userId: string,
    matchId: string,
    startTime?: number,
    endTime?: number,
  ): Promise<TrackingData[]> {
    // Verify match ownership
    await this.getMatch(userId, matchId);

    const queryBuilder = this.trackingRepository
      .createQueryBuilder('tracking')
      .where('tracking.matchId = :matchId', { matchId });

    if (startTime !== undefined) {
      queryBuilder.andWhere('tracking.timestamp >= :startTime', { startTime });
    }

    if (endTime !== undefined) {
      queryBuilder.andWhere('tracking.timestamp <= :endTime', { endTime });
    }

    return await queryBuilder
      .orderBy('tracking.timestamp', 'ASC')
      .getMany();
  }

  // ================== MATCH EVENTS ==================

  async addMatchEvent(
    userId: string,
    matchId: string,
    event: Partial<MatchEvent>,
  ): Promise<MatchEvent> {
    // Verify match ownership
    await this.getMatch(userId, matchId);

    const matchEvent = this.eventRepository.create({
      ...event,
      matchId,
    });

    return await this.eventRepository.save(matchEvent);
  }

  async getMatchEvents(
    userId: string,
    matchId: string,
    eventType?: string,
  ): Promise<MatchEvent[]> {
    // Verify match ownership
    await this.getMatch(userId, matchId);

    const where: any = { matchId };
    if (eventType) {
      where.type = eventType;
    }

    return await this.eventRepository.find({
      where,
      order: { timestamp: 'ASC' },
    });
  }

  // ================== ANALYSES ==================

  async getAnalyses(userId: string, matchId: string): Promise<TacticalAnalysis[]> {
    // Verify match ownership
    await this.getMatch(userId, matchId);

    return await this.analysisRepository.find({
      where: { matchId },
      relations: ['patterns', 'predictions'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAnalysis(userId: string, analysisId: string): Promise<TacticalAnalysis> {
    const analysis = await this.analysisRepository.findOne({
      where: { id: analysisId },
      relations: ['match', 'patterns', 'predictions'],
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    // Verify ownership through match
    await this.getMatch(userId, analysis.matchId);

    return analysis;
  }

  // ================== REPORTS ==================

  async getReports(userId: string, matchId: string): Promise<MatchReport[]> {
    // Verify match ownership
    await this.getMatch(userId, matchId);

    return await this.reportRepository.find({
      where: { matchId },
      order: { createdAt: 'DESC' },
    });
  }

  async getReport(userId: string, reportId: string): Promise<MatchReport> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: ['match'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Verify ownership through match
    await this.getMatch(userId, report.matchId);

    return report;
  }

  // ================== TRAINING PLANS ==================

  async getTrainingPlans(
    userId: string,
    teamId?: string,
  ): Promise<TrainingPlan[]> {
    const where: any = { userId };

    if (teamId) {
      // Verify team ownership
      await this.getTeam(userId, teamId);
      where.teamId = teamId;
    }

    return await this.trainingRepository.find({
      where,
      relations: ['team'],
      order: { targetDate: 'DESC' },
    });
  }

  async getTrainingPlan(userId: string, planId: string): Promise<TrainingPlan> {
    const plan = await this.trainingRepository.findOne({
      where: { id: planId, userId },
      relations: ['team'],
    });

    if (!plan) {
      throw new NotFoundException('Training plan not found');
    }

    return plan;
  }

  // ================== SET PIECES ==================

  async getSetPieces(userId: string, teamId?: string): Promise<SetPiece[]> {
    const where: any = { userId };

    if (teamId) {
      // Verify team ownership
      await this.getTeam(userId, teamId);
      where.teamId = teamId;
    }

    return await this.setPieceRepository.find({
      where,
      relations: ['team'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSetPiece(userId: string, setPieceId: string): Promise<SetPiece> {
    const setPiece = await this.setPieceRepository.findOne({
      where: { id: setPieceId, userId },
      relations: ['team'],
    });

    if (!setPiece) {
      throw new NotFoundException('Set piece not found');
    }

    return setPiece;
  }
}
