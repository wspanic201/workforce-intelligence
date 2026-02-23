'use client';

import { useState } from 'react';
import { IntelSearch, IntelFilter, Badge, Pagination, SortHeader, useIntelData, US_STATES } from '../components';

interface CountyDemo {
  id: string;
  county_name: string;
  state: string;
  fips_code: string;
  total_population: number | null;
  pct_bachelors_plus: number | null;
  median_household_income: number | null;
  poverty_rate: number | null;
  unemployment_rate: number | null;
  labor_force_total: number | null;
  acs_year: string | null;
}

export default function DemographicsPage() {
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterState) params.state = filterState;

  const { data, total, page, totalPages, loading, setPage, sort, dir, toggleSort } = useIntelData<CountyDemo>('demographics', params);

  const fmt = (n: number | null) => n != null ? n.toLocaleString() : '—';
  const fmtPct = (n: number | null) => n != null ? `${n.toFixed(1)}%` : '—';
  const fmtDollar = (n: number | null) => n != null ? `$${n.toLocaleString()}` : '—';

  const povertyColor = (r: number | null): 'green' | 'yellow' | 'red' | 'slate' => {
    if (r == null) return 'slate';
    if (r < 10) return 'green';
    if (r < 18) return 'yellow';
    return 'red';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search by county name..." /></div>
        <IntelFilter value={filterState} onChange={setFilterState} options={US_STATES} placeholder="All States" />
      </div>

      <p className="text-sm text-slate-500 mb-4">{total.toLocaleString()} counties • Census ACS 2023 (5-year 2019–2023)</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <SortHeader label="County" column="county_name" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="State" column="state" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="Population" column="total_population" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Median Income" column="median_household_income" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Labor Force" column="labor_force_total" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Unemployment" column="unemployment_rate" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Poverty" column="poverty_rate" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Bachelor's+" column="pct_bachelors_plus" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <th className="text-left px-4 py-3 font-medium text-slate-600">FIPS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No demographics found.</td></tr>
              ) : data.map(d => (
                <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-900 font-medium">{d.county_name}</td>
                  <td className="px-4 py-3"><Badge color="blue">{d.state}</Badge></td>
                  <td className="px-4 py-3 text-right text-slate-900">{fmt(d.total_population)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmtDollar(d.median_household_income)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmt(d.labor_force_total)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmtPct(d.unemployment_rate)}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge color={povertyColor(d.poverty_rate)}>{fmtPct(d.poverty_rate)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmtPct(d.pct_bachelors_plus)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{d.fips_code}</td>
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
