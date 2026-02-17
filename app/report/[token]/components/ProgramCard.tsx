'use client';

import { useState, useId } from 'react';
import {
  ChevronDown,
  Zap,
  Building2,
  Clock,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Telescope,
  Waves,
} from 'lucide-react';
import { ScoreGauge, ScoreBreakdown } from './ScoreBar';
import { EvidenceTrail } from './EvidenceTrail';
import type { ScoredOpportunity, BlueOceanOpportunity } from '../types';

// Tier styles
const TIER_CONFIG: Record<string, { label: string; badge: string; icon: React.ComponentType<{className?: string}> }> = {
  quick_win: {
    label: 'Quick Win',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    icon: Zap,
  },
  strategic_build: {
    label: 'Strategic Build',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    icon: Building2,
  },
  emerging: {
    label: 'Emerging',
    badge: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    icon: Telescope,
  },
  blue_ocean: {
    label: 'Blue Ocean',
    badge: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    icon: Waves,
  },
};

// Discovery method labels
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
  const TierIcon = tierConfig.icon;

  const evidence = isBO ? blueOcean!.evidence : (conventional?.demandEvidence || []);
  const validationItems = program.whatValidationWouldConfirm || [];
  const barriers = conventional?.barriers || [];

  return (
    <div
      id={`program-${rank}`}
      className={`card-cosmic rounded-2xl overflow-hidden transition-all duration-300 ${
        isBO ? 'border-teal-500/20' : ''
      }`}
    >
      {/* Blue Ocean accent stripe */}
      {isBO && (
        <div className="h-0.5 w-full bg-gradient-to-r from-teal-600 via-teal-400 to-cyan-400" />
      )}

      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={cardId}
        className="w-full text-left p-6 flex items-start gap-4 group"
      >
        {/* Rank + Gauge */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <ScoreGauge score={composite} isBlueOcean={isBO} size="md" />
          <span className="text-xs text-white/25 tabular-nums">#{rank}</span>
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white leading-tight group-hover:text-gradient-cosmic transition-all">
              {title}
            </h3>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${tierConfig.badge}`}>
              <TierIcon className="w-3 h-3" />
              {tierConfig.label}
            </span>
            {isBO && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/25 shrink-0">
                ◆ Hidden Opportunity
              </span>
            )}
          </div>

          {/* Quick stats row */}
          <div className="flex flex-wrap gap-3 mt-2">
            {isBO && blueOcean?.medianWage && (
              <span className="text-xs text-white/50">
                💰 <span className="text-white/70">{blueOcean.medianWage}</span> median wage
              </span>
            )}
            {!isBO && conventional?.keyMetrics?.medianHourlyWage && (
              <span className="text-xs text-white/50">
                💰 <span className="text-white/70">{conventional.keyMetrics.medianHourlyWage}</span>/hr
              </span>
            )}
            {!isBO && conventional?.keyMetrics?.regionalAnnualOpenings && (
              <span className="text-xs text-white/50">
                📍 <span className="text-white/70">{conventional.keyMetrics.regionalAnnualOpenings}</span> openings/yr
              </span>
            )}
            {isBO && blueOcean?.estimatedDemand && (
              <span className="text-xs text-white/50">
                📍 <span className="text-white/70">{blueOcean.estimatedDemand}</span>
              </span>
            )}
            {isBO && blueOcean?.discoveryMethod && (
              <span className="text-xs text-teal-400/70">
                🔭 {DISCOVERY_LABELS[blueOcean.discoveryMethod] || blueOcean.discoveryMethod}
              </span>
            )}
          </div>
        </div>

        {/* Expand chevron */}
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-white/30 transition-transform duration-300 mt-1 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expandable body */}
      <div
        id={cardId}
        className={`overflow-hidden transition-all duration-500 ease-out ${
          expanded ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 space-y-6 border-t border-white/[0.06] pt-5">

          {/* Description */}
          <p className="text-sm text-white/70 leading-relaxed">{description}</p>

          {/* Blue Ocean callouts */}
          {isBO && blueOcean && (
            <div className="space-y-3">
              {blueOcean.whyNonObvious && (
                <div className="rounded-xl bg-teal-500/[0.08] border border-teal-500/20 p-4">
                  <div className="flex items-start gap-2">
                    <Waves className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
                        Why This Is Non-Obvious
                      </p>
                      <p className="text-sm text-white/70 leading-relaxed">{blueOcean.whyNonObvious}</p>
                    </div>
                  </div>
                </div>
              )}
              {blueOcean.whyDefensible && (
                <div className="rounded-xl bg-violet-500/[0.06] border border-violet-500/15 p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">
                        First-Mover Advantage
                      </p>
                      <p className="text-sm text-white/70 leading-relaxed">{blueOcean.whyDefensible}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Score breakdown + metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score breakdown */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                <span className="inline-block w-4 h-px bg-white/20" />
                Score Breakdown
              </h4>
              <ScoreBreakdown scores={scores} isBlueOcean={isBO} />
            </div>

            {/* Key metrics */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
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
                      <span className="text-white/40">{labels[key] || key}</span>
                      <span className="text-white/70 text-right">{val}</span>
                    </div>
                  );
                })}
                {isBO && blueOcean && (
                  <>
                    {blueOcean.medianWage && (
                      <div className="flex justify-between text-xs gap-3">
                        <span className="text-white/40">Median Wage</span>
                        <span className="text-white/70">{blueOcean.medianWage}</span>
                      </div>
                    )}
                    {blueOcean.estimatedDemand && (
                      <div className="flex justify-between text-xs gap-3">
                        <span className="text-white/40">Demand Estimate</span>
                        <span className="text-white/70">{blueOcean.estimatedDemand}</span>
                      </div>
                    )}
                    {blueOcean.competitivePosition && (
                      <div className="flex justify-between text-xs gap-3">
                        <span className="text-white/40">Market Position</span>
                        <span className="text-white/70 capitalize">{blueOcean.competitivePosition.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    {blueOcean.firstMoverAdvantage && (
                      <div className="flex justify-between text-xs gap-3">
                        <span className="text-white/40">First Mover</span>
                        <span className="text-white/70">{blueOcean.firstMoverAdvantage}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Program details (conventional) */}
          {conventional?.programSnapshot && (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Program Structure
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {conventional.programSnapshot.estimatedDuration && (
                  <div>
                    <span className="text-white/40">Duration: </span>
                    <span className="text-white/70">{conventional.programSnapshot.estimatedDuration}</span>
                  </div>
                )}
                {conventional.programSnapshot.deliveryFormat && (
                  <div>
                    <span className="text-white/40">Format: </span>
                    <span className="text-white/70">{conventional.programSnapshot.deliveryFormat}</span>
                  </div>
                )}
                {conventional.programSnapshot.targetAudience && (
                  <div className="col-span-full">
                    <span className="text-white/40">Target Audience: </span>
                    <span className="text-white/70">{conventional.programSnapshot.targetAudience}</span>
                  </div>
                )}
              </div>
              {conventional.programSnapshot.stackableCredentials?.length && (
                <div className="mt-3">
                  <span className="text-white/40 text-xs">Stackable: </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {conventional.programSnapshot.stackableCredentials.map((c, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Evidence trail */}
          <EvidenceTrail evidence={evidence} />

          {/* Barriers */}
          {barriers.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Barriers & Risks
              </h4>
              <ul className="space-y-1.5">
                {barriers.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0 mt-1.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What Validation Would Confirm — CTA hook */}
          {validationItems.length > 0 && (
            <div className="rounded-xl bg-gradient-to-br from-violet-900/20 to-blue-900/10 border border-violet-500/20 p-5">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-violet-300 mb-2">
                    What Validation Would Confirm
                  </h4>
                  <p className="text-xs text-white/50 mb-3">
                    These are the open questions that employer validation would answer — turning this discovery into a launch decision.
                  </p>
                  <ul className="space-y-2">
                    {validationItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-violet-400/60 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <a
                      href="/#pricing"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <span>Get Employer Validation →</span>
                    </a>
                    <p className="text-xs text-white/30 mt-1">
                      Wavelength Validation Phase conducts deep employer outreach in your region
                    </p>
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
