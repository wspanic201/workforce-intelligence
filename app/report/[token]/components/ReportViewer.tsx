'use client';

import { useState, useRef, useCallback } from 'react';
import {
  BookOpen,
  BarChart2,
  Map,
  FileText,
  Download,
  Database,
  Sparkles,
  Waves,
  ChevronRight,
  ExternalLink,
  Clock,
  Search,
  Users,
  Building2,
} from 'lucide-react';
import { Aurora } from '@/components/cosmic/Aurora';
import { Stars } from '@/components/cosmic/Stars';
import { ProgramCard } from './ProgramCard';
import { ScoreArc, CompactScoreBar, TIER_STYLES } from './ScoreBar';
import { AuditTrail } from './AuditTrail';
import { RegionalSummary } from './RegionalSummary';
import type { ReportData, AnyProgram, ScoredOpportunity, BlueOceanOpportunity } from '../types';

// ─── Tab types ──────────────────────────────────────────────
type Tab = 'overview' | 'programs' | 'regional' | 'citations';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'programs', label: 'Programs', icon: Sparkles },
  { id: 'regional', label: 'Regional Intel', icon: Map },
  { id: 'citations', label: 'Audit Trail', icon: FileText },
];

// ─── Extract executive summary ──────────────────────────────
function extractExecutiveSummary(markdown: string): string {
  const lines = markdown.split('\n');
  const startIdx = lines.findIndex((l) => l.toLowerCase().includes('executive summary'));
  if (startIdx === -1) return markdown.slice(0, 1500);
  const bodyLines: string[] = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ') && i > startIdx + 1) break;
    if (line.startsWith('---') && i > startIdx + 5) break;
    bodyLines.push(line);
  }
  return bodyLines.join('\n').trim();
}

