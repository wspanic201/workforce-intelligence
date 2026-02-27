/**
 * Configuration Management
 * View environment variables, test connections, manage settings
 */

import { checkNewsSourcesHealth } from '@/lib/signal/news-sources';
import { ModelProfilesCrudPanel } from './model-profiles-crud';

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

  const envConfigured = envVars.filter((v) => v.status).length;
  const envMissing = envVars.length - envConfigured;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-slate-900">Configuration</h1>
        <p className="text-slate-500 mt-1 text-sm">Environment variables and API connections</p>
      </div>

      {/* Top Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Env configured" value={`${envConfigured}/${envVars.length}`} tone={envMissing === 0 ? 'green' : 'amber'} />
        <SummaryCard title="Service health" value={[newsHealth.brave, newsHealth.newsapi, newsHealth.googleRss, newsHealth.cache].filter(Boolean).length + '/4'} tone={newsHealth.brave && newsHealth.cache ? 'green' : 'amber'} />
        <SummaryCard title="Phase C profile" value={`${modelRouting[1].value} retries`} tone="blue" />
      </div>

      {/* Service Health */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Service Health</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time status of external APIs</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <ServiceStatus service="Brave Search" status={newsHealth.brave} detail="Primary external discovery source" />
          <ServiceStatus service="NewsAPI" status={newsHealth.newsapi} detail="Secondary news fallback" />
          <ServiceStatus service="Google News RSS" status={newsHealth.googleRss} detail="Free backup feed" />
          <ServiceStatus service="Cache" status={newsHealth.cache} detail="Last-resort source for Signal sends" />
        </div>
      </div>

      {/* Model Routing */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Model Routing</h2>
          <p className="text-sm text-slate-500 mt-1">Phase C runtime controls and model defaults</p>
        </div>
        <div className="p-6 space-y-3">
          {modelRouting.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.detail}</p>
                </div>
                <code className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-mono">
                  {item.value}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Profiles CRUD */}
      <ModelProfilesCrudPanel />

      {/* Environment Variables */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Environment Variables</h2>
          <p className="text-sm text-slate-500 mt-1">API keys and configuration (values masked for security)</p>
        </div>
        {envMissing > 0 && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {envMissing} environment variable{envMissing > 1 ? 's are' : ' is'} missing. Pipeline reliability may degrade until these are set.
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-slate-100 text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Variable</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Service</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {envVars.map((env) => (
                <tr key={env.name} className={`hover:bg-slate-50/70 transition-colors ${!env.status ? 'bg-red-50/40' : ''}`}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-slate-900">
                    {env.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                    {env.service}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {env.status ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700">Set</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700">Missing</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ops Runbook */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Ops Runbook</h2>
          <p className="text-sm text-slate-500 mt-1">Quick links for pipeline triage + reliability checks</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <a href="/admin/reports" className="rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50 hover:border-slate-300 transition-all">
            <p className="font-medium text-slate-900">Report Queue</p>
            <p className="text-xs text-slate-400 mt-1">Review failed or unreviewed reports.</p>
          </a>
          <a href="/api/admin/pipeline-runs/health" className="rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50 hover:border-slate-300 transition-all">
            <p className="font-medium text-slate-900">Pipeline Health JSON</p>
            <p className="text-xs text-slate-400 mt-1">24h SLO + retry metrics endpoint.</p>
          </a>
          <a href="/admin/reports?filter=partial" className="rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50 hover:border-slate-300 transition-all">
            <p className="font-medium text-slate-900">Partial Runs</p>
            <p className="text-xs text-slate-400 mt-1">Jump straight to incomplete validations.</p>
          </a>
        </div>
      </div>

      {/* Documentation Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-400 mt-0.5">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <h3 className="text-sm font-semibold text-blue-800">Configuration Guide</h3>
            <p className="text-sm text-blue-700 mt-1">
              To update environment variables, use the Vercel dashboard or CLI: <code className="font-mono bg-blue-100 rounded px-1.5 py-0.5 text-xs">vercel env add KEY_NAME production</code>
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Reference: <code className="font-mono bg-blue-100 rounded px-1.5 py-0.5 text-xs">/workspace/api-keys-reference.md</code>
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
    <div className={`rounded-xl border px-5 py-4 ${toneStyles[tone] || toneStyles.blue}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{title}</p>
      <p className="text-xl font-heading font-bold mt-1">{value}</p>
    </div>
  );
}

function ServiceStatus({ service, status, detail }: { service: string; status: boolean; detail: string }) {
  return (
    <div className="rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50/50 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-900">{service}</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {status ? 'Online' : 'Offline'}
        </span>
      </div>
      <p className="text-xs text-slate-400 mt-1">{detail}</p>
    </div>
  );
}
