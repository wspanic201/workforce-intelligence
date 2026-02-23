'use client';

import { useState } from 'react';
import { IntelSearch, IntelFilter, Badge, Pagination, SortHeader, useIntelData, US_STATES } from '../components';

interface H1BDemand {
  id: string;
  soc_code: string;
  soc_title: string;
  state: string;
  fiscal_year: string;
  applications_total: number | null;
  applications_certified: number | null;
  applications_denied: number | null;
  applications_withdrawn: number | null;
  median_prevailing_wage: number | null;
  median_offered_wage: number | null;
  top_employers: string[] | null;
  top_metro_areas: string[] | null;
  source: string | null;
}

export default function H1BPage() {
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterState) params.state = filterState;

  const { data, total, page, totalPages, loading, setPage, sort, dir, toggleSort } = useIntelData<H1BDemand>('h1b', params);

  const fmt = (n: number | null) => n != null ? n.toLocaleString() : '—';
  const fmtDollar = (n: number | null) => n != null ? `$${n.toLocaleString()}` : '—';

  const certRate = (d: H1BDemand) => {
    if (!d.applications_total || !d.applications_certified) return null;
    return Math.round((d.applications_certified / d.applications_total) * 100);
  };

  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6">
        <p className="text-sm text-blue-800">
          <strong>H-1B LCA Demand Signals</strong> — Aggregated from DOL Labor Condition Applications. High H-1B demand for an occupation signals talent shortage
          that community college programs could help address locally.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search by SOC code or occupation..." /></div>
        <IntelFilter value={filterState} onChange={setFilterState} options={US_STATES} placeholder="All States" />
      </div>

      <p className="text-sm text-slate-500 mb-4">{total.toLocaleString()} demand signals • DOL H-1B FY2025 Q4</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <SortHeader label="SOC" column="soc_code" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="Occupation" column="soc_title" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="State" column="state" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="Applications" column="applications_total" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Certified" column="applications_certified" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <th className="text-right px-4 py-3 font-medium text-slate-600">Cert Rate</th>
                <SortHeader label="Prevailing Wage" column="median_prevailing_wage" sort={sort} dir={dir} onSort={toggleSort} align="right" />
                <SortHeader label="Offered Wage" column="median_offered_wage" sort={sort} dir={dir} onSort={toggleSort} align="right" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No H-1B records found.</td></tr>
              ) : data.map(d => {
                const rate = certRate(d);
                return (
                  <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-purple-700 text-xs">{d.soc_code}</td>
                    <td className="px-4 py-3 text-slate-900 max-w-[250px] truncate">{d.soc_title}</td>
                    <td className="px-4 py-3"><Badge color="blue">{d.state}</Badge></td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmt(d.applications_total)}</td>
                    <td className="px-4 py-3 text-right text-green-700">{fmt(d.applications_certified)}</td>
                    <td className="px-4 py-3 text-right">
                      {rate != null ? <Badge color={rate >= 80 ? 'green' : rate >= 60 ? 'yellow' : 'red'}>{rate}%</Badge> : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{fmtDollar(d.median_prevailing_wage)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{fmtDollar(d.median_offered_wage)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
