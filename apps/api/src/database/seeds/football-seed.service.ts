import { Injectable, Logger } from '@nestjs/common';
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
} from '../../modules/football/entities';
import { User } from '../../modules/users/user.entity';

@Injectable()
export class FootballSeedService {
  private readonly logger = new Logger(FootballSeedService.name);

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
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed(userId?: string) {
    this.logger.log('🌱 Starting FootMind Engine seeding...');

    // Get or create demo user
    let user: User;
    if (userId) {
      user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }
    } else {
      user = await this.userRepository.findOne({ where: { email: 'demo@footmind.com' } });
      if (!user) {
        this.logger.log('Creating demo user...');
        user = this.userRepository.create({
          email: 'demo@footmind.com',
          username: 'demo-user',
          password: 'hashed_password', // Should be properly hashed in production
        });
        await this.userRepository.save(user);
      }
    }

    this.logger.log(`Using user: ${user.email}`);

    // Clear existing data (optional - comment out to keep existing data)
    // await this.clearData(user.id);

    // Seed teams
    const teams = await this.seedTeams(user.id);
    this.logger.log(`✅ Created ${teams.length} teams`);

    // Seed players
    const players = await this.seedPlayers(user.id, teams);
    this.logger.log(`✅ Created ${players.length} players`);

    // Seed matches
    const matches = await this.seedMatches(user.id, teams);
    this.logger.log(`✅ Created ${matches.length} matches`);

    // Seed match events
    const events = await this.seedMatchEvents(matches);
    this.logger.log(`✅ Created ${events.length} match events`);

    // Seed tracking data (sample)
    const trackingData = await this.seedTrackingData(matches.slice(0, 2));
    this.logger.log(`✅ Created ${trackingData.length} tracking data points`);

    // Seed tactical analyses
    const analyses = await this.seedAnalyses(matches);
    this.logger.log(`✅ Created ${analyses.length} tactical analyses`);

    // Seed patterns
    const patterns = await this.seedPatterns(analyses);
    this.logger.log(`✅ Created ${patterns.length} patterns`);

    // Seed predictions
    const predictions = await this.seedPredictions(analyses);
    this.logger.log(`✅ Created ${predictions.length} predictions`);

    // Seed training plans
    const trainingPlans = await this.seedTrainingPlans(user.id, teams);
    this.logger.log(`✅ Created ${trainingPlans.length} training plans`);

    // Seed set pieces
    const setPieces = await this.seedSetPieces(user.id, teams);
    this.logger.log(`✅ Created ${setPieces.length} set pieces`);

    // Seed match reports
    const reports = await this.seedMatchReports(matches, analyses);
    this.logger.log(`✅ Created ${reports.length} match reports`);

    this.logger.log('🎉 FootMind Engine seeding completed!');

