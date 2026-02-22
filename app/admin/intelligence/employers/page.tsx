'use client';

import { useState } from 'react';
import type { IntelEmployer } from '@/lib/intelligence/types';
import { IntelSearch, IntelFilter, Badge, Modal, Field, Input, Select, Btn, Pagination, useIntelData, US_STATES } from '../components';

const empty = (): Partial<IntelEmployer> => ({
  employer_name: '', industry: '', naics_code: '', state: '', city: '', msa: '',
  estimated_employees: 0, key_occupations: [], source_url: '', is_hiring: true,
  partnership_potential: '', recent_investments: '',
});

export default function EmployersPage() {
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<IntelEmployer | null>(null);
  const [form, setForm] = useState<Partial<IntelEmployer>>(empty());

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterState) params.state = filterState;

  const { data, total, page, totalPages, loading, setPage, refetch } = useIntelData<IntelEmployer>('employers', params);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/intelligence/employers/${editing.id}` : '/api/admin/intelligence/employers';
    const body = { ...form, last_verified: new Date().toISOString(), verified_by: 'matt' };
    if (typeof body.key_occupations === 'string') body.key_occupations = (body.key_occupations as string).split(',').map(t => t.trim()).filter(Boolean);
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowAdd(false); setEditing(null); setForm(empty()); refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employer?')) return;
    await fetch(`/api/admin/intelligence/employers/${id}`, { method: 'DELETE' });
    refetch();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search employers, industries..." /></div>
        <IntelFilter value={filterState} onChange={setFilterState} options={US_STATES} placeholder="All States" />
        <Btn onClick={() => { setForm(empty()); setEditing(null); setShowAdd(true); }}>+ Add Employer</Btn>
      </div>
      <p className="text-sm text-slate-500 mb-4">{total} employers</p>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Employer</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Industry</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Location</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Est. Employees</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Hiring For</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr> :
            data.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No employers found.</td></tr> :
            data.map(e => (
              <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-900">{e.employer_name}</td>
                <td className="px-4 py-3 text-slate-600">{e.industry || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{[e.city, e.state].filter(Boolean).join(', ') || '—'}</td>
                <td className="px-4 py-3 text-right">{e.estimated_employees?.toLocaleString() || '—'}</td>
                <td className="px-4 py-3">{e.key_occupations?.length ? e.key_occupations.slice(0, 2).map(o => <Badge key={o}>{o}</Badge>) : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setForm(e); setEditing(e); setShowAdd(true); }} className="text-purple-600 hover:text-purple-800 mr-3">Edit</button>
                  <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditing(null); }} title={editing ? 'Edit Employer' : 'Add Employer'} wide>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Employer Name" required><Input value={form.employer_name || ''} onChange={v => setForm({ ...form, employer_name: v })} placeholder="UnityPoint Health" /></Field>
          <Field label="Industry"><Input value={form.industry || ''} onChange={v => setForm({ ...form, industry: v })} placeholder="Healthcare" /></Field>
          <Field label="NAICS Code"><Input value={form.naics_code || ''} onChange={v => setForm({ ...form, naics_code: v })} placeholder="622110" /></Field>
          <Field label="State"><Select value={form.state || ''} onChange={v => setForm({ ...form, state: v })} options={US_STATES} placeholder="Select" /></Field>
          <Field label="City"><Input value={form.city || ''} onChange={v => setForm({ ...form, city: v })} placeholder="Cedar Rapids" /></Field>
          <Field label="MSA"><Input value={form.msa || ''} onChange={v => setForm({ ...form, msa: v })} placeholder="Cedar Rapids, IA" /></Field>
          <Field label="Est. Employees"><Input type="number" value={form.estimated_employees || 0} onChange={v => setForm({ ...form, estimated_employees: parseInt(v) || 0 })} /></Field>
          <Field label="Source URL"><Input value={form.source_url || ''} onChange={v => setForm({ ...form, source_url: v })} /></Field>
          <Field label="Key Occupations (comma-separated)"><Input value={Array.isArray(form.key_occupations) ? form.key_occupations.join(', ') : ''} onChange={v => setForm({ ...form, key_occupations: v.split(',').map(t => t.trim()) })} placeholder="Pharmacy Tech, CNA, CDL Driver" /></Field>
        </div>
        <Field label="Recent Investments"><Input value={form.recent_investments || ''} onChange={v => setForm({ ...form, recent_investments: v })} placeholder="New facility, expansion..." /></Field>
        <Field label="Partnership Potential"><Input value={form.partnership_potential || ''} onChange={v => setForm({ ...form, partnership_potential: v })} placeholder="Advisory board, clinical sites..." /></Field>
        <div className="flex justify-end gap-3 mt-4"><Btn variant="secondary" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Btn><Btn onClick={handleSave}>{editing ? 'Update' : 'Create'}</Btn></div>
      </Modal>
    </div>
  );
}
