'use client';

import { useState, useEffect } from 'react';
import { IntelSearch, IntelFilter, Badge, Pagination, SortHeader, useIntelData, US_STATES } from '../components';

interface ServiceArea {
  id: string;
  institution_id: string;
  county_fips: string;
  county_name: string;
  state: string;
  is_primary: boolean | null;
  source: string | null;
  notes: string | null;
}

interface Institution {
  id: string;
  name: string;
}

export default function ServiceAreasPage() {
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filterInst, setFilterInst] = useState('');

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterState) params.state = filterState;
  if (filterInst) params.institution_id = filterInst;

  const { data, total, page, totalPages, loading, setPage, sort, dir, toggleSort } = useIntelData<ServiceArea>('service-areas', params);

  // Load institutions for filter
  useEffect(() => {
    fetch('/api/admin/intelligence/institutions?limit=1000&sort=name&dir=asc')
      .then(r => r.json())
      .then(j => {
        if (j.data) {
          // Only show institutions that likely have service areas (Iowa CCs)
          setInstitutions(j.data.map((i: any) => ({ id: i.id, name: i.name })));
        }
      })
      .catch(() => {});
  }, []);

  const instOptions = institutions.map(i => ({ value: i.id, label: i.name }));
  const instName = (id: string) => institutions.find(i => i.id === id)?.name || id.slice(0, 8) + '...';

  return (
    <div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Service Area Mapping</strong> — Maps community colleges to their county service areas. Currently Iowa's 16 CCs with 121 county assignments.
          Used by agents to pull relevant demographics and employer data for institutional service territories.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search by county name..." /></div>
        <IntelFilter value={filterState} onChange={setFilterState} options={US_STATES} placeholder="All States" />
        {instOptions.length > 0 && (
          <IntelFilter value={filterInst} onChange={setFilterInst} options={instOptions} placeholder="All Institutions" />
        )}
      </div>

      <p className="text-sm text-slate-500 mb-4">{total.toLocaleString()} county assignments</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <SortHeader label="County" column="county_name" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="State" column="state" sort={sort} dir={dir} onSort={toggleSort} />
                <th className="text-left px-4 py-3 font-medium text-slate-600">Institution</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">FIPS</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Primary</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Source</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No service areas found.</td></tr>
              ) : data.map(sa => (
                <tr key={sa.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-900 font-medium">{sa.county_name}</td>
                  <td className="px-4 py-3"><Badge color="blue">{sa.state}</Badge></td>
                  <td className="px-4 py-3 text-slate-700 text-sm">{instName(sa.institution_id)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{sa.county_fips}</td>
                  <td className="px-4 py-3 text-center">{sa.is_primary ? <span className="text-green-600">✓</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{sa.source || '—'}</td>
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
