'use client';

interface StatChartProps {
  label: string;
  homeValue: number;
  awayValue: number;
  homeLabel?: string;
  awayLabel?: string;
  unit?: string;
  type?: 'bar' | 'radial';
}

export function StatChart({
  label,
  homeValue,
  awayValue,
  homeLabel = 'Home',
  awayLabel = 'Away',
  unit = '',
  type = 'bar',
}: StatChartProps) {
  if (type === 'bar') {
    const total = homeValue + awayValue;
    const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
    const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-blue-400">
            {homeValue}
            {unit}
          </span>
          <span className="text-slate-400">{label}</span>
          <span className="font-semibold text-emerald-400">
            {awayValue}
            {unit}
          </span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-slate-700">
          <div
            className="bg-blue-500 transition-all duration-500"
            style={{ width: `${homePercent}%` }}
          />
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${awayPercent}%` }}
          />
        </div>
      </div>
    );
  }

  // Radial type
  const maxValue = Math.max(homeValue, awayValue);
  const homeHeight = maxValue > 0 ? (homeValue / maxValue) * 100 : 0;
  const awayHeight = maxValue > 0 ? (awayValue / maxValue) * 100 : 0;

  return (
    <div className="text-center">
      <p className="text-sm text-slate-400 mb-3">{label}</p>
      <div className="flex items-end justify-center gap-4 h-32">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 bg-slate-700 rounded-t-lg overflow-hidden flex flex-col justify-end" style={{ height: '100%' }}>
            <div
              className="bg-blue-500 w-full transition-all duration-500"
              style={{ height: `${homeHeight}%` }}
            />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-400">
              {homeValue}
              {unit}
            </p>
            <p className="text-xs text-slate-500">{homeLabel}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 bg-slate-700 rounded-t-lg overflow-hidden flex flex-col justify-end" style={{ height: '100%' }}>
            <div
              className="bg-emerald-500 w-full transition-all duration-500"
              style={{ height: `${awayHeight}%` }}
            />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">
              {awayValue}
              {unit}
            </p>
            <p className="text-xs text-slate-500">{awayLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
