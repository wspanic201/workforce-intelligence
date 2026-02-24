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
        <h1 className="text-3xl font-bold text-gray-900">The Signal Newsletter</h1>
        <p className="text-gray-600 mt-1">Monitoring and controls for the Mon/Wed/Fri newsletter</p>
      </div>

      {/* Overall Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            <p className="text-sm text-gray-600 mt-1">
              {sendHealth.healthy ? '✅ All systems operational' : '⚠️ Issues detected'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Days since last send</p>
            <p className="text-2xl font-bold text-gray-900">{sendHealth.daysSinceSuccess.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* News Sources Status */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            className="w-full text-left block bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-gray-200 hover:border-purple-500"
          >
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold text-gray-900">Send Test</h3>
            <p className="text-sm text-gray-600 mt-2">Send newsletter to subscribers (production)</p>
          </button>
        </form>
      </div>

      {/* Send History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Send History</h2>
          <p className="text-sm text-gray-600 mt-1">Last 10 newsletter sends</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentSends.map((send) => (
                <tr key={send.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(send.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {send.edition || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      send.status === 'success' ? 'bg-green-100 text-green-800' :
                      send.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {send.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {send.newsSource}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {send.newsItemCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {(send.durationMs / 1000).toFixed(1)}s
                  </td>
                </tr>
              ))}
              {recentSends.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No sends yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Automated Schedule</h3>
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
    <div className={`bg-white rounded-lg shadow p-4 ${primary ? 'ring-2 ring-purple-500' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <span className={`text-2xl ${status ? 'text-green-500' : 'text-red-500'}`}>
          {status ? '✓' : '✗'}
        </span>
      </div>
      {primary && (
        <p className="text-xs text-gray-500 mt-2">Primary source</p>
      )}
    </div>
  );
}

function ActionCard({ title, description, href, target, icon }: { title: string; description: string; href: string; target?: string; icon: string }) {
  return (
    <a 
      href={href} 
      target={target}
      className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-gray-200 hover:border-purple-500"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-2">{description}</p>
    </a>
  );
}
