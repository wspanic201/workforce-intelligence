'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { IntelInstitution } from '@/lib/intelligence/types';
import { IntelSearch, IntelFilter, Badge, Modal, Field, Input, Select, Btn, Pagination, SortHeader, useIntelData, US_STATES } from '../components';

const TYPES = [
  { value: 'community_college', label: 'Community College' },
  { value: 'technical_college', label: 'Technical College' },
  { value: '4yr_public', label: '4-Year Public' },
  { value: '4yr_private', label: '4-Year Private' },
];

const empty = (): Partial<IntelInstitution> => ({
  name: '', short_name: '', state: '', city: '', county: '', zip: '', ipeds_id: '',
  type: 'community_college', accreditor: '', website: '', system_name: '',
  total_enrollment: 0, service_area_population: 0, notes: '',
});

export default function InstitutionsPage() {
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<IntelInstitution>>(empty());

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterState) params.state = filterState;
  if (filterType) params.type = filterType;

  const { data, total, page, totalPages, loading, setPage, sort, dir, toggleSort, refetch } = useIntelData<IntelInstitution>('institutions', params);

  const handleSave = async () => {
    const body = { ...form, last_verified: new Date().toISOString(), verified_by: 'matt' };
    await fetch('/api/admin/intelligence/institutions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowAdd(false); setForm(empty()); refetch();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search by name, city, IPEDS ID..." /></div>
        <IntelFilter value={filterState} onChange={setFilterState} options={US_STATES} placeholder="All States" />
        <IntelFilter value={filterType} onChange={setFilterType} options={TYPES} placeholder="All Types" />
        <Btn onClick={() => { setForm(empty()); setShowAdd(true); }}>+ Add Institution</Btn>
      </div>

      <p className="text-sm text-slate-500 mb-4">{total} institutions</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <SortHeader label="Institution" column="name" sort={sort} dir={dir} onSort={toggleSort} />
              <SortHeader label="State" column="state" sort={sort} dir={dir} onSort={toggleSort} />
              <SortHeader label="City" column="city" sort={sort} dir={dir} onSort={toggleSort} />
              <SortHeader label="County" column="county" sort={sort} dir={dir} onSort={toggleSort} />
              <SortHeader label="Type" column="type" sort={sort} dir={dir} onSort={toggleSort} />
              <SortHeader label="Enrollment" column="total_enrollment" sort={sort} dir={dir} onSort={toggleSort} align="right" />
              <SortHeader label="IPEDS" column="ipeds_id" sort={sort} dir={dir} onSort={toggleSort} />
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No institutions found.</td></tr>
            ) : data.map(inst => (
              <tr key={inst.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/intelligence/institutions/${inst.id}`} className="text-purple-700 hover:text-purple-900 font-semibold">
                    {inst.short_name || inst.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700">{inst.state}</td>
                <td className="px-4 py-3 text-slate-600">{inst.city}</td>
                <td className="px-4 py-3 text-slate-500">{inst.county || '—'}</td>
                <td className="px-4 py-3"><Badge>{inst.type.replace(/_/g, ' ')}</Badge></td>
                <td className="px-4 py-3 text-right text-slate-900">{inst.total_enrollment?.toLocaleString() || '—'}</td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">{inst.ipeds_id || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/intelligence/institutions/${inst.id}`} className="text-purple-600 hover:text-purple-800">View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Institution" wide>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" required><Input value={form.name || ''} onChange={v => setForm({ ...form, name: v })} placeholder="Kirkwood Community College" /></Field>
          <Field label="Short Name"><Input value={form.short_name || ''} onChange={v => setForm({ ...form, short_name: v })} placeholder="Kirkwood" /></Field>
          <Field label="State" required><Select value={form.state || ''} onChange={v => setForm({ ...form, state: v })} options={US_STATES} placeholder="Select" /></Field>
          <Field label="City"><Input value={form.city || ''} onChange={v => setForm({ ...form, city: v })} placeholder="Cedar Rapids" /></Field>
          <Field label="IPEDS ID"><Input value={form.ipeds_id || ''} onChange={v => setForm({ ...form, ipeds_id: v })} placeholder="153658" /></Field>
          <Field label="Type"><Select value={form.type || 'community_college'} onChange={v => setForm({ ...form, type: v as any })} options={TYPES} /></Field>
          <Field label="Accreditor"><Input value={form.accreditor || ''} onChange={v => setForm({ ...form, accreditor: v })} placeholder="HLC" /></Field>
          <Field label="Website"><Input value={form.website || ''} onChange={v => setForm({ ...form, website: v })} placeholder="https://kirkwood.edu" /></Field>
          <Field label="Total Enrollment"><Input type="number" value={form.total_enrollment || 0} onChange={v => setForm({ ...form, total_enrollment: parseInt(v) || 0 })} /></Field>
          <Field label="Service Area Population"><Input type="number" value={form.service_area_population || 0} onChange={v => setForm({ ...form, service_area_population: parseInt(v) || 0 })} /></Field>
        </div>
        <Field label="Notes"><Input value={form.notes || ''} onChange={v => setForm({ ...form, notes: v })} /></Field>
        <div className="flex justify-end gap-3 mt-4">
          <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
          <Btn onClick={handleSave}>Create</Btn>
        </div>
      </Modal>
    </div>
  );
}
