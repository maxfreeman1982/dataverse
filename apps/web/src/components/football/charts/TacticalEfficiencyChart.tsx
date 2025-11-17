'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

interface TacticalEfficiencyChartProps {
  matches: any[];
  selectedTeam: string | null;
}

export function TacticalEfficiencyChart({ matches, selectedTeam }: TacticalEfficiencyChartProps) {
  // Calculate averages
  const finishedMatches = matches.filter((m: any) => m.status === 'finished');

  const avgPossession = finishedMatches.reduce((acc: number, match: any) => {
    if (!match.statistics?.possession) return acc;
    const isHome = selectedTeam ? match.homeTeam.id === selectedTeam : true;
    return acc + (isHome ? match.statistics.possession.home : match.statistics.possession.away);
  }, 0) / (finishedMatches.length || 1);

  const avgShots = finishedMatches.reduce((acc: number, match: any) => {
    if (!match.statistics?.shots) return acc;
    const isHome = selectedTeam ? match.homeTeam.id === selectedTeam : true;
    return acc + (isHome ? match.statistics.shots.home : match.statistics.shots.away);
  }, 0) / (finishedMatches.length || 1);

  const avgAccuracy = finishedMatches.reduce((acc: number, match: any) => {
    if (!match.statistics?.passAccuracy) return acc;
    const isHome = selectedTeam ? match.homeTeam.id === selectedTeam : true;
    return acc + (isHome ? match.statistics.passAccuracy.home : match.statistics.passAccuracy.away);
  }, 0) / (finishedMatches.length || 1);

  // Calculate pattern effectiveness from analyses
  const avgPatternEffectiveness = finishedMatches.reduce((acc: number, match: any) => {
    if (!match.analyses || match.analyses.length === 0) return acc;
    const latestAnalysis = match.analyses[0];
    if (!latestAnalysis.patterns) return acc;

    const avgEff = latestAnalysis.patterns.reduce((sum: number, p: any) => sum + (p.effectiveness || 0), 0) /
                   (latestAnalysis.patterns.length || 1);
    return acc + avgEff;
  }, 0) / (finishedMatches.length || 1);

  // Calculate defensive efficiency (inverse of risks)
  const avgDefensiveEff = finishedMatches.reduce((acc: number, match: any) => {
    if (!match.analyses || match.analyses.length === 0) return acc + 70; // default
    const latestAnalysis = match.analyses[0];
    if (!latestAnalysis.risks || latestAnalysis.risks.length === 0) return acc + 70;

    const avgSeverity = latestAnalysis.risks.reduce((sum: number, r: any) => sum + (r.severity || 0), 0) /
                        latestAnalysis.risks.length;
    return acc + (100 - avgSeverity); // inverse severity = efficiency
  }, 0) / (finishedMatches.length || 1);

  // Calculate offensive creativity (from opportunities)
  const avgOffensiveCreativity = finishedMatches.reduce((acc: number, match: any) => {
    if (!match.analyses || match.analyses.length === 0) return acc + 60;
    const latestAnalysis = match.analyses[0];
    if (!latestAnalysis.opportunities || latestAnalysis.opportunities.length === 0) return acc + 60;

    const avgPotential = latestAnalysis.opportunities.reduce((sum: number, o: any) => sum + (o.potential || 0), 0) /
                         latestAnalysis.opportunities.length;
    return acc + avgPotential;
  }, 0) / (finishedMatches.length || 1);

  const data = [
    {
      metric: 'Possession',
      value: avgPossession,
      fullMark: 100,
    },
    {
      metric: 'Tirs',
      value: Math.min((avgShots / 20) * 100, 100), // normalize to 100
      fullMark: 100,
    },
    {
      metric: 'Précision',
      value: avgAccuracy,
      fullMark: 100,
    },
    {
      metric: 'Patterns',
      value: avgPatternEffectiveness,
      fullMark: 100,
    },
    {
      metric: 'Défense',
      value: avgDefensiveEff,
      fullMark: 100,
    },
    {
      metric: 'Créativité',
      value: avgOffensiveCreativity,
      fullMark: 100,
    },
  ];

  return (
    <div className="w-full h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis
            dataKey="metric"
            stroke="#94a3b8"
            style={{ fontSize: '11px' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            stroke="#94a3b8"
            style={{ fontSize: '10px' }}
          />
          <Radar
            name="Performance"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
