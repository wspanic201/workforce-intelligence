'use client';

import { useState, useMemo } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { classifySource, SOURCE_CONFIG, SourceBadge, type SourceType } from './EvidenceTrail';
import type { AnyProgram, EvidencePoint } from '../types';

interface CitationRow {
  program: string;
  programRank: number;
  isBlueOcean: boolean;
  point: string;
  source: string;
  sourceType: SourceType;
}

function buildCitations(programs: AnyProgram[]): CitationRow[] {
  const rows: CitationRow[] = [];
  programs.forEach((prog, idx) => {
    const isBO = 'isBlueOcean' in prog && prog.isBlueOcean === true;
    const title = isBO ? (prog as { programTitle: string }).programTitle : (prog as { programTitle: string }).programTitle;
    const evidence: EvidencePoint[] = isBO
      ? ((prog as { evidence?: EvidencePoint[] }).evidence || [])
      : ((prog as { demandEvidence?: EvidencePoint[] }).demandEvidence || []);

    evidence.forEach((ev) => {
      rows.push({
        program: title,
        programRank: idx + 1,
        isBlueOcean: isBO,
        point: ev.point,
        source: ev.source,
        sourceType: classifySource(ev.source),
      });
    });
  });
  return rows;
}

type SortKey = 'sourceType' | 'program' | 'rank';

interface AuditTrailProps {
  programs: AnyProgram[];
  onScrollToProgram?: (rank: number) => void;
}

export function AuditTrail({ programs, onScrollToProgram }: AuditTrailProps) {
  const allCitations = useMemo(() => buildCitations(programs), [programs]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<SourceType | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('rank');

  const filtered = useMemo(() => {
    let rows = allCitations;
    if (filterType !== 'all') {
      rows = rows.filter((r) => r.sourceType === filterType);
    }
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.point.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q) ||
          r.program.toLowerCase().includes(q)
      );
    }
    if (sortKey === 'sourceType') {
      rows = [...rows].sort((a, b) => a.sourceType.localeCompare(b.sourceType));
    } else if (sortKey === 'program') {
      rows = [...rows].sort((a, b) => a.program.localeCompare(b.program));
    } else {
      rows = [...rows].sort((a, b) => a.programRank - b.programRank);
    }
    return rows;
  }, [allCitations, search, filterType, sortKey]);

  // Source type breakdown counts
  const typeCounts = useMemo(() => {
    const counts: Partial<Record<SourceType, number>> = {};
    allCitations.forEach((r) => {
      counts[r.sourceType] = (counts[r.sourceType] || 0) + 1;
    });
    return counts;
  }, [allCitations]);

  const uniqueSources = useMemo(() => new Set(allCitations.map((r) => r.source)).size, [allCitations]);

  return (
    <div className="space-y-6">
      {/* Stats header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-cosmic rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gradient-cosmic">{allCitations.length}</div>
          <div className="text-xs text-theme-muted mt-1">Total Citations</div>
        </div>
        <div className="card-cosmic rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gradient-cosmic">{uniqueSources}</div>
          <div className="text-xs text-theme-muted mt-1">Unique Sources</div>
        </div>
        <div className="card-cosmic rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gradient-cosmic">{programs.length}</div>
          <div className="text-xs text-theme-muted mt-1">Programs Analyzed</div>
        </div>
        <div className="card-cosmic rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gradient-cosmic">
            {Object.keys(typeCounts).length}
          </div>
          <div className="text-xs text-theme-muted mt-1">Source Types</div>
        </div>
      </div>

      {/* Source type filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
            filterType === 'all'
              ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
              : 'bg-white/[0.04] text-theme-tertiary border-white/10 hover:border-white/20'
          }`}
        >
          All ({allCitations.length})
        </button>
        {(Object.keys(typeCounts) as SourceType[]).map((t) => {
          const cfg = SOURCE_CONFIG[t];
          const Icon = cfg.icon;
          return (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                filterType === t
                  ? `${cfg.badge}`
                  : 'bg-white/[0.04] text-theme-tertiary border-white/10 hover:border-white/20'
              }`}
            >
              <Icon className="w-3 h-3" />
              {cfg.label} ({typeCounts[t]})
            </button>
          );
        })}
      </div>

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search citations, sources, programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-theme-secondary placeholder:text-theme-muted focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.06] transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-theme-secondary focus:outline-none focus:border-violet-500/40 cursor-pointer"
          >
            <option value="rank">Sort by Program Rank</option>
            <option value="sourceType">Sort by Source Type</option>
            <option value="program">Sort by Program Name</option>
          </select>
        </div>
      </div>

      {/* Citation rows */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-theme-muted text-sm">No citations match your filters.</div>
        )}
        {filtered.map((row, i) => (
          <div
            key={i}
            className="card-cosmic rounded-xl p-4 flex flex-col sm:flex-row gap-3"
          >
            {/* Left: source type dot */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="shrink-0 mt-1">
                <span className={`inline-block w-2 h-2 rounded-full ${SOURCE_CONFIG[row.sourceType].dot}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-theme-secondary leading-relaxed">{row.point}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <SourceBadge source={row.source} />
                  <span className="text-xs text-theme-muted">{row.source}</span>
                </div>
              </div>
            </div>
            {/* Right: program tag */}
            <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
              <button
                onClick={() => onScrollToProgram?.(row.programRank)}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors text-right"
              >
                #{row.programRank} {row.program.length > 30 ? row.program.slice(0, 30) + '…' : row.program}
              </button>
              {row.isBlueOcean && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/25">
                  ◆ Blue Ocean
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
