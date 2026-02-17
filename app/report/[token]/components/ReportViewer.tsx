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
import { ScoreGauge, OverviewBar } from './ScoreBar';
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

// ─── Markdown to plain text (first section only) ────────────
function extractExecutiveSummary(markdown: string): string {
  const lines = markdown.split('\n');
  const startIdx = lines.findIndex((l) => l.toLowerCase().includes('executive summary'));
  if (startIdx === -1) return markdown.slice(0, 1500);
  const bodyLines: string[] = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    // Stop at next major section
    if (line.startsWith('## ') && i > startIdx + 1) break;
    if (line.startsWith('---') && i > startIdx + 5) break;
    bodyLines.push(line);
  }
  return bodyLines.join('\n').trim();
}

// ─── Simple markdown renderer (no library) ──────────────────
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-3 text-sm text-white/70 leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        if (line.startsWith('### '))
          return <h3 key={i} className="text-base font-semibold text-white/90 mt-4">{line.slice(4)}</h3>;
        if (line.startsWith('## '))
          return <h2 key={i} className="text-lg font-semibold text-white mt-5">{line.slice(3)}</h2>;
        if (line.startsWith('# '))
          return <h1 key={i} className="text-xl font-bold text-white mt-6">{line.slice(2)}</h1>;
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-white/65">{line.slice(2)}</li>;
        if (line.startsWith('**') && line.endsWith('**'))
          return <p key={i} className="font-semibold text-white/80">{line.slice(2, -2)}</p>;
        // Bold inline
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((p, j) =>
              p.startsWith('**') && p.endsWith('**') ? (
                <strong key={j} className="font-semibold text-white/85">{p.slice(2, -2)}</strong>
              ) : (
                <span key={j}>{p}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

// ─── Stat chip ───────────────────────────────────────────────
function StatChip({ label, value, icon: Icon }: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08]">
      <Icon className="w-4 h-4 text-violet-400 shrink-0" />
      <div>
        <div className="text-base font-bold text-white tabular-nums">{value}</div>
        <div className="text-[11px] text-white/45 leading-none mt-0.5">{label}</div>
      </div>
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

  // Combine all programs for unified list
  const allPrograms: AnyProgram[] = [
    ...scored.map((p): ScoredOpportunity => p),
    ...blueOcean.map((p, i): BlueOceanOpportunity => ({
      ...p,
      isBlueOcean: true,
      rank: scored.length + i + 1,
    })),
  ];

  // Sort by composite score for overview bars
  const sortedForOverview = [...allPrograms].sort((a, b) => {
    const scoreA = a.scores.composite ?? Object.values(a.scores).reduce((s, v) => s + (v as number), 0) / Math.max(1, Object.keys(a.scores).length);
    const scoreB = b.scores.composite ?? Object.values(b.scores).reduce((s, v) => s + (v as number), 0) / Math.max(1, Object.keys(b.scores).length);
    return scoreB - scoreA;
  });

  const scrollToProgram = useCallback((rank: number) => {
    setActiveTab('programs');
    setTimeout(() => {
      const el = document.getElementById(`program-${rank}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, []);

  const institutionName = institution?.name || 'Institution';
  const region = institution?.city
    ? `${institution.city}, ${institution.state}`
    : '';
  const generatedDate = brief?.generatedAt
    ? new Date(brief.generatedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : reportConfig?.generatedAt
    ? new Date(reportConfig.generatedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const execSummary = extractExecutiveSummary(brief?.markdown || '');

  return (
    <div className="min-h-screen bg-[#050510] text-[#e2e8f0]">

      {/* ═══ HERO HEADER ═══════════════════════════════════════ */}
      <header className="relative overflow-hidden pt-20 pb-16 px-6">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <Stars />
          <Aurora />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050510] to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-white/30 mb-6">
            <span>Wavelength</span>
            <ChevronRight className="w-3 h-3" />
            <span>Program Discovery Brief</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/50">{token}</span>
          </div>

          {/* Institution name */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
            {institutionName}
          </h1>
          {region && (
            <p className="text-lg text-white/50 mb-6 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400" />
              {region} — Program Discovery Analysis
            </p>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap gap-2.5 mb-8">
            <StatChip
              icon={Sparkles}
              value={brief?.programCount || allPrograms.length}
              label="Opportunities Found"
            />
            <StatChip
              icon={Search}
              value={metadata?.totalSearches || '—'}
              label="Data Sources Searched"
            />
            <StatChip
              icon={Building2}
              value={structuredData?.competitiveLandscape?.providers?.length || '—'}
              label="Competitors Mapped"
            />
            <StatChip
              icon={Waves}
              value={blueOcean.length}
              label="Blue Ocean Programs"
            />
            {metadata?.durationSeconds && (
              <StatChip
                icon={Clock}
                value={`${Math.round(metadata.durationSeconds / 60)}m`}
                label="Analysis Duration"
              />
            )}
          </div>

          {/* Generated date */}
          {generatedDate && (
            <p className="text-xs text-white/25">
              Generated {generatedDate} · Powered by Wavelength
            </p>
          )}
        </div>
      </header>

      {/* ═══ STICKY TAB NAV ════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-[#050510]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6">
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide py-1" aria-label="Report sections">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    active
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
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
                <h2 className="text-lg font-semibold text-white">Executive Summary</h2>
              </div>
              <div className="card-cosmic rounded-2xl p-6">
                <SimpleMarkdown text={execSummary} />
              </div>
            </section>

            {/* Program score overview */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-violet-400" />
                  <h2 className="text-lg font-semibold text-white">All Programs at a Glance</h2>
                </div>
                <button
                  onClick={() => setActiveTab('programs')}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="card-cosmic rounded-2xl p-4">
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-4 px-3">
                  {[
                    { key: 'quick_win', label: 'Quick Win', style: 'bg-emerald-500/20 text-emerald-400' },
                    { key: 'strategic_build', label: 'Strategic Build', style: 'bg-amber-500/20 text-amber-400' },
                    { key: 'emerging', label: 'Emerging', style: 'bg-violet-500/20 text-violet-400' },
                    { key: 'blue_ocean', label: 'Blue Ocean', style: 'bg-teal-500/20 text-teal-400' },
                  ].map((l) => (
                    <span key={l.key} className={`text-[11px] px-2 py-1 rounded-full font-medium ${l.style}`}>
                      {l.label}
                    </span>
                  ))}
                </div>

                <div className="space-y-1">
                  {sortedForOverview.map((prog, i) => {
                    const isBO = 'isBlueOcean' in prog && prog.isBlueOcean === true;
                    const title = (prog as { programTitle: string }).programTitle;
                    const tier = isBO ? 'blue_ocean' : ((prog as ScoredOpportunity).tier || 'emerging');
                    const composite = prog.scores.composite ?? (
                      Object.values(prog.scores).reduce((a, b) => a + (b as number), 0) /
                      Math.max(1, Object.keys(prog.scores).length)
                    );
                    return (
                      <OverviewBar
                        key={i}
                        programName={title}
                        score={composite}
                        category={tier}
                        isBlueOcean={isBO}
                        rank={i + 1}
                        onClick={() => {
                          setActiveTab('programs');
                          setTimeout(() => {
                            const el = document.getElementById(`program-${i + 1}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Top 3 teaser */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Top Recommendations</h2>
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
                <h2 className="text-xl font-bold text-white">All Programs</h2>
                <p className="text-sm text-white/40 mt-1">
                  {scored.length} conventional + {blueOcean.length} blue ocean ={' '}
                  <strong className="text-white/60">{allPrograms.length} total</strong>
                </p>
              </div>
            </div>

            {/* Conventional programs */}
            {scored.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
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

            {/* Blue Ocean programs */}
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
                <p className="text-sm text-white/50 mb-4 italic">
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
              <h2 className="text-xl font-bold text-white">Regional Intelligence</h2>
              <p className="text-sm text-white/40 mt-1">
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
              <h2 className="text-xl font-bold text-white">Audit Trail</h2>
              <p className="text-sm text-white/40 mt-1">
                Every data point, signal, and source behind this analysis
              </p>
            </div>
            <AuditTrail programs={allPrograms} onScrollToProgram={scrollToProgram} />
          </div>
        )}

      </main>

      {/* ═══ FOOTER ════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] mt-16 bg-[#050510]">
        <div className="max-w-5xl mx-auto px-6 py-12">

          {/* CTA band */}
          <div className="card-cosmic rounded-2xl p-8 mb-10 text-center relative overflow-hidden">
            <div className="aurora opacity-50 pointer-events-none" aria-hidden="true">
              <div className="aurora-blob aurora-blob-1" />
              <div className="aurora-blob aurora-blob-3" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-2">
                Next Steps
              </p>
              <h3 className="text-2xl font-bold text-white mb-3">
                Want to validate these findings?
              </h3>
              <p className="text-white/60 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                Wavelength Validation Phase conducts deep employer outreach and market validation in your region to confirm demand before you commit budget to a new program.
              </p>
              <a
                href="/#pricing"
                className="btn-cosmic btn-cosmic-primary inline-flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Get Employer Validation
              </a>
            </div>
          </div>

          {/* Download + links */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div>
              <p className="text-sm font-semibold text-white mb-1">Download Options</p>
              <div className="flex gap-3 mt-2">
                <a
                  href={`/api/report/${token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
                >
                  <Database className="w-3.5 h-3.5" />
                  Raw JSON
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </a>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-white">Wavelength</p>
              <p className="text-xs text-white/30 mt-1">
                Program intelligence for community colleges
              </p>
              <a
                href="/"
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors mt-1 inline-block"
              >
                workforceos.com →
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-white/20">
              © {new Date().getFullYear()} Wavelength. Confidential — for {institutionName} use only.
            </p>
            <p className="text-xs text-white/20">
              Report token: <code className="font-mono text-white/30">{token}</code>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
