/**
 * Admin Dashboard Home
 * System overview with Wavelength brand styling
 */

import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { checkSendHealth } from '@/lib/signal/send-tracker';
import { checkNewsSourcesHealth } from '@/lib/signal/news-sources';

export default async function AdminDashboardPage() {
  const [reportStats, signalHealth, newsHealth] = await Promise.all([
    getReportStats(),
    checkSendHealth().catch(() => null),
    checkNewsSourcesHealth().catch(() => null),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">Wavelength platform overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Reports This Week"
          value={reportStats.thisWeek}
          subtitle={`${reportStats.total} total`}
          href="/admin/reports"
          accent="purple"
          icon="📊"
        />
        
        <StatCard
          title="The Signal"
          value={signalHealth?.healthy ? 'Healthy' : 'Issues'}
          subtitle={signalHealth ? `${signalHealth.daysSinceSuccess.toFixed(1)}d since last send` : 'Loading...'}
          href="/admin/signal"
          accent={signalHealth?.healthy ? 'teal' : 'amber'}
          icon="📧"
        />

        <StatCard
          title="News Sources"
          value={getHealthySourcesCount(newsHealth)}
          subtitle="sources available"
          href="/admin/signal"
          accent={newsHealth?.brave || newsHealth?.newsapi || newsHealth?.googleRss ? 'blue' : 'red'}
          icon="📡"
        />

        <StatCard
          title="Pending Orders"
          value={reportStats.pending}
          subtitle="awaiting generation"
          href="/admin/reports?filter=unreviewed"
          accent={reportStats.pending > 0 ? 'amber' : 'slate'}
          icon="📋"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            title="Send Newsletter"
            description="Preview and send The Signal"
            href="/admin/signal"
            icon="📧"
          />
          <QuickAction
            title="Generate Report"
            description="Create a new validation report"
            href="/admin/reports?action=new"
            icon="📊"
          />
          <QuickAction
            title="Chat with Cassidy"
            description="Get help or run commands"
            href="/admin/chat"
            icon="💬"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">Recent Activity</h2>
        <div className="space-y-1">
          {reportStats.recent.map((report: any) => (
            <div key={report.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 px-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-900">{report.program_name || 'Untitled Report'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(report.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded w-fit">{report.status}</span>
            </div>
          ))}
          {reportStats.recent.length === 0 && (
            <div className="py-8 text-center">
              <div className="text-slate-300 text-2xl mb-2">📊</div>
              <p className="text-sm text-slate-400">No recent reports</p>
              <p className="text-xs text-slate-300 mt-1">Generated reports will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Components ──────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
  href,
  accent,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  href: string;
  accent: 'purple' | 'blue' | 'teal' | 'amber' | 'red' | 'slate';
  icon: string;
}) {
  const gradients: Record<string, string> = {
    purple: 'from-purple-500 to-blue-500',
    blue: 'from-blue-500 to-cyan-500',
    teal: 'from-teal-500 to-emerald-500',
    amber: 'from-amber-500 to-orange-500',
    red: 'from-red-500 to-rose-500',
    slate: 'from-slate-400 to-slate-500',
  };

  return (
    <Link href={href}>
      <div className="group relative bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
        {/* Accent gradient bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[accent]}`} />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
            <p className="text-2xl font-heading font-bold text-slate-900 mt-2">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          </div>
          <span className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ title, description, href, icon }: { title: string; description: string; href: string; icon: string }) {
  return (
    <Link href={href}>
      <div className="group border border-slate-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all duration-200 bg-white">
        <div className="text-2xl mb-3">{icon}</div>
        <h3 className="font-heading font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
    </Link>
  );
}

// ── Data Fetching ───────────────────────────────────────────────────────────

async function getReportStats() {
  try {
    const supabase = getSupabaseServerClient();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [totalResult, thisWeekResult, pendingResult, recentResult] = await Promise.all([
      supabase
        .from('validation_projects')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('validation_projects')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString()),
      supabase
        .from('validation_projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('validation_projects')
        .select('id, program_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    return {
      total: totalResult.count || 0,
      thisWeek: thisWeekResult.count || 0,
      pending: pendingResult.count || 0,
      recent: recentResult.data || [],
    };
  } catch (error) {
    console.error('[Admin] Failed to fetch report stats:', error);
    return { total: 0, thisWeek: 0, pending: 0, recent: [] };
  }
}

function getHealthySourcesCount(newsHealth: any) {
  if (!newsHealth) return '?';
  let count = 0;
  if (newsHealth.brave) count++;
  if (newsHealth.newsapi) count++;
  if (newsHealth.googleRss) count++;
  if (newsHealth.cache) count++;
  return `${count}/4`;
}
