'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  ArrowLeft,
  Play,
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  Activity,
  FileText,
  Download,
  Zap,
  AlertTriangle,
  Target,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const GET_MATCH = gql`
  query GetMatch($id: ID!) {
    match(id: $id) {
      id
      date
      venue
      competition
      status
      homeScore
      awayScore
      homeFormation
      awayFormation
      homeTeam {
        id
        name
        logo
        tacticalStyle
      }
      awayTeam {
        id
        name
        logo
        tacticalStyle
      }
      environment {
        temperature
        humidity
        weather
        pitchCondition
      }
      statistics {
        possession {
          home
          away
        }
        shots {
          home
          away
        }
        shotsOnTarget {
          home
          away
        }
        passes {
          home
          away
        }
        passAccuracy {
          home
          away
        }
      }
      analyses {
        id
        analysisType
        createdAt
        summary
      }
      reports {
        id
        reportType
        createdAt
      }
      coachGoals
      notes
    }
  }
`;

const ANALYZE_MATCH_MUTATION = gql`
  mutation AnalyzeMatch($input: AnalyzeMatchInput!) {
    analyzeMatch(input: $input) {
      id
      analysisType
      summary
      recommendations
    }
  }
`;

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const { data, loading, error, refetch } = useQuery(GET_MATCH, {
    variables: { id: matchId },
  });

  const [analyzeMatch, { loading: analyzing }] = useMutation(ANALYZE_MATCH_MUTATION, {
    onCompleted: (data) => {
      refetch();
      router.push(`/football/analysis/${data.analyzeMatch.id}`);
    },
  });

  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [analysisConfig, setAnalysisConfig] = useState({
    phase: 'POST_MATCH',
    focus: 'FULL',
    includeTrainingRecommendations: true,
    includeCrossSportInnovation: true,
    includeSetPieceAnalysis: true,
    generateFullReport: true,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Chargement du match...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-white text-xl">Match non trouvé</p>
          <Link href="/football/matches" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
            ← Retour aux matchs
          </Link>
        </div>
      </div>
    );
  }

  const match = data.match;
  const hasAnalyses = match.analyses && match.analyses.length > 0;

  const handleAnalyze = () => {
    analyzeMatch({
      variables: {
        input: {
          matchId,
          ...analysisConfig,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Link
          href="/football/matches"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux matchs
        </Link>

        {/* Match Header */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <StatusBadge status={match.status} />
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Calendar className="w-4 h-4" />
                {new Date(match.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              {match.venue && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  {match.venue}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAnalyzeModal(true)}
              disabled={analyzing}
              className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Analyser avec IA
                </>
              )}
            </button>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-3 gap-8 items-center">
            {/* Home Team */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">{match.homeTeam.name}</h2>
              <p className="text-slate-400 mb-4">{match.homeFormation}</p>
              <p className="text-sm text-slate-500">{match.homeTeam.tacticalStyle}</p>
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="text-6xl font-bold">
                {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
              </div>
              {match.competition && (
                <p className="text-slate-400 mt-4">{match.competition}</p>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">{match.awayTeam.name}</h2>
              <p className="text-slate-400 mb-4">{match.awayFormation}</p>
              <p className="text-sm text-slate-500">{match.awayTeam.tacticalStyle}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {match.statistics && (
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Statistiques du Match
            </h3>
            <div className="space-y-6">
              <StatBar
                label="Possession"
                homeValue={match.statistics.possession?.home}
                awayValue={match.statistics.possession?.away}
                unit="%"
              />
              <StatBar
                label="Tirs"
                homeValue={match.statistics.shots?.home}
                awayValue={match.statistics.shots?.away}
              />
              <StatBar
                label="Tirs cadrés"
                homeValue={match.statistics.shotsOnTarget?.home}
                awayValue={match.statistics.shotsOnTarget?.away}
              />
              <StatBar
                label="Passes"
                homeValue={match.statistics.passes?.home}
                awayValue={match.statistics.passes?.away}
              />
              <StatBar
                label="Précision passes"
                homeValue={match.statistics.passAccuracy?.home}
                awayValue={match.statistics.passAccuracy?.away}
                unit="%"
              />
            </div>
          </div>
        )}

        {/* Environment */}
        {match.environment && (
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
            <h3 className="text-2xl font-bold mb-6">Conditions Environnementales</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {match.environment.temperature && (
                <EnvCard label="Température" value={`${match.environment.temperature}°C`} />
              )}
              {match.environment.humidity && (
                <EnvCard label="Humidité" value={`${match.environment.humidity}%`} />
              )}
              {match.environment.weather && (
                <EnvCard label="Météo" value={match.environment.weather} />
              )}
              {match.environment.pitchCondition && (
                <EnvCard label="État terrain" value={match.environment.pitchCondition} />
              )}
            </div>
          </div>
        )}

        {/* Analyses */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Analyses IA ({match.analyses?.length || 0})
            </h3>
          </div>

          {hasAnalyses ? (
            <div className="space-y-4">
              {match.analyses.map((analysis: any) => (
                <Link
                  key={analysis.id}
                  href={`/football/analysis/${analysis.id}`}
                  className="block bg-slate-900/50 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-semibold">
                          {analysis.analysisType}
                        </span>
                        <span className="text-sm text-slate-400">
                          {new Date(analysis.createdAt).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      {analysis.summary && (
                        <p className="text-slate-300 line-clamp-2">{analysis.summary}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 mb-4">Aucune analyse pour ce match</p>
              <button
                onClick={() => setShowAnalyzeModal(true)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Lancer une analyse IA
              </button>
            </div>
          )}
        </div>

        {/* Reports */}
        {match.reports && match.reports.length > 0 && (
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Rapports ({match.reports.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {match.reports.map((report: any) => (
                <div
                  key={report.id}
                  className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{report.reportType}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Analyze Modal */}
      {showAnalyzeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-slate-700">
            <h2 className="text-2xl font-bold mb-6">Analyser le Match avec IA</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Phase d'analyse</label>
                <select
                  value={analysisConfig.phase}
                  onChange={(e) => setAnalysisConfig({ ...analysisConfig, phase: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2"
                >
                  <option value="PRE_MATCH">Pré-Match (Préparation)</option>
                  <option value="LIVE">Live (En direct)</option>
                  <option value="POST_MATCH">Post-Match (Analyse complète)</option>
                  <option value="TRAINING">Training (Pour entraînement)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Focus</label>
                <select
                  value={analysisConfig.focus}
                  onChange={(e) => setAnalysisConfig({ ...analysisConfig, focus: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2"
                >
                  <option value="FULL">Complet (Tous les aspects)</option>
                  <option value="TACTICAL">Tactique</option>
                  <option value="PHYSICAL">Physique</option>
                  <option value="TECHNICAL">Technique</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analysisConfig.includeTrainingRecommendations}
                    onChange={(e) =>
                      setAnalysisConfig({
                        ...analysisConfig,
                        includeTrainingRecommendations: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                  <span>Recommandations d'entraînement</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analysisConfig.includeCrossSportInnovation}
                    onChange={(e) =>
                      setAnalysisConfig({
                        ...analysisConfig,
                        includeCrossSportInnovation: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                  <span>Innovations cross-sport (Basket, Rugby, NFL)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analysisConfig.includeSetPieceAnalysis}
                    onChange={(e) =>
                      setAnalysisConfig({
                        ...analysisConfig,
                        includeSetPieceAnalysis: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                  <span>Analyse phases arrêtées</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analysisConfig.generateFullReport}
                    onChange={(e) =>
                      setAnalysisConfig({
                        ...analysisConfig,
                        generateFullReport: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                  <span>Générer rapport complet</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAnalyzeModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Lancer l'analyse
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    scheduled: 'bg-blue-600/20 text-blue-400',
    live: 'bg-red-600/20 text-red-400 animate-pulse',
    'half-time': 'bg-orange-600/20 text-orange-400',
    finished: 'bg-slate-600/20 text-slate-400',
  };

  return (
    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${colors[status] || colors.finished}`}>
      {status}
    </span>
  );
}

function StatBar({
  label,
  homeValue,
  awayValue,
  unit = '',
}: {
  label: string;
  homeValue?: number;
  awayValue?: number;
  unit?: string;
}) {
  if (homeValue === undefined || awayValue === undefined) return null;

  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">
          {homeValue}
          {unit}
        </span>
        <span className="text-slate-400">{label}</span>
        <span className="text-sm font-semibold">
          {awayValue}
          {unit}
        </span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-slate-700">
        <div
          className="bg-blue-500"
          style={{ width: `${homePercent}%` }}
        />
        <div
          className="bg-emerald-500"
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  );
}

function EnvCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
