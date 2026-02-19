'use client';

import { useState, useId } from 'react';
import {
  ChevronDown,
  Clock,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Waves,
} from 'lucide-react';
import { ScoreArc, CompactScoreBar } from './ScoreBar';
import { EvidenceTrail } from './EvidenceTrail';
import type { ScoredOpportunity, BlueOceanOpportunity } from '../types';

const TIER_CONFIG: Record<string, { label: string; dot: string; textClass: string }> = {
  quick_win: {
    label: 'Quick Win',
    dot: 'bg-emerald-400',
    textClass: 'text-emerald-400',
  },
  strategic_build: {
    label: 'Strategic Build',
    dot: 'bg-amber-400',
    textClass: 'text-amber-400',
  },
  emerging: {
    label: 'Emerging',
    dot: 'bg-violet-400',
    textClass: 'text-violet-400',
  },
  blue_ocean: {
    label: 'Blue Ocean',
    dot: 'bg-teal-400',
    textClass: 'text-teal-400',
  },
};

const DISCOVERY_LABELS: Record<string, string> = {
  economic_development: 'Economic Development Intel',
  labor_market: 'Labor Market Analysis',
  employer_signal: 'Employer Signal',
  gap_analysis: 'Competitive Gap Analysis',
  trend_analysis: 'Trend Analysis',
  supply_chain: 'Supply Chain Analysis',
};

interface ProgramCardProps {
  program: ScoredOpportunity | BlueOceanOpportunity;
  defaultExpanded?: boolean;
  rank: number;
}

