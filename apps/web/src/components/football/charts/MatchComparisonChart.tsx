'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MatchComparisonChartProps {
  matches: any[];
  selectedTeam: string | null;
}

export function MatchComparisonChart({ matches, selectedTeam }: MatchComparisonChartProps) {
  const finishedMatches = matches.filter((m: any) => m.status === 'finished').slice(0, 10);

  if (finishedMatches.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 sm:h-80 text-slate-400 text-sm">
        Aucun match terminé pour la comparaison
      </div>
    );
  }

  const data = finishedMatches.map((match, index) => {
    const isHome = selectedTeam ? match.homeTeam.id === selectedTeam : true;
    const opponent = isHome ? match.awayTeam.name : match.homeTeam.name;
    const shortOpponent = opponent.length > 10 ? opponent.substring(0, 8) + '...' : opponent;

    return {
      name: shortOpponent,
      possession: match.statistics?.possession
        ? (isHome ? match.statistics.possession.home : match.statistics.possession.away)
        : 50,
      shots: match.statistics?.shots
        ? (isHome ? match.statistics.shots.home : match.statistics.shots.away)
        : 0,
      passAccuracy: match.statistics?.passAccuracy
        ? (isHome ? match.statistics.passAccuracy.home : match.statistics.passAccuracy.away)
        : 0,
    };
  });

  return (
    <div className="w-full h-64 sm:h-80 lg:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            angle={-45}
            textAnchor="end"
            height={80}
            style={{ fontSize: '10px' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '11px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="rect"
          />
          <Bar dataKey="possession" fill="#3b82f6" name="Possession %" radius={[4, 4, 0, 0]} />
          <Bar dataKey="shots" fill="#10b981" name="Tirs" radius={[4, 4, 0, 0]} />
          <Bar dataKey="passAccuracy" fill="#a78bfa" name="Précision %" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
