'use client';

import { useState, useRef } from 'react';
import { Badge, Btn, Field, Input, Select, Modal } from '../components';

const TARGET_TABLES = [
  { value: '', label: 'Save as Source (no extraction)' },
  { value: 'intel_wages', label: '💰 Wages — BLS salary data' },
  { value: 'intel_statutes', label: '📜 Statutes — State laws & regulations' },
  { value: 'intel_credentials', label: '📋 Credentials — Licensing requirements' },
  { value: 'intel_employers', label: '🏢 Employers — Regional employer data' },
  { value: 'intel_institutions', label: '🏫 Institutions — College profiles' },
];

type ImportMode = 'url' | 'upload' | null;
type ImportState = 'idle' | 'fetching' | 'extracting' | 'preview' | 'saving' | 'done' | 'error';

export default function ImportPage() {
  const [mode, setMode] = useState<ImportMode>(null);
  const [state, setState] = useState<ImportState>('idle');
  const [url, setUrl] = useState('');
  const [targetTable, setTargetTable] = useState('');
  const [extracted, setExtracted] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [sourceInfo, setSourceInfo] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setMode(null); setState('idle'); setUrl(''); setTargetTable('');
    setExtracted([]); setSelectedRows(new Set()); setError('');
    setSourceInfo(null); setResult(null);
  };

  // ── Clip URL ──────────────────────────────────────────

  const clipUrl = async () => {
    if (!url) return;
    setState(targetTable ? 'extracting' : 'fetching');
    setError('');

    try {
      const res = await fetch('/api/admin/intelligence/import/clip-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, targetTable: targetTable || undefined, aiExtract: !!targetTable }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      if (data.extracted) {
        setExtracted(data.extracted);
        setSelectedRows(new Set(data.extracted.map((_: any, i: number) => i)));
        setSourceInfo(data.source);
        setState('preview');
      } else {
        setSourceInfo(data.source);
        setResult({ inserted: 1, type: 'source' });
        setState('done');
      }
    } catch (err: any) {
      setError(err.message);
      setState('error');
    }
  };

  // ── Upload File ───────────────────────────────────────

  const uploadFile = async (file: File) => {
    setState(targetTable ? 'extracting' : 'fetching');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (targetTable) formData.append('targetTable', targetTable);

      const res = await fetch('/api/admin/intelligence/import/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      if (data.extracted) {
        setExtracted(data.extracted);
        setSelectedRows(new Set(data.extracted.map((_: any, i: number) => i)));
        setSourceInfo({ title: data.filename, fileType: data.fileType });
        setState('preview');
      } else {
        setSourceInfo(data.source);
        setResult({ inserted: 1, type: 'source' });
        setState('done');
      }
    } catch (err: any) {
      setError(err.message);
      setState('error');
    }
  };

  // ── Save Extracted Records ────────────────────────────

  const saveRecords = async () => {
    const records = extracted.filter((_, i) => selectedRows.has(i));
    if (records.length === 0) return;

    setState('saving');
    try {
      const res = await fetch('/api/admin/intelligence/import/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTable, records, sourceUrl: url || undefined }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setResult(data);
      setState('done');
    } catch (err: any) {
      setError(err.message);
      setState('error');
    }
  };

  const toggleRow = (i: number) => {
    const next = new Set(selectedRows);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelectedRows(next);
  };

  const toggleAll = () => {
    if (selectedRows.size === extracted.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(extracted.map((_, i) => i)));
    }
  };

  // ── Render ────────────────────────────────────────────

  return (
    <div>
      {/* Mode Selection */}
      {!mode && state === 'idle' && (
        <div>
          <p className="text-sm text-slate-500 mb-6">Import verified data from URLs or documents. AI extracts structured records for your review before saving.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => setMode('url')}
              className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-md hover:border-purple-300 transition-all text-left">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="font-semibold text-slate-900 text-lg mb-1">Clip from URL</h3>
              <p className="text-sm text-slate-500">Paste a link to a .gov page, BLS report, state statute, or any web source. AI extracts the data.</p>
              <div className="flex gap-2 mt-3">
                <Badge color="green">BLS.gov</Badge>
                <Badge color="blue">State codes</Badge>
                <Badge>Any URL</Badge>
              </div>
            </button>
            <button onClick={() => setMode('upload')}
              className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-md hover:border-purple-300 transition-all text-left">
              <div className="text-3xl mb-3">📄</div>
              <h3 className="font-semibold text-slate-900 text-lg mb-1">Upload Document</h3>
              <p className="text-sm text-slate-500">Upload a PDF, CSV, Excel file, or text document. AI reads it and extracts structured intelligence data.</p>
              <div className="flex gap-2 mt-3">
                <Badge color="purple">PDF</Badge>
                <Badge color="green">CSV</Badge>
                <Badge color="blue">Excel</Badge>
                <Badge>TXT</Badge>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* URL Clipper */}
      {mode === 'url' && (state === 'idle' || state === 'error') && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">🔗 Clip from URL</h3>
            <Btn variant="ghost" onClick={reset}>← Back</Btn>
          </div>
          <Field label="URL" required>
            <Input value={url} onChange={setUrl} placeholder="https://bls.gov/oes/current/oes292052.htm" />
          </Field>
          <Field label="Extract into">
            <Select value={targetTable} onChange={setTargetTable} options={TARGET_TABLES} placeholder="" />
          </Field>
          <p className="text-xs text-slate-400 mb-4">
            {targetTable ? 'AI will extract structured data for your review before saving.' : 'Page will be saved as a reference source.'}
          </p>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">❌ {error}</p>}
          <Btn onClick={clipUrl} disabled={!url}>
            {targetTable ? '🤖 Extract with AI' : '📥 Save as Source'}
          </Btn>
        </div>
      )}

      {/* File Upload */}
      {mode === 'upload' && (state === 'idle' || state === 'error') && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">📄 Upload Document</h3>
            <Btn variant="ghost" onClick={reset}>← Back</Btn>
          </div>
          <Field label="Extract into">
            <Select value={targetTable} onChange={setTargetTable} options={TARGET_TABLES} placeholder="" />
          </Field>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-purple-300 transition-colors cursor-pointer mb-4"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) uploadFile(f); }}
          >
            <div className="text-4xl mb-2">📎</div>
            <p className="text-sm text-slate-600 font-medium">Drop a file here or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">PDF, CSV, Excel, JSON, or TXT</p>
          </div>
          <input ref={fileRef} type="file" className="hidden" accept=".pdf,.csv,.xlsx,.xls,.txt,.md,.json"
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">❌ {error}</p>}
        </div>
      )}

      {/* Loading States */}
      {(state === 'fetching' || state === 'extracting' || state === 'saving') && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="text-4xl mb-4 animate-pulse">
            {state === 'fetching' ? '🌐' : state === 'extracting' ? '🤖' : '💾'}
          </div>
          <p className="text-lg font-medium text-slate-900">
            {state === 'fetching' ? 'Fetching page...' : state === 'extracting' ? 'AI is extracting structured data...' : 'Saving records...'}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            {state === 'extracting' ? 'Claude is reading the document and pulling out structured records.' : ''}
          </p>
        </div>
      )}

      {/* Preview Extracted Records */}
      {state === 'preview' && extracted.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Review Extracted Data</h3>
              <p className="text-sm text-slate-500">
                {extracted.length} records found from {sourceInfo?.title || 'source'}.
                Uncheck any you don&apos;t want to save.
              </p>
            </div>
            <div className="flex gap-2">
              <Btn variant="ghost" onClick={reset}>Cancel</Btn>
              <Btn onClick={saveRecords} disabled={selectedRows.size === 0}>
                💾 Save {selectedRows.size} Records
              </Btn>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selectedRows.size === extracted.length}
                      onChange={toggleAll} className="rounded" />
                  </th>
                  {extracted.length > 0 && Object.keys(extracted[0]).filter(k => extracted[0][k] !== null).slice(0, 6).map(key => (
                    <th key={key} className="text-left px-4 py-3 font-medium text-slate-600 text-xs uppercase">
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {extracted.map((row, i) => {
                  const visibleKeys = Object.keys(row).filter(k => row[k] !== null).slice(0, 6);
                  return (
                    <tr key={i} className={`border-b border-slate-50 ${selectedRows.has(i) ? 'bg-white' : 'bg-slate-50 opacity-50'}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedRows.has(i)} onChange={() => toggleRow(i)} className="rounded" />
                      </td>
                      {visibleKeys.map(key => (
                        <td key={key} className="px-4 py-3 text-slate-700 max-w-48 truncate">
                          {Array.isArray(row[key]) ? row[key].join(', ') :
                           typeof row[key] === 'boolean' ? (row[key] ? '✅' : '—') :
                           row[key]?.toString() || '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Raw JSON toggle */}
          <details className="mt-4">
            <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">View raw JSON</summary>
            <pre className="mt-2 bg-slate-50 rounded-lg p-4 text-xs overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(extracted, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Done State */}
      {state === 'done' && (
        <div className="bg-white rounded-xl border border-green-200 p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {result?.inserted ? `${result.inserted} records saved!` : 'Source clipped!'}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {result?.targetTable ? `Data added to ${result.targetTable.replace('intel_', '')} table.` : 'Saved to your sources library.'}
          </p>
          <div className="flex justify-center gap-3">
            <Btn variant="secondary" onClick={reset}>Import More</Btn>
            <Btn onClick={() => window.location.href = `/admin/intelligence/${result?.targetTable?.replace('intel_', '') || 'sources'}`}>
              View Records →
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
