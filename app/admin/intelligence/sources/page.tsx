'use client';

import { useEffect, useState } from 'react';
import type { IntelSource } from '@/lib/intelligence/types';
import { IntelSearch, IntelFilter, Badge, Modal, Field, Input, TextArea, Select, Btn, Pagination, SortHeader, useIntelData } from '../components';

const SOURCE_TYPES = [
  { value: 'government', label: '🏛️ Government' }, { value: 'research', label: '🎓 Research' },
  { value: 'industry', label: '🏢 Industry' }, { value: 'news', label: '📰 News' },
  { value: 'internal', label: '🔒 Internal' },
];

const empty = (): Partial<IntelSource> => ({
  title: '', source_type: 'government', publisher: '', published_date: '',
  url: '', summary: '', reliability: 'verified', topics: [],
});

export default function SourcesPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<IntelSource | null>(null);
  const [form, setForm] = useState<Partial<IntelSource>>(empty());
  const [institutions, setInstitutions] = useState<Array<{ id: string; name: string; short_name?: string | null }>>([]);
  const [instQuery, setInstQuery] = useState('');

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterType) params.source_type = filterType;

  const { data, total, page, totalPages, loading, setPage, sort, dir, toggleSort, refetch } = useIntelData<IntelSource>('sources', params);

  useEffect(() => {
    fetch('/api/admin/intelligence/institutions?limit=500')
      .then(r => r.json())
      .then(res => setInstitutions(res?.data || []))
      .catch(() => setInstitutions([]));
  }, []);

  const toggleInstitution = (instId: string) => {
    const current = Array.isArray(form.institution_ids) ? form.institution_ids : [];
    const next = current.includes(instId)
      ? current.filter(id => id !== instId)
      : [...current, instId];
    setForm({ ...form, institution_ids: next });
  };

  const selectedInstitutionIds = Array.isArray(form.institution_ids) ? form.institution_ids : [];
  const selectedInstitutions = selectedInstitutionIds
    .map(id => institutions.find(i => i.id === id))
    .filter(Boolean) as Array<{ id: string; name: string; short_name?: string | null }>;

  const institutionMatches = institutions
    .filter(inst => {
      if (selectedInstitutionIds.includes(inst.id)) return false;
      const q = instQuery.trim().toLowerCase();
      if (!q) return false;
      return (
        inst.name.toLowerCase().includes(q) ||
        (inst.short_name || '').toLowerCase().includes(q)
      );
    })
    .slice(0, 12);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/intelligence/sources/${editing.id}` : '/api/admin/intelligence/sources';
    const body = { ...form };
    if (typeof body.topics === 'string') body.topics = (body.topics as string).split(',').map(t => t.trim()).filter(Boolean);
    if (!Array.isArray(body.institution_ids)) body.institution_ids = [];
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowAdd(false); setEditing(null); setInstQuery(''); setForm(empty()); refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this source?')) return;
    await fetch(`/api/admin/intelligence/sources/${id}`, { method: 'DELETE' });
    refetch();
  };

  const typeIcon = (t: string) => t === 'government' ? '🏛️' : t === 'academic' ? '🎓' : t === 'industry' ? '🏢' : t === 'news' ? '📰' : '🔒';

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search sources, publishers..." /></div>
        <IntelFilter value={filterType} onChange={setFilterType} options={SOURCE_TYPES} placeholder="All Types" />
        <Btn onClick={() => { setForm(empty()); setEditing(null); setInstQuery(''); setShowAdd(true); }}>+ Clip Source</Btn>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
        <span>{total} sources</span>
        <span className="text-slate-300">|</span>
        <span className="text-xs text-slate-400">Sort by:</span>
        {[
          { label: 'Title', col: 'title' },
          { label: 'Publisher', col: 'publisher' },
          { label: 'Date', col: 'published_date' },
          { label: 'Type', col: 'source_type' },
          { label: 'Reliability', col: 'reliability' },
        ].map(s => (
          <button
            key={s.col}
            onClick={() => toggleSort(s.col)}
            className={`text-xs px-2 py-1 rounded transition-colors ${sort === s.col ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-slate-500 hover:text-purple-600'}`}
          >
            {s.label} {sort === s.col ? (dir === 'asc' ? '▲' : '▼') : ''}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {loading ? <div className="text-center text-slate-400 py-8">Loading...</div> :
        data.length === 0 ? <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">No sources yet. Clip your first one!</div> :
        data.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{typeIcon(s.source_type)}</span>
                  <span className="font-semibold text-slate-900">{s.title}</span>
                  {s.reliability && (
                    <Badge color={s.reliability === 'official' ? 'green' : s.reliability === 'verified' ? 'blue' : 'yellow'}>
                      {s.reliability}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                  {s.publisher && <span>{s.publisher}</span>}
                  {s.published_date && <span>{s.published_date}</span>}
                  {s.url && <a href={s.url} target="_blank" className="text-purple-600 hover:underline">{new URL(s.url).hostname}</a>}
                </div>
                {s.summary && <p className="text-sm text-slate-600">{s.summary}</p>}
                {s.topics?.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">{s.topics.map(t => <Badge key={t}>{t}</Badge>)}</div>
                )}
                {s.institution_ids?.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {s.institution_ids.slice(0, 4).map(instId => {
                      const inst = institutions.find(i => i.id === instId);
                      return <Badge key={instId} color="purple">🏫 {inst?.short_name || inst?.name || instId.slice(0, 8)}</Badge>;
                    })}
                    {s.institution_ids.length > 4 && <Badge>+{s.institution_ids.length - 4} more</Badge>}
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => { setForm(s); setEditing(s); setInstQuery(''); setShowAdd(true); }} className="text-purple-600 hover:text-purple-800 text-sm">Edit</button>
                <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditing(null); setInstQuery(''); }} title={editing ? 'Edit Source' : 'Clip a Source'} wide>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title" required><Input value={form.title || ''} onChange={v => setForm({ ...form, title: v })} placeholder="BLS Occupational Employment and Wages, May 2024" /></Field>
          <Field label="Type"><Select value={form.source_type || 'government'} onChange={v => setForm({ ...form, source_type: v as any })} options={SOURCE_TYPES} /></Field>
          <Field label="Publisher"><Input value={form.publisher || ''} onChange={v => setForm({ ...form, publisher: v })} placeholder="Bureau of Labor Statistics" /></Field>
          <Field label="Publish Date"><Input type="date" value={form.published_date || ''} onChange={v => setForm({ ...form, published_date: v })} /></Field>
          <Field label="URL"><Input value={form.url || ''} onChange={v => setForm({ ...form, url: v })} placeholder="https://bls.gov/..." /></Field>
          <Field label="Reliability"><Select value={form.reliability || 'verified'} onChange={v => setForm({ ...form, reliability: v as any })} options={[{value:'official',label:'Official'},{value:'verified',label:'Verified'},{value:'unverified',label:'Unverified'}]} /></Field>
        </div>
        <Field label="Summary"><TextArea value={form.summary || ''} onChange={v => setForm({ ...form, summary: v })} rows={3} placeholder="What this source covers and why it matters..." /></Field>
        <Field label="Topics (comma-separated)"><Input value={Array.isArray(form.topics) ? form.topics.join(', ') : ''} onChange={v => setForm({ ...form, topics: v.split(',').map(t => t.trim()) })} placeholder="BLS, wages, Iowa" /></Field>
        <Field label="Link to Institutions">
          <div className="border border-slate-200 rounded-lg p-3">
            <Input
              value={instQuery}
              onChange={setInstQuery}
              placeholder="Type institution name (e.g., Kirkwood, Des Moines Area, Valencia...)"
            />

            {instQuery.trim().length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-slate-100 rounded-md">
                {institutionMatches.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-slate-400">No matches</div>
                ) : institutionMatches.map(inst => (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => {
                      toggleInstitution(inst.id);
                      setInstQuery('');
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 text-slate-700 border-b border-slate-50 last:border-b-0"
                  >
                    <span className="font-medium">{inst.short_name || inst.name}</span>
                    {inst.short_name && inst.short_name !== inst.name && (
                      <span className="text-xs text-slate-500 ml-2">({inst.name})</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              {selectedInstitutions.length > 0 ? selectedInstitutions.map(inst => (
                <span key={inst.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 text-purple-800 text-xs">
                  🏫 {inst.short_name || inst.name}
                  <button
                    type="button"
                    onClick={() => toggleInstitution(inst.id)}
                    className="text-purple-600 hover:text-purple-900"
                    aria-label={`Remove ${inst.short_name || inst.name}`}
                  >
                    ×
                  </button>
                </span>
              )) : <span className="text-xs text-slate-400">No institutions selected</span>}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-1">Type to search across ~900 institutions. Selected schools get direct relevance in command center + report context.</div>
        </Field>
        <div className="flex justify-end gap-3 mt-4"><Btn variant="secondary" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Btn><Btn onClick={handleSave}>{editing ? 'Update' : 'Clip'}</Btn></div>
      </Modal>
    </div>
  );
}
