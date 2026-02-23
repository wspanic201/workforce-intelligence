'use client';

import { useState } from 'react';
import { IntelSearch, IntelFilter, Badge, Pagination, SortHeader, useIntelData, US_STATES } from '../components';

interface StatePriority {
  id: string;
  state: string;
  occupation_title: string;
  soc_code: string | null;
  sector: string | null;
  priority_level: string | null;
  designation_source: string | null;
  scholarship_eligible: boolean | null;
  wioa_fundable: boolean | null;
  etpl_required: boolean | null;
  entry_hourly_wage: number | null;
  entry_annual_salary: number | null;
  median_annual_wage: number | null;
  effective_year: string | null;
  plan_cycle: string | null;
  source_url: string | null;
  source_document: string | null;
  notes: string | null;
}

export default function StatePrioritiesPage() {
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterSector, setFilterSector] = useState('');

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterState) params.state = filterState;
  if (filterSector) params.sector = filterSector;

  const { data, total, page, totalPages, loading, setPage, sort, dir, toggleSort } = useIntelData<StatePriority>('state-priorities', params);

  const fmtDollar = (n: number | null) => n != null ? `$${n.toLocaleString()}` : '—';

  // Get unique sectors from data for filter
  const SECTORS = [
    { value: 'Advanced Manufacturing', label: 'Advanced Manufacturing' },
    { value: 'Biosciences', label: 'Biosciences' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Transportation & Logistics', label: 'Transportation & Logistics' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Education', label: 'Education' },
    { value: 'Finance & Insurance', label: 'Finance & Insurance' },
  ];

  const sectorColor = (s: string | null): 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'slate' => {
    const map: Record<string, 'purple' | 'blue' | 'green' | 'yellow' | 'red'> = {
      'Advanced Manufacturing': 'blue',
      'Biosciences': 'green',
      'Information Technology': 'purple',
      'Healthcare': 'red',
      'Transportation & Logistics': 'yellow',
      'Construction': 'yellow',
      'Education': 'blue',
      'Finance & Insurance': 'green',
    };
    return (s && map[s]) || 'slate';
  };

  return (
    <div>
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6">
        <p className="text-sm text-green-800">
          <strong>State Priority Occupations</strong> — Programs aligned with these occupations are eligible for WIOA funding, state scholarships,
          and often get expedited approval. Key for institutional fit analysis and report recommendations.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search by occupation or SOC code..." /></div>
        <IntelFilter value={filterState} onChange={setFilterState} options={US_STATES} placeholder="All States" />
        <IntelFilter value={filterSector} onChange={setFilterSector} options={SECTORS} placeholder="All Sectors" />
      </div>

      <p className="text-sm text-slate-500 mb-4">{total.toLocaleString()} priority occupations</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <SortHeader label="Occupation" column="occupation_title" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="SOC" column="soc_code" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="State" column="state" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="Sector" column="sector" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="Entry Wage" column="entry_annual_salary" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Median Wage" column="median_annual_wage" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <th className="text-center px-4 py-3 font-medium text-slate-600">WIOA</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Scholarship</th>
                <SortHeader label="Year" column="effective_year" sort={sort} dir={dir} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No state priorities found.</td></tr>
              ) : data.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-900 font-medium max-w-[250px] truncate">{p.occupation_title}</td>
                  <td className="px-4 py-3 font-mono text-purple-700 text-xs">{p.soc_code || '—'}</td>
                  <td className="px-4 py-3"><Badge color="blue">{p.state}</Badge></td>
                  <td className="px-4 py-3"><Badge color={sectorColor(p.sector)}>{p.sector || '—'}</Badge></td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmtDollar(p.entry_annual_salary)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmtDollar(p.median_annual_wage)}</td>
                  <td className="px-4 py-3 text-center">{p.wioa_fundable ? <span className="text-green-600">✓</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-center">{p.scholarship_eligible ? <span className="text-green-600">✓</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-slate-500">{p.effective_year || '—'}</td>
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
