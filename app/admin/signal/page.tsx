/**
 * The Signal Newsletter Management
 * Health monitoring, preview, and manual send controls
 */

import Link from 'next/link';
import { checkSendHealth, getRecentSends } from '@/lib/signal/send-tracker';
import { checkNewsSourcesHealth } from '@/lib/signal/news-sources';

export default async function SignalAdminPage() {
  let sendHealth = { healthy: false, daysSinceSuccess: 999, recentFailures: 0 } as Awaited<ReturnType<typeof checkSendHealth>>;
  let recentSends: Awaited<ReturnType<typeof getRecentSends>> = [];
  let newsHealth = { brave: false, newsapi: false, googleRss: false, intel: false, cache: false } as Awaited<ReturnType<typeof checkNewsSourcesHealth>>;

  try {
    [sendHealth, recentSends, newsHealth] = await Promise.all([
      checkSendHealth(),
      getRecentSends(10),
      checkNewsSourcesHealth(),
    ]);
  } catch (err) {
    console.error('[SignalAdmin] Failed to load health data:', err);
  }

  const cronSecret = process.env.CRON_SECRET || '';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-slate-900">The Signal Newsletter</h1>
        <p className="text-slate-500 mt-1 text-sm">Monitoring and controls for the Mon/Wed/Fri newsletter</p>
      </div>

      {/* Overall Status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">System Status</h2>
            <p className="text-sm text-slate-600 mt-2">
              {sendHealth.healthy ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700">All systems operational</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700">Issues detected</span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Days since last send</p>
            <p className="text-2xl font-heading font-bold text-slate-900 mt-1">{sendHealth.daysSinceSuccess.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* News Sources Status */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SourceStatusCard title="Brave Search" status={newsHealth.brave} primary />
        <SourceStatusCard title="NewsAPI" status={newsHealth.newsapi} />
        <SourceStatusCard title="Google RSS" status={newsHealth.googleRss} />
        <SourceStatusCard title="Intelligence DB" status={newsHealth.intel} />
        <SourceStatusCard title="Cache" status={newsHealth.cache} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          title="Preview Next Newsletter"
          description="See what will be sent before it goes out"
          href={`/api/signal-preview?secret=${cronSecret}`}
          target="_blank"
          icon="👁️"
        />
        <ActionCard
          title="Health Dashboard"
          description="Detailed system health monitoring"
          href={`/api/signal-health?secret=${cronSecret}`}
          target="_blank"
          icon="🏥"
        />
        <form method="POST" action={`/api/send-signal?secret=${cronSecret}`}>
          <button
            type="submit"
            className="w-full text-left block bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-purple-300 transition-all"
          >
            <div className="text-2xl mb-3">🚀</div>
            <h3 className="font-heading font-semibold text-slate-900">Send Test</h3>
            <p className="text-sm text-slate-500 mt-1">Send newsletter to subscribers (production)</p>
          </button>
        </form>
      </div>

      {/* Send History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Send History</h2>
          <p className="text-sm text-slate-500 mt-1">Last 10 newsletter sends</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-slate-100 text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Edition</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Source</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Stories</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentSends.map((send) => (
                <tr key={send.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                    {new Date(send.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                    {send.edition || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      send.status === 'success' ? 'bg-emerald-50 text-emerald-700' :
                      send.status === 'partial' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {send.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                    {send.newsSource}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                    {send.newsItemCount}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                    {(send.durationMs / 1000).toFixed(1)}s
                  </td>
                </tr>
              ))}
              {recentSends.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-slate-300 text-2xl mb-2">📧</div>
                    <p className="text-sm text-slate-400">No sends yet</p>
                    <p className="text-xs text-slate-300 mt-1">Newsletter sends will appear here</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-400 mt-0.5">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <h3 className="text-sm font-semibold text-blue-800">Automated Schedule</h3>
            <p className="text-sm text-blue-700 mt-1">
              The Signal sends automatically every Monday, Wednesday, and Friday at 8:00 AM CST via Vercel cron.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function SourceStatusCard({ title, status, primary = false }: { title: string; status: boolean; primary?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm p-4 ${primary ? 'border-purple-300 ring-1 ring-purple-100' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {status ? 'Online' : 'Offline'}
        </span>
      </div>
      {primary && (
        <p className="text-xs text-slate-400 mt-2">Primary source</p>
      )}
    </div>
  );
}

function ActionCard({ title, description, href, target, icon }: { title: string; description: string; href: string; target?: string; icon: string }) {
  return (
    <a
      href={href}
      target={target}
      className="block bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-purple-300 transition-all"
    >
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="font-heading font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </a>
  );
}
