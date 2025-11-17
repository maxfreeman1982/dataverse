'use client';

import { useParams } from 'next/navigation';
import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  Target,
  Activity,
  Zap,
  Download,
  FileText,
  Users,
  Shield,
  Repeat,
  MapPin,
  BarChart3,
  Brain,
  Dumbbell,
} from 'lucide-react';

const GET_ANALYSIS = gql`
  query GetAnalysis($id: ID!) {
    analysis(id: $id) {
      id
      analysisType
      timestamp
      phase
      summary
      recommendations
      createdAt
      match {
        id
        homeTeam {
          name
        }
        awayTeam {
          name
        }
        homeScore
        awayScore
        date
      }
      spatialAnalysis
      offensiveAnalysis
      defensiveAnalysis
      transitionAnalysis
      risks {
        type
        severity
        description
        timeWindow
        affectedPlayers
      }
      opportunities {
        type
        potential
        description
        suggestedAction
        targetPlayers
      }
      patterns {
        id
        type
        category
        name
        description
        frequency
        successRate
        effectiveness
        support
        zones
        triggers
        outcomes
        counterMeasures
        crossSportAnalogy
      }
      predictions {
        id
        predictionType
        timeHorizon
        confidence
        prediction
        predictedOutcomes {
          outcome
          probability
          expectedValue
        }
        risks {
          type
          probability
          impact
          description
        }
        opportunities {
          type
          probability
          potential
          description
          suggestedAction
        }
      }
    }
  }
`;

