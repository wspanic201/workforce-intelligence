'use client';

import { useState } from 'react';
import { IntelSearch, IntelFilter, Badge, Modal, Field, Input, TextArea, Select, Btn, Pagination, SortHeader, useIntelData } from '../components';

const TYPES = [
  { value: 'cbe_framework', label: 'CBE Framework' },
  { value: 'competency_model', label: 'Competency Model' },
  { value: 'program_design', label: 'Program Design' },
  { value: 'employer_partnership', label: 'Employer Partnership' },
  { value: 'quality_standard', label: 'Quality Standard' },
  { value: 'credential_framework', label: 'Credential Framework' },
  { value: 'training_design', label: 'Training Design' },
  { value: 'adult_learning', label: 'Adult Learning' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'policy_framework', label: 'Policy Framework' },
  { value: 'accreditation', label: 'Accreditation' },
];

const CATEGORIES = [
  { value: 'higher_ed', label: 'Higher Ed' },
  { value: 'workforce_development', label: 'Workforce Development' },
  { value: 'continuing_education', label: 'Continuing Education' },
  { value: 'apprenticeship', label: 'Apprenticeship' },
  { value: 'industry_specific', label: 'Industry Specific' },
  { value: 'k12_cte', label: 'K-12 CTE' },
];

interface Framework {
  id: string;
  framework_name: string;
  short_name: string | null;
  version: string | null;
  framework_type: string;
  category: string;
  organization: string;
  organization_type: string | null;
  summary: string | null;
  key_principles: string[] | null;
  implementation_steps: string[] | null;
  quality_indicators: string[] | null;
  common_pitfalls: string[] | null;
  applicable_sectors: string[] | null;
  applicable_program_types: string[] | null;
  institution_types: string[] | null;
  source_url: string | null;
  source_document: string | null;
  publication_year: number | null;
  last_updated_year: number | null;
  is_current: boolean;
  when_to_use: string | null;
  citation_text: string | null;
  tags: string[] | null;
  related_frameworks: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const typeColors: Record<string, 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'slate'> = {
  cbe_framework: 'purple',
  competency_model: 'blue',
  program_design: 'green',
  employer_partnership: 'yellow',
  quality_standard: 'red',
  credential_framework: 'blue',
  training_design: 'green',
  adult_learning: 'purple',
  assessment: 'slate',
  policy_framework: 'yellow',
};

export default function FrameworksPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterType) params.framework_type = filterType;
  if (filterCat) params.category = filterCat;

  const { data, total, page, totalPages, loading, setPage, sort, dir, toggleSort } = useIntelData<Framework>('frameworks', params);

  const typeLabel = (t: string) => TYPES.find(x => x.value === t)?.label || t;
  const catLabel = (c: string) => CATEGORIES.find(x => x.value === c)?.label || c;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search frameworks..." /></div>
        <IntelFilter value={filterType} onChange={setFilterType} options={TYPES} placeholder="All Types" />
        <IntelFilter value={filterCat} onChange={setFilterCat} options={CATEGORIES} placeholder="All Categories" />
      </div>

      <p className="text-sm text-slate-500 mb-4">{total} frameworks</p>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No frameworks found.</div>
      ) : (
        <div className="space-y-4">
          {data.map(f => (
            <div key={f.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Header row */}
              <div
                className="px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(expanded === f.id ? null : f.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{f.framework_name}</h3>
                    {f.version && <span className="text-xs text-slate-400">v{f.version}</span>}
                  </div>
                  <p className="text-sm text-slate-500">{f.organization}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge color={typeColors[f.framework_type] || 'slate'}>{typeLabel(f.framework_type)}</Badge>
                  <Badge color="slate">{catLabel(f.category)}</Badge>
                  {f.is_current && <Badge color="green">Current</Badge>}
                  <span className="text-slate-400 text-lg">{expanded === f.id ? '▾' : '▸'}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === f.id && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                  {f.summary && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Summary</h4>
                      <p className="text-sm text-slate-700 leading-relaxed">{f.summary}</p>
                    </div>
                  )}

                  {f.when_to_use && (
                    <div className="bg-purple-50 rounded-lg px-4 py-3">
                      <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">When to Use</h4>
                      <p className="text-sm text-purple-900">{f.when_to_use}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {f.key_principles?.length ? (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Key Principles</h4>
                        <ul className="space-y-1">
                          {f.key_principles.map((p, i) => (
                            <li key={i} className="text-sm text-slate-700 flex gap-2">
                              <span className="text-purple-500 shrink-0">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {f.implementation_steps?.length ? (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Implementation Steps</h4>
                        <ol className="space-y-1">
                          {f.implementation_steps.map((s, i) => (
                            <li key={i} className="text-sm text-slate-700 flex gap-2">
                              <span className="text-purple-500 font-mono text-xs shrink-0 w-5">{i + 1}.</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : null}

                    {f.quality_indicators?.length ? (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quality Indicators</h4>
                        <ul className="space-y-1">
                          {f.quality_indicators.map((q, i) => (
                            <li key={i} className="text-sm text-slate-700 flex gap-2">
                              <span className="text-green-500 shrink-0">✓</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {f.common_pitfalls?.length ? (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Common Pitfalls</h4>
                        <ul className="space-y-1">
                          {f.common_pitfalls.map((p, i) => (
                            <li key={i} className="text-sm text-slate-700 flex gap-2">
                              <span className="text-red-500 shrink-0">⚠</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  {/* Metadata row */}
                  <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    {f.publication_year && <span>Published: {f.publication_year}</span>}
                    {f.last_updated_year && <span>Updated: {f.last_updated_year}</span>}
                    {f.source_url && (
                      <a href={f.source_url} target="_blank" rel="noopener" className="text-purple-600 hover:text-purple-800">
                        Source ↗
                      </a>
                    )}
                    {f.citation_text && <span className="italic">{f.citation_text}</span>}
                  </div>

                  {/* Tags */}
                  {f.tags?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {f.tags.map((t, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  ) : null}

                  {/* Related frameworks */}
                  {f.related_frameworks?.length ? (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Related Frameworks</h4>
                      <p className="text-sm text-slate-600">{f.related_frameworks.join(' • ')}</p>
                    </div>
                  ) : null}

                  {/* Applicable to */}
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    {f.applicable_sectors?.length ? <span>Sectors: {f.applicable_sectors.join(', ')}</span> : null}
                    {f.applicable_program_types?.length ? <span>Programs: {f.applicable_program_types.join(', ')}</span> : null}
                    {f.institution_types?.length ? <span>Institutions: {f.institution_types.join(', ')}</span> : null}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
