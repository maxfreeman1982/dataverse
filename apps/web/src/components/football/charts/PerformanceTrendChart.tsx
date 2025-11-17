'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PerformanceTrendChartProps {
  matches: any[];
  selectedTeam: string | null;
}

export function PerformanceTrendChart({ matches, selectedTeam }: PerformanceTrendChartProps) {
  const data = matches.map((match, index) => {
    const isHome = selectedTeam ? match.homeTeam.id === selectedTeam : true;
    const teamScore = isHome ? match.homeScore : match.awayScore;
    const opponentScore = isHome ? match.awayScore : match.homeScore;

    const result = teamScore > opponentScore ? 3 : teamScore === opponentScore ? 1 : 0;
    const possession = match.statistics?.possession
      ? (isHome ? match.statistics.possession.home : match.statistics.possession.away)
      : 50;

    return {
      name: `M${matches.length - index}`,
      date: new Date(match.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      points: result,
      possession,
      goals: teamScore || 0,
      conceded: opponentScore || 0,
    };
  }).reverse();

  return (
    <div className="w-full h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            style={{ fontSize: '11px' }}
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
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="points"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            name="Points"
          />
          <Line
            type="monotone"
            dataKey="goals"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            name="Buts"
          />
          <Line
            type="monotone"
            dataKey="possession"
            stroke="#a78bfa"
            strokeWidth={2}
            dot={{ fill: '#a78bfa', r: 4 }}
            name="Possession %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
