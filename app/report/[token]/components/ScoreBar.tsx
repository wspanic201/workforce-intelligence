'use client';

import type { ProgramScores } from '../types';

interface ScoreBarProps {
  score: number; // 0-10
  label?: string;
  color?: 'purple' | 'blue' | 'teal' | 'amber' | 'green';
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

const colorMap = {
  purple: {
    bar: 'from-violet-600 to-purple-500',
    text: 'text-violet-400',
    glow: 'shadow-[0_0_12px_rgba(124,58,237,0.4)]',
  },
  blue: {
    bar: 'from-blue-600 to-blue-400',
    text: 'text-blue-400',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.4)]',
  },
  teal: {
    bar: 'from-teal-600 to-teal-400',
    text: 'text-teal-400',
    glow: 'shadow-[0_0_12px_rgba(20,184,166,0.4)]',
  },
  amber: {
    bar: 'from-amber-600 to-amber-400',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
  },
  green: {
    bar: 'from-emerald-600 to-emerald-400',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
  },
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

export function ScoreBar({
  score,
  label,
  color = 'purple',
  size = 'md',
  showNumber = true,
}: ScoreBarProps) {
  const pct = Math.min(100, Math.max(0, (score / 10) * 100));
  const { bar, text, glow } = colorMap[color];
  const barH = sizeMap[size];

  return (
    <div className="flex items-center gap-3">
      {label && (
        <span className="text-xs text-white/50 w-24 shrink-0 text-right">{label}</span>
      )}
      <div className={`flex-1 rounded-full bg-white/[0.06] ${barH} overflow-hidden`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${bar} ${glow} transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showNumber && (
        <span className={`text-sm font-bold tabular-nums w-8 text-right ${text}`}>
          {score.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Composite score circle gauge
interface ScoreGaugeProps {
  score: number;
  isBlueOcean?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreGauge({ score, isBlueOcean = false, size = 'md' }: ScoreGaugeProps) {
  const pct = Math.min(100, Math.max(0, (score / 10) * 100));
  const radius = size === 'sm' ? 20 : size === 'lg' ? 36 : 28;
  const stroke = size === 'sm' ? 3 : size === 'lg' ? 5 : 4;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;
  const svgSize = (radius + stroke + 2) * 2;

  const color = isBlueOcean
    ? { stroke: '#14b8a6', text: 'text-teal-400', shadow: 'drop-shadow(0 0 8px rgba(20,184,166,0.5))' }
    : score >= 8
    ? { stroke: '#10b981', text: 'text-emerald-400', shadow: 'drop-shadow(0 0 8px rgba(16,185,129,0.5))' }
    : score >= 6
    ? { stroke: '#7c3aed', text: 'text-violet-400', shadow: 'drop-shadow(0 0 8px rgba(124,58,237,0.5))' }
    : { stroke: '#f59e0b', text: 'text-amber-400', shadow: 'drop-shadow(0 0 8px rgba(245,158,11,0.5))' };

  const textSize =
    size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={svgSize}
        height={svgSize}
        style={{ filter: color.shadow, transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold tabular-nums ${textSize} ${color.text}`}>
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

// Score breakdown spider/bar chart
interface ScoreBreakdownProps {
  scores: ProgramScores;
  isBlueOcean?: boolean;
}

export function ScoreBreakdown({ scores, isBlueOcean = false }: ScoreBreakdownProps) {
  // Normalize to a consistent label/value set
  const dimensions = isBlueOcean
    ? [
        { label: 'Demand', value: scores.demand ?? scores.demandEvidence ?? 0, color: 'blue' as const },
        { label: 'Competition', value: scores.competition ?? scores.competitiveGap ?? 0, color: 'teal' as const },
        { label: 'Revenue', value: scores.revenue ?? scores.revenueViability ?? 0, color: 'green' as const },
        { label: 'Wages', value: scores.wages ?? scores.wageOutcomes ?? 0, color: 'amber' as const },
        { label: 'Speed', value: scores.speed ?? scores.launchSpeed ?? 0, color: 'purple' as const },
      ]
    : [
        { label: 'Demand', value: scores.demandEvidence ?? 0, color: 'blue' as const },
        { label: 'Competition', value: scores.competitiveGap ?? 0, color: 'teal' as const },
        { label: 'Revenue', value: scores.revenueViability ?? 0, color: 'green' as const },
        { label: 'Wages', value: scores.wageOutcomes ?? 0, color: 'amber' as const },
        { label: 'Speed', value: scores.launchSpeed ?? 0, color: 'purple' as const },
      ];

  return (
    <div className="space-y-2">
      {dimensions.map((dim) => (
        <ScoreBar
          key={dim.label}
          score={dim.value}
          label={dim.label}
          color={dim.color}
          size="sm"
        />
      ))}
    </div>
  );
}

// Horizontal bar for overview chart
interface OverviewBarProps {
  programName: string;
  score: number;
  category: string;
  isBlueOcean?: boolean;
  rank: number;
  onClick?: () => void;
}

const CATEGORY_STYLES: Record<string, { label: string; badge: string; bar: string }> = {
  quick_win: {
    label: 'Quick Win',
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    bar: 'from-emerald-600 to-emerald-400',
  },
  strategic_build: {
    label: 'Strategic Build',
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    bar: 'from-amber-600 to-amber-400',
  },
  emerging: {
    label: 'Emerging',
    badge: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
    bar: 'from-violet-600 to-violet-400',
  },
  blue_ocean: {
    label: 'Blue Ocean',
    badge: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
    bar: 'from-teal-600 to-teal-400',
  },
};

export function OverviewBar({
  programName,
  score,
  category,
  isBlueOcean = false,
  rank,
  onClick,
}: OverviewBarProps) {
  const key = isBlueOcean ? 'blue_ocean' : (category || 'emerging').toLowerCase().replace(' ', '_');
  const style = CATEGORY_STYLES[key] || CATEGORY_STYLES['emerging'];
  const pct = Math.min(100, Math.max(0, (score / 10) * 100));

  return (
    <button
      onClick={onClick}
      className="w-full text-left group hover:bg-white/[0.02] rounded-lg px-3 py-2.5 transition-colors duration-150 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/30 w-5 text-right shrink-0">#{rank}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
              {programName}
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${style.badge}`}>
              {style.label}
            </span>
            {isBlueOcean && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
                ◆ Hidden
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${style.bar} transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-bold tabular-nums text-white/60 w-8 text-right">
              {score.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
