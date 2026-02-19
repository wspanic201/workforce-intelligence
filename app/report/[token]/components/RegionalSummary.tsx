'use client';

import { Building2, TrendingUp, GraduationCap, MapPin, Users, Briefcase } from 'lucide-react';
import type { RegionalIntelligence, CompetitiveLandscape, DemandSignals } from '../types';

interface RegionalSummaryProps {
  regionalIntelligence: RegionalIntelligence;
  competitiveLandscape: CompetitiveLandscape;
  demandSignals: DemandSignals;
}

function BigStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-theme-primary tabular-nums">{value}</div>
      <div className="text-xs text-theme-muted mt-0.5">{label}</div>
    </div>
  );
}

function CompetitorBadge({ type }: { type: string }) {
  const labels: Record<string, { label: string; textClass: string; dot: string }> = {
    community_college: { label: 'Community College', textClass: 'text-blue-300', dot: 'bg-blue-500/60' },
    university: { label: 'University', textClass: 'text-violet-300', dot: 'bg-violet-500/60' },
    proprietary: { label: 'Proprietary', textClass: 'text-amber-300', dot: 'bg-amber-500/60' },
    online: { label: 'Online Provider', textClass: 'text-teal-300', dot: 'bg-teal-500/60' },
    workforce: { label: 'Workforce Dev', textClass: 'text-emerald-300', dot: 'bg-emerald-500/60' },
  };
  const match = labels[type] || { label: type, textClass: 'text-white/50', dot: 'bg-white/40' };
  return (
    <span className={`flex items-center gap-1.5 text-[11px] font-medium ${match.textClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${match.dot}`} />
      {match.label}
    </span>
  );
}

