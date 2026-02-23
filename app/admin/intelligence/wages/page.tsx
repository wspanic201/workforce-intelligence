'use client';

import { useState } from 'react';
import type { IntelWage } from '@/lib/intelligence/types';
import { IntelSearch, IntelFilter, Badge, Modal, Field, Input, Select, Btn, Pagination, SortHeader, useIntelData, US_STATES } from '../components';

const GEO_LEVELS = [
  { value: 'national', label: 'National' },
  { value: 'state', label: 'State' },
  { value: 'msa', label: 'MSA' },
];

const emptyWage = (): Partial<IntelWage> => ({
  soc_code: '', occupation_title: '', geo_level: 'national', geo_code: 'national', geo_name: 'National',
  median_annual: 0, mean_annual: 0, pct_10: 0, pct_25: 0, pct_75: 0, pct_90: 0,
  employment: 0, bls_release: 'May 2024', source_url: '', notes: '',
});

export default function WagesPage() {
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterGeo, setFilterGeo] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<IntelWage | null>(null);
  const [form, setForm] = useState<Partial<IntelWage>>(emptyWage());

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterState) params.geo_code = filterState;
  if (filterGeo) params.geo_level = filterGeo;

  const { data, total, page, totalPages, loading, setPage, sort, dir, toggleSort, refetch } = useIntelData<IntelWage>('wages', params);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/intelligence/wages/${editing.id}` : '/api/admin/intelligence/wages';
    const body = { ...form, last_verified: new Date().toISOString(), verified_by: 'matt' };
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowAdd(false); setEditing(null); setForm(emptyWage()); refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this wage record?')) return;
    await fetch(`/api/admin/intelligence/wages/${id}`, { method: 'DELETE' });
    refetch();
  };

  const openEdit = (w: IntelWage) => {
    setForm(w); setEditing(w); setShowAdd(true);
  };

  const fmt = (n: number | null) => n ? `$${n.toLocaleString()}` : '—';

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search by SOC code or occupation..." /></div>
        <IntelFilter value={filterGeo} onChange={setFilterGeo} options={GEO_LEVELS} placeholder="All Geo Levels" />
        <IntelFilter value={filterState} onChange={setFilterState} options={US_STATES} placeholder="All States" />
        <Btn onClick={() => { setForm(emptyWage()); setEditing(null); setShowAdd(true); }}>+ Add Wage</Btn>
      </div>

      <p className="text-sm text-slate-500 mb-4">{total} records</p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <SortHeader label="SOC" column="soc_code" sort={sort} dir={dir} onSort={toggleSort} />
              <SortHeader label="Occupation" column="occupation_title" sort={sort} dir={dir} onSort={toggleSort} />
              <SortHeader label="Median" column="median_annual" sort={sort} dir={dir} onSort={toggleSort} align="right" />
              <SortHeader label="Employment" column="employment" sort={sort} dir={dir} onSort={toggleSort} align="right" />
              <SortHeader label="Geo" column="geo_name" sort={sort} dir={dir} onSort={toggleSort} />
              <SortHeader label="Release" column="bls_release" sort={sort} dir={dir} onSort={toggleSort} />
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No wage records found. Add your first one!</td></tr>
            ) : data.map(w => (
              <tr key={w.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-purple-700">{w.soc_code}</td>
                <td className="px-4 py-3 text-slate-900">{w.occupation_title}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmt(w.median_annual)}</td>
                <td className="px-4 py-3 text-right text-slate-600">{w.employment?.toLocaleString() || '—'}</td>
                <td className="px-4 py-3"><Badge color={w.geo_level === 'national' ? 'purple' : w.geo_level === 'state' ? 'blue' : 'slate'}>{w.geo_name}</Badge></td>
                <td className="px-4 py-3 text-slate-500">{w.bls_release}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(w)} className="text-purple-600 hover:text-purple-800 mr-3">Edit</button>
                  <button onClick={() => handleDelete(w.id)} className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Add/Edit Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditing(null); }} title={editing ? 'Edit Wage Record' : 'Add Wage Record'} wide>
        <div className="grid grid-cols-2 gap-4">
          <Field label="SOC Code" required>
            <Input value={form.soc_code || ''} onChange={v => setForm({ ...form, soc_code: v })} placeholder="29-2052" />
          </Field>
          <Field label="Occupation Title" required>
            <Input value={form.occupation_title || ''} onChange={v => setForm({ ...form, occupation_title: v })} placeholder="Pharmacy Technicians" />
          </Field>
          <Field label="Geo Level">
            <Select value={form.geo_level || 'national'} onChange={v => setForm({ ...form, geo_level: v as any })} options={GEO_LEVELS} />
          </Field>
          <Field label="Geo Code">
            <Input value={form.geo_code || ''} onChange={v => setForm({ ...form, geo_code: v })} placeholder="IA or national" />
          </Field>
          <Field label="Geo Name">
            <Input value={form.geo_name || ''} onChange={v => setForm({ ...form, geo_name: v })} placeholder="Iowa" />
          </Field>
          <Field label="BLS Release" required>
            <Input value={form.bls_release || ''} onChange={v => setForm({ ...form, bls_release: v })} placeholder="May 2024" />
          </Field>
          <Field label="Median Annual">
            <Input type="number" value={form.median_annual || 0} onChange={v => setForm({ ...form, median_annual: parseInt(v) || 0 })} />
          </Field>
          <Field label="Mean Annual">
            <Input type="number" value={form.mean_annual || 0} onChange={v => setForm({ ...form, mean_annual: parseInt(v) || 0 })} />
          </Field>
          <Field label="10th Percentile">
            <Input type="number" value={form.pct_10 || 0} onChange={v => setForm({ ...form, pct_10: parseInt(v) || 0 })} />
          </Field>
          <Field label="25th Percentile">
            <Input type="number" value={form.pct_25 || 0} onChange={v => setForm({ ...form, pct_25: parseInt(v) || 0 })} />
          </Field>
          <Field label="75th Percentile">
            <Input type="number" value={form.pct_75 || 0} onChange={v => setForm({ ...form, pct_75: parseInt(v) || 0 })} />
          </Field>
          <Field label="90th Percentile">
            <Input type="number" value={form.pct_90 || 0} onChange={v => setForm({ ...form, pct_90: parseInt(v) || 0 })} />
          </Field>
          <Field label="Employment">
            <Input type="number" value={form.employment || 0} onChange={v => setForm({ ...form, employment: parseInt(v) || 0 })} />
          </Field>
          <Field label="Source URL">
            <Input value={form.source_url || ''} onChange={v => setForm({ ...form, source_url: v })} placeholder="https://bls.gov/..." />
          </Field>
        </div>
        <Field label="Notes">
          <Input value={form.notes || ''} onChange={v => setForm({ ...form, notes: v })} placeholder="Optional notes..." />
        </Field>
        <div className="flex justify-end gap-3 mt-4">
          <Btn variant="secondary" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Btn>
          <Btn onClick={handleSave}>{editing ? 'Update' : 'Create'}</Btn>
        </div>
      </Modal>
    </div>
  );
}
