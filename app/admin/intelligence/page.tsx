'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { IntelDashboardStats } from '@/lib/intelligence/types';

// ── Types for inventory ─────────────────────────────────

interface InventoryItem {
  table: string;
  label: string;
  icon: string;
  category: string;
  count: number;
  source: string;
  sourceUrl: string | null;
  dataPeriod: string;
  dataReleaseDate: string | null;
  nextExpectedRelease: string | null;
  recordsLoaded: number;
  lastRefreshedAt: string | null;
  refreshedBy: string | null;
  refreshMethod: string | null;
  citationText: string | null;
  citationUrl: string | null;
  coverageNotes: string | null;
  knownLimitations: string | null;
  isStale: boolean;
  staleReason: string | null;
  description: string;
}

// ── Stat Cards ──────────────────────────────────────────

const STAT_CARDS = [
  { key: 'institutions', label: 'Institutions', icon: '🏫', href: '/admin/intelligence/institutions' },
  { key: 'employers', label: 'Employers', icon: '🏢', href: '/admin/intelligence/employers' },
  { key: 'completions', label: 'Completions', icon: '🎓', href: '/admin/intelligence/institutions' },
  { key: 'projections', label: 'Projections', icon: '📈', href: '/admin/intelligence/wages' },
  { key: 'wages', label: 'Wages', icon: '💰', href: '/admin/intelligence/wages' },
  { key: 'financial_aid', label: 'Financial Aid', icon: '💳', href: '/admin/intelligence/institutions' },
  { key: 'credentials', label: 'Credentials', icon: '📋', href: '/admin/intelligence/credentials' },
  { key: 'statutes', label: 'Statutes', icon: '📜', href: '/admin/intelligence/statutes' },
] as const;

// ── Category config ─────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  credit: { label: '🎓 Credit / IPEDS', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  noncredit: { label: '🏭 Noncredit / Workforce', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  both: { label: '📊 Cross-Cutting', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  reference: { label: '📎 Reference', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
};

const METHOD_LABELS: Record<string, string> = {
  api_bulk: '🔄 API Bulk',
  api_incremental: '🔄 API Incremental',
  manual_import: '📥 Manual Import',
  csv_upload: '📄 CSV Upload',
  scrape: '🕸️ Scrape',
};

// ── Sort config ─────────────────────────────────────────