export function RegionalSummary({ regionalIntelligence, competitiveLandscape, demandSignals }: RegionalSummaryProps) {
  const { institution } = regionalIntelligence;
  const providers = competitiveLandscape?.providers || [];
  const gaps = competitiveLandscape?.gaps || [];
  const topIndustries = demandSignals?.topIndustries || [];
  const trendingCerts = demandSignals?.trendingCertifications || [];
  const currentPrograms = institution?.currentPrograms || [];
  const demos = institution?.demographics || {};
  const recentNews = institution?.recentNews || [];

  return (
    <div className="space-y-8">

      {/* Overview stats — large numbers with dividers */}
      <div className="flex items-center justify-around divide-x divide-theme-subtle py-4">
        <BigStat label="Active Competitors" value={providers.length} />
        <BigStat label="Market Gaps" value={gaps.length || competitiveLandscape?.whiteSpaceCount || '—'} />
        <BigStat label="Demand Signals" value={demandSignals?.signals?.length || 0} />
        <BigStat label="Existing Programs" value={currentPrograms.length} />
      </div>

      <hr className="border-theme-subtle" />

      {/* Institution overview */}
      {institution && (
        <div className="card-cosmic rounded-2xl p-6 md:p-8">
          <h3 className="text-base font-semibold text-theme-primary mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-violet-400" />
            Institution Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-theme-muted mb-0.5">Name</div>
              <div className="text-sm text-theme-secondary">{institution.name}</div>
            </div>
            {institution.city && (
              <div>
                <div className="text-xs text-theme-muted mb-0.5">Service Region</div>
                <div className="text-sm text-theme-secondary flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-violet-400" />
                  {institution.city}, {institution.state}
                  {institution.serviceArea && ` (${institution.serviceArea})`}
                </div>
              </div>
            )}
          </div>

          {/* Demographics */}
          {Object.keys(demos).length > 0 && (
            <div className="mt-5 pt-5 border-t border-theme-subtle">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-muted mb-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Regional Demographics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(demos).map(([county, info]) => (
                  <div key={county} className="rounded-xl bg-white/[0.03] border border-theme-subtle p-3">
                    <div className="text-xs font-semibold text-theme-secondary mb-2">{county} County</div>
                    {info.population && (
                      <div className="text-xs text-theme-muted">
                        Population: <span className="text-theme-secondary">{info.population}</span>
                      </div>
                    )}
                    {info.medianIncome && (
                      <div className="text-xs text-theme-muted mt-1">
                        Median Income: <span className="text-theme-secondary">{info.medianIncome}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategic priorities */}
          {institution.strategicPriorities?.length && (
            <div className="mt-5 pt-5 border-t border-theme-subtle">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-muted mb-3">
                Strategic Priorities
              </h4>
              <ul className="space-y-1.5">
                {institution.strategicPriorities.slice(0, 4).map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-theme-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500/60 shrink-0 mt-1.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent news */}
          {recentNews.length > 0 && (
            <div className="mt-5 pt-5 border-t border-theme-subtle">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-muted mb-3">
                Recent Developments
              </h4>
              <ul className="space-y-1.5">
                {recentNews.slice(0, 4).map((n, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-theme-secondary">
                    <span className="text-teal-500 shrink-0 mt-0.5">→</span>
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Competitive landscape */}
      {providers.length > 0 && (
        <div className="card-cosmic rounded-2xl p-6 md:p-8">
          <h3 className="text-base font-semibold text-theme-primary mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-violet-400" />
            Competitive Landscape
            <span className="text-xs text-theme-muted font-normal">{providers.length} providers mapped</span>
          </h3>
          <div className="space-y-3">
            {providers.map((p, i) => (
              <div key={i} className="rounded-xl bg-white/[0.03] border border-theme-subtle p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-sm font-medium text-theme-secondary">{p.name}</span>
                    {p.distance && (
                      <span className="text-xs text-theme-muted ml-2">{p.distance}</span>
                    )}
                  </div>
                  <CompetitorBadge type={p.type} />
                </div>
                {p.programs?.length && (
                  <p className="text-xs text-theme-muted mt-2">
                    {p.programs.slice(0, 4).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>

          {gaps.length > 0 && (
            <div className="mt-5 pt-5 border-t border-theme-subtle">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-400/70 mb-3">
                Market Gaps (White Space)
              </h4>
              <ul className="space-y-3">
                {gaps.map((g: any, i: number) => (
                  <li key={i} className="rounded-xl bg-white/[0.03] border border-theme-subtle p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-teal-400 shrink-0">◆</span>
                      <span className="text-sm font-medium text-theme-secondary">
                        {typeof g === 'string' ? g : g.occupation || g.name || 'Opportunity'}
                      </span>
                      {g.socCode && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-white/30 font-mono">
                          {g.socCode}
                        </span>
                      )}
                      {g.demandSignalStrength && (
                        <span className={`flex items-center gap-1.5 text-[11px] font-medium ${
                          g.demandSignalStrength === 'strong' ? 'text-emerald-300' : 'text-amber-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            g.demandSignalStrength === 'strong' ? 'bg-emerald-500/60' : 'bg-amber-500/60'
                          }`} />
                          {g.demandSignalStrength}
                        </span>
                      )}
                    </div>
                    {g.opportunity && (
                      <p className="text-xs text-theme-tertiary ml-6 leading-relaxed">{g.opportunity}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <hr className="border-theme-subtle" />

      {/* Demand signals — top industries + trending certs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topIndustries.length > 0 && (
          <div className="card-cosmic rounded-2xl p-6 md:p-8">
            <h3 className="text-base font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Top Industries
            </h3>
            <ul className="space-y-2.5">
              {topIndustries.map((ind, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400/60 shrink-0" />
                    <span className="text-theme-secondary">{ind.industry}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-theme-muted">{ind.signalCount} signals</span>
                    <span className={`flex items-center gap-1.5 text-[11px] font-medium ${
                      ind.averageStrength === 'high' ? 'text-emerald-300'
                        : ind.averageStrength === 'moderate' ? 'text-amber-300'
                        : 'text-white/40'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        ind.averageStrength === 'high' ? 'bg-emerald-500/60'
                          : ind.averageStrength === 'moderate' ? 'bg-amber-500/60'
                          : 'bg-white/20'
                      }`} />
                      {ind.averageStrength}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {trendingCerts.length > 0 && (
          <div className="card-cosmic rounded-2xl p-6 md:p-8">
            <h3 className="text-base font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              Trending Certifications
            </h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              {trendingCerts.map((cert: any) =>
                typeof cert === 'string' ? cert : cert.certification || cert.name || 'Certification'
              ).join(', ')}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
