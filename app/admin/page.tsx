/**
 * Admin Dashboard Home
 * System overview and quick stats
 */

import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { checkSendHealth } from '@/lib/signal/send-tracker';
import { checkNewsSourcesHealth } from '@/lib/signal/news-sources';

export default async function AdminDashboardPage() {
  // Fetch dashboard data
  const [reportStats, signalHealth, newsHealth] = await Promise.all([
    getReportStats(),
    checkSendHealth().catch(() => null),
    checkNewsSourcesHealth().catch(() => null),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Wavelength platform overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Reports This Week"
          value={reportStats.thisWeek}
          subtitle={`${reportStats.total} total`}
          href="/admin/reports"
          status="good"
        />
        
        <StatCard
          title="The Signal"
          value={signalHealth?.healthy ? 'Healthy' : 'Issues'}
          subtitle={signalHealth ? `${signalHealth.daysSinceSuccess.toFixed(1)}d since last send` : 'Loading...'}
          href="/admin/signal"
          status={signalHealth?.healthy ? 'good' : 'warning'}
        />

        <StatCard
          title="News Sources"
          value={getHealthySourcesCount(newsHealth)}
          subtitle="sources available"
          href="/admin/signal"
          status={newsHealth?.brave || newsHealth?.newsapi || newsHealth?.googleRss ? 'good' : 'error'}
        />

        <StatCard
          title="Pending Orders"
          value={0}
          subtitle="awaiting generation"
          href="/admin/reports"
          status="neutral"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {reportStats.recent.map((report: any) => (
            <div key={report.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{report.program_name || 'Untitled Report'}</p>
                <p className="text-xs text-gray-500">{new Date(report.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-xs text-gray-500">{report.status}</span>
            </div>
          ))}
          {reportStats.recent.length === 0 && (
            <p className="text-sm text-gray-500">No recent reports</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper components
function StatCard({ 
  title, 
  value, 
  subtitle, 
  href, 
  status 
}: { 
  title: string; 
  value: string | number; 
  subtitle: string; 
  href: string;
  status: 'good' | 'warning' | 'error' | 'neutral';
}) {
  const statusColors = {
    good: 'border-green-500',
    warning: 'border-yellow-500',
    error: 'border-red-500',
    neutral: 'border-gray-300',
  };

  return (
    <Link href={href}>
      <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${statusColors[status]} hover:shadow-lg transition-shadow`}>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
    </Link>
  );
}

function QuickAction({ title, description, href, icon }: { title: string; description: string; href: string; icon: string }) {
  return (
    <Link href={href}>
      <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-500 hover:shadow transition-all">
        <div className="text-2xl mb-2">{icon}</div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </Link>
  );
}

// Data fetching helpers
async function getReportStats() {
  try {
    const supabase = getSupabaseServerClient();
    
    // Get total count
    const { count: total } = await supabase
      .from('validation_projects')
      .select('*', { count: 'exact', head: true });

    // Get this week's count
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { count: thisWeek } = await supabase
      .from('validation_projects')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString());

    // Get recent reports
    const { data: recent } = await supabase
      .from('validation_projects')
      .select('id, program_name, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      total: total || 0,
      thisWeek: thisWeek || 0,
      recent: recent || [],
    };
  } catch (error) {
    console.error('[Admin] Failed to fetch report stats:', error);
    return { total: 0, thisWeek: 0, recent: [] };
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