type SortKey = 'label' | 'count' | 'source' | 'category' | 'dataPeriod' | 'lastRefreshedAt';
type SortDir = 'asc' | 'desc';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export default function IntelligenceDashboard() {
  const [stats, setStats] = useState<IntelDashboardStats | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [invLoading, setInvLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('count');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/intelligence')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch('/api/admin/intelligence?view=inventory')
      .then(r => r.json())
      .then(setInventory)
      .catch(console.error)
      .finally(() => setInvLoading(false));
  }, []);

  // Compute totals
  const totalRecords = inventory.reduce((sum, item) => sum + item.count, 0);
  const filledTables = inventory.filter(i => i.count > 0).length;
  const emptyTables = inventory.filter(i => i.count === 0).length;
  const staleTables = inventory.filter(i => i.isStale).length;

  // Filter + sort
  const filtered = filterCategory === 'all' ? inventory : inventory.filter(i => i.category === filterCategory);
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'count') cmp = a.count - b.count;
    else if (sortKey === 'label') cmp = a.label.localeCompare(b.label);
    else if (sortKey === 'source') cmp = a.source.localeCompare(b.source);
    else if (sortKey === 'category') cmp = a.category.localeCompare(b.category);
    else if (sortKey === 'dataPeriod') cmp = a.dataPeriod.localeCompare(b.dataPeriod);
    else if (sortKey === 'lastRefreshedAt') cmp = (a.lastRefreshedAt || '').localeCompare(b.lastRefreshedAt || '');
    return sortDir === 'desc' ? -cmp : cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'count' ? 'desc' : 'asc'); }
  };

  const sortIcon = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ⇅';

  return (
    <div>
      {/* ── Summary Row ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-purple-900">{loading ? '—' : formatNumber(totalRecords)}</div>
          <div className="text-sm text-purple-600 font-medium">Total Verified Records</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-green-900">{invLoading ? '—' : filledTables}</div>
          <div className="text-sm text-green-600 font-medium">Active Data Sources</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-slate-600">{invLoading ? '—' : emptyTables}</div>
          <div className="text-sm text-slate-500 font-medium">Awaiting Data</div>
        </div>
        <div className={`rounded-xl p-5 text-center border ${staleTables > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
          <div className={`text-3xl font-bold ${staleTables > 0 ? 'text-amber-800' : 'text-green-900'}`}>
            {invLoading ? '—' : staleTables}
          </div>
          <div className={`text-sm font-medium ${staleTables > 0 ? 'text-amber-600' : 'text-green-600'}`}>
            {staleTables > 0 ? 'Stale Datasets' : 'All Current'}
          </div>
        </div>
      </div>

      {/* ── Quick Stat Cards ───────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {STAT_CARDS.map(card => {
          const stat = stats?.[card.key as keyof IntelDashboardStats];
          const count = typeof stat === 'object' && stat !== null && 'count' in stat ? stat.count : 0;
          return (
            <Link key={card.key} href={card.href}>
              <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{card.icon}</span>
                  <span className="text-xs text-slate-500">{card.label}</span>
                </div>
                <div className="text-xl font-bold text-slate-900">{loading ? '...' : formatNumber(count)}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Review Queue Banner ────────────────────────── */}
      {stats && (stats.review_queue?.flagged ?? 0) > 0 && (
        <Link href="/admin/intelligence/review">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between hover:bg-red-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span className="font-medium text-red-800">{stats.review_queue.flagged} items flagged for review</span>
            </div>
            <span className="text-red-600 text-sm">Review →</span>
          </div>
        </Link>
      )}

      {/* ── Data Inventory ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Data Inventory</h2>
            <p className="text-sm text-slate-500">What&apos;s in the Verified Intelligence Layer — sources, vintage, and freshness</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-white"
            >
              <option value="all">All Categories</option>
              <option value="credit">🎓 Credit / IPEDS</option>
              <option value="noncredit">🏭 Noncredit</option>
              <option value="both">📊 Cross-Cutting</option>
              <option value="reference">📎 Reference</option>
            </select>
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 text-sm ${viewMode === 'cards' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >Cards</button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-sm ${viewMode === 'table' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >Table</button>
            </div>
          </div>
        </div>

        {invLoading ? (
          <div className="text-center text-slate-400 py-12">Loading inventory...</div>
        ) : viewMode === 'cards' ? (
          /* ── Card View ──────────────────────────────── */
          <div className="space-y-6">
            {['credit', 'both', 'noncredit', 'reference']
              .filter(cat => filterCategory === 'all' || filterCategory === cat)
              .map(cat => {
                const items = sorted.filter(i => i.category === cat);
                if (items.length === 0) return null;
                const meta = CATEGORY_META[cat];

                return (
                  <div key={cat}>
                    <div className={`text-sm font-semibold ${meta.color} mb-2`}>{meta.label}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {items.map(item => {
                        const isExpanded = expandedItem === item.table;
                        return (
                          <div
                            key={item.table}
                            className={`rounded-lg border p-4 transition-all cursor-pointer ${
                              item.isStale ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-200' :
                              item.count > 0 ? `${meta.bg} ${meta.border}` : 'bg-slate-50 border-slate-200 border-dashed'
                            }`}
                            onClick={() => setExpandedItem(isExpanded ? null : item.table)}
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-semibold text-slate-900">{item.label}</span>
                                {item.isStale && (
                                  <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-medium">STALE</span>
                                )}
                              </div>
                              <span className={`text-lg font-bold ${item.count > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                                {formatNumber(item.count)}
                              </span>
                            </div>

                            {/* Key info row */}
                            <div className="flex items-center gap-3 text-xs mb-1">
                              <span className="text-slate-600">
                                <span className="text-slate-400">Data covers:</span>{' '}
                                <span className="font-semibold">{item.dataPeriod}</span>
                              </span>
                              {item.count > 0 && (
                                <span className="text-slate-400">
                                  Refreshed {timeAgo(item.lastRefreshedAt)}
                                  {item.refreshedBy && <span> by {item.refreshedBy}</span>}
                                </span>
                              )}
                            </div>

                            {/* Source */}
                            <div className="text-xs text-slate-400">
                              Source: <span className="text-slate-600">{item.source}</span>
                              {item.count === 0 && <span className="text-amber-500 font-medium ml-2">⏳ Awaiting data</span>}
                            </div>

                            {/* Stale reason */}
                            {item.isStale && item.staleReason && (
                              <div className="text-xs text-amber-700 mt-1 font-medium">⚠️ {item.staleReason}</div>
                            )}

                            {/* Expanded detail */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-xs">
                                {item.coverageNotes && (
                                  <div><span className="text-slate-400">Coverage:</span> <span className="text-slate-700">{item.coverageNotes}</span></div>
                                )}
                                {item.knownLimitations && (
                                  <div><span className="text-slate-400">Limitations:</span> <span className="text-amber-700">{item.knownLimitations}</span></div>
                                )}
                                {item.citationText && (
                                  <div className="bg-white/60 rounded p-2">
                                    <span className="text-slate-400 block mb-0.5">📝 Citation:</span>
                                    <span className="text-slate-800 italic">{item.citationText}</span>
                                    {item.citationUrl && (
                                      <a href={item.citationUrl} target="_blank" rel="noopener noreferrer" className="block text-purple-600 hover:underline mt-0.5">{item.citationUrl}</a>
                                    )}
                                  </div>
                                )}
                                {item.nextExpectedRelease && (
                                  <div><span className="text-slate-400">Next release:</span> <span className="text-slate-700">{item.nextExpectedRelease}</span></div>
                                )}
                                {item.refreshMethod && (
                                  <div><span className="text-slate-400">Import method:</span> <span className="text-slate-600">{METHOD_LABELS[item.refreshMethod] || item.refreshMethod}</span></div>
                                )}
                                {item.dataReleaseDate && (
                                  <div><span className="text-slate-400">Source published:</span> <span className="text-slate-600">{formatDate(item.dataReleaseDate)}</span></div>
                                )}
                                {item.sourceUrl && (
                                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">🔗 Source documentation →</a>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          /* ── Table View ─────────────────────────────── */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-medium text-slate-500 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('label')}>
                    Dataset{sortIcon('label')}
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-slate-500 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('count')}>
                    Records{sortIcon('count')}
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('dataPeriod')}>
                    Data Period{sortIcon('dataPeriod')}
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('source')}>
                    Source{sortIcon('source')}
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('category')}>
                    Type{sortIcon('category')}
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('lastRefreshedAt')}>
                    Refreshed{sortIcon('lastRefreshedAt')}
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(item => {
                  const catMeta = CATEGORY_META[item.category];
                  return (
                    <tr key={item.table} className={`border-b border-slate-100 ${item.count === 0 ? 'opacity-50' : ''} ${item.isStale ? 'bg-amber-50' : ''}`}>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span className="font-medium text-slate-900">{item.label}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                        {item.count > 0 ? formatNumber(item.count) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{item.dataPeriod}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {item.sourceUrl ? (
                          <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">{item.source}</a>
                        ) : item.source}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${catMeta.bg} ${catMeta.color}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-xs">
                        {item.count > 0 ? (
                          <div>
                            <div>{timeAgo(item.lastRefreshedAt)}</div>
                            {item.refreshedBy && <div className="text-slate-400">by {item.refreshedBy}</div>}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.isStale ? (
                          <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-medium" title={item.staleReason || ''}>⚠️ Stale</span>
                        ) : item.count > 0 ? (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">✅ Current</span>
                        ) : (
                          <span className="text-xs text-slate-400">⏳ Empty</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">Total</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-700">{formatNumber(totalRecords)}</td>
                  <td colSpan={5} className="py-2.5 px-3 text-slate-400 text-sm">
                    {filledTables} active · {emptyTables} awaiting data{staleTables > 0 ? ` · ${staleTables} stale` : ''}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Quick Actions ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/intelligence/wages" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
            <span>💰</span> Add Wage Data
          </Link>
          <Link href="/admin/intelligence/statutes" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
            <span>📜</span> Add Statute
          </Link>
          <Link href="/admin/intelligence/institutions" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
            <span>🏫</span> Add Institution
          </Link>
          <Link href="/admin/intelligence/import" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-sm font-medium text-purple-700">
            <span>📥</span> Import Data
          </Link>
        </div>
      </div>
    </div>
  );
}
