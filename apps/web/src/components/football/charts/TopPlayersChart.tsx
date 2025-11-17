'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TopPlayersChartProps {
  players: any[];
}

const COLORS = ['#3b82f6', '#10b981', '#a78bfa', '#f59e0b', '#ef4444'];

export function TopPlayersChart({ players }: TopPlayersChartProps) {
  if (!players || players.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Aucune donnée de joueur disponible
      </div>
    );
  }

  const data = players.slice(0, 5).map((player: any) => ({
    name: player.name.split(' ').pop(), // Last name only
    goals: player.statistics?.goals || 0,
    assists: player.statistics?.assists || 0,
    total: (player.statistics?.goals || 0) + (player.statistics?.assists || 0),
  }));

  return (
    <div className="w-full h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="name"
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
          <Bar dataKey="goals" fill="#3b82f6" name="Buts" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-goals-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
          <Bar dataKey="assists" fill="#10b981" name="Passes D." radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-assists-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
