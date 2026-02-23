'use client';

import { useState } from 'react';
import { IntelSearch, IntelFilter, Badge, Pagination, SortHeader, useIntelData } from '../components';

const AWARD_LEVELS = [
  { value: '1', label: '< 1 year certificate' },
  { value: '2', label: '1-2 year certificate' },
  { value: '3', label: "Associate's degree" },
  { value: '4', label: '2-4 year certificate' },
  { value: '5', label: "Bachelor's degree" },
  { value: '6', label: 'Postbaccalaureate certificate' },
  { value: '7', label: "Master's degree" },
  { value: '8', label: 'Post-master\'s certificate' },
  { value: '9', label: 'Doctor\'s degree' },
];

interface Completion {
  id: string;
  institution_id: string | null;
  ipeds_id: string;
  year: number;
  cip_code: string;
  cip_title: string;
  award_level: number | null;
  completions_total: number | null;
  completions_men: number | null;
  completions_women: number | null;
  source: string | null;
}

export default function CompletionsPage() {
  const [search, setSearch] = useState('');
  const [filterAward, setFilterAward] = useState('');

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterAward) params.award_level = filterAward;

  const { data, total, page, totalPages, loading, setPage, sort, dir, toggleSort } = useIntelData<Completion>('completions', params);

  const fmt = (n: number | null) => n != null ? n.toLocaleString() : '—';

  const awardLabel = (level: number | null) => {
    if (level == null) return '—';
    return AWARD_LEVELS.find(a => a.value === String(level))?.label || `Level ${level}`;
  };

  const awardColor = (level: number | null): 'purple' | 'blue' | 'green' | 'yellow' | 'slate' => {
    if (level == null) return 'slate';
    if (level <= 2) return 'green';   // certificates
    if (level === 3) return 'blue';   // associate's
    if (level >= 5) return 'purple';  // bachelor's+
    return 'yellow';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search by CIP code, title, or IPEDS ID..." /></div>
        <IntelFilter value={filterAward} onChange={setFilterAward} options={AWARD_LEVELS} placeholder="All Award Levels" />
      </div>

      <p className="text-sm text-slate-500 mb-4">{total.toLocaleString()} completion records • IPEDS 2021</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <SortHeader label="IPEDS" column="ipeds_id" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="CIP Code" column="cip_code" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="Program Title" column="cip_title" sort={sort} dir={dir} onSort={toggleSort} />
                <th className="text-left px-4 py-3 font-medium text-slate-600">Award Level</th>
                <SortHeader label="Total" column="completions_total" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Men" column="completions_men" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Women" column="completions_women" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Year" column="year" sort={sort} dir={dir} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No completions found.</td></tr>
              ) : data.map(c => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.ipeds_id}</td>
                  <td className="px-4 py-3 font-mono text-purple-700 text-xs">{c.cip_code}</td>
                  <td className="px-4 py-3 text-slate-900 max-w-[300px] truncate">{c.cip_title}</td>
                  <td className="px-4 py-3"><Badge color={awardColor(c.award_level)}>{awardLabel(c.award_level)}</Badge></td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmt(c.completions_total)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmt(c.completions_men)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmt(c.completions_women)}</td>
                  <td className="px-4 py-3 text-slate-500">{c.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
