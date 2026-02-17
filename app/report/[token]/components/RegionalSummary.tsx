'use client';

import { Building2, TrendingUp, GraduationCap, MapPin, Users, Briefcase } from 'lucide-react';
import type { RegionalIntelligence, CompetitiveLandscape, DemandSignals } from '../types';

interface RegionalSummaryProps {
  regionalIntelligence: RegionalIntelligence;
  competitiveLandscape: CompetitiveLandscape;
  demandSignals: DemandSignals;
}

function StatCard({ label, value, icon: Icon, color = 'purple' }: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{className?: string}>;
  color?: 'purple' | 'teal' | 'blue' | 'amber' | 'green';
}) {
  const colorMap = {
    purple: 'text-violet-400 bg-violet-500/10',
    teal: 'text-teal-400 bg-teal-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    green: 'text-emerald-400 bg-emerald-500/10',
  };
  return (
    <div className="card-cosmic rounded-xl p-4">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${colorMap[color]}`}>
        <Icon className={`w-4 h-4 ${colorMap[color].split(' ')[0]}`} />
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
    </div>
  );
}

function CompetitorBadge({ type }: { type: string }) {
  const labels: Record<string, { label: string; style: string }> = {
    community_college: { label: 'Community College', style: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    university: { label: 'University', style: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
    proprietary: { label: 'Proprietary', style: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    online: { label: 'Online Provider', style: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
    workforce: { label: 'Workforce Dev', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  };
  const match = labels[type] || { label: type, style: 'bg-white/10 text-white/50 border-white/20' };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${match.style}`}>
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

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Active Competitors"
          value={providers.length}
          icon={Building2}
          color="purple"
        />
        <StatCard
          label="Market Gaps Identified"
          value={gaps.length || competitiveLandscape?.whiteSpaceCount || '—'}
          icon={TrendingUp}
          color="teal"
        />
        <StatCard
          label="Demand Signals"
          value={demandSignals?.signals?.length || 0}
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          label="Existing Programs"
          value={currentPrograms.length}
          icon={GraduationCap}
          color="amber"
        />
      </div>

      {/* Institution overview */}
      {institution && (
        <div className="card-cosmic rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-violet-400" />
            Institution Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-white/40 mb-0.5">Name</div>
              <div className="text-sm text-white/80">{institution.name}</div>
            </div>
            {institution.city && (
              <div>
                <div className="text-xs text-white/40 mb-0.5">Service Region</div>
                <div className="text-sm text-white/80 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-violet-400" />
                  {institution.city}, {institution.state}
                  {institution.serviceArea && ` (${institution.serviceArea})`}
                </div>
              </div>
            )}
          </div>

          {/* Demographics */}
          {Object.keys(demos).length > 0 && (
            <div className="mt-5 pt-5 border-t border-white/[0.06]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Regional Demographics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(demos).map(([county, info]) => (
                  <div key={county} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                    <div className="text-xs font-semibold text-white/60 mb-2">{county} County</div>
                    {info.population && (
                      <div className="text-xs text-white/40">
                        Population: <span className="text-white/60">{info.population}</span>
                      </div>
                    )}
                    {info.medianIncome && (
                      <div className="text-xs text-white/40 mt-1">
                        Median Income: <span className="text-white/60">{info.medianIncome}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategic priorities */}
          {institution.strategicPriorities?.length && (
            <div className="mt-5 pt-5 border-t border-white/[0.06]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
                Strategic Priorities
              </h4>
              <ul className="space-y-1.5">
                {institution.strategicPriorities.slice(0, 4).map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500/60 shrink-0 mt-1.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent news */}
          {recentNews.length > 0 && (
            <div className="mt-5 pt-5 border-t border-white/[0.06]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
                Recent Developments
              </h4>
              <ul className="space-y-1.5">
                {recentNews.slice(0, 4).map((n, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60">
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
        <div className="card-cosmic rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-violet-400" />
            Competitive Landscape
            <span className="text-xs text-white/30 font-normal">{providers.length} providers mapped</span>
          </h3>
          <div className="space-y-3">
            {providers.map((p, i) => (
              <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-sm font-medium text-white/80">{p.name}</span>
                    {p.distance && (
                      <span className="text-xs text-white/30 ml-2">{p.distance}</span>
                    )}
                  </div>
                  <CompetitorBadge type={p.type} />
                </div>
                {p.programs?.length && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.programs.slice(0, 4).map((prog, j) => (
                      <span key={j} className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/40 border border-white/[0.06]">
                        {prog}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Gaps / white space */}
          {gaps.length > 0 && (
            <div className="mt-5 pt-5 border-t border-white/[0.06]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-400/70 mb-3">
                Market Gaps (White Space)
              </h4>
              <ul className="space-y-3">
                {gaps.map((g: any, i: number) => (
                  <li key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-teal-400 shrink-0">◆</span>
                      <span className="text-sm font-medium text-white/80">
                        {typeof g === 'string' ? g : g.occupation || g.name || 'Opportunity'}
                      </span>
                      {g.socCode && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-white/30 font-mono">
                          {g.socCode}
                        </span>
                      )}
                      {g.demandSignalStrength && (
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                          g.demandSignalStrength === 'strong'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {g.demandSignalStrength}
                        </span>
                      )}
                    </div>
                    {g.opportunity && (
                      <p className="text-xs text-white/50 ml-6 leading-relaxed">{g.opportunity}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Demand signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top industries */}
        {topIndustries.length > 0 && (
          <div className="card-cosmic rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Top Industries
            </h3>
            <div className="space-y-3">
              {topIndustries.map((ind, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{ind.industry}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">{ind.signalCount} signals</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      ind.averageStrength === 'high'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : ind.averageStrength === 'moderate'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-white/10 text-white/40 border-white/20'
                    }`}>
                      {ind.averageStrength}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending certifications */}
        {trendingCerts.length > 0 && (
          <div className="card-cosmic rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              Trending Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingCerts.map((cert: any, i: number) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {typeof cert === 'string' ? cert : cert.certification || cert.name || 'Certification'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
