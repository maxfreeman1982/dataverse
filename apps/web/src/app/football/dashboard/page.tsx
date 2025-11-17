'use client';

import { useQuery, gql } from '@apollo/client';
import { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Target,
  Users,
  BarChart3,
  Calendar,
  Award,
  Zap,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import {
  PerformanceTrendChart,
  TopPlayersChart,
  TacticalEfficiencyChart,
  MatchComparisonChart,
} from '@/components/football/charts';

const GET_ANALYTICS_DATA = gql`
  query GetAnalytics($teamId: ID, $startDate: String, $endDate: String) {
    matches(teamId: $teamId) {
      id
      date
      status
      homeScore
      awayScore
      homeTeam {
        id
        name
      }
      awayTeam {
        id
        name
      }
      statistics {
        possession { home away }
        shots { home away }
        passAccuracy { home away }
      }
      analyses {
        id
        risks {
          severity
        }
        opportunities {
          potential
        }
        patterns {
          effectiveness
        }
      }
    }
    teams {
      id
      name
    }
    players {
      id
      name
      position
      statistics {
        goals
        assists
        matchesPlayed
        minutesPlayed
        passAccuracy
      }
      currentFitness
    }
  }
`;

export default function AnalyticsDashboard() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'season'>('month');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  const { data, loading, error } = useQuery(GET_ANALYTICS_DATA, {
    variables: {
      teamId: selectedTeam,
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  const matches = data?.matches || [];
  const teams = data?.teams || [];
  const players = data?.players || [];

  // Calculate KPIs
  const totalMatches = matches.filter((m: any) => m.status === 'finished').length;
  const wins = matches.filter((m: any) => {
    if (m.status !== 'finished' || !selectedTeam) return false;
    const isHome = m.homeTeam.id === selectedTeam;
    return isHome ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
  }).length;
  const draws = matches.filter((m: any) => {
    if (m.status !== 'finished') return false;
    return m.homeScore === m.awayScore;
  }).length;
  const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

  // Calculate average possession
  const avgPossession = matches.reduce((acc: number, match: any) => {
    if (!match.statistics?.possession) return acc;
    const isHome = selectedTeam ? match.homeTeam.id === selectedTeam : true;
    const possession = isHome ? match.statistics.possession.home : match.statistics.possession.away;
    return acc + (possession || 0);
  }, 0) / (totalMatches || 1);

  // Top scorers
  const topScorers = [...players]
    .filter((p: any) => p.statistics?.goals > 0)
    .sort((a: any, b: any) => (b.statistics?.goals || 0) - (a.statistics?.goals || 0))
    .slice(0, 5);

  // Recent form (last 5 matches)
  const recentMatches = [...matches]
    .filter((m: any) => m.status === 'finished')
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Mobile/Tablet optimized container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            📊 Analytics Dashboard
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Vue d'ensemble des performances et statistiques avancées
          </p>
        </div>

        {/* Filters - Tablet optimized */}
        <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-700 mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Équipe
              </label>
              <select
                value={selectedTeam || ''}
                onChange={(e) => setSelectedTeam(e.target.value || null)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm sm:text-base"
              >
                <option value="">Toutes les équipes</option>
                {teams.map((team: any) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Période
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDateRange('week')}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                    dateRange === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setDateRange('month')}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                    dateRange === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Mois
                </button>
                <button
                  onClick={() => setDateRange('season')}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                    dateRange === 'season'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Saison
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs Grid - Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <KPICard
            icon={<Trophy className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Taux de victoire"
            value={`${winRate.toFixed(1)}%`}
            trend={winRate > 50 ? '+12%' : '-5%'}
            trendUp={winRate > 50}
            color="emerald"
          />
          <KPICard
            icon={<Target className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Matchs joués"
            value={totalMatches.toString()}
            subtitle={`${wins}V ${draws}N`}
            color="blue"
          />
          <KPICard
            icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Possession moy."
            value={`${avgPossession.toFixed(1)}%`}
            trend={avgPossession > 50 ? '+3%' : '-2%'}
            trendUp={avgPossession > 50}
            color="purple"
          />
          <KPICard
            icon={<Zap className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Analyses IA"
            value={matches.reduce((acc: number, m: any) => acc + (m.analyses?.length || 0), 0).toString()}
            color="orange"
          />
        </div>

        {/* Charts Grid - Tablet responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Performance Trend */}
          <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-700">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              Tendance de Performance
            </h3>
            <PerformanceTrendChart matches={recentMatches} selectedTeam={selectedTeam} />
          </div>

          {/* Tactical Efficiency */}
          <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-700">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
              Efficacité Tactique
            </h3>
            <TacticalEfficiencyChart matches={matches} selectedTeam={selectedTeam} />
          </div>
        </div>

        {/* Top Players and Recent Matches - Stacked on tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Top Players */}
          <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-700">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              Top Joueurs
            </h3>
            <TopPlayersChart players={topScorers} />
          </div>

          {/* Recent Form */}
          <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-700">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              Forme Récente
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {recentMatches.length > 0 ? (
                recentMatches.map((match: any, index: number) => (
                  <MatchResultCard key={match.id} match={match} selectedTeam={selectedTeam} index={index} />
                ))
              ) : (
                <p className="text-slate-400 text-center py-8 text-sm sm:text-base">Aucun match terminé</p>
              )}
            </div>
          </div>
        </div>

        {/* Match Comparison */}
        <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-700">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
            Comparaison Multi-Matchs
          </h3>
          <MatchComparisonChart matches={matches.slice(0, 10)} selectedTeam={selectedTeam} />
        </div>
      </div>
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  subtitle,
  trend,
  trendUp,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 lg:p-6 border border-slate-700">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-3 sm:mb-4`}>
        {icon}
      </div>
      <p className="text-slate-400 text-xs sm:text-sm mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{value}</p>
        {trend && (
          <span className={`text-xs sm:text-sm font-semibold ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-slate-500 text-xs sm:text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

function MatchResultCard({ match, selectedTeam, index }: { match: any; selectedTeam: string | null; index: number }) {
  const isHome = selectedTeam ? match.homeTeam.id === selectedTeam : true;
  const won = isHome ? match.homeScore > match.awayScore : match.awayScore > match.homeScore;
  const draw = match.homeScore === match.awayScore;

  return (
    <Link href={`/football/matches/${match.id}`}>
      <div className="bg-slate-900/50 rounded-lg p-3 sm:p-4 border border-slate-700 hover:border-blue-500 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-slate-400 mb-1 truncate">
              {new Date(match.date).toLocaleDateString('fr-FR')}
            </p>
            <p className="font-semibold text-sm sm:text-base truncate">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 ml-2">
            <span className="text-lg sm:text-xl font-bold">
              {match.homeScore} - {match.awayScore}
            </span>
            <div
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                won ? 'bg-emerald-600' : draw ? 'bg-slate-600' : 'bg-red-600'
              }`}
            >
              {won ? 'V' : draw ? 'N' : 'D'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}
