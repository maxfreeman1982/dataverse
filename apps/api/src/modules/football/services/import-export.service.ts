import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import csvParser from 'csv-parser';
import { stringify } from 'csv-stringify';
import { Readable } from 'stream';
import * as ExcelJS from 'exceljs';
import {
  TrackingData,
  MatchEvent,
  TacticalAnalysis,
  Match,
  Team,
  Player,
} from '../entities';

/**
 * Import/Export Service for FootMind Engine
 * Handles CSV import, JSON/Excel export
 */
@Injectable()
export class ImportExportService {
  private readonly logger = new Logger(ImportExportService.name);

  constructor(
    @InjectRepository(TrackingData)
    private trackingRepository: Repository<TrackingData>,
    @InjectRepository(MatchEvent)
    private eventRepository: Repository<MatchEvent>,
    @InjectRepository(TacticalAnalysis)
    private analysisRepository: Repository<TacticalAnalysis>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

  /**
   * Import tracking data from CSV
   * Expected format: timestamp,frame,period,ballX,ballY,ballSpeed,playerPositions(JSON)
   */
  async importTrackingDataCSV(
    matchId: string,
    csvContent: string,
    userId: string,
  ): Promise<{ imported: number; errors: string[] }> {
    this.logger.log(`Importing tracking data for match ${matchId}`);

    // Verify match ownership
    const match = await this.matchRepository.findOne({
      where: { id: matchId, userId },
    });

    if (!match) {
      throw new BadRequestException('Match not found or access denied');
    }

    const results: TrackingData[] = [];
    const errors: string[] = [];

    return new Promise((resolve) => {
      const stream = Readable.from(csvContent);

      stream
        .pipe(csvParser())
        .on('data', (row) => {
          try {
            const tracking = this.trackingRepository.create({
              matchId,
              timestamp: parseFloat(row.timestamp),
              frame: parseInt(row.frame, 10),
              period: row.period,
              ball: {
                x: parseFloat(row.ballX),
                y: parseFloat(row.ballY),
                speed: parseFloat(row.ballSpeed),
              },
              players: JSON.parse(row.playerPositions || '[]'),
            });

            results.push(tracking);
          } catch (error) {
            errors.push(`Row ${row.frame}: ${(error as Error).message}`);
          }
        })
        .on('end', async () => {
          try {
            await this.trackingRepository.save(results);
            this.logger.log(`Imported ${results.length} tracking data points`);
            resolve({ imported: results.length, errors });
          } catch (error) {
            this.logger.error('Error saving tracking data', error);
            resolve({ imported: 0, errors: [...errors, (error as Error).message] });
          }
        })
        .on('error', (error) => {
          this.logger.error('CSV parsing error', error);
          resolve({ imported: 0, errors: [...errors, error.message] });
        });
    });
  }

  /**
   * Import match events from CSV
   * Expected format: timestamp,minute,type,team,outcome,locationX,locationY
   */
  async importMatchEventsCSV(
    matchId: string,
    csvContent: string,
    userId: string,
  ): Promise<{ imported: number; errors: string[] }> {
    this.logger.log(`Importing match events for match ${matchId}`);

    const match = await this.matchRepository.findOne({
      where: { id: matchId, userId },
    });

    if (!match) {
      throw new BadRequestException('Match not found or access denied');
    }

    const results: MatchEvent[] = [];
    const errors: string[] = [];

    return new Promise((resolve) => {
      const stream = Readable.from(csvContent);

      stream
        .pipe(csvParser())
        .on('data', (row) => {
          try {
            const event = this.eventRepository.create({
              matchId,
              timestamp: parseFloat(row.timestamp),
              minute: parseInt(row.minute, 10),
              type: row.type,
              team: row.team,
              outcome: row.outcome,
              location: {
                x: parseFloat(row.locationX),
                y: parseFloat(row.locationY),
              },
              playerId: row.playerId || undefined,
            });

            results.push(event);
          } catch (error) {
            errors.push(`Row ${row.minute}: ${(error as Error).message}`);
          }
        })
        .on('end', async () => {
          try {
            await this.eventRepository.save(results);
            this.logger.log(`Imported ${results.length} match events`);
            resolve({ imported: results.length, errors });
          } catch (error) {
            this.logger.error('Error saving match events', error);
            resolve({ imported: 0, errors: [...errors, (error as Error).message] });
          }
        })
        .on('error', (error) => {
          this.logger.error('CSV parsing error', error);
          resolve({ imported: 0, errors: [...errors, error.message] });
        });
    });
  }

  /**
   * Export tactical analysis to JSON
   */
  async exportAnalysisJSON(
    analysisId: string,
    userId: string,
  ): Promise<any> {
    this.logger.log(`Exporting analysis ${analysisId} to JSON`);

    const analysis = await this.analysisRepository.findOne({
      where: { id: analysisId },
      relations: ['match', 'match.homeTeam', 'match.awayTeam', 'patterns', 'predictions'],
    });

    if (!analysis || analysis.match.userId !== userId) {
      throw new BadRequestException('Analysis not found or access denied');
    }

    return {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        application: 'FootMind Engine',
      },
      analysis: {
        id: analysis.id,
        type: analysis.analysisType,
        timestamp: analysis.timestamp,
        createdAt: analysis.createdAt,
      },
      match: {
        id: analysis.match.id,
        date: analysis.match.date,
        homeTeam: {
          id: analysis.match.homeTeam?.id,
          name: analysis.match.homeTeam?.name,
          score: analysis.match.homeScore,
        },
        awayTeam: {
          id: analysis.match.awayTeam?.id,
          name: analysis.match.awayTeam?.name,
          score: analysis.match.awayScore,
        },
        statistics: analysis.match.statistics,
      },
      tacticalAnalysis: {
        summary: analysis.summary,
        spatialAnalysis: analysis.spatialAnalysis,
        offensiveAnalysis: analysis.offensiveAnalysis,
        defensiveAnalysis: analysis.defensiveAnalysis,
        transitionAnalysis: analysis.transitionAnalysis,
        recommendations: analysis.recommendations,
        risks: analysis.risks,
        opportunities: analysis.opportunities,
      },
      patterns: analysis.patterns?.map(p => ({
        type: p.type,
        category: p.category,
        name: p.name,
        frequency: p.frequency,
        successRate: p.successRate,
        effectiveness: p.effectiveness,
        zones: p.zones,
        triggers: p.triggers,
        crossSportAnalogy: p.crossSportAnalogy,
      })),
      predictions: analysis.predictions?.map(p => ({
        type: p.predictionType,
        timeHorizon: p.timeHorizon,
        confidence: p.confidence,
        prediction: p.prediction,
        predictedOutcomes: p.predictedOutcomes,
        risks: p.risks,
      })),
    };
  }

