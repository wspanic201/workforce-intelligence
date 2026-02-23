'use client';

import { useState } from 'react';
import { IntelSearch, IntelFilter, Badge, Pagination, SortHeader, useIntelData, US_STATES } from '../components';

const EDUCATION_LEVELS = [
  { value: 'No formal educational credential', label: 'No formal credential' },
  { value: 'High school diploma or equivalent', label: 'High school diploma' },
  { value: 'Postsecondary nondegree award', label: 'Postsecondary nondegree' },
  { value: 'Some college, no degree', label: 'Some college' },
  { value: "Associate's degree", label: "Associate's" },
  { value: "Bachelor's degree", label: "Bachelor's" },
  { value: "Master's degree", label: "Master's" },
  { value: 'Doctoral or professional degree', label: 'Doctoral/Professional' },
];

const GROWTH_CATS = [
  { value: 'Much faster than average', label: 'Much faster' },
  { value: 'Faster than average', label: 'Faster' },
  { value: 'As fast as average', label: 'Average' },
  { value: 'Slower than average', label: 'Slower' },
  { value: 'Decline', label: 'Decline' },
];

interface Projection {
  id: string;
  soc_code: string;
  occupation_title: string;
  base_year: number;
  projected_year: number;
  employment_base: number | null;
  employment_projected: number | null;
  change_number: number | null;
  change_percent: number | null;
  annual_openings: number | null;
  median_annual_wage: number | null;
  typical_education: string | null;
  growth_category: string | null;
  geo_level: string;
  geo_code: string;
  source: string | null;
}

export default function ProjectionsPage() {
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterEd, setFilterEd] = useState('');

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterState) params.geo_code = filterState;
  if (filterEd) params.typical_education = filterEd;

  const { data, total, page, totalPages, loading, setPage, sort, dir, toggleSort } = useIntelData<Projection>('projections', params);

  const fmt = (n: number | null) => n != null ? n.toLocaleString() : '—';
  const fmtPct = (n: number | null) => n != null ? `${n > 0 ? '+' : ''}${n.toFixed(1)}%` : '—';
  const fmtDollar = (n: number | null) => n != null ? `$${n.toLocaleString()}` : '—';

  const growthColor = (pct: number | null): 'green' | 'blue' | 'yellow' | 'red' | 'slate' => {
    if (pct == null) return 'slate';
    if (pct >= 15) return 'green';
    if (pct >= 5) return 'blue';
    if (pct >= 0) return 'yellow';
    return 'red';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search by SOC code or occupation..." /></div>
        <IntelFilter value={filterState} onChange={setFilterState} options={US_STATES} placeholder="All States" />
        <IntelFilter value={filterEd} onChange={setFilterEd} options={EDUCATION_LEVELS} placeholder="All Education" />
      </div>

      <p className="text-sm text-slate-500 mb-4">{total.toLocaleString()} projections • Projections Central 2022–2032</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <SortHeader label="SOC" column="soc_code" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="Occupation" column="occupation_title" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="State" column="geo_code" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="Growth %" column="change_percent" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Change" column="change_number" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Annual Openings" column="annual_openings" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Base Empl." column="employment_base" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Median Wage" column="median_annual_wage" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <th className="text-left px-4 py-3 font-medium text-slate-600">Education</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No projections found.</td></tr>
              ) : data.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-purple-700 text-xs">{p.soc_code}</td>
                  <td className="px-4 py-3 text-slate-900 max-w-[250px] truncate">{p.occupation_title}</td>
                  <td className="px-4 py-3"><Badge color="blue">{p.geo_code}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Badge color={growthColor(p.change_percent)}>{fmtPct(p.change_percent)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmt(p.change_number)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmt(p.annual_openings)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmt(p.employment_base)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmtDollar(p.median_annual_wage)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-[150px] truncate">{p.typical_education || '—'}</td>
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
