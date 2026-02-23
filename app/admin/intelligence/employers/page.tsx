'use client';

import { useState } from 'react';
import type { IntelEmployer } from '@/lib/intelligence/types';
import { IntelSearch, IntelFilter, Badge, Modal, Field, Input, Select, Btn, Pagination, SortHeader, useIntelData, US_STATES } from '../components';

// NAICS 2-digit sector lookup
const NAICS_SECTORS: Record<string, string> = {
  '11': 'Agriculture, Forestry, Fishing & Hunting',
  '21': 'Mining, Quarrying & Oil/Gas Extraction',
  '22': 'Utilities',
  '23': 'Construction',
  '31-33': 'Manufacturing',
  '42': 'Wholesale Trade',
  '44-45': 'Retail Trade',
  '48-49': 'Transportation & Warehousing',
  '51': 'Information',
  '52': 'Finance & Insurance',
  '53': 'Real Estate & Rental/Leasing',
  '54': 'Professional, Scientific & Technical Services',
  '55': 'Management of Companies',
  '56': 'Administrative & Waste Management Services',
  '61': 'Educational Services',
  '62': 'Health Care & Social Assistance',
  '71': 'Arts, Entertainment & Recreation',
  '72': 'Accommodation & Food Services',
  '81': 'Other Services (except Public Admin)',
  '92': 'Public Administration',
};

const NAICS_OPTIONS = Object.entries(NAICS_SECTORS).map(([code, name]) => ({
  value: code,
  label: `${code} — ${name}`,
}));

function naicsLabel(code: string | null): string {
  if (!code) return '—';
  return NAICS_SECTORS[code] || code;
}

// Extract county from the employer_name field (format: "11 - Autauga County")
function parseCounty(name: string): string {
  const match = name?.match(/^\d+(?:-\d+)?\s*-\s*(.+)$/);
  return match ? match[1] : name || '—';
}

// Parse establishment count from notes (format: "10 establishments, 52 employees...")
function parseEstablishments(notes: string | null): number | null {
  if (!notes) return null;
  const match = notes.match(/^(\d+)\s+establishments?/);
  return match ? parseInt(match[1]) : null;
}

const empty = (): Partial<IntelEmployer> => ({
  employer_name: '', industry: '', naics_code: '', state: '', city: '', msa: '',
  estimated_employees: 0, key_occupations: [], source_url: '', is_hiring: true,
  partnership_potential: '', recent_investments: '',
});

export default function EmployersPage() {
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterNaics, setFilterNaics] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<IntelEmployer | null>(null);
  const [form, setForm] = useState<Partial<IntelEmployer>>(empty());

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterState) params.state = filterState;
  if (filterNaics) params.naics_code = filterNaics;

  const { data, total, page, totalPages, loading, setPage, sort, dir, toggleSort, refetch } = useIntelData<IntelEmployer>('employers', params);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/intelligence/employers/${editing.id}` : '/api/admin/intelligence/employers';
    const body = { ...form, last_verified: new Date().toISOString(), verified_by: 'matt' };
    if (typeof body.key_occupations === 'string') body.key_occupations = (body.key_occupations as string).split(',').map(t => t.trim()).filter(Boolean);
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowAdd(false); setEditing(null); setForm(empty()); refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    await fetch(`/api/admin/intelligence/employers/${id}`, { method: 'DELETE' });
    refetch();
  };

  return (
    <div>
      {/* Info banner explaining what this data is */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-lg">🏢</span>
          <div className="text-sm">
            <p className="font-semibold text-purple-900 mb-1">Census County Business Patterns (CBP) 2022</p>
            <p className="text-purple-700">
              Industry-level establishment and employee counts by county — <strong>not individual employers</strong>. 
              Each row shows how many businesses and employees exist for a given NAICS sector in a given county. 
              Use this to understand the economic composition of an institution&apos;s service area.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search by county, state..." /></div>
        <IntelFilter value={filterState} onChange={setFilterState} options={US_STATES} placeholder="All States" />
        <IntelFilter value={filterNaics} onChange={setFilterNaics} options={NAICS_OPTIONS} placeholder="All Industries" />
        <Btn onClick={() => { setForm(empty()); setEditing(null); setShowAdd(true); }}>+ Add Record</Btn>
      </div>
      <p className="text-sm text-slate-500 mb-4">{total?.toLocaleString()} industry-county records</p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <SortHeader label="County" column="city" sort={sort} dir={dir} onSort={toggleSort} />
              <SortHeader label="State" column="state" sort={sort} dir={dir} onSort={toggleSort} />
              <SortHeader label="NAICS" column="naics_code" sort={sort} dir={dir} onSort={toggleSort} />
              <th className="text-left px-4 py-3 font-medium text-slate-600">Industry Sector</th>
              <SortHeader label="Establishments" column="employer_name" sort={sort} dir={dir} onSort={toggleSort} align="right" />
              <SortHeader label="Employees" column="estimated_employees" sort={sort} dir={dir} onSort={toggleSort} align="right" />
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr> :
            data.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No records found.</td></tr> :
            data.map(e => {
              const estCount = parseEstablishments(e.notes as string);
              return (
                <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{parseCounty(e.employer_name)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{e.state}</td>
                  <td className="px-4 py-3 font-mono text-purple-700">{e.naics_code}</td>
                  <td className="px-4 py-3 text-slate-600">{naicsLabel(e.naics_code)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{estCount?.toLocaleString() || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{e.estimated_employees?.toLocaleString() || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setForm(e); setEditing(e); setShowAdd(true); }} className="text-purple-600 hover:text-purple-800 mr-3">Edit</button>
                    <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Add/Edit Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditing(null); }} title={editing ? 'Edit Record' : 'Add Industry Record'} wide>
        <div className="grid grid-cols-2 gap-4">
          <Field label="County/Area" required><Input value={form.city || ''} onChange={v => setForm({ ...form, city: v })} placeholder="Johnson County" /></Field>
          <Field label="State"><Select value={form.state || ''} onChange={v => setForm({ ...form, state: v })} options={US_STATES} placeholder="Select" /></Field>
          <Field label="NAICS Sector"><Select value={form.naics_code || ''} onChange={v => setForm({ ...form, naics_code: v, industry: v })} options={NAICS_OPTIONS} placeholder="Select industry" /></Field>
          <Field label="Est. Employees"><Input type="number" value={form.estimated_employees || 0} onChange={v => setForm({ ...form, estimated_employees: parseInt(v) || 0 })} /></Field>
          <Field label="Source URL"><Input value={form.source_url || ''} onChange={v => setForm({ ...form, source_url: v })} /></Field>
          <Field label="MSA"><Input value={form.msa || ''} onChange={v => setForm({ ...form, msa: v })} placeholder="Cedar Rapids, IA" /></Field>
        </div>
        <Field label="Notes"><Input value={form.notes || ''} onChange={v => setForm({ ...form, notes: v })} placeholder="10 establishments, 52 employees..." /></Field>
        <div className="flex justify-end gap-3 mt-4"><Btn variant="secondary" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Btn><Btn onClick={handleSave}>{editing ? 'Update' : 'Create'}</Btn></div>
      </Modal>
    </div>
  );
}
