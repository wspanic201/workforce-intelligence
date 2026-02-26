/**
 * Configuration Management
 * View environment variables, test connections, manage settings
 */

import { checkNewsSourcesHealth } from '@/lib/signal/news-sources';

export default async function ConfigAdminPage() {
  const newsHealth = await checkNewsSourcesHealth();

  const envVars = [
    { name: 'ANTHROPIC_API_KEY', status: !!process.env.ANTHROPIC_API_KEY, service: 'Claude' },
    { name: 'OPENAI_API_KEY', status: !!process.env.OPENAI_API_KEY, service: 'OpenAI' },
    { name: 'BRAVE_API_KEY', status: !!process.env.BRAVE_API_KEY, service: 'Brave Search' },
    { name: 'RESEND_API_KEY', status: !!process.env.RESEND_API_KEY, service: 'Resend' },
    { name: 'RESEND_AUDIENCE_ID_SIGNAL', status: !!process.env.RESEND_AUDIENCE_ID_SIGNAL, service: 'The Signal' },
    { name: 'CRON_SECRET', status: !!process.env.CRON_SECRET, service: 'Cron Auth' },
    { name: 'NEWSAPI_KEY', status: !!process.env.NEWSAPI_KEY, service: 'NewsAPI (Optional)' },
    { name: 'BLS_API_KEY', status: !!process.env.BLS_API_KEY, service: 'BLS Data' },
    { name: 'SERPAPI_KEY', status: !!process.env.SERPAPI_KEY, service: 'SerpAPI' },
  ];

  const modelRouting = [
    { label: 'Default validation model', value: process.env.VALIDATION_MODEL || 'claude-sonnet-4-6', detail: 'Used for pipeline run metadata + baseline agent routing.' },
    { label: 'Stage max attempts', value: process.env.VALIDATION_STAGE_MAX_ATTEMPTS || '2', detail: 'Phase C retry cap per stage.' },
    { label: 'Retry backoff (ms)', value: process.env.VALIDATION_STAGE_RETRY_BACKOFF_MS || '2000', detail: 'Linear retry backoff multiplier.' },
  ];

  const modelProfiles = [
    { name: 'Balanced', model: 'claude-sonnet-4-6', useCase: 'Default production runs' },
    { name: 'Deep Reasoning', model: 'claude-opus-4-6', useCase: 'High-stakes synthesis + strategy' },
    { name: 'Fast Draft', model: 'claude-3-5-haiku-20241022', useCase: 'Quick retries / low-cost checks' },
    { name: 'Custom', model: 'manual override', useCase: 'Per-run input from report detail page' },
  ];

  const envConfigured = envVars.filter((v) => v.status).length;
  const envMissing = envVars.length - envConfigured;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuration</h1>
        <p className="text-gray-600 mt-1">Environment variables and API connections</p>
      </div>

      {/* Top Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Env configured" value={`${envConfigured}/${envVars.length}`} tone={envMissing === 0 ? 'green' : 'amber'} />
        <SummaryCard title="Service health" value={[newsHealth.brave, newsHealth.newsapi, newsHealth.googleRss, newsHealth.cache].filter(Boolean).length + '/4'} tone={newsHealth.brave && newsHealth.cache ? 'green' : 'amber'} />
        <SummaryCard title="Phase C profile" value={`${modelRouting[1].value} retries`} tone="blue" />
      </div>

      {/* Service Health */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Service Health</h2>
          <p className="text-sm text-gray-600 mt-1">Real-time status of external APIs</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <ServiceStatus service="Brave Search" status={newsHealth.brave} detail="Primary external discovery source" />
          <ServiceStatus service="NewsAPI" status={newsHealth.newsapi} detail="Secondary news fallback" />
          <ServiceStatus service="Google News RSS" status={newsHealth.googleRss} detail="Free backup feed" />
          <ServiceStatus service="Cache" status={newsHealth.cache} detail="Last-resort source for Signal sends" />
        </div>
      </div>

      {/* Model Routing */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Model Routing</h2>
          <p className="text-sm text-gray-600 mt-1">Phase C runtime controls and model defaults</p>
        </div>
        <div className="p-6 space-y-3">
          {modelRouting.map((item) => (
            <div key={item.label} className="rounded-md border border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                </div>
                <code className="text-xs bg-gray-100 border border-gray-200 rounded px-2 py-1 text-gray-700">
                  {item.value}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Profiles */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Model Profiles</h2>
          <p className="text-sm text-gray-600 mt-1">Used by the run-time model picker in report detail → resume.</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {modelProfiles.map((profile) => (
            <div key={profile.name} className="rounded-md border border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                <code className="text-[11px] bg-gray-100 border border-gray-200 rounded px-2 py-0.5 text-gray-700">
                  {profile.model}
                </code>
              </div>
              <p className="text-xs text-gray-500 mt-1">{profile.useCase}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Environment Variables */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Environment Variables</h2>
          <p className="text-sm text-gray-600 mt-1">API keys and configuration (values masked for security)</p>
        </div>
        {envMissing > 0 && (
          <div className="mx-6 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {envMissing} environment variable{envMissing > 1 ? 's are' : ' is'} missing. Pipeline reliability may degrade until these are set.
          </div>
        )}
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
                <tr key={env.name} className={!env.status ? 'bg-red-50/40' : ''}>
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

      {/* Ops Runbook */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ops Runbook</h2>
          <p className="text-sm text-gray-600 mt-1">Quick links for pipeline triage + reliability checks</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <a href="/admin/reports" className="rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50">
            <p className="font-medium text-gray-900">Report Queue</p>
            <p className="text-xs text-gray-500 mt-1">Review failed or unreviewed reports.</p>
          </a>
          <a href="/api/admin/pipeline-runs/health" className="rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50">
            <p className="font-medium text-gray-900">Pipeline Health JSON</p>
            <p className="text-xs text-gray-500 mt-1">24h SLO + retry metrics endpoint.</p>
          </a>
          <a href="/admin/reports?filter=partial" className="rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50">
            <p className="font-medium text-gray-900">Partial Runs</p>
            <p className="text-xs text-gray-500 mt-1">Jump straight to incomplete validations.</p>
          </a>
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
function SummaryCard({ title, value, tone }: { title: string; value: string; tone: 'green' | 'amber' | 'blue' }) {
  const toneStyles: Record<string, string> = {
    green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneStyles[tone] || toneStyles.blue}`}>
      <p className="text-xs uppercase tracking-wide opacity-70">{title}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function ServiceStatus({ service, status, detail }: { service: string; status: boolean; detail: string }) {
  return (
    <div className="rounded-lg border border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{service}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {status ? 'Online' : 'Offline'}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">{detail}</p>
    </div>
  );
}
