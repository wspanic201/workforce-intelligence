/**
 * Configuration Management
 * View environment variables, test connections, manage settings
 */

import { checkNewsSourcesHealth } from '@/lib/signal/news-sources';

export default async function ConfigAdminPage() {
  const newsHealth = await checkNewsSourcesHealth();

  const envVars = [
    { name: 'ANTHROPIC_API_KEY', status: !!process.env.ANTHROPIC_API_KEY, service: 'Claude' },
    { name: 'BRAVE_API_KEY', status: !!process.env.BRAVE_API_KEY, service: 'Brave Search' },
    { name: 'RESEND_API_KEY', status: !!process.env.RESEND_API_KEY, service: 'Resend' },
    { name: 'RESEND_AUDIENCE_ID_SIGNAL', status: !!process.env.RESEND_AUDIENCE_ID_SIGNAL, service: 'The Signal' },
    { name: 'CRON_SECRET', status: !!process.env.CRON_SECRET, service: 'Cron Auth' },
    { name: 'NEWSAPI_KEY', status: !!process.env.NEWSAPI_KEY, service: 'NewsAPI (Optional)' },
    { name: 'BLS_API_KEY', status: !!process.env.BLS_API_KEY, service: 'BLS Data' },
    { name: 'SERPAPI_KEY', status: !!process.env.SERPAPI_KEY, service: 'SerpAPI' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuration</h1>
        <p className="text-gray-600 mt-1">Environment variables and API connections</p>
      </div>

      {/* Service Health */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Service Health</h2>
          <p className="text-sm text-gray-600 mt-1">Real-time status of external APIs</p>
        </div>
        <div className="p-6 space-y-3">
          <ServiceStatus service="Brave Search" status={newsHealth.brave} />
          <ServiceStatus service="NewsAPI" status={newsHealth.newsapi} />
          <ServiceStatus service="Google News RSS" status={newsHealth.googleRss} />
          <ServiceStatus service="Cache" status={newsHealth.cache} />
        </div>
      </div>

      {/* Environment Variables */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Environment Variables</h2>
          <p className="text-sm text-gray-600 mt-1">API keys and configuration (values masked for security)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variable</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {envVars.map((env) => (
                <tr key={env.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {env.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {env.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {env.status ? (
                      <span className="text-green-600">✓ Set</span>
                    ) : (
                      <span className="text-red-600">✗ Missing</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documentation Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Configuration Guide</h3>
            <p className="text-sm text-blue-700 mt-1">
              To update environment variables, use the Vercel dashboard or CLI: <code className="font-mono bg-blue-100 px-1">vercel env add KEY_NAME production</code>
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Reference: <code className="font-mono bg-blue-100 px-1">/workspace/api-keys-reference.md</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function ServiceStatus({ service, status }: { service: string; status: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-900">{service}</span>
      <span className={`text-sm font-medium ${status ? 'text-green-600' : 'text-red-600'}`}>
        {status ? '✓ Online' : '✗ Offline'}
      </span>
    </div>
  );
}