// ─── Executive Summary Component ─────────────────────────────
function ExecutiveSummary({ text }: { text: string }) {
  // Split into sentences, extract first 2-3 as pull quote
  const cleaned = text.replace(/^#+\s+.*/gm, '').replace(/\n{3,}/g, '\n\n').trim();
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
  const pullQuote = sentences.slice(0, 3).join(' ').trim();
  const rest = sentences.slice(3).join(' ').trim();

  // Parse remaining text into paragraphs with bold handling
  function renderText(t: string) {
    const parts = t.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, j) =>
      p.startsWith('**') && p.endsWith('**') ? (
        <strong key={j} className="font-semibold text-theme-secondary">{p.slice(2, -2)}</strong>
      ) : (
        <span key={j}>{p}</span>
      )
    );
  }

  return (
    <div className="space-y-6">
      {/* Pull quote callout */}
      <div className="relative pl-5 border-l-2 border-violet-500/40">
        <p className="text-base text-theme-secondary leading-relaxed italic">
          {renderText(pullQuote)}
        </p>
      </div>

      {/* Remaining content */}
      {rest && (
        <div className="space-y-3 text-sm text-theme-secondary leading-relaxed">
          {rest.split('\n\n').filter(Boolean).map((para, i) => (
            <p key={i}>{renderText(para)}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────
interface ReportViewerProps {
  data: ReportData;
  token: string;
}

export function ReportViewer({ data, token }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const programsSectionRef = useRef<HTMLDivElement>(null);

  const { brief, structuredData, metadata, reportConfig } = data;
  const ri = structuredData?.regionalIntelligence;
  const institution = ri?.institution;
  const scored: ScoredOpportunity[] = structuredData?.scoredOpportunities?.scoredOpportunities || [];
  const blueOcean: BlueOceanOpportunity[] = structuredData?.blueOceanResults?.hiddenOpportunities || [];

  const allPrograms: AnyProgram[] = [
    ...scored.map((p): ScoredOpportunity => p),
    ...blueOcean.map((p, i): BlueOceanOpportunity => ({
      ...p,
      isBlueOcean: true,
      rank: scored.length + i + 1,
    })),
  ];

  const sortedForOverview = [...allPrograms].sort((a, b) => {
    const scoreA = a.scores.composite ?? Object.values(a.scores).reduce((s, v) => s + (v as number), 0) / Math.max(1, Object.keys(a.scores).length);
    const scoreB = b.scores.composite ?? Object.values(b.scores).reduce((s, v) => s + (v as number), 0) / Math.max(1, Object.keys(b.scores).length);
    return scoreB - scoreA;
  });

  const scrollToProgram = useCallback((rank: number) => {
    setActiveTab('programs');
    setTimeout(() => {
      const el = document.getElementById(`program-${rank}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const institutionName = institution?.name || 'Institution';
  const region = institution?.city ? `${institution.city}, ${institution.state}` : '';
  const generatedDate = brief?.generatedAt
    ? new Date(brief.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : reportConfig?.generatedAt
    ? new Date(reportConfig.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  const execSummary = extractExecutiveSummary(brief?.markdown || '');

  // Stats data
  const stats = [
    { value: brief?.programCount || allPrograms.length, label: 'Opportunities Found' },
    { value: metadata?.totalSearches || '—', label: 'Sources Searched' },
    { value: structuredData?.competitiveLandscape?.providers?.length || '—', label: 'Competitors Mapped' },
    { value: blueOcean.length, label: 'Blue Ocean Programs' },
  ];

  return (
    <div className="min-h-screen bg-theme-page text-theme-primary">

      {/* ═══ HERO HEADER ═══════════════════════════════════════ */}
      <header className="relative overflow-hidden pt-24 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <Stars />
          <Aurora />
          <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to top, var(--bg-page), transparent)' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-1.5 text-xs text-theme-muted mb-6">
            <a href="/" className="hover:text-theme-tertiary transition-colors">Wavelength</a>
            <ChevronRight className="w-3 h-3" />
            <span>Program Market Scan</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-theme-tertiary">{token}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-primary mb-2 leading-tight">
            {institutionName}
          </h1>
          {region && (
            <p className="text-lg text-theme-tertiary mb-8 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400" />
              {region} — Program Discovery Analysis
            </p>
          )}

          {/* Stats row — clean dividers */}
          <div className="flex items-center divide-x divide-theme-subtle mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="px-6 first:pl-0 last:pr-0">
                <div className="text-2xl font-bold text-theme-primary tabular-nums">{stat.value}</div>
                <div className="text-xs text-theme-muted mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {generatedDate && (
            <p className="text-xs text-theme-muted">
              Generated {generatedDate} · Powered by Wavelength
            </p>
          )}
        </div>
      </header>

      {/* ═══ STICKY TAB NAV ════════════════════════════════════ */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-theme-subtle" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-page) 95%, transparent)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide" aria-label="Report sections">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                    active
                      ? 'border-violet-400 text-violet-300'
                      : 'border-transparent text-theme-muted hover:text-theme-secondary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ══════════════════════════════════════ */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* ── OVERVIEW TAB ───────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-fade-up">

            {/* Executive Summary */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-violet-400" />
                <h2 className="text-lg font-semibold text-theme-primary">Executive Summary</h2>
              </div>
              <div className="card-cosmic rounded-2xl p-6 md:p-8">
                <ExecutiveSummary text={execSummary} />
              </div>
            </section>

            <hr className="border-theme-subtle my-8" />

            {/* Program ranking grid */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-violet-400" />
                  <h2 className="text-lg font-semibold text-theme-primary">All Programs at a Glance</h2>
                </div>
                <button
                  onClick={() => setActiveTab('programs')}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mb-5">
                {Object.entries(TIER_STYLES).map(([key, { label, badge }]) => (
                  <span key={key} className={`text-[11px] px-2 py-1 rounded-full font-medium ${badge}`}>
                    {label}
                  </span>
                ))}
              </div>

              {/* 2-col program card grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedForOverview.map((prog, i) => {
                  const isBO = 'isBlueOcean' in prog && prog.isBlueOcean === true;
                  const title = (prog as { programTitle: string }).programTitle;
                  const tier = isBO ? 'blue_ocean' : ((prog as ScoredOpportunity).tier || 'emerging');
                  const tierKey = tier.toLowerCase().replace(' ', '_');
                  const tierStyle = TIER_STYLES[tierKey] || TIER_STYLES['emerging'];
                  const scores = prog.scores;
                  const composite = scores.composite ?? (
                    Object.values(scores).reduce((a, b) => a + (b as number), 0) /
                    Math.max(1, Object.keys(scores).length)
                  );

                  const demandEvidence = isBO ? (scores as any).demand ?? (scores as any).demandEvidence ?? 0 : (scores as any).demandEvidence ?? 0;
                  const competitiveGap = isBO ? (scores as any).competition ?? (scores as any).competitiveGap ?? 0 : (scores as any).competitiveGap ?? 0;
                  const revenueViability = isBO ? (scores as any).revenue ?? (scores as any).revenueViability ?? 0 : (scores as any).revenueViability ?? 0;
                  const wageOutcomes = isBO ? (scores as any).wages ?? (scores as any).wageOutcomes ?? 0 : (scores as any).wageOutcomes ?? 0;
                  const launchSpeed = isBO ? (scores as any).speed ?? (scores as any).launchSpeed ?? 0 : (scores as any).launchSpeed ?? 0;

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveTab('programs');
                        setTimeout(() => {
                          const el = document.getElementById(`program-${i + 1}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      className="card-cosmic rounded-2xl p-6 text-left hover:bg-white/[0.02] transition-colors cursor-pointer group relative"
                    >
                      {/* Rank number */}
                      <span className="absolute top-4 left-5 text-3xl font-bold text-theme-muted opacity-20 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <div className="flex items-start gap-4 ml-8">
                        {/* Arc gauge */}
                        <div className="shrink-0">
                          <ScoreArc score={composite} size={64} />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Title + tier */}
                          <h3 className="text-sm font-semibold text-theme-primary truncate group-hover:text-violet-300 transition-colors">
                            {title}
                          </h3>
                          <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-1 ${tierStyle.badge}`}>
                            {tierStyle.label}
                          </span>

                          {/* 5 dimension bars in 2-col grid */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
                            <CompactScoreBar label="Demand" score={demandEvidence} />
                            <CompactScoreBar label="Competition" score={competitiveGap} />
                            <CompactScoreBar label="Revenue" score={revenueViability} />
                            <CompactScoreBar label="Wages" score={wageOutcomes} />
                            <CompactScoreBar label="Speed" score={launchSpeed} />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <hr className="border-theme-subtle my-8" />

            {/* Top 3 teaser */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-lg font-semibold text-theme-primary">Top Recommendations</h2>
              </div>
              <div className="space-y-4">
                {allPrograms.slice(0, 3).map((prog, i) => (
                  <ProgramCard key={i} program={prog} defaultExpanded={i === 0} rank={i + 1} />
                ))}
              </div>
              {allPrograms.length > 3 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setActiveTab('programs')}
                    className="btn-cosmic btn-cosmic-ghost text-sm py-2.5 px-6"
                  >
                    View All {allPrograms.length} Programs →
                  </button>
                </div>
              )}
            </section>

          </div>
        )}

        {/* ── PROGRAMS TAB ───────────────────────────────────── */}
        {activeTab === 'programs' && (
          <div className="space-y-6 animate-fade-up" ref={programsSectionRef}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-bold text-theme-primary">All Programs</h2>
                <p className="text-sm text-theme-muted mt-1">
                  {scored.length} conventional + {blueOcean.length} blue ocean ={' '}
                  <strong className="text-theme-secondary">{allPrograms.length} total</strong>
                </p>
              </div>
            </div>

            {scored.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
                    Conventional Opportunities ({scored.length})
                  </span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                <div className="space-y-4">
                  {scored.map((prog, i) => (
                    <ProgramCard key={i} program={prog} defaultExpanded={i < 3} rank={i + 1} />
                  ))}
                </div>
              </div>
            )}

            {blueOcean.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-400/80">
                      Blue Ocean — Hidden Opportunities ({blueOcean.length})
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-teal-500/20" />
                </div>
                <p className="text-sm text-theme-tertiary mb-4 italic">
                  {structuredData.blueOceanResults?.keyInsight || 'Opportunities discovered through non-obvious pattern matching — not in standard labor market data.'}
                </p>
                <div className="space-y-4">
                  {blueOcean.map((prog, i) => (
                    <ProgramCard
                      key={i}
                      program={{ ...prog, isBlueOcean: true, rank: scored.length + i + 1 }}
                      defaultExpanded={i === 0}
                      rank={scored.length + i + 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REGIONAL INTEL TAB ─────────────────────────────── */}
        {activeTab === 'regional' && ri && (
          <div className="animate-fade-up">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-theme-primary">Regional Intelligence</h2>
              <p className="text-sm text-theme-muted mt-1">
                Market context and competitive landscape for {institutionName}
              </p>
            </div>
            <RegionalSummary
              regionalIntelligence={ri}
              competitiveLandscape={structuredData.competitiveLandscape}
              demandSignals={structuredData.demandSignals}
            />
          </div>
        )}

        {/* ── AUDIT TRAIL TAB ────────────────────────────────── */}
        {activeTab === 'citations' && (
          <div className="animate-fade-up">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-theme-primary">Audit Trail</h2>
              <p className="text-sm text-theme-muted mt-1">
                Every data point, signal, and source behind this analysis
              </p>
            </div>
            <AuditTrail programs={allPrograms} onScrollToProgram={scrollToProgram} />
          </div>
        )}

      </main>

      {/* ═══ FOOTER ════════════════════════════════════════════ */}
      <footer className="border-t border-theme-subtle mt-16 bg-theme-page">
        <div className="max-w-5xl mx-auto px-6 py-12">

          <div className="card-cosmic rounded-2xl p-8 mb-10 text-center relative overflow-hidden">
            <div className="aurora opacity-50 pointer-events-none" aria-hidden="true">
              <div className="aurora-blob aurora-blob-1" />
              <div className="aurora-blob aurora-blob-3" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-2">
                Next Steps
              </p>
              <h3 className="text-2xl font-bold text-theme-primary mb-3">
                Want to validate these findings?
              </h3>
              <p className="text-theme-secondary text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                Wavelength Validation Phase conducts deep employer outreach and market validation in your region to confirm demand before you commit budget to a new program.
              </p>
              <a href="/#pricing" className="btn-cosmic btn-cosmic-primary inline-flex items-center gap-2">
                <Users className="w-4 h-4" />
                Get Employer Validation
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div>
              <p className="text-sm font-semibold text-theme-primary mb-1">Download Options</p>
              <div className="flex gap-3 mt-2">
                <a href={`/api/report/${token}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-theme-tertiary hover:text-theme-secondary transition-colors">
                  <Database className="w-3.5 h-3.5" /> Raw JSON <ExternalLink className="w-3 h-3" />
                </a>
                <a href="#" className="inline-flex items-center gap-1.5 text-xs text-theme-tertiary hover:text-theme-secondary transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </a>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-theme-primary">Wavelength</p>
              <p className="text-xs text-theme-muted mt-1">Program intelligence for community colleges</p>
              <a href="/" className="text-xs text-violet-400 hover:text-violet-300 transition-colors mt-1 inline-block">
                withwavelength.com →
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-theme-subtle flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-theme-muted">
              © {new Date().getFullYear()} Wavelength. Confidential — for {institutionName} use only.
            </p>
            <p className="text-xs text-theme-muted">
              Report token: <code className="font-mono text-theme-muted">{token}</code>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
