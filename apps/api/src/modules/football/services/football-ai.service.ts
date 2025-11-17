import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIService } from '../../ai/ai.service';
import { Match, TacticalAnalysis, MatchReport } from '../entities';
import { AnalysisPhase, AnalysisFocus } from '../dto';

/**
 * FootMind Engine - Master Prompt
 * AI service for advanced football analysis combining tactical expertise,
 * data science, prediction, and multi-sport innovation
 */
@Injectable()
export class FootballAiService {
  private readonly logger = new Logger(FootballAiService.name);

  private readonly MASTER_PROMPT = `
Rôle :
Tu es FootMind Engine, une IA experte en football : tactique, data, spatio-temporel, prédiction, entraînement et décision en match.
Tu analyses tracking, events, vidéo, biométrie, historique et style adverse.
Tu combines football, basket, rugby, handball, NFL pour innover tactiquement.

Objectifs généraux :
- analyser un match / adversaire
- détecter patterns offensifs et défensifs
- prédire actions futures (3–10 sec)
- anticiper risques et opportunités
- optimiser tactiques et formations
- proposer coaching en temps réel
- générer entraînements ciblés
- simuler what-if tactique
- améliorer performance physique et bio
- innover avec concepts multi-sports

Format attendu :
1. Executive Summary
2. Analyse Tactique Profonde
3. Patterns Détectés (offense / défense / transition)
4. Analyse Spatio-Temporelle
5. Modèle de Prédiction (3–10 sec + séquences probables)
6. Profil Adversaire & Faiblesses Exploitables
7. Risques & Zones de Danger
8. Recommandations Coaching Live
9. Substitutions Intelligentes
10. Plan d'Entraînement Généré Automatiquement
11. Propositions Phases Arrêtées
12. Innovation CrossSport (basket / handball / rugby / NFL)
13. Rapport Synthétique pour Staff

Contraintes :
- analytique, rigoureux, chiffré
- expliquer causes et conséquences
- proposer plusieurs options tactiques
- s'adapter aux données manquantes
- être cohérent football + data science
`;

  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(TacticalAnalysis)
    private analysisRepository: Repository<TacticalAnalysis>,
    @InjectRepository(MatchReport)
    private reportRepository: Repository<MatchReport>,
    private aiService: AIService,
  ) {}

  /**
   * Main analysis function - orchestrates the full FootMind Engine pipeline
   */
  async analyzeMatch(
    matchId: string,
    userId: string,
    options: {
      phase: AnalysisPhase;
      focus?: AnalysisFocus;
      specificInstructions?: string;
      includeTrainingRecommendations?: boolean;
      includeCrossSportInnovation?: boolean;
      includeSetPieceAnalysis?: boolean;
      generateFullReport?: boolean;
    },
  ): Promise<{
    analysis: TacticalAnalysis;
    report?: MatchReport;
  }> {
    this.logger.log(`Analyzing match ${matchId} with FootMind Engine`);

    // Load match with all related data
    const match = await this.matchRepository.findOne({
      where: { id: matchId, userId },
      relations: [
        'homeTeam',
        'awayTeam',
        'trackingData',
        'events',
        'homeTeam.players',
        'awayTeam.players',
      ],
    });

    if (!match) {
      throw new Error('Match not found');
    }

    // Prepare context for AI
    const context = this.prepareMatchContext(match);

    // Build prompt based on phase and focus
    const prompt = this.buildAnalysisPrompt(context, options);

    // Call AI service with master prompt
    // Note: Using simplified chat interface for now
    const fullPrompt = `${this.MASTER_PROMPT}\n\n${prompt}`;
    const aiResponse = await this.aiService.chat(fullPrompt, userId);

    // Parse AI response and structure data
    const parsedAnalysis = this.parseAIResponse(aiResponse.answer);

    // Create tactical analysis entity
    const analysisEntity = this.analysisRepository.create({
      matchId: match.id,
      analysisType: options.phase,
      timestamp: options.phase === AnalysisPhase.LIVE ? Date.now() / 1000 : null,
      ...parsedAnalysis.tacticalData,
    });

    const saveResult = await this.analysisRepository.save(analysisEntity);
    const savedAnalysis = Array.isArray(saveResult) ? saveResult[0] : saveResult;

    // Generate full report if requested
    let report: MatchReport | undefined;
    if (options.generateFullReport) {
      report = await this.generateMatchReport(
        match,
        savedAnalysis,
        aiResponse.answer,
        parsedAnalysis,
      );
    }

    this.logger.log(`Analysis complete for match ${matchId}`);

    return { analysis: savedAnalysis, report };
  }

  /**
   * Prepare match context for AI analysis
   */
  private prepareMatchContext(match: Match): string {
    const context = {
      match_info: {
        id: match.id,
        date: match.date,
        competition: match.competition,
        venue: match.venue,
        status: match.status,
        score: `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`,
      },
      teams: {
        home: {
          name: match.homeTeam.name,
          formation: match.homeFormation,
          tacticalStyle: match.homeTeam.tacticalStyle,
          philosophy: match.homeTeam.philosophyOfPlay,
          players: match.homeTeam.players?.length || 0,
        },
        away: {
          name: match.awayTeam.name,
          formation: match.awayFormation,
          tacticalStyle: match.awayTeam.tacticalStyle,
          philosophy: match.awayTeam.philosophyOfPlay,
          players: match.awayTeam.players?.length || 0,
        },
      },
      data_available: {
        tracking: match.trackingData?.length || 0,
        events: match.events?.length || 0,
        video: !!match.videoUrl,
        environment: !!match.environment,
      },
      environment: match.environment,
      coach_goals: match.coachGoals,
      statistics: match.statistics,
      events_summary: this.summarizeEvents(match.events),
    };

    return JSON.stringify(context, null, 2);
  }

  /**
   * Build analysis prompt based on phase and options
   */
  private buildAnalysisPrompt(
    context: string,
    options: {
      phase: AnalysisPhase;
      focus?: AnalysisFocus;
      specificInstructions?: string;
      includeTrainingRecommendations?: boolean;
      includeCrossSportInnovation?: boolean;
      includeSetPieceAnalysis?: boolean;
    },
  ): string {
    let prompt = `Analyse le match suivant avec FootMind Engine.\n\n`;
    prompt += `**Phase**: ${options.phase}\n`;
    if (options.focus) {
      prompt += `**Focus**: ${options.focus}\n`;
    }
    prompt += `\n**Données du match**:\n\`\`\`json\n${context}\n\`\`\`\n\n`;

    prompt += `Fournis une analyse complète incluant:\n`;
    prompt += `- Analyse tactique détaillée (formations, styles, patterns)\n`;
    prompt += `- Détection de patterns offensifs et défensifs\n`;
    prompt += `- Analyse spatio-temporelle (occupation, pressing, espaces)\n`;
    prompt += `- Prédictions (3-10 secondes, séquences probables)\n`;
    prompt += `- Profil adversaire et faiblesses exploitables\n`;
    prompt += `- Risques et zones de danger\n`;
    prompt += `- Recommandations coaching en temps réel\n`;

    if (options.includeTrainingRecommendations) {
      prompt += `- Plan d'entraînement basé sur les faiblesses identifiées\n`;
    }

    if (options.includeCrossSportInnovation) {
      prompt += `- Innovations tactiques inspirées du basket, handball, rugby, NFL\n`;
    }

    if (options.includeSetPieceAnalysis) {
      prompt += `- Analyse et propositions pour phases arrêtées\n`;
    }

    if (options.specificInstructions) {
      prompt += `\n**Instructions spécifiques**: ${options.specificInstructions}\n`;
    }

    prompt += `\nRéponds de manière structurée, analytique et chiffrée.`;

    return prompt;
  }

  /**
   * Parse AI response into structured data
   */
  private parseAIResponse(aiResponse: string): any {
    // This is a simplified parser - in production you'd want more robust parsing
    // potentially using structured outputs or JSON mode from the AI

    const tacticalData: any = {
      spatialAnalysis: {},
      offensiveAnalysis: {},
      defensiveAnalysis: {},
      transitionAnalysis: {},
      risks: [],
      opportunities: [],
      summary: '',
      recommendations: '',
    };

    // Extract summary (first paragraph or section)
    const summaryMatch = aiResponse.match(/(?:Executive Summary|Résumé)[:\s]+([^#\n]+(?:\n(?!#)[^\n]+)*)/i);
    if (summaryMatch) {
      tacticalData.summary = summaryMatch[1].trim();
    }

    // Extract recommendations
    const recoMatch = aiResponse.match(/(?:Recommandations|Recommendations)[:\s]+([^#\n]+(?:\n(?!#)[^\n]+)*)/i);
    if (recoMatch) {
      tacticalData.recommendations = recoMatch[1].trim();
    }

    // Extract risks
    const risksMatch = aiResponse.match(/(?:Risques|Risks)[:\s]+([^#]+?)(?=\n#|\n\n[A-Z]|$)/is);
    if (risksMatch) {
      const riskLines = risksMatch[1].match(/[-•]\s*(.+)/g) || [];
      tacticalData.risks = riskLines.map((line, index) => ({
        type: `Risk ${index + 1}`,
        severity: 50, // default
        description: line.replace(/^[-•]\s*/, '').trim(),
      }));
    }

    // Extract opportunities
    const oppsMatch = aiResponse.match(/(?:Opportunités|Opportunities)[:\s]+([^#]+?)(?=\n#|\n\n[A-Z]|$)/is);
    if (oppsMatch) {
      const oppLines = oppsMatch[1].match(/[-•]\s*(.+)/g) || [];
      tacticalData.opportunities = oppLines.map((line, index) => ({
        type: `Opportunity ${index + 1}`,
        potential: 50, // default
        description: line.replace(/^[-•]\s*/, '').trim(),
      }));
    }

    return {
      tacticalData,
      fullResponse: aiResponse,
    };
  }

  /**
   * Generate comprehensive match report
   */
  private async generateMatchReport(
    match: Match,
    analysis: TacticalAnalysis,
    aiResponse: string,
    parsedAnalysis: any,
  ): Promise<MatchReport> {
    const report = this.reportRepository.create({
      matchId: match.id,
      reportType: 'tactical-deep-dive',
      executiveSummary: parsedAnalysis.tacticalData.summary,
      tacticalAnalysisDeep: aiResponse,
      risksAndDangerZones: parsedAnalysis.tacticalData.risks,
      coachingRecommendationsLive: parsedAnalysis.tacticalData.recommendations,
      rawAIOutput: aiResponse,
      aiModelInfo: {
        modelUsed: 'OpenAI GPT-4 / Claude',
        promptVersion: '1.0',
        processingTime: 0,
        confidence: 85,
      },
    });

    return await this.reportRepository.save(report);
  }

  /**
   * Summarize events for context
   */
  private summarizeEvents(events: any[]): any {
    if (!events || events.length === 0) {
      return { total: 0 };
    }

    const summary: any = {
      total: events.length,
      byType: {},
      byTeam: { home: 0, away: 0 },
    };

    events.forEach((event) => {
      // Count by type
      summary.byType[event.type] = (summary.byType[event.type] || 0) + 1;

      // Count by team
      if (event.team) {
        summary.byTeam[event.team] = (summary.byTeam[event.team] || 0) + 1;
      }
    });

    return summary;
  }

  /**
   * Generate real-time predictions (3-10 seconds ahead)
   */
  async generateMicroPredictions(
    matchId: string,
    userId: string,
    currentTimestamp: number,
  ): Promise<any> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId, userId },
      relations: ['trackingData', 'events'],
    });

    if (!match) {
      throw new Error('Match not found');
    }

    // Get recent tracking data (last 30 seconds)
    const recentTracking = match.trackingData?.filter(
      (t) => t.timestamp >= currentTimestamp - 30 && t.timestamp <= currentTimestamp,
    );

    // Get recent events (last 60 seconds)
    const recentEvents = match.events?.filter(
      (e) => e.timestamp >= currentTimestamp - 60 && e.timestamp <= currentTimestamp,
    );

    const context = {
      currentTimestamp,
      recentTracking: recentTracking?.slice(-10), // last 10 frames
      recentEvents: recentEvents?.slice(-20), // last 20 events
    };

    const prompt = `
Analyse les données en temps réel et prédis les 3-10 prochaines secondes.

**Données**:
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`

Fournis:
1. Séquence prédite (actions probables dans les 10 prochaines secondes)
2. Risques immédiats (probabilité de perte de balle, contre-attaque adverse)
3. Opportunités (zones d'attaque, joueurs libres)
4. Recommandations tactiques urgentes

Sois précis, chiffré et rapide.
`;

    const fullPrompt = `${this.MASTER_PROMPT}\n\n${prompt}`;
    const aiResponse = await this.aiService.chat(fullPrompt, userId);

    return {
      timestamp: currentTimestamp,
      predictions: aiResponse.answer,
    };
  }
}
