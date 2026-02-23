'use client';

import { useState } from 'react';
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

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterType) params.source_type = filterType;

  const { data, total, page, totalPages, loading, setPage, sort, dir, toggleSort, refetch } = useIntelData<IntelSource>('sources', params);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/intelligence/sources/${editing.id}` : '/api/admin/intelligence/sources';
    const body = { ...form };
    if (typeof body.topics === 'string') body.topics = (body.topics as string).split(',').map(t => t.trim()).filter(Boolean);
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowAdd(false); setEditing(null); setForm(empty()); refetch();
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
        <Btn onClick={() => { setForm(empty()); setEditing(null); setShowAdd(true); }}>+ Clip Source</Btn>
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
                  <div className="flex gap-1 mt-2">{s.topics.map(t => <Badge key={t}>{t}</Badge>)}</div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => { setForm(s); setEditing(s); setShowAdd(true); }} className="text-purple-600 hover:text-purple-800 text-sm">Edit</button>
                <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditing(null); }} title={editing ? 'Edit Source' : 'Clip a Source'} wide>
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
        <div className="flex justify-end gap-3 mt-4"><Btn variant="secondary" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Btn><Btn onClick={handleSave}>{editing ? 'Update' : 'Clip'}</Btn></div>
      </Modal>
    </div>
  );
}