  /**
   * Export match statistics to Excel
   */
  async exportMatchStatisticsExcel(
    matchId: string,
    userId: string,
  ): Promise<Buffer> {
    this.logger.log(`Exporting match ${matchId} statistics to Excel`);

    const match = await this.matchRepository.findOne({
      where: { id: matchId, userId },
      relations: ['homeTeam', 'awayTeam', 'analyses', 'events'],
    });

    if (!match) {
      throw new BadRequestException('Match not found or access denied');
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FootMind Engine';
    workbook.created = new Date();

    // Sheet 1: Match Info
    const infoSheet = workbook.addWorksheet('Match Info');
    infoSheet.columns = [
      { header: 'Field', key: 'field', width: 30 },
      { header: 'Value', key: 'value', width: 50 },
    ];

    infoSheet.addRows([
      { field: 'Match ID', value: match.id },
      { field: 'Date', value: match.date?.toISOString() },
      { field: 'Home Team', value: match.homeTeam?.name },
      { field: 'Away Team', value: match.awayTeam?.name },
      { field: 'Score', value: `${match.homeScore || 0} - ${match.awayScore || 0}` },
      { field: 'Competition', value: match.competition },
      { field: 'Season', value: match.season },
      { field: 'Venue', value: match.venue },
      { field: 'Status', value: match.status },
    ]);

    // Sheet 2: Statistics
    const statsSheet = workbook.addWorksheet('Statistics');
    statsSheet.columns = [
      { header: 'Statistic', key: 'stat', width: 30 },
      { header: 'Home', key: 'home', width: 15 },
      { header: 'Away', key: 'away', width: 15 },
    ];

    if (match.statistics) {
      statsSheet.addRows([
        {
          stat: 'Possession (%)',
          home: match.statistics.possession?.home,
          away: match.statistics.possession?.away,
        },
        {
          stat: 'Shots',
          home: match.statistics.shots?.home,
          away: match.statistics.shots?.away,
        },
        {
          stat: 'Shots on Target',
          home: match.statistics.shotsOnTarget?.home,
          away: match.statistics.shotsOnTarget?.away,
        },
        {
          stat: 'Passes',
          home: match.statistics.passes?.home,
          away: match.statistics.passes?.away,
        },
        {
          stat: 'Pass Accuracy (%)',
          home: match.statistics.passAccuracy?.home,
          away: match.statistics.passAccuracy?.away,
        },
        {
          stat: 'Fouls',
          home: match.statistics.fouls?.home,
          away: match.statistics.fouls?.away,
        },
        {
          stat: 'Corners',
          home: match.statistics.corners?.home,
          away: match.statistics.corners?.away,
        },
        {
          stat: 'Yellow Cards',
          home: match.statistics.yellowCards?.home,
          away: match.statistics.yellowCards?.away,
        },
        {
          stat: 'Red Cards',
          home: match.statistics.redCards?.home,
          away: match.statistics.redCards?.away,
        },
      ]);
    }

    // Sheet 3: Events
    if (match.events && match.events.length > 0) {
      const eventsSheet = workbook.addWorksheet('Events');
      eventsSheet.columns = [
        { header: 'Minute', key: 'minute', width: 10 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Team', key: 'team', width: 10 },
        { header: 'Outcome', key: 'outcome', width: 10 },
        { header: 'Location X', key: 'locationX', width: 12 },
        { header: 'Location Y', key: 'locationY', width: 12 },
      ];

      const eventRows = match.events.map(event => ({
        minute: event.minute,
        type: event.type,
        team: event.team,
        outcome: event.outcome,
        locationX: event.location?.x,
        locationY: event.location?.y,
      }));

      eventsSheet.addRows(eventRows);
    }

    // Sheet 4: Analyses Summary
    if (match.analyses && match.analyses.length > 0) {
      const analysisSheet = workbook.addWorksheet('Analyses');
      analysisSheet.columns = [
        { header: 'Analysis ID', key: 'id', width: 38 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Created At', key: 'createdAt', width: 20 },
        { header: 'Summary', key: 'summary', width: 60 },
      ];

      const analysisRows = match.analyses.map(analysis => ({
        id: analysis.id,
        type: analysis.analysisType,
        createdAt: analysis.createdAt?.toISOString(),
        summary: analysis.summary,
      }));

      analysisSheet.addRows(analysisRows);
    }

    // Style headers
    workbook.eachSheet(sheet => {
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3B82F6' },
      };
      sheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
    });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  /**
   * Export team statistics to Excel
   */
  async exportTeamStatisticsExcel(
    teamId: string,
    userId: string,
  ): Promise<Buffer> {
    this.logger.log(`Exporting team ${teamId} statistics to Excel`);

    const team = await this.teamRepository.findOne({
      where: { id: teamId, userId },
      relations: ['players'],
    });

    if (!team) {
      throw new BadRequestException('Team not found or access denied');
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FootMind Engine';

    // Sheet 1: Team Info
    const infoSheet = workbook.addWorksheet('Team Info');
    infoSheet.columns = [
      { header: 'Field', key: 'field', width: 30 },
      { header: 'Value', key: 'value', width: 50 },
    ];

    infoSheet.addRows([
      { field: 'Team ID', value: team.id },
      { field: 'Name', value: team.name },
      { field: 'Coach', value: team.coach },
      { field: 'Formation', value: team.formation },
      { field: 'Tactical Style', value: team.tacticalStyle },
      { field: 'League', value: team.league },
      { field: 'Country', value: team.country },
    ]);

    // Sheet 2: Players
    if (team.players && team.players.length > 0) {
      const playersSheet = workbook.addWorksheet('Players');
      playersSheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Position', key: 'position', width: 10 },
        { header: 'Number', key: 'number', width: 10 },
        { header: 'Age', key: 'age', width: 8 },
        { header: 'Nationality', key: 'nationality', width: 15 },
        { header: 'Matches Played', key: 'matches', width: 15 },
        { header: 'Goals', key: 'goals', width: 10 },
        { header: 'Assists', key: 'assists', width: 10 },
        { header: 'Pass Accuracy', key: 'passAccuracy', width: 15 },
      ];

      const playerRows = team.players.map(player => ({
        name: player.name,
        position: player.position,
        number: player.jerseyNumber,
        age: player.age,
        nationality: player.nationality,
        matches: player.statistics?.matchesPlayed,
        goals: player.statistics?.goals,
        assists: player.statistics?.assists,
        passAccuracy: player.statistics?.passAccuracy ? `${player.statistics.passAccuracy}%` : '',
      }));

      playersSheet.addRows(playerRows);
    }

    // Style headers
    workbook.eachSheet(sheet => {
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF10B981' },
      };
      sheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
    });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }
}