    return {
      teams: teams.length,
      players: players.length,
      matches: matches.length,
      events: events.length,
      trackingData: trackingData.length,
      analyses: analyses.length,
      patterns: patterns.length,
      predictions: predictions.length,
      trainingPlans: trainingPlans.length,
      setPieces: setPieces.length,
      reports: reports.length,
    };
  }

  private async seedTeams(userId: string): Promise<Team[]> {
    const teamsData = [
      {
        name: 'FC Barcelona',
        logo: '🔵🔴',
        stadium: 'Camp Nou',
        coach: 'Xavi Hernández',
        formation: '4-3-3',
        tacticalStyle: 'possession',
        philosophyOfPlay: {
          buildupStyle: 'short-passing',
          defensiveApproach: 'high-press',
          pressingIntensity: 85,
          possessionTarget: 65,
        },
        colors: { primary: '#004D98', secondary: '#A50044' },
        country: 'Spain',
        league: 'La Liga',
        statistics: { wins: 18, draws: 5, losses: 3, goalsScored: 54, goalsConceded: 22 },
      },
      {
        name: 'Real Madrid',
        logo: '⚪👑',
        stadium: 'Santiago Bernabéu',
        coach: 'Carlo Ancelotti',
        formation: '4-3-3',
        tacticalStyle: 'counter-attack',
        philosophyOfPlay: {
          buildupStyle: 'direct',
          defensiveApproach: 'mid-block',
          pressingIntensity: 70,
          possessionTarget: 55,
        },
        colors: { primary: '#FFFFFF', secondary: '#00529F' },
        country: 'Spain',
        league: 'La Liga',
        statistics: { wins: 20, draws: 4, losses: 2, goalsScored: 58, goalsConceded: 18 },
      },
      {
        name: 'Manchester City',
        logo: '💙🦅',
        stadium: 'Etihad Stadium',
        coach: 'Pep Guardiola',
        formation: '4-2-3-1',
        tacticalStyle: 'possession',
        philosophyOfPlay: {
          buildupStyle: 'short-passing',
          defensiveApproach: 'high-press',
          pressingIntensity: 90,
          possessionTarget: 70,
        },
        colors: { primary: '#6CABDD', secondary: '#1C2C5B' },
        country: 'England',
        league: 'Premier League',
        statistics: { wins: 22, draws: 3, losses: 1, goalsScored: 68, goalsConceded: 15 },
      },
      {
        name: 'Bayern München',
        logo: '🔴⚪',
        stadium: 'Allianz Arena',
        coach: 'Thomas Tuchel',
        formation: '4-2-3-1',
        tacticalStyle: 'high-press',
        philosophyOfPlay: {
          buildupStyle: 'direct',
          defensiveApproach: 'high-press',
          pressingIntensity: 88,
          possessionTarget: 62,
        },
        colors: { primary: '#DC052D', secondary: '#0066B2' },
        country: 'Germany',
        league: 'Bundesliga',
        statistics: { wins: 21, draws: 2, losses: 3, goalsScored: 72, goalsConceded: 24 },
      },
    ];

    const teams: Team[] = [];
    for (const teamData of teamsData) {
      const team = this.teamRepository.create({
        ...teamData,
        userId,
      });
      teams.push(await this.teamRepository.save(team));
    }

    return teams;
  }

  private async seedPlayers(userId: string, teams: Team[]): Promise<Player[]> {
    const players: Player[] = [];

    // FC Barcelona players
    const barcelonaPlayers = [
      { name: 'Ter Stegen', position: 'GK', jerseyNumber: 1, rating: 87 },
      { name: 'Araujo', position: 'CB', jerseyNumber: 4, rating: 85 },
      { name: 'Koundé', position: 'CB', jerseyNumber: 23, rating: 84 },
      { name: 'Balde', position: 'LB', jerseyNumber: 28, rating: 82 },
      { name: 'Cancelo', position: 'RB', jerseyNumber: 2, rating: 86 },
      { name: 'De Jong', position: 'CM', jerseyNumber: 21, rating: 88 },
      { name: 'Gavi', position: 'CM', jerseyNumber: 6, rating: 84 },
      { name: 'Pedri', position: 'CAM', jerseyNumber: 8, rating: 87 },
      { name: 'Raphinha', position: 'RW', jerseyNumber: 11, rating: 85 },
      { name: 'Lewandowski', position: 'ST', jerseyNumber: 9, rating: 91 },
      { name: 'Gündogan', position: 'CM', jerseyNumber: 22, rating: 86 },
    ];

    for (const playerData of barcelonaPlayers) {
      players.push(await this.createPlayer(playerData, teams[0].id));
    }

    // Real Madrid players
    const madridPlayers = [
      { name: 'Courtois', position: 'GK', jerseyNumber: 1, rating: 89 },
      { name: 'Militão', position: 'CB', jerseyNumber: 3, rating: 86 },
      { name: 'Rüdiger', position: 'CB', jerseyNumber: 22, rating: 87 },
      { name: 'Mendy', position: 'LB', jerseyNumber: 23, rating: 84 },
      { name: 'Carvajal', position: 'RB', jerseyNumber: 2, rating: 85 },
      { name: 'Modrić', position: 'CM', jerseyNumber: 10, rating: 88 },
      { name: 'Kroos', position: 'CM', jerseyNumber: 8, rating: 88 },
      { name: 'Valverde', position: 'CM', jerseyNumber: 15, rating: 87 },
      { name: 'Vinicius Jr', position: 'LW', jerseyNumber: 7, rating: 89 },
      { name: 'Benzema', position: 'ST', jerseyNumber: 9, rating: 91 },
      { name: 'Rodrygo', position: 'RW', jerseyNumber: 11, rating: 85 },
    ];

    for (const playerData of madridPlayers) {
      players.push(await this.createPlayer(playerData, teams[1].id));
    }

    // Manchester City players (subset)
    const cityPlayers = [
      { name: 'Ederson', position: 'GK', jerseyNumber: 31, rating: 89 },
      { name: 'Dias', position: 'CB', jerseyNumber: 3, rating: 88 },
      { name: 'Stones', position: 'CB', jerseyNumber: 5, rating: 85 },
      { name: 'De Bruyne', position: 'CAM', jerseyNumber: 17, rating: 91 },
      { name: 'Haaland', position: 'ST', jerseyNumber: 9, rating: 91 },
      { name: 'Foden', position: 'LW', jerseyNumber: 47, rating: 85 },
    ];

    for (const playerData of cityPlayers) {
      players.push(await this.createPlayer(playerData, teams[2].id));
    }

    // Bayern players (subset)
    const bayernPlayers = [
      { name: 'Neuer', position: 'GK', jerseyNumber: 1, rating: 88 },
      { name: 'De Ligt', position: 'CB', jerseyNumber: 4, rating: 86 },
      { name: 'Kimmich', position: 'CDM', jerseyNumber: 6, rating: 89 },
      { name: 'Musiala', position: 'CAM', jerseyNumber: 42, rating: 85 },
      { name: 'Kane', position: 'ST', jerseyNumber: 9, rating: 90 },
      { name: 'Sané', position: 'RW', jerseyNumber: 10, rating: 86 },
    ];

    for (const playerData of bayernPlayers) {
      players.push(await this.createPlayer(playerData, teams[3].id));
    }

    return players;
  }

  private async createPlayer(data: any, teamId: string): Promise<Player> {
    const player = this.playerRepository.create({
      name: data.name,
      position: data.position,
      jerseyNumber: data.jerseyNumber,
      teamId,
      age: 20 + Math.floor(Math.random() * 15),
      height: 170 + Math.floor(Math.random() * 25),
      weight: 65 + Math.floor(Math.random() * 25),
      preferredFoot: Math.random() > 0.7 ? 'Left' : 'Right',
      nationality: 'Spain',
      currentFitness: 85 + Math.floor(Math.random() * 15),
      fatigue: Math.floor(Math.random() * 30),
      attributes: {
        pace: data.rating - 5 + Math.floor(Math.random() * 10),
        shooting: data.rating - 5 + Math.floor(Math.random() * 10),
        passing: data.rating - 5 + Math.floor(Math.random() * 10),
        dribbling: data.rating - 5 + Math.floor(Math.random() * 10),
        defending: data.position.includes('B') || data.position === 'GK' ? data.rating : data.rating - 15,
        physical: data.rating - 5 + Math.floor(Math.random() * 10),
      },
      statistics: {
        matchesPlayed: 15 + Math.floor(Math.random() * 20),
        minutesPlayed: 1200 + Math.floor(Math.random() * 800),
        goals: data.position === 'ST' ? 8 + Math.floor(Math.random() * 12) : Math.floor(Math.random() * 5),
        assists: ['CAM', 'CM', 'LW', 'RW'].includes(data.position) ? 3 + Math.floor(Math.random() * 8) : Math.floor(Math.random() * 3),
        yellowCards: Math.floor(Math.random() * 5),
        redCards: Math.random() > 0.9 ? 1 : 0,
        passAccuracy: 75 + Math.floor(Math.random() * 20),
      },
    });

    return await this.playerRepository.save(player);
  }

  private async seedMatches(userId: string, teams: Team[]): Promise<Match[]> {
    const matches: Match[] = [];
    const now = new Date();

    // Create 10 finished matches
    for (let i = 0; i < 10; i++) {
      const homeTeam = teams[Math.floor(Math.random() * teams.length)];
      let awayTeam = teams[Math.floor(Math.random() * teams.length)];
      while (awayTeam.id === homeTeam.id) {
        awayTeam = teams[Math.floor(Math.random() * teams.length)];
      }

      const homeScore = Math.floor(Math.random() * 4);
      const awayScore = Math.floor(Math.random() * 4);

      const match = this.matchRepository.create({
        userId,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        date: new Date(now.getTime() - (10 - i) * 7 * 24 * 60 * 60 * 1000),
        venue: homeTeam.stadium,
        competition: 'Champions League',
        season: '2023/24',
        status: 'finished',
        homeScore,
        awayScore,
        homeFormation: homeTeam.formation,
        awayFormation: awayTeam.formation,
        environment: {
          temperature: 15 + Math.floor(Math.random() * 15),
          humidity: 40 + Math.floor(Math.random() * 40),
          weather: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
          pitchCondition: 'excellent',
        },
        statistics: {
          possession: { home: 45 + Math.floor(Math.random() * 20), away: 35 + Math.floor(Math.random() * 20) },
          shots: { home: 8 + Math.floor(Math.random() * 12), away: 6 + Math.floor(Math.random() * 12) },
          shotsOnTarget: { home: 3 + Math.floor(Math.random() * 6), away: 2 + Math.floor(Math.random() * 6) },
          passes: { home: 400 + Math.floor(Math.random() * 300), away: 350 + Math.floor(Math.random() * 250) },
          passAccuracy: { home: 75 + Math.floor(Math.random() * 20), away: 70 + Math.floor(Math.random() * 20) },
        },
      });

      matches.push(await this.matchRepository.save(match));
    }

    // Create 2 upcoming matches
    for (let i = 0; i < 2; i++) {
      const homeTeam = teams[Math.floor(Math.random() * teams.length)];
      let awayTeam = teams[Math.floor(Math.random() * teams.length)];
      while (awayTeam.id === homeTeam.id) {
        awayTeam = teams[Math.floor(Math.random() * teams.length)];
      }

      const match = this.matchRepository.create({
        userId,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        date: new Date(now.getTime() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
        venue: homeTeam.stadium,
        competition: 'Champions League',
        season: '2023/24',
        status: 'scheduled',
        homeFormation: homeTeam.formation,
        awayFormation: awayTeam.formation,
      });

      matches.push(await this.matchRepository.save(match));
    }

    return matches;
  }

  private async seedMatchEvents(matches: Match[]): Promise<MatchEvent[]> {
    const events: MatchEvent[] = [];

    // Only add events to finished matches
    const finishedMatches = matches.filter((m) => m.status === 'finished');

    for (const match of finishedMatches.slice(0, 5)) {
      // Add 20-40 events per match
      const eventCount = 20 + Math.floor(Math.random() * 20);

      for (let i = 0; i < eventCount; i++) {
        const minute = Math.floor(Math.random() * 90);
        const team = Math.random() > 0.5 ? 'home' : 'away';
        const eventTypes = ['pass', 'shot', 'tackle', 'foul', 'corner', 'throw-in'];
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];

        const event = this.eventRepository.create({
          matchId: match.id,
          timestamp: minute * 60,
          minute,
          type,
          team,
          outcome: Math.random() > 0.3 ? 'success' : 'fail',
          location: {
            x: -50 + Math.random() * 100,
            y: -30 + Math.random() * 60,
          },
        });

        events.push(await this.eventRepository.save(event));
      }
    }

    return events;
  }

  private async seedTrackingData(matches: Match[]): Promise<TrackingData[]> {
    const trackingData: TrackingData[] = [];

    // Add sample tracking for first 2 matches only (can be heavy)
    for (const match of matches.slice(0, 2)) {
      // Add 100 frames (sample)
      for (let frame = 0; frame < 100; frame++) {
        const timestamp = frame * 0.1; // Every 0.1 seconds

        const tracking = this.trackingRepository.create({
          matchId: match.id,
          timestamp,
          frame,
          period: timestamp < 2700 ? 'first-half' : 'second-half',
          ball: {
            x: -50 + Math.random() * 100,
            y: -30 + Math.random() * 60,
            speed: Math.random() * 30,
          },
          players: this.generatePlayerPositions(11, 'home').concat(
            this.generatePlayerPositions(11, 'away'),
          ),
        });

        trackingData.push(await this.trackingRepository.save(tracking));
      }
    }

    return trackingData;
  }

  private generatePlayerPositions(count: number, team: string): any[] {
    const positions = [];
    for (let i = 0; i < count; i++) {
      positions.push({
        playerId: `player-${team}-${i}`,
        team,
        x: -50 + Math.random() * 100,
        y: -30 + Math.random() * 60,
        speed: Math.random() * 10,
        direction: Math.random() * 360,
      });
    }
    return positions;
  }

  private async seedAnalyses(matches: Match[]): Promise<TacticalAnalysis[]> {
    const analyses: TacticalAnalysis[] = [];

    // Add analysis to first 8 finished matches
    const finishedMatches = matches.filter((m) => m.status === 'finished').slice(0, 8);

    for (const match of finishedMatches) {
      const analysis = this.analysisRepository.create({
        matchId: match.id,
        analysisType: 'post-match',
        summary: `Analyse tactique complète du match. L'équipe domicile a montré une possession de ${match.statistics?.possession?.home}% avec un style ${match.homeFormation === '4-3-3' ? 'offensif' : 'équilibré'}. Points forts: construction de jeu, pressing. Points faibles: transitions défensives.`,
        recommendations: 'Améliorer les transitions défensives, travailler les phases arrêtées offensives, renforcer le pressing collectif dans le tiers adverse.',
        spatialAnalysis: {
          zones: [
            { zone: 'attacking-third', occupation: { home: 35, away: 25 }, effectiveness: 75 },
            { zone: 'middle-third', occupation: { home: 40, away: 45 }, effectiveness: 68 },
            { zone: 'defensive-third', occupation: { home: 25, away: 30 }, effectiveness: 82 },
          ],
          pressing: {
            intensity: { home: 75, away: 65 },
            zones: ['middle-third', 'attacking-third'],
          },
        },
        offensiveAnalysis: {
          buildUpStyle: 'short-passing',
          attackingWidth: 45,
          progressionSpeed: 'medium',
          keyPlayers: [
            { playerId: 'player-1', role: 'playmaker', impact: 85 },
            { playerId: 'player-2', role: 'finisher', impact: 78 },
          ],
        },
        defensiveAnalysis: {
          blockHeight: 'high',
          blockCompactness: 25,
          pressingIntensity: 80,
          vulnerabilities: [
            { type: 'counter-attack', severity: 65, description: 'Vulnérable aux transitions rapides' },
          ],
        },
        risks: [
          { type: 'Transition défensive', severity: 70, description: 'Problèmes de replacement après perte de balle', timeWindow: 45 },
          { type: 'Fatigue joueurs', severity: 55, description: 'Signes de fatigue en fin de match', affectedPlayers: ['player-3', 'player-4'] },
        ],
        opportunities: [
          { type: 'Pressing haut', potential: 85, description: 'Adversaire vulnérable au pressing', suggestedAction: 'Intensifier le pressing dans le tiers adverse' },
          { type: 'Couloir droit', potential: 75, description: 'Espace disponible côté droit', targetPlayers: ['player-5'] },
        ],
      });

      analyses.push(await this.analysisRepository.save(analysis));
    }

    return analyses;
  }

  private async seedPatterns(analyses: TacticalAnalysis[]): Promise<Pattern[]> {
    const patterns: Pattern[] = [];

    for (const analysis of analyses.slice(0, 5)) {
      // 2-4 patterns per analysis
      const patternCount = 2 + Math.floor(Math.random() * 3);

      for (let i = 0; i < patternCount; i++) {
        const types = ['offensive', 'defensive', 'transition'];
        const categories = ['passing-sequence', 'press-trap', 'overload', 'counter-attack'];

        const pattern = this.patternRepository.create({
          analysisId: analysis.id,
          type: types[Math.floor(Math.random() * types.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          name: `Pattern ${i + 1} - ${categories[Math.floor(Math.random() * categories.length)]}`,
          description: 'Séquence tactique récurrente identifiée par IA',
          frequency: 5 + Math.random() * 15,
          successRate: 60 + Math.random() * 35,
          effectiveness: 65 + Math.random() * 30,
          support: 5 + Math.floor(Math.random() * 15),
          zones: ['middle-third', 'attacking-third'],
          triggers: ['ball-recovery', 'opponent-press'],
          crossSportAnalogy: {
            sport: 'Basketball',
            pattern: 'Pick and Roll',
            explanation: 'Mouvement coordonné similaire au pick and roll NBA',
          },
        });

        patterns.push(await this.patternRepository.save(pattern));
      }
    }

    return patterns;
  }

  private async seedPredictions(analyses: TacticalAnalysis[]): Promise<Prediction[]> {
    const predictions: Prediction[] = [];

    for (const analysis of analyses.slice(0, 5)) {
      const predictionTypes = ['micro', 'sequence', 'outcome'];

      for (const type of predictionTypes) {
        const prediction = this.predictionRepository.create({
          analysisId: analysis.id,
          predictionType: type,
          timeHorizon: type === 'micro' ? 5 + Math.random() * 5 : 30 + Math.random() * 30,
          confidence: 70 + Math.random() * 25,
          prediction: `Prédiction ${type}: Action probable dans les prochaines secondes`,
          predictedOutcomes: [
            { outcome: 'pass', probability: 45, expectedValue: 0.65 },
            { outcome: 'shot', probability: 25, expectedValue: 0.15 },
            { outcome: 'dribble', probability: 30, expectedValue: 0.45 },
          ],
          risks: [
            { type: 'turnover', probability: 35, impact: 65, description: 'Risque de perte de balle' },
          ],
        });

        predictions.push(await this.predictionRepository.save(prediction));
      }
    }

    return predictions;
  }

  private async seedTrainingPlans(userId: string, teams: Team[]): Promise<TrainingPlan[]> {
    const plans: TrainingPlan[] = [];

    for (const team of teams.slice(0, 2)) {
      const plan = this.trainingRepository.create({
        userId,
        teamId: team.id,
        title: `Entraînement tactique - ${team.name}`,
        description: 'Plan d\'entraînement généré par IA basé sur les faiblesses identifiées',
        targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration: 90,
        focus: 'tactical',
        difficulty: 'high',
        objectives: [
          { objective: 'Améliorer transitions défensives', priority: 'high' },
          { objective: 'Travailler pressing collectif', priority: 'high' },
          { objective: 'Phases arrêtées offensives', priority: 'medium' },
        ],
        exercises: [
          {
            name: 'Rondo 4v2',
            type: 'drill',
            duration: 15,
            intensity: 'medium',
            description: 'Travail de conservation et pressing',
            coachingPoints: ['Position du corps', 'Communication', 'Timing du pressing'],
          },
          {
            name: 'Transition défensive',
            type: 'drill',
            duration: 20,
            intensity: 'high',
            description: 'Replacement défensif après perte de balle',
            coachingPoints: ['Vitesse de replacement', 'Organisation défensive', 'Communication'],
          },
        ],
        status: 'planned',
      });

      plans.push(await this.trainingRepository.save(plan));
    }

    return plans;
  }

  private async seedSetPieces(userId: string, teams: Team[]): Promise<SetPiece[]> {
    const setPieces: SetPiece[] = [];

    for (const team of teams.slice(0, 2)) {
      const setPiece = this.setPieceRepository.create({
        userId,
        teamId: team.id,
        name: 'Corner court variant A',
        type: 'corner',
        situation: 'offensive',
        description: 'Variant de corner court avec appel dans premier poteau',
        successRate: 35,
        statistics: {
          timesUsed: 12,
          goals: 4,
          shots: 8,
        },
      });

      setPieces.push(await this.setPieceRepository.save(setPiece));
    }

    return setPieces;
  }

  private async seedMatchReports(matches: Match[], analyses: TacticalAnalysis[]): Promise<MatchReport[]> {
    const reports: MatchReport[] = [];

    for (let i = 0; i < Math.min(analyses.length, 5); i++) {
      const analysis = analyses[i];
      const match = matches.find((m) => m.id === analysis.matchId);

      if (match) {
        const report = this.reportRepository.create({
          matchId: match.id,
          reportType: 'tactical-deep-dive',
          executiveSummary: analysis.summary,
          tacticalAnalysisDeep: `Rapport complet d'analyse tactique généré par FootMind Engine IA.

**Points Forts:**
- Possession maîtrisée (${match.statistics?.possession?.home}%)
- Pressing efficace dans le tiers adverse
- Construction de jeu propre depuis l'arrière

**Points Faibles:**
- Transitions défensives lentes
- Manque de créativité dans le dernier tiers
- Vulnérabilité sur contre-attaques

**Recommandations:**
${analysis.recommendations}`,
          syntheticReportForStaff: 'Victoire méritée avec domination tactique. À travailler: transitions et phases arrêtées.',
        });

        reports.push(await this.reportRepository.save(report));
      }
    }

    return reports;
  }

  private async clearData(userId: string) {
    this.logger.log('🗑️  Clearing existing data...');

    // Delete in correct order due to foreign keys
    // For complex nested relations, use query builder
    const matches = await this.matchRepository.find({ where: { userId } });
    const matchIds = matches.map(m => m.id);

    if (matchIds.length > 0) {
      // Delete reports for these matches
      await this.reportRepository.createQueryBuilder()
        .delete()
        .where('matchId IN (:...matchIds)', { matchIds })
        .execute();

      // Get analyses for deletion cascade
      const analyses = await this.analysisRepository.find({
        where: { matchId: matchIds.length > 0 ? matchIds[0] : undefined }
      });
      const analysisIds = analyses.map(a => a.id);

      if (analysisIds.length > 0) {
        await this.predictionRepository.createQueryBuilder()
          .delete()
          .where('analysisId IN (:...analysisIds)', { analysisIds })
          .execute();
        await this.patternRepository.createQueryBuilder()
          .delete()
          .where('analysisId IN (:...analysisIds)', { analysisIds })
          .execute();
      }

      await this.analysisRepository.createQueryBuilder()
        .delete()
        .where('matchId IN (:...matchIds)', { matchIds })
        .execute();
      await this.eventRepository.createQueryBuilder()
        .delete()
        .where('matchId IN (:...matchIds)', { matchIds })
        .execute();
      await this.trackingRepository.createQueryBuilder()
        .delete()
        .where('matchId IN (:...matchIds)', { matchIds })
        .execute();
    }

    await this.matchRepository.delete({ userId });
    await this.trainingRepository.delete({ userId });
    await this.setPieceRepository.delete({ userId });

    const teams = await this.teamRepository.find({ where: { userId } });
    const teamIds = teams.map(t => t.id);
    if (teamIds.length > 0) {
      await this.playerRepository.createQueryBuilder()
        .delete()
        .where('teamId IN (:...teamIds)', { teamIds })
        .execute();
    }

    await this.teamRepository.delete({ userId });
  }
}
