'use client';

import { useState } from 'react';
import type { IntelStatute } from '@/lib/intelligence/types';
import { IntelSearch, IntelFilter, Badge, Modal, Field, Input, TextArea, Select, Btn, Pagination, useIntelData, US_STATES } from '../components';

const STATUSES = [
  { value: 'active', label: 'Active' }, { value: 'repealed', label: 'Repealed' },
  { value: 'amended', label: 'Amended' }, { value: 'pending', label: 'Pending' },
];

const CATEGORIES = [
  { value: 'cosmetology', label: 'Cosmetology' }, { value: 'barbering', label: 'Barbering' },
  { value: 'real_estate', label: 'Real Estate' }, { value: 'healthcare', label: 'Healthcare' },
  { value: 'food_safety', label: 'Food Safety' }, { value: 'education', label: 'Education' },
  { value: 'trades', label: 'Trades' }, { value: 'transportation', label: 'Transportation' },
];

const empty = (): Partial<IntelStatute> => ({
  state: '', code_type: 'statute', code_chapter: '', code_section: '', title: '', summary: '',
  full_text: '', admin_code_ref: '', regulatory_body: '', status: 'active', source_url: '',
  category: '', tags: [], notes: '',
});

export default function StatutesPage() {
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<IntelStatute | null>(null);
  const [form, setForm] = useState<Partial<IntelStatute>>(empty());

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterState) params.state = filterState;
  if (filterStatus) params.status = filterStatus;
  if (filterCategory) params.category = filterCategory;

  const { data, total, page, totalPages, loading, setPage, refetch } = useIntelData<IntelStatute>('statutes', params);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/intelligence/statutes/${editing.id}` : '/api/admin/intelligence/statutes';
    const body = { ...form, last_verified: new Date().toISOString(), verified_by: 'matt' };
    if (typeof body.tags === 'string') body.tags = (body.tags as string).split(',').map(t => t.trim()).filter(Boolean);
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowAdd(false); setEditing(null); setForm(empty()); refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this statute?')) return;
    await fetch(`/api/admin/intelligence/statutes/${id}`, { method: 'DELETE' });
    refetch();
  };

  const statusColor = (s: string) => s === 'active' ? 'green' : s === 'repealed' ? 'red' : s === 'amended' ? 'yellow' : 'slate';

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search statutes..." /></div>
        <IntelFilter value={filterState} onChange={setFilterState} options={US_STATES} placeholder="All States" />
        <IntelFilter value={filterStatus} onChange={setFilterStatus} options={STATUSES} placeholder="All Statuses" />
        <IntelFilter value={filterCategory} onChange={setFilterCategory} options={CATEGORIES} placeholder="All Categories" />
        <Btn onClick={() => { setForm(empty()); setEditing(null); setShowAdd(true); }}>+ Add Statute</Btn>
      </div>

      <p className="text-sm text-slate-500 mb-4">{total} records</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">State</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Chapter</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Regulatory Body</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No statutes found.</td></tr>
            ) : data.map(s => (
              <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-900">{s.state}</td>
                <td className="px-4 py-3 font-mono text-purple-700">{s.code_chapter}{s.code_section ? `.${s.code_section}` : ''}</td>
                <td className="px-4 py-3 text-slate-900">{s.title}</td>
                <td className="px-4 py-3 text-slate-600">{s.regulatory_body || '—'}</td>
                <td className="px-4 py-3"><Badge color={statusColor(s.status) as any}>{s.status}</Badge></td>
                <td className="px-4 py-3 text-slate-500">{s.category || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setForm(s); setEditing(s); setShowAdd(true); }} className="text-purple-600 hover:text-purple-800 mr-3">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditing(null); }} title={editing ? 'Edit Statute' : 'Add Statute'} wide>
        <div className="grid grid-cols-2 gap-4">
          <Field label="State" required><Select value={form.state || ''} onChange={v => setForm({ ...form, state: v })} options={US_STATES} placeholder="Select state" /></Field>
          <Field label="Code Chapter" required><Input value={form.code_chapter || ''} onChange={v => setForm({ ...form, code_chapter: v })} placeholder="157" /></Field>
          <Field label="Code Section"><Input value={form.code_section || ''} onChange={v => setForm({ ...form, code_section: v })} placeholder="157.1 (optional)" /></Field>
          <Field label="Category"><Select value={form.category || ''} onChange={v => setForm({ ...form, category: v })} options={CATEGORIES} placeholder="Select category" /></Field>
          <Field label="Title" required><Input value={form.title || ''} onChange={v => setForm({ ...form, title: v })} placeholder="Barbering and Cosmetology" /></Field>
          <Field label="Status"><Select value={form.status || 'active'} onChange={v => setForm({ ...form, status: v as any })} options={STATUSES} /></Field>
          <Field label="Admin Code Reference"><Input value={form.admin_code_ref || ''} onChange={v => setForm({ ...form, admin_code_ref: v })} placeholder="IAC 481—940-946" /></Field>
          <Field label="Regulatory Body"><Input value={form.regulatory_body || ''} onChange={v => setForm({ ...form, regulatory_body: v })} placeholder="DIAL" /></Field>
          <Field label="Source URL"><Input value={form.source_url || ''} onChange={v => setForm({ ...form, source_url: v })} placeholder="https://legis.iowa.gov/..." /></Field>
          <Field label="Tags (comma-separated)"><Input value={Array.isArray(form.tags) ? form.tags.join(', ') : ''} onChange={v => setForm({ ...form, tags: v.split(',').map(t => t.trim()) })} placeholder="cosmetology, licensing" /></Field>
        </div>
        <Field label="Summary"><TextArea value={form.summary || ''} onChange={v => setForm({ ...form, summary: v })} rows={3} placeholder="Plain-language summary..." /></Field>
        <Field label="Full Statute Text"><TextArea value={form.full_text || ''} onChange={v => setForm({ ...form, full_text: v })} rows={8} placeholder="Paste full statute text here..." /></Field>
        <Field label="Notes"><Input value={form.notes || ''} onChange={v => setForm({ ...form, notes: v })} /></Field>
        <div className="flex justify-end gap-3 mt-4">
          <Btn variant="secondary" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Btn>
          <Btn onClick={handleSave}>{editing ? 'Update' : 'Create'}</Btn>
        </div>
      </Modal>
    </div>
  );
}
