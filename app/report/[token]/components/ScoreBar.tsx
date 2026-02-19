'use client';

import type { ProgramScores } from '../types';

// ─── Score Arc Gauge (SVG) ───────────────────────────────────
export function ScoreArc({ score, size = 64 }: { score: number; size?: number }) {
  const pct = score / 10;
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const strokeDasharray = `${pct * circ * 0.75} ${circ}`;
  const color = score >= 7.5 ? '#10b981' : score >= 5.5 ? '#f59e0b' : '#f43f5e';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-theme-muted opacity-20"
        strokeDasharray={`${circ * 0.75} ${circ}`}
        strokeDashoffset={`${-circ * 0.125}`}
        strokeLinecap="round" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={`${-circ * 0.125}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease-out' }} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fontSize={size <= 48 ? 11 : 14} fontWeight="bold" fill={color}>{score.toFixed(1)}</text>
    </svg>
  );
}

// ─── Score Bar ───────────────────────────────────────────────
interface ScoreBarProps {
  score: number;
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
        <span className="text-xs text-theme-tertiary w-24 shrink-0 text-right">{label}</span>
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

// ─── Compact Score Bar (for overview grid cards) ─────────────
export function CompactScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.min(100, Math.max(0, (score / 10) * 100));
  const color = score >= 7.5 ? 'from-emerald-600 to-emerald-400' : score >= 5.5 ? 'from-amber-600 to-amber-400' : 'from-rose-600 to-rose-400';
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="text-[11px] text-theme-muted">{label}</span>
        <span className="text-[11px] font-semibold text-theme-tertiary tabular-nums">{score.toFixed(1)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Composite score circle gauge (legacy — kept for compatibility)
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
        <circle cx={svgSize / 2} cy={svgSize / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle cx={svgSize / 2} cy={svgSize / 2} r={radius} fill="none" stroke={color.stroke} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold tabular-nums ${textSize} ${color.text}`}>{score.toFixed(1)}</span>
      </div>
    </div>
  );
}

// Score breakdown bars
interface ScoreBreakdownProps {
  scores: ProgramScores;
  isBlueOcean?: boolean;
}

export function ScoreBreakdown({ scores, isBlueOcean = false }: ScoreBreakdownProps) {
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
        <ScoreBar key={dim.label} score={dim.value} label={dim.label} color={dim.color} size="sm" />
      ))}
    </div>
  );
}

// ─── Tier badge styles (shared) ──────────────────────────────
export const TIER_STYLES: Record<string, { label: string; badge: string }> = {
  quick_win: { label: 'Quick Win', badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  strategic_build: { label: 'Strategic Build', badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  emerging: { label: 'Emerging', badge: 'bg-violet-500/20 text-violet-400 border border-violet-500/30' },
  blue_ocean: { label: 'Blue Ocean', badge: 'bg-teal-500/20 text-teal-400 border border-teal-500/30' },
};
