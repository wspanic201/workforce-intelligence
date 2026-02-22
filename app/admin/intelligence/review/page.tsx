'use client';

import { useState } from 'react';
import type { IntelReviewItem } from '@/lib/intelligence/types';
import { IntelSearch, IntelFilter, Badge, Btn, Pagination, useIntelData } from '../components';

const STATUSES = [
  { value: 'flagged', label: '⚠️ Flagged' }, { value: 'verified', label: '✅ Verified' },
  { value: 'corrected', label: '🔄 Corrected' }, { value: 'dismissed', label: '🗑️ Dismissed' },
];

const CATEGORIES = [
  { value: 'wage', label: 'Wage' }, { value: 'statute', label: 'Statute' },
  { value: 'distance', label: 'Distance' }, { value: 'enrollment', label: 'Enrollment' },
  { value: 'employer', label: 'Employer' }, { value: 'credential', label: 'Credential' },
  { value: 'other', label: 'Other' },
];

export default function ReviewPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('flagged');
  const [filterCategory, setFilterCategory] = useState('');

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (filterStatus) params.verification_status = filterStatus;
  if (filterCategory) params.claim_category = filterCategory;

  const { data, total, page, totalPages, loading, setPage, refetch } = useIntelData<IntelReviewItem>('review', params);

  const handleAction = async (id: string, status: string, addToDb = false) => {
    await fetch(`/api/admin/intelligence/review/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verification_status: status, reviewed_by: 'matt', reviewed_at: new Date().toISOString(), added_to_db: addToDb }),
    });
    refetch();
  };

  const statusColor = (s: string) => s === 'verified' ? 'green' : s === 'corrected' ? 'blue' : s === 'flagged' ? 'red' : 'slate';

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><IntelSearch value={search} onChange={setSearch} placeholder="Search claims..." /></div>
        <IntelFilter value={filterStatus} onChange={setFilterStatus} options={STATUSES} placeholder="All Statuses" />
        <IntelFilter value={filterCategory} onChange={setFilterCategory} options={CATEGORIES} placeholder="All Categories" />
      </div>

      <p className="text-sm text-slate-500 mb-4">{total} items {filterStatus === 'flagged' && 'need review'}</p>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-slate-400 py-8">Loading...</div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-slate-600 font-medium">No items to review!</div>
            <div className="text-sm text-slate-400">All clear — your reports are using verified data.</div>
          </div>
        ) : data.map(item => (
          <div key={item.id} className={`bg-white rounded-xl border p-5 ${item.verification_status === 'flagged' ? 'border-red-200' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge color={statusColor(item.verification_status) as any}>{item.verification_status}</Badge>
                  <Badge>{item.claim_category}</Badge>
                  {item.confidence && <span className="text-xs text-slate-400">confidence: {item.confidence}</span>}
                </div>
                {item.report_name && <p className="text-xs text-slate-500">From: {item.report_name}</p>}
              </div>
              <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
            </div>

            <p className="text-sm text-slate-900 mb-2 bg-slate-50 rounded-lg p-3 font-medium">
              &ldquo;{item.claim_text}&rdquo;
            </p>

            {item.verified_value && (
              <p className="text-sm text-green-700 mb-2 bg-green-50 rounded-lg p-3">
                ✅ Corrected to: {item.verified_value}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
              {item.agent_source && <span>Agent: {item.agent_source}</span>}
              {item.web_source && <span>Source: <a href={item.web_source} target="_blank" className="text-purple-600 underline">{new URL(item.web_source).hostname}</a></span>}
            </div>

            {item.verification_status === 'flagged' && (
              <div className="flex gap-2">
                <Btn variant="primary" onClick={() => handleAction(item.id, 'verified')}>✅ Approve</Btn>
                <Btn variant="secondary" onClick={() => {
                  const corrected = prompt('Enter the correct value:');
                  if (corrected) {
                    fetch(`/api/admin/intelligence/review/${item.id}`, {
                      method: 'PUT', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ verification_status: 'corrected', verified_value: corrected, reviewed_by: 'matt', reviewed_at: new Date().toISOString() }),
                    }).then(() => refetch());
                  }
                }}>✏️ Correct</Btn>
                <Btn variant="ghost" onClick={() => handleAction(item.id, 'dismissed')}>🗑️ Dismiss</Btn>
                <Btn variant="secondary" onClick={() => handleAction(item.id, 'verified', true)}>📥 Add to DB</Btn>
              </div>
            )}
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
