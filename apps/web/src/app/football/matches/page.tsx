'use client';

import { useState } from 'react';
import { Plus, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Matchs & Analyses</h1>
            <p className="text-slate-400">Analysez vos matchs avec FootMind Engine IA</p>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors">
            <Plus className="w-5 h-5" />
            Nouveau Match
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <FilterButton active>Tous</FilterButton>
          <FilterButton>Programmés</FilterButton>
          <FilterButton>En cours</FilterButton>
          <FilterButton>Terminés</FilterButton>
          <FilterButton>Analysés</FilterButton>
        </div>

        {/* Empty State */}
        {matches.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl p-12 border border-slate-700 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-2xl font-bold mb-2">Aucun match</h3>
            <p className="text-slate-400 mb-6">Créez votre premier match pour commencer l'analyse</p>
            <button className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Créer un match
            </button>
          </div>
        ) : (
          /* Matches List */
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}

        {/* Analysis Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnalysisFeature
            icon={<TrendingUp className="w-8 h-8" />}
            title="Analyse Tactique"
            description="Patterns, formations, zones d'occupation, pressing"
            color="blue"
          />
          <AnalysisFeature
            icon={<Clock className="w-8 h-8" />}
            title="Prédictions Live"
            description="Anticipation 3-10 secondes, risques et opportunités"
            color="purple"
          />
          <AnalysisFeature
            icon={<CheckCircle className="w-8 h-8" />}
            title="Rapports IA"
            description="Recommandations coaching, substitutions, entraînements"
            color="emerald"
          />
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  children,
  active = false
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

function MatchCard({ match }: { match: any }) {
  return (
    <Link href={`/football/matches/${match.id}`}>
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-emerald-500 transition-all cursor-pointer group">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-slate-400">{match.date}</span>
              <StatusBadge status={match.status} />
            </div>
            <div className="flex items-center justify-between max-w-md">
              <div className="text-center flex-1">
                <p className="font-bold text-lg">{match.homeTeam}</p>
                <p className="text-sm text-slate-400">{match.homeFormation}</p>
              </div>
              <div className="text-center px-8">
                <p className="text-3xl font-bold">
                  {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
                </p>
              </div>
              <div className="text-center flex-1">
                <p className="font-bold text-lg">{match.awayTeam}</p>
                <p className="text-sm text-slate-400">{match.awayFormation}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {match.hasAnalysis && (
              <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-lg text-sm font-medium">
                Analysé
              </span>
            )}
            <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-semibold transition-colors">
              Analyser
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    scheduled: 'bg-blue-600/20 text-blue-400',
    live: 'bg-red-600/20 text-red-400',
    'half-time': 'bg-orange-600/20 text-orange-400',
    finished: 'bg-slate-600/20 text-slate-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  );
}

function AnalysisFeature({
  icon,
  title,
  description,
  color
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/30',
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/30',
    emerald: 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-xl p-6 border`}>
      <div className="mb-4 text-slate-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}
