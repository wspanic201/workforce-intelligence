'use client';

import { useState } from 'react';
import { IntelSearch, IntelFilter, Badge, Pagination, SortHeader, useIntelData } from '../components';

const SKILL_TYPES = [
  { value: 'skill', label: 'Skills' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'technology', label: 'Technology' },
  { value: 'ability', label: 'Abilities' },
  { value: 'work_activity', label: 'Work Activities' },
];

interface OccSkill {
  id: string;
  soc_code: string;
  occupation_title: string;
  skill_type: string;
  skill_name: string;
  importance: number | null;
  level: number | null;
  category: string | null;
  source: string | null;
}

export default function SkillsPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterType) params.skill_type = filterType;

  const { data, total, page, totalPages, loading, setPage, sort, dir, toggleSort } = useIntelData<OccSkill>('skills', params);

  const typeColor = (t: string): 'purple' | 'blue' | 'green' | 'yellow' | 'slate' => {
    const map: Record<string, 'purple' | 'blue' | 'green' | 'yellow' | 'slate'> = {
      skill: 'purple', knowledge: 'blue', technology: 'green', ability: 'yellow', work_activity: 'slate',
    };
    return map[t] || 'slate';
  };

  const importanceBar = (val: number | null) => {
    if (val == null) return '—';
    const pct = Math.round((val / 5) * 100);
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-slate-500">{val.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search by SOC, occupation, or skill name..." /></div>
        <IntelFilter value={filterType} onChange={setFilterType} options={SKILL_TYPES} placeholder="All Types" />
      </div>

      <p className="text-sm text-slate-500 mb-4">{total.toLocaleString()} records • O*NET v30.1 (Feb 2025)</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <SortHeader label="SOC" column="soc_code" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="Occupation" column="occupation_title" sort={sort} dir={dir} onSort={toggleSort} />
                <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
                <SortHeader label="Skill / Knowledge" column="skill_name" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="Importance" column="importance" sort={sort} dir={dir} onSort={toggleSort} />
                <SortHeader label="Level" column="level" sort={sort} dir={dir} onSort={toggleSort} />
                <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No records found.</td></tr>
              ) : data.map(s => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-purple-700 text-xs">{s.soc_code}</td>
                  <td className="px-4 py-3 text-slate-900 max-w-[200px] truncate">{s.occupation_title}</td>
                  <td className="px-4 py-3"><Badge color={typeColor(s.skill_type)}>{s.skill_type}</Badge></td>
                  <td className="px-4 py-3 text-slate-900">{s.skill_name}</td>
                  <td className="px-4 py-3">{importanceBar(s.importance)}</td>
                  <td className="px-4 py-3">{importanceBar(s.level)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{s.category || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
