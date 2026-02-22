'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { IntelInstitution, IntelInstitutionProgram, IntelInstitutionCustom } from '@/lib/intelligence/types';
import { Badge, Modal, Field, Input, Select, TextArea, Btn } from '../../components';

export default function InstitutionDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [tab, setTab] = useState<'profile' | 'programs' | 'custom'>('profile');
  const [inst, setInst] = useState<IntelInstitution | null>(null);
  const [programs, setPrograms] = useState<IntelInstitutionProgram[]>([]);
  const [custom, setCustom] = useState<IntelInstitutionCustom[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<IntelInstitution>>({});

  // Add program/custom modals
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [progForm, setProgForm] = useState<Partial<IntelInstitutionProgram>>({ institution_id: id as string, active: true });
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customForm, setCustomForm] = useState<Partial<IntelInstitutionCustom>>({ institution_id: id as string, data_type: 'text', confidence: 'confirmed' });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/intelligence/institutions/${id}`).then(r => r.json()),
      fetch(`/api/admin/intelligence/institutions/${id}/programs`).then(r => r.json()),
      fetch(`/api/admin/intelligence/institutions/${id}/custom`).then(r => r.json()),
    ]).then(([instData, progData, customData]) => {
      setInst(instData); setForm(instData);
      setPrograms(progData.data ?? []);
      setCustom(customData.data ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const saveProfile = async () => {
    await fetch(`/api/admin/intelligence/institutions/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, last_verified: new Date().toISOString(), verified_by: 'matt' }),
    });
    setEditing(false);
    const updated = await fetch(`/api/admin/intelligence/institutions/${id}`).then(r => r.json());
    setInst(updated); setForm(updated);
  };

  const addProgram = async () => {
    await fetch(`/api/admin/intelligence/institutions/${id}/programs`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...progForm, institution_id: id, last_verified: new Date().toISOString(), verified_by: 'matt' }),
    });
    setShowAddProgram(false); setProgForm({ institution_id: id as string, active: true });
    const res = await fetch(`/api/admin/intelligence/institutions/${id}/programs`).then(r => r.json());
    setPrograms(res.data ?? []);
  };

  const addCustom = async () => {
    await fetch(`/api/admin/intelligence/institutions/${id}/custom`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...customForm, institution_id: id, last_verified: new Date().toISOString(), verified_by: 'matt' }),
    });
    setShowAddCustom(false); setCustomForm({ institution_id: id as string, data_type: 'text', confidence: 'confirmed' });
    const res = await fetch(`/api/admin/intelligence/institutions/${id}/custom`).then(r => r.json());
    setCustom(res.data ?? []);
  };

  if (loading) return <div className="text-slate-400 py-8 text-center">Loading...</div>;
  if (!inst) return <div className="text-red-500 py-8 text-center">Institution not found.</div>;

  const TABS = [
    { key: 'profile', label: 'Profile' },
    { key: 'programs', label: `Programs (${programs.length})` },
    { key: 'custom', label: `Custom Data (${custom.length})` },
  ] as const;

  return (
    <div>
      <button onClick={() => router.push('/admin/intelligence/institutions')} className="text-sm text-purple-600 hover:text-purple-800 mb-4">← Back to Institutions</button>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-900">{inst.short_name || inst.name}</h2>
        <Badge color="purple">{inst.type.replace(/_/g, ' ')}</Badge>
        <span className="text-sm text-slate-500">{inst.city}, {inst.state}</span>
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`text-sm font-medium px-4 py-2.5 border-b-2 transition-colors ${tab === t.key ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >{t.label}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Institution Profile</h3>
            <Btn variant={editing ? 'primary' : 'secondary'} onClick={() => editing ? saveProfile() : setEditing(true)}>{editing ? 'Save' : 'Edit'}</Btn>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Name', 'name'], ['Short Name', 'short_name'], ['State', 'state'], ['City', 'city'],
              ['County', 'county'], ['ZIP', 'zip'], ['IPEDS ID', 'ipeds_id'], ['Accreditor', 'accreditor'],
              ['Website', 'website'], ['System', 'system_name'], ['Total Enrollment', 'total_enrollment'],
              ['Credit Enrollment', 'credit_enrollment'], ['Noncredit Enrollment', 'noncredit_enrollment'],
              ['Service Area Population', 'service_area_population'], ['Program Count', 'program_count'],
            ].map(([label, key]) => (
              <div key={key}>
                <span className="text-slate-500">{label}</span>
                {editing ? (
                  <Input value={(form as any)[key] ?? ''} onChange={v => setForm({ ...form, [key]: v })} />
                ) : (
                  <div className="font-medium text-slate-900">{(inst as any)[key] || '—'}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Programs Tab */}
      {tab === 'programs' && (
        <div>
          <div className="flex justify-between mb-4">
            <p className="text-sm text-slate-500">{programs.length} programs</p>
            <Btn onClick={() => setShowAddProgram(true)}>+ Add Program</Btn>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Program</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">CIP</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Credential</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Hours</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Tuition</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {programs.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No programs yet.</td></tr>
                ) : programs.map(p => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900">{p.program_name}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{p.cip_code || '—'}</td>
                    <td className="px-4 py-3"><Badge>{p.credential_level || '—'}</Badge></td>
                    <td className="px-4 py-3 text-right">{p.clock_hours || p.credit_hours || '—'}</td>
                    <td className="px-4 py-3 text-right">{p.tuition ? `$${p.tuition.toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3"><Badge color={p.active ? 'green' : 'red'}>{p.active ? 'Active' : 'Inactive'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Modal open={showAddProgram} onClose={() => setShowAddProgram(false)} title="Add Program" wide>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Program Name" required><Input value={progForm.program_name || ''} onChange={v => setProgForm({ ...progForm, program_name: v })} /></Field>
              <Field label="CIP Code"><Input value={progForm.cip_code || ''} onChange={v => setProgForm({ ...progForm, cip_code: v })} placeholder="51.0805" /></Field>
              <Field label="Credential Level"><Select value={progForm.credential_level || ''} onChange={v => setProgForm({ ...progForm, credential_level: v as any })} options={[{value:'certificate',label:'Certificate'},{value:'diploma',label:'Diploma'},{value:'associate',label:'Associate'},{value:'bachelor',label:'Bachelor'}]} placeholder="Select" /></Field>
              <Field label="Credit Type"><Select value={progForm.credit_type || ''} onChange={v => setProgForm({ ...progForm, credit_type: v as any })} options={[{value:'credit',label:'Credit'},{value:'noncredit',label:'Noncredit'},{value:'both',label:'Both'}]} placeholder="Select" /></Field>
              <Field label="Clock Hours"><Input type="number" value={progForm.clock_hours || ''} onChange={v => setProgForm({ ...progForm, clock_hours: parseInt(v) || undefined })} /></Field>
              <Field label="Tuition"><Input type="number" value={progForm.tuition || ''} onChange={v => setProgForm({ ...progForm, tuition: parseInt(v) || undefined })} /></Field>
              <Field label="Licensure Alignment"><Input value={progForm.licensure_alignment || ''} onChange={v => setProgForm({ ...progForm, licensure_alignment: v })} placeholder="e.g., PTCB Certification" /></Field>
              <Field label="Source"><Input value={progForm.source || ''} onChange={v => setProgForm({ ...progForm, source: v })} placeholder="Catalog 2025-26" /></Field>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Btn variant="secondary" onClick={() => setShowAddProgram(false)}>Cancel</Btn>
              <Btn onClick={addProgram}>Add Program</Btn>
            </div>
          </Modal>
        </div>
      )}

      {/* Custom Data Tab */}
      {tab === 'custom' && (
        <div>
          <div className="flex justify-between mb-4">
            <p className="text-sm text-slate-500">{custom.length} custom data points</p>
            <Btn onClick={() => setShowAddCustom(true)}>+ Add Custom Data</Btn>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Key</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Value</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {custom.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No custom data yet. Add institutional knowledge here.</td></tr>
                ) : custom.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3"><Badge color="blue">{c.data_category}</Badge></td>
                    <td className="px-4 py-3 font-medium text-slate-900">{c.data_key}</td>
                    <td className="px-4 py-3 text-slate-700">{c.data_value}</td>
                    <td className="px-4 py-3 text-slate-500">{c.source || '—'}</td>
                    <td className="px-4 py-3"><Badge color={c.confidence === 'confirmed' ? 'green' : c.confidence === 'estimated' ? 'yellow' : 'slate'}>{c.confidence}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Modal open={showAddCustom} onClose={() => setShowAddCustom(false)} title="Add Custom Data">
            <Field label="Category" required><Input value={customForm.data_category || ''} onChange={v => setCustomForm({ ...customForm, data_category: v })} placeholder="enrollment_detail, program_history, partnerships..." /></Field>
            <Field label="Key" required><Input value={customForm.data_key || ''} onChange={v => setCustomForm({ ...customForm, data_key: v })} placeholder="noncredit_enrollment_2024" /></Field>
            <Field label="Value" required><Input value={customForm.data_value || ''} onChange={v => setCustomForm({ ...customForm, data_value: v })} placeholder="8,234" /></Field>
            <Field label="Source"><Input value={customForm.source || ''} onChange={v => setCustomForm({ ...customForm, source: v })} placeholder="Annual report, personal knowledge, etc." /></Field>
            <Field label="Confidence"><Select value={customForm.confidence || 'confirmed'} onChange={v => setCustomForm({ ...customForm, confidence: v as any })} options={[{value:'confirmed',label:'Confirmed'},{value:'estimated',label:'Estimated'},{value:'reported',label:'Reported'}]} /></Field>
            <Field label="Notes"><Input value={customForm.notes || ''} onChange={v => setCustomForm({ ...customForm, notes: v })} /></Field>
            <div className="flex justify-end gap-3 mt-4">
              <Btn variant="secondary" onClick={() => setShowAddCustom(false)}>Cancel</Btn>
              <Btn onClick={addCustom}>Add Data</Btn>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
