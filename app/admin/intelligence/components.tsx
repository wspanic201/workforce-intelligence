'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';

// ── Search Bar ─────────────────────────────────────────

export function IntelSearch({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">🔍</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
      />
    </div>
  );
}

// ── Filter Select ──────────────────────────────────────

export function IntelFilter({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:border-purple-400"
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Badge ──────────────────────────────────────────────

export function Badge({ children, color = 'slate' }: { children: ReactNode; color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'slate' }) {
  const colors = {
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[color]}`}>{children}</span>;
}

// ── Modal ──────────────────────────────────────────────

export function Modal({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} max-h-[80vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Form Field ─────────────────────────────────────────

export function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function Input({ value, onChange, type, placeholder, ...rest }: {
  value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; [k: string]: any;
}) {
  return (
    <input
      type={type || 'text'}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
      {...rest}
    />
  );
}

export function TextArea({ value, onChange, rows, placeholder }: {
  value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows || 4}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
    />
  );
}

export function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-purple-400"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Button ─────────────────────────────────────────────

export function Btn({ children, onClick, variant = 'primary', disabled, type }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; disabled?: boolean; type?: 'submit' | 'button';
}) {
  const styles = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200',
    ghost: 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
  };
  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

// ── Pagination ─────────────────────────────────────────

export function Pagination({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <Btn variant="secondary" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>← Prev</Btn>
        <Btn variant="secondary" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>Next →</Btn>
      </div>
    </div>
  );
}

// ── Data Hook ──────────────────────────────────────────

export function useIntelData<T>(endpoint: string, params: Record<string, string> = {}) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('');
  const [dir, setDir] = useState<'asc' | 'desc'>('asc');

  const toggleSort = useCallback((col: string) => {
    if (sort === col) {
      setDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(col);
      setDir('asc');
    }
    setPage(1);
  }, [sort]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), limit: '25', ...params });
      if (sort) { qs.set('sort', sort); qs.set('dir', dir); }
      Object.keys(params).forEach(k => { if (!params[k]) qs.delete(k); });
      const res = await fetch(`/api/admin/intelligence/${endpoint}?${qs}`);
      const json = await res.json();
      setData(json.data ?? []);
      setTotal(json.total ?? 0);
      setTotalPages(json.totalPages ?? 1);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [endpoint, page, sort, dir, JSON.stringify(params)]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, total, page, totalPages, loading, setPage, sort, dir, toggleSort, refetch: fetchData };
}

// ── Sortable Header ────────────────────────────────────

export function SortHeader({ label, column, sort, dir, onSort, align }: {
  label: string; column: string; sort: string; dir: 'asc' | 'desc'; onSort: (col: string) => void; align?: 'left' | 'right';
}) {
  const active = sort === column;
  return (
    <th
      className={`${align === 'right' ? 'text-right' : 'text-left'} px-4 py-3 font-medium text-slate-600 cursor-pointer select-none hover:text-purple-700 transition-colors`}
      onClick={() => onSort(column)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={`text-xs ${active ? 'text-purple-600' : 'text-slate-300'}`}>
          {active ? (dir === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
      </span>
    </th>
  );
}

// ── US States ──────────────────────────────────────────

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC','PR'
].map(s => ({ value: s, label: s }));