export default function AnalysisPage() {
  const params = useParams();
  const analysisId = params.id as string;

  const { data, loading, error } = useQuery(GET_ANALYSIS, {
    variables: { id: analysisId },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Chargement de l'analyse...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl">Analyse non trouvée</p>
          <Link href="/football/matches" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
            ← Retour aux matchs
          </Link>
        </div>
      </div>
    );
  }

  const analysis = data.analysis;
  const match = analysis.match;

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert('Export PDF en cours de développement...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href={`/football/matches/${match.id}`}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour au match
            </Link>
            <h1 className="text-4xl font-bold mb-2">Analyse FootMind Engine</h1>
            <p className="text-slate-400">
              {match.homeTeam.name} vs {match.awayTeam.name} · {analysis.analysisType}
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            Exporter PDF
          </button>
        </div>

        {/* Executive Summary */}
        <div className="bg-gradient-to-br from-blue-600/20 to-emerald-600/20 rounded-2xl p-8 border border-blue-500/30 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Résumé Exécutif</h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                {analysis.summary || 'Analyse en cours...'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <QuickStat
            icon={<Target className="w-6 h-6" />}
            label="Patterns détectés"
            value={analysis.patterns?.length || 0}
            color="blue"
          />
          <QuickStat
            icon={<Zap className="w-6 h-6" />}
            label="Prédictions"
            value={analysis.predictions?.length || 0}
            color="purple"
          />
          <QuickStat
            icon={<AlertTriangle className="w-6 h-6" />}
            label="Risques identifiés"
            value={analysis.risks?.length || 0}
            color="red"
          />
          <QuickStat
            icon={<TrendingUp className="w-6 h-6" />}
            label="Opportunités"
            value={analysis.opportunities?.length || 0}
            color="emerald"
          />
        </div>

        {/* Risks & Opportunities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Risks */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Risques & Zones de Danger
            </h3>
            {analysis.risks && analysis.risks.length > 0 ? (
              <div className="space-y-4">
                {analysis.risks.map((risk: any, index: number) => (
                  <RiskCard key={index} risk={risk} />
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">Aucun risque majeur identifié</p>
            )}
          </div>

          {/* Opportunities */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              Opportunités Tactiques
            </h3>
            {analysis.opportunities && analysis.opportunities.length > 0 ? (
              <div className="space-y-4">
                {analysis.opportunities.map((opp: any, index: number) => (
                  <OpportunityCard key={index} opportunity={opp} />
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">Aucune opportunité majeure</p>
            )}
          </div>
        </div>

        {/* Tactical Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Offensive */}
          {analysis.offensiveAnalysis && (
            <TacticalAnalysisCard
              title="Analyse Offensive"
              icon={<Target className="w-6 h-6" />}
              data={analysis.offensiveAnalysis}
              color="blue"
            />
          )}

          {/* Defensive */}
          {analysis.defensiveAnalysis && (
            <TacticalAnalysisCard
              title="Analyse Défensive"
              icon={<Shield className="w-6 h-6" />}
              data={analysis.defensiveAnalysis}
              color="red"
            />
          )}

          {/* Transition */}
          {analysis.transitionAnalysis && (
            <TacticalAnalysisCard
              title="Transitions"
              icon={<Repeat className="w-6 h-6" />}
              data={analysis.transitionAnalysis}
              color="purple"
            />
          )}
        </div>

        {/* Spatial Analysis */}
        {analysis.spatialAnalysis && (
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Analyse Spatio-Temporelle
            </h3>
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
              <pre className="text-slate-300 text-sm whitespace-pre-wrap">
                {JSON.stringify(analysis.spatialAnalysis, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Patterns Detected */}
        {analysis.patterns && analysis.patterns.length > 0 && (
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Patterns Détectés ({analysis.patterns.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.patterns.map((pattern: any) => (
                <PatternCard key={pattern.id} pattern={pattern} />
              ))}
            </div>
          </div>
        )}

        {/* Predictions */}
        {analysis.predictions && analysis.predictions.length > 0 && (
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Prédictions IA ({analysis.predictions.length})
            </h3>
            <div className="space-y-6">
              {analysis.predictions.map((prediction: any) => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))}
            </div>
          </div>
        )}

        {/* Coaching Recommendations */}
        {analysis.recommendations && (
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-8 border border-purple-500/30">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Dumbbell className="w-6 h-6" />
              Recommandations Coaching
            </h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
                {analysis.recommendations}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    emerald: 'from-emerald-500 to-emerald-600',
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function RiskCard({ risk }: { risk: any }) {
  const severityColor = (severity: number) => {
    if (severity >= 80) return 'bg-red-600/20 text-red-400 border-red-500/30';
    if (severity >= 50) return 'bg-orange-600/20 text-orange-400 border-orange-500/30';
    return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
  };

  return (
    <div className={`rounded-xl p-4 border ${severityColor(risk.severity)}`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold">{risk.type}</h4>
        <span className="text-sm font-bold">{risk.severity}%</span>
      </div>
      <p className="text-sm opacity-90 mb-2">{risk.description}</p>
      {risk.timeWindow && (
        <p className="text-xs opacity-70">Fenêtre: {risk.timeWindow}s</p>
      )}
      {risk.affectedPlayers && risk.affectedPlayers.length > 0 && (
        <p className="text-xs opacity-70 mt-1">
          Joueurs affectés: {risk.affectedPlayers.join(', ')}
        </p>
      )}
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: any }) {
  const potentialColor = (potential: number) => {
    if (potential >= 80) return 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30';
    if (potential >= 50) return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
    return 'bg-slate-600/20 text-slate-400 border-slate-500/30';
  };

  return (
    <div className={`rounded-xl p-4 border ${potentialColor(opportunity.potential)}`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold">{opportunity.type}</h4>
        <span className="text-sm font-bold">{opportunity.potential}%</span>
      </div>
      <p className="text-sm opacity-90 mb-2">{opportunity.description}</p>
      {opportunity.suggestedAction && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <p className="text-xs font-semibold mb-1">Action suggérée:</p>
          <p className="text-sm opacity-90">{opportunity.suggestedAction}</p>
        </div>
      )}
      {opportunity.targetPlayers && opportunity.targetPlayers.length > 0 && (
        <p className="text-xs opacity-70 mt-2">
          Joueurs cibles: {opportunity.targetPlayers.join(', ')}
        </p>
      )}
    </div>
  );
}

function TacticalAnalysisCard({
  title,
  icon,
  data,
  color,
}: {
  title: string;
  icon: React.ReactNode;
  data: any;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'border-blue-500/30',
    red: 'border-red-500/30',
    purple: 'border-purple-500/30',
  };

  return (
    <div className={`bg-slate-800/50 rounded-xl p-6 border ${colorClasses[color]}`}>
      <h4 className="font-bold mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <div className="space-y-3 text-sm">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <p className="text-slate-400 capitalize mb-1">
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </p>
            <p className="text-slate-200">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatternCard({ pattern }: { pattern: any }) {
  const typeColors: Record<string, string> = {
    offensive: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
    defensive: 'bg-red-600/20 text-red-400 border-red-500/30',
    transition: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
    'set-piece': 'bg-orange-600/20 text-orange-400 border-orange-500/30',
  };

  return (
    <div className={`rounded-xl p-6 border ${typeColors[pattern.type] || typeColors.offensive}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-lg mb-1">{pattern.name}</h4>
          <p className="text-xs opacity-70">
            {pattern.category} · Support: {pattern.support}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{pattern.effectiveness}%</div>
          <div className="text-xs opacity-70">Efficacité</div>
        </div>
      </div>

      <p className="text-sm opacity-90 mb-4">{pattern.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs opacity-70 mb-1">Fréquence</p>
          <div className="bg-slate-900/50 rounded px-2 py-1">
            <p className="text-sm font-semibold">{pattern.frequency}</p>
          </div>
        </div>
        <div>
          <p className="text-xs opacity-70 mb-1">Taux de réussite</p>
          <div className="bg-slate-900/50 rounded px-2 py-1">
            <p className="text-sm font-semibold">{pattern.successRate}%</p>
          </div>
        </div>
      </div>

      {pattern.zones && pattern.zones.length > 0 && (
        <div className="mb-3">
          <p className="text-xs opacity-70 mb-2">Zones:</p>
          <div className="flex flex-wrap gap-2">
            {pattern.zones.map((zone: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-slate-900/50 rounded text-xs"
              >
                {zone}
              </span>
            ))}
          </div>
        </div>
      )}

      {pattern.crossSportAnalogy && (
        <div className="mt-4 pt-4 border-t border-current/20">
          <p className="text-xs font-semibold mb-2">🏀 Analogie Cross-Sport:</p>
          <p className="text-sm opacity-90">
            <strong>{pattern.crossSportAnalogy.sport}:</strong>{' '}
            {pattern.crossSportAnalogy.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: any }) {
  return (
    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg mb-1">{prediction.predictionType}</h4>
          <p className="text-sm text-slate-400">
            Horizon: {prediction.timeHorizon}s · Confiance: {prediction.confidence}%
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-purple-400">{prediction.confidence}%</div>
        </div>
      </div>

      {prediction.prediction && (
        <p className="text-slate-300 mb-4">{prediction.prediction}</p>
      )}

      {prediction.predictedOutcomes && prediction.predictedOutcomes.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2">Résultats prédits:</p>
          <div className="space-y-2">
            {prediction.predictedOutcomes.map((outcome: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded px-3 py-2">
                <span className="text-sm">{outcome.outcome}</span>
                <span className="text-sm font-semibold text-blue-400">{outcome.probability}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
