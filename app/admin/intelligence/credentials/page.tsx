'use client';

import { useState } from 'react';
import type { IntelCredential } from '@/lib/intelligence/types';
import { IntelSearch, IntelFilter, Badge, Modal, Field, Input, Select, Btn, Pagination, useIntelData, US_STATES } from '../components';

const CRED_TYPES = [
  { value: 'license', label: 'License' }, { value: 'certification', label: 'Certification' },
  { value: 'registration', label: 'Registration' }, { value: 'permit', label: 'Permit' },
];

const empty = (): Partial<IntelCredential> => ({
  state: '', credential_name: '', credential_type: 'license', required_hours: 0,
  hour_type: 'clock', education_requirement: '', exam_required: false, exam_name: '',
  regulatory_body: '', renewal_period_years: 0, ce_hours_required: 0, source_url: '', notes: '',
});

export default function CredentialsPage() {
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<IntelCredential | null>(null);
  const [form, setForm] = useState<Partial<IntelCredential>>(empty());

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterState) params.state = filterState;

  const { data, total, page, totalPages, loading, setPage, refetch } = useIntelData<IntelCredential>('credentials', params);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/intelligence/credentials/${editing.id}` : '/api/admin/intelligence/credentials';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, last_verified: new Date().toISOString(), verified_by: 'matt' }) });
    setShowAdd(false); setEditing(null); setForm(empty()); refetch();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search credentials..." /></div>
        <IntelFilter value={filterState} onChange={setFilterState} options={US_STATES} placeholder="All States" />
        <Btn onClick={() => { setForm(empty()); setEditing(null); setShowAdd(true); }}>+ Add Credential</Btn>
      </div>
      <p className="text-sm text-slate-500 mb-4">{total} credentials</p>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">State</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Credential</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Hours</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Exam</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Regulatory Body</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr> :
            data.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No credentials found.</td></tr> :
            data.map(c => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{c.state}</td>
                <td className="px-4 py-3 text-slate-900">{c.credential_name}</td>
                <td className="px-4 py-3"><Badge>{c.credential_type}</Badge></td>
                <td className="px-4 py-3 text-right">{c.required_hours || '—'}</td>
                <td className="px-4 py-3">{c.exam_required ? <Badge color="green">{c.exam_name || 'Yes'}</Badge> : '—'}</td>
                <td className="px-4 py-3 text-slate-600">{c.regulatory_body || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setForm(c); setEditing(c); setShowAdd(true); }} className="text-purple-600 hover:text-purple-800">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditing(null); }} title={editing ? 'Edit Credential' : 'Add Credential'} wide>
        <div className="grid grid-cols-2 gap-4">
          <Field label="State" required><Select value={form.state || ''} onChange={v => setForm({ ...form, state: v })} options={US_STATES} placeholder="Select" /></Field>
          <Field label="Credential Name" required><Input value={form.credential_name || ''} onChange={v => setForm({ ...form, credential_name: v })} placeholder="Licensed Barber" /></Field>
          <Field label="Type"><Select value={form.credential_type || 'license'} onChange={v => setForm({ ...form, credential_type: v as any })} options={CRED_TYPES} /></Field>
          <Field label="Required Hours"><Input type="number" value={form.required_hours || 0} onChange={v => setForm({ ...form, required_hours: parseInt(v) || 0 })} /></Field>
          <Field label="Exam Required"><Select value={form.exam_required ? 'true' : 'false'} onChange={v => setForm({ ...form, exam_required: v === 'true' })} options={[{value:'true',label:'Yes'},{value:'false',label:'No'}]} /></Field>
          <Field label="Exam Name"><Input value={form.exam_name || ''} onChange={v => setForm({ ...form, exam_name: v })} placeholder="PTCB, NIC, etc." /></Field>
          <Field label="Regulatory Body"><Input value={form.regulatory_body || ''} onChange={v => setForm({ ...form, regulatory_body: v })} placeholder="DIAL" /></Field>
          <Field label="Renewal (years)"><Input type="number" value={form.renewal_period_years || 0} onChange={v => setForm({ ...form, renewal_period_years: parseInt(v) || 0 })} /></Field>
          <Field label="CE Hours for Renewal"><Input type="number" value={form.ce_hours_required || 0} onChange={v => setForm({ ...form, ce_hours_required: parseInt(v) || 0 })} /></Field>
          <Field label="Source URL"><Input value={form.source_url || ''} onChange={v => setForm({ ...form, source_url: v })} /></Field>
        </div>
        <Field label="Education Requirement"><Input value={form.education_requirement || ''} onChange={v => setForm({ ...form, education_requirement: v })} placeholder="2,100 hours from approved school" /></Field>
        <Field label="Notes"><Input value={form.notes || ''} onChange={v => setForm({ ...form, notes: v })} /></Field>
        <div className="flex justify-end gap-3 mt-4"><Btn variant="secondary" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Btn><Btn onClick={handleSave}>{editing ? 'Update' : 'Create'}</Btn></div>
      </Modal>
    </div>
  );
}
