'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { IntelDashboardStats } from '@/lib/intelligence/types';

const CARDS = [
  { key: 'wages', label: 'Wages', icon: '💰', href: '/admin/intelligence/wages', color: 'green' },
  { key: 'statutes', label: 'Statutes', icon: '📜', href: '/admin/intelligence/statutes', color: 'blue' },
  { key: 'institutions', label: 'Institutions', icon: '🏫', href: '/admin/intelligence/institutions', color: 'purple' },
  { key: 'sources', label: 'Sources', icon: '📰', href: '/admin/intelligence/sources', color: 'amber' },
  { key: 'credentials', label: 'Credentials', icon: '📋', href: '/admin/intelligence/credentials', color: 'teal' },
  { key: 'employers', label: 'Employers', icon: '🏢', href: '/admin/intelligence/employers', color: 'indigo' },
  { key: 'distances', label: 'Distances', icon: '📏', href: '/admin/intelligence', color: 'slate' },
  { key: 'review_queue', label: 'Review Queue', icon: '⚠️', href: '/admin/intelligence/review', color: 'red' },
] as const;

export default function IntelligenceDashboard() {
  const [stats, setStats] = useState<IntelDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/intelligence')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CARDS.map(c => (
          <div key={c.key} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
            <div className="h-8 bg-slate-100 rounded mb-2" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {CARDS.map(card => {
          const stat = stats?.[card.key as keyof IntelDashboardStats];
          const count = typeof stat === 'object' && stat !== null
            ? ('count' in stat ? stat.count : ('flagged' in stat ? stat.flagged : 0))
            : 0;
          const pct = typeof stat === 'object' && stat !== null && 'verified_pct' in stat
            ? (stat as any).verified_pct
            : null;
          const isFlagged = card.key === 'review_queue' && count > 0;

          return (
            <Link key={card.key} href={card.href}>
              <div className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow cursor-pointer ${
                isFlagged ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{card.icon}</span>
                  {pct !== null && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      pct >= 90 ? 'bg-green-100 text-green-700' :
                      pct >= 70 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {pct}% verified
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-slate-900">{count.toLocaleString()}</div>
                <div className="text-sm text-slate-500">{card.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/intelligence/wages" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
            <span>💰</span> Add Wage Data
          </Link>
          <Link href="/admin/intelligence/statutes" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
            <span>📜</span> Add Statute
          </Link>
          <Link href="/admin/intelligence/institutions" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
            <span>🏫</span> Add Institution
          </Link>
          <Link href="/admin/intelligence/sources" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
            <span>📰</span> Clip Source
          </Link>
        </div>
      </div>
    </div>
  );
}