export function ProgramCard({ program, defaultExpanded = false, rank }: ProgramCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const cardId = useId();
  const isBO = 'isBlueOcean' in program && program.isBlueOcean === true;
  const blueOcean = isBO ? (program as BlueOceanOpportunity) : null;
  const conventional = !isBO ? (program as ScoredOpportunity) : null;

  const title = isBO ? blueOcean!.programTitle : conventional!.programTitle;
  const description = program.description;
  const scores = program.scores;
  const composite = scores.composite ?? (
    Object.values(scores).reduce((a, b) => a + (b as number), 0) /
    Math.max(1, Object.keys(scores).length)
  );

  const tier = isBO ? 'blue_ocean' : ((conventional?.tier || 'emerging').toLowerCase());
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG['emerging'];

  const evidence = isBO ? blueOcean!.evidence : (conventional?.demandEvidence || []);
  const validationItems = program.whatValidationWouldConfirm || [];
  const barriers = conventional?.barriers || [];

  // Score dimensions
  const demandEvidence = isBO ? (scores as any).demand ?? (scores as any).demandEvidence ?? 0 : (scores as any).demandEvidence ?? 0;
  const competitiveGap = isBO ? (scores as any).competition ?? (scores as any).competitiveGap ?? 0 : (scores as any).competitiveGap ?? 0;
  const revenueViability = isBO ? (scores as any).revenue ?? (scores as any).revenueViability ?? 0 : (scores as any).revenueViability ?? 0;
  const wageOutcomes = isBO ? (scores as any).wages ?? (scores as any).wageOutcomes ?? 0 : (scores as any).wageOutcomes ?? 0;
  const launchSpeed = isBO ? (scores as any).speed ?? (scores as any).launchSpeed ?? 0 : (scores as any).launchSpeed ?? 0;

  return (
    <div
      id={`program-${rank}`}
      className={`card-cosmic rounded-2xl overflow-hidden transition-all duration-300 ${
        isBO ? 'border-teal-500/20' : ''
      }`}
    >
      {isBO && (
        <div className="h-0.5 w-full bg-gradient-to-r from-teal-600 via-teal-400 to-cyan-400" />
      )}

      {/* Header — rank + title + tier left, arc + chevron right */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={cardId}
        className="w-full text-left p-6 flex items-center gap-4 group"
      >
        {/* Left: rank + title + tier */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-lg font-bold text-theme-muted tabular-nums shrink-0">#{rank}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-theme-primary leading-tight group-hover:text-violet-300 transition-colors truncate">
                {title}
              </h3>
              <span className={`flex items-center gap-1.5 text-[11px] font-semibold shrink-0 ${tierConfig.textClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tierConfig.dot}`} />
                {tierConfig.label}
              </span>
              {isBO && (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold shrink-0 text-teal-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500/60 shrink-0" />
                  ◆ Hidden
                </span>
              )}
            </div>
            {/* Quick stats */}
            <div className="flex flex-wrap gap-3 mt-1">
              {isBO && blueOcean?.medianWage && (
                <span className="text-xs text-theme-tertiary">💰 <span className="text-theme-secondary">{blueOcean.medianWage}</span></span>
              )}
              {!isBO && conventional?.keyMetrics?.medianHourlyWage && (
                <span className="text-xs text-theme-tertiary">💰 <span className="text-theme-secondary">{conventional.keyMetrics.medianHourlyWage}</span>/hr</span>
              )}
              {!isBO && conventional?.keyMetrics?.regionalAnnualOpenings && (
                <span className="text-xs text-theme-tertiary">📍 <span className="text-theme-secondary">{conventional.keyMetrics.regionalAnnualOpenings}</span> openings/yr</span>
              )}
              {isBO && blueOcean?.estimatedDemand && (
                <span className="text-xs text-theme-tertiary">📍 <span className="text-theme-secondary">{blueOcean.estimatedDemand}</span></span>
              )}
              {isBO && blueOcean?.discoveryMethod && (
                <span className="text-xs text-teal-400/70">🔭 {DISCOVERY_LABELS[blueOcean.discoveryMethod] || blueOcean.discoveryMethod}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: arc gauge + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <ScoreArc score={composite} size={48} />
          <ChevronDown
            className={`w-5 h-5 text-theme-muted transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expandable body */}
      <div
        id={cardId}
        className={`overflow-hidden transition-all duration-500 ease-out ${
          expanded ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 space-y-6 border-t border-theme-subtle pt-5">

          <p className="text-sm text-theme-secondary leading-relaxed">{description}</p>

          {/* Blue Ocean callouts */}
          {isBO && blueOcean && (
            <div className="space-y-3">
              {blueOcean.whyNonObvious && (
                <div className="rounded-xl bg-teal-500/[0.08] border border-teal-500/20 p-4">
                  <div className="flex items-start gap-2">
                    <Waves className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">Why This Is Non-Obvious</p>
                      <p className="text-sm text-theme-secondary leading-relaxed">{blueOcean.whyNonObvious}</p>
                    </div>
                  </div>
                </div>
              )}
              {blueOcean.whyDefensible && (
                <div className="rounded-xl bg-violet-500/[0.06] border border-violet-500/15 p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">First-Mover Advantage</p>
                      <p className="text-sm text-theme-secondary leading-relaxed">{blueOcean.whyDefensible}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Score dimensions — 2-col grid + key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-muted mb-3 flex items-center gap-2">
                <span className="inline-block w-4 h-px bg-white/20" />
                Score Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <CompactScoreBar label="Demand Evidence" score={demandEvidence} />
                <CompactScoreBar label="Competitive Gap" score={competitiveGap} />
                <CompactScoreBar label="Revenue Viability" score={revenueViability} />
                <CompactScoreBar label="Wage Outcomes" score={wageOutcomes} />
                <CompactScoreBar label="Launch Speed" score={launchSpeed} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-muted mb-3 flex items-center gap-2">
                <span className="inline-block w-4 h-px bg-white/20" />
                Key Metrics
              </h4>
              <div className="space-y-2">
                {conventional?.keyMetrics && Object.entries(conventional.keyMetrics).map(([key, val]) => {
                  if (!val) return null;
                  const labels: Record<string, string> = {
                    regionalAnnualOpenings: 'Annual Openings',
                    medianHourlyWage: 'Median Wage',
                    projectedGrowth: 'Growth Outlook',
                    activeJobPostings: 'Active Postings',
                  };
                  return (
                    <div key={key} className="flex justify-between text-xs gap-3">
                      <span className="text-theme-muted">{labels[key] || key}</span>
                      <span className="text-theme-secondary text-right">{val}</span>
                    </div>
                  );
                })}
                {isBO && blueOcean && (
                  <>
                    {blueOcean.medianWage && (
                      <div className="flex justify-between text-xs gap-3">
                        <span className="text-theme-muted">Median Wage</span>
                        <span className="text-theme-secondary">{blueOcean.medianWage}</span>
                      </div>
                    )}
                    {blueOcean.estimatedDemand && (
                      <div className="flex justify-between text-xs gap-3">
                        <span className="text-theme-muted">Demand Estimate</span>
                        <span className="text-theme-secondary">{blueOcean.estimatedDemand}</span>
                      </div>
                    )}
                    {blueOcean.competitivePosition && (
                      <div className="flex justify-between text-xs gap-3">
                        <span className="text-theme-muted">Market Position</span>
                        <span className="text-theme-secondary capitalize">{blueOcean.competitivePosition.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    {blueOcean.firstMoverAdvantage && (
                      <div className="flex justify-between text-xs gap-3">
                        <span className="text-theme-muted">First Mover</span>
                        <span className="text-theme-secondary">{blueOcean.firstMoverAdvantage}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Program structure (conventional) */}
          {conventional?.programSnapshot && (
            <div className="rounded-xl bg-white/[0.03] border border-theme-subtle p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-muted mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Program Structure
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {conventional.programSnapshot.estimatedDuration && (
                  <div>
                    <span className="text-theme-muted">Duration: </span>
                    <span className="text-theme-secondary">{conventional.programSnapshot.estimatedDuration}</span>
                  </div>
                )}
                {conventional.programSnapshot.deliveryFormat && (
                  <div>
                    <span className="text-theme-muted">Format: </span>
                    <span className="text-theme-secondary">{conventional.programSnapshot.deliveryFormat}</span>
                  </div>
                )}
                {conventional.programSnapshot.targetAudience && (
                  <div className="col-span-full">
                    <span className="text-theme-muted">Target Audience: </span>
                    <span className="text-theme-secondary">{conventional.programSnapshot.targetAudience}</span>
                  </div>
                )}
              </div>
              {conventional.programSnapshot.stackableCredentials?.length && (
                <div className="mt-3">
                  <span className="text-white/40 text-xs">Stackable: </span>
                  <span className="text-theme-muted text-xs">
                    {conventional.programSnapshot.stackableCredentials.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}

          <EvidenceTrail evidence={evidence} />

          {barriers.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-muted mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Barriers & Risks
              </h4>
              <ul className="space-y-1.5">
                {barriers.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-theme-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0 mt-1.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validationItems.length > 0 && (
            <div className="rounded-xl bg-gradient-to-br from-violet-900/20 to-blue-900/10 border border-violet-500/20 p-5">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-violet-300 mb-2">What Validation Would Confirm</h4>
                  <p className="text-xs text-theme-tertiary mb-3">
                    These are the open questions that employer validation would answer — turning this discovery into a launch decision.
                  </p>
                  <ul className="space-y-2">
                    {validationItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-theme-secondary leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-violet-400/60 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-theme-subtle">
                    <a href="/#pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                      <span>Get Employer Validation →</span>
                    </a>
                    <p className="text-xs text-theme-muted mt-1">Wavelength Validation Phase conducts deep employer outreach in your region</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
