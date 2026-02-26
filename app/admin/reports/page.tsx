/**
 * Reports Management Page
 * View, filter, and manage validation reports — Wavelength brand styling
 */

import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/client';

interface ReportRow {
  id: string;
  program_name: string | null;
  client_name: string | null;
  status: string;
  created_at: string;
  // Joined from pipeline_runs (latest run)
  latest_run?: {
    model: string;
    pipeline_version: string;
    runtime_seconds: number | null;
    composite_score: number | null;
    review_scores: { overall: number } | null;
    reviewed_at: string | null;
  } | null;
}

export default async function ReportsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const { filter, q } = await searchParams;
  const activeFilter = filter || 'all';
  const query = (q || '').trim().toLowerCase();
  const { reports, pipelineRunMap, partialProjectIds, health } = await getReportsWithRuns();

  // Apply filter + search query
  const filteredReports = reports.filter((r) => {
    const run = pipelineRunMap[r.id];

    let matchesFilter = true;
    if (activeFilter === 'reviewed') matchesFilter = !!run?.reviewed_at;
    if (activeFilter === 'unreviewed') matchesFilter = !!run && !run.reviewed_at;
    if (activeFilter === 'partial') matchesFilter = partialProjectIds.has(r.id);

    if (!matchesFilter) return false;
    if (!query) return true;

    const haystack = [
      r.program_name || '',
      r.client_name || '',
      run?.report_id || '',
      run?.model || '',
    ].join(' ').toLowerCase();

    return haystack.includes(query);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900">Reports Command Center</h1>
          <p className="text-slate-500 mt-1 text-sm">Validation reports, retries, and quality review in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/config"
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Config
          </Link>
          <a
            href="/api/admin/pipeline-runs/health"
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Health JSON
          </a>
          <Link
            href="/admin/intake"
            className="font-heading font-semibold text-sm py-2.5 px-5 rounded-xl text-white transition-all hover:-translate-y-0.5 inline-block"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #14b8a6 100%)' }}
          >
            + New Report
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Total Reports" value={reports.length} accent="purple" />
        <StatBox title="This Week" value={reports.filter(r => isThisWeek(r.created_at)).length} accent="blue" />
        <StatBox title="Pending" value={reports.filter(r => r.status === 'pending').length} accent="amber" />
        <StatBox title="Reviewed" value={Object.values(pipelineRunMap).filter(r => r?.reviewed_at).length} accent="teal" />
      </div>

      {/* Workflow Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <form action="/admin/reports" className="flex items-center gap-2">
            <input type="hidden" name="filter" value={activeFilter} />
            <input
              name="q"
              defaultValue={q || ''}
              placeholder="Search program, client, report ID, model..."
              className="w-[320px] max-w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            <button className="text-sm px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">Search</button>
            {query && (
              <Link href={activeFilter === 'all' ? '/admin/reports' : `/admin/reports?filter=${activeFilter}`} className="text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                Clear
              </Link>
            )}
          </form>
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredReports.length}</span> of {reports.length} reports
          </p>
        </div>
      </div>

      {/* Reliability / Health */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Pipeline Health (24h)</h2>
            <p className="text-xs text-slate-500">Retry/recovery signal from pipeline telemetry</p>
          </div>
          <div className="flex items-center gap-2">
            {health && (
              <span className={`px-2.5 py-1 text-[11px] rounded-full font-semibold ${
                health.runFailed === 0 && health.stageFailed === 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : health.runFailed > 0
                    ? 'bg-red-50 text-red-700'
                    : 'bg-amber-50 text-amber-700'
              }`}>
                {health.runFailed === 0 && health.stageFailed === 0
                  ? 'Healthy'
                  : health.runFailed > 0
                    ? 'Action needed'
                    : 'Recovering'}
              </span>
            )}
            <a href="/api/admin/pipeline-runs/health" className="text-xs text-purple-600 hover:text-purple-800">Raw JSON</a>
          </div>
        </div>
        {health ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
            <HealthCell label="Runs completed" value={health.runCompleted} tone="emerald" />
            <HealthCell label="Runs failed" value={health.runFailed} tone={health.runFailed > 0 ? 'red' : 'slate'} />
            <HealthCell label="Stage failures" value={health.stageFailed} tone={health.stageFailed > 0 ? 'amber' : 'slate'} />
            <HealthCell label="Retries" value={health.stageRetried} tone={health.stageRetried > 0 ? 'blue' : 'slate'} />
            <HealthCell label="Avg runtime" value={health.avgRuntimeSeconds != null ? `${Math.round(health.avgRuntimeSeconds)}s` : '--'} tone="slate" />
            <HealthCell label="Last event" value={health.latestEventAt ? new Date(health.latestEventAt).toLocaleTimeString() : '--'} tone="slate" />
          </div>
        ) : (
          <p className="text-xs text-slate-400">Telemetry table unavailable in this environment yet.</p>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {[
          { key: 'all', label: 'All' },
          { key: 'unreviewed', label: 'Unreviewed' },
          { key: 'reviewed', label: 'Reviewed' },
          { key: 'partial', label: `Partial (${partialProjectIds.size})` },
        ].map(tab => (
          <Link
            key={tab.key}
            href={(() => {
              const params = new URLSearchParams();
              if (tab.key !== 'all') params.set('filter', tab.key);
              if (q) params.set('q', q);
              const qs = params.toString();
              return qs ? `/admin/reports?${qs}` : '/admin/reports';
            })()}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeFilter === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full divide-y divide-slate-100 text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Report ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Program
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Client
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Status
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Score
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Model
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Quality
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Time
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Date
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredReports.map((report) => {
              const run = pipelineRunMap[report.id];
              return (
                <tr key={report.id} className="hover:bg-slate-50/70 even:bg-slate-50/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {run?.report_id ? (
                      <span className="font-mono text-xs text-slate-600">{run.report_id}</span>
                    ) : (
                      <span className="text-xs text-slate-300">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">
                    <span className="font-medium text-slate-900">
                      {report.program_name || 'Untitled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[160px] truncate text-slate-500">
                    {report.client_name || 'Unknown'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {run?.composite_score != null ? (
                      <span className={`text-xs font-bold ${
                        run.composite_score >= 7 ? 'text-emerald-600' :
                        run.composite_score >= 5 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>{run.composite_score}/10</span>
                    ) : partialProjectIds.has(report.id) ? (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Partial</span>
                    ) : (
                      <span className="text-xs text-slate-300">--</span>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {run ? (
                      <ModelBadge model={run.model} />
                    ) : (
                      <span className="text-xs text-slate-300">--</span>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {run?.reviewed_at ? (
                      <QualityBadge score={run.review_scores?.overall ?? null} />
                    ) : run ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : (
                      <span className="text-xs text-slate-300">--</span>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-slate-500">
                    {run?.runtime_seconds ? `${Math.round(run.runtime_seconds)}s` : '--'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-slate-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap space-x-2">
                    <Link
                      href={`/admin/reports/${report.id}`}
                      className="text-xs text-purple-600 hover:text-purple-900 font-medium"
                    >
                      Review
                    </Link>
                    {run ? (
                      <a
                        href={`/api/admin/pipeline-runs/${report.id}/download-pdf`}
                        className="text-xs text-slate-400 hover:text-slate-700"
                        title="Download PDF"
                      >
                        ↓ PDF
                      </a>
                    ) : partialProjectIds.has(report.id) ? (
                      <a
                        href={`/api/admin/reports/${report.id}/export-raw`}
                        className="text-xs text-amber-500 hover:text-amber-700"
                        title="Export raw agent outputs"
                      >
                        ↓ Raw
                      </a>
                    ) : null}
                  </td>
                </tr>
              );
            })}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                  No reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatBox({ title, value, accent }: { title: string; value: number; accent: string }) {
  const gradients: Record<string, string> = {
    purple: 'from-purple-500 to-blue-500',
    blue: 'from-blue-500 to-cyan-500',
    teal: 'from-teal-500 to-emerald-500',
    amber: 'from-amber-500 to-orange-500',
  };

  return (
    <div className="relative bg-white rounded-xl border border-slate-200 p-5 shadow-sm overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[accent] || gradients.purple}`} />
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <p className="text-2xl font-heading font-bold text-slate-900 mt-2">{value}</p>
    </div>
  );
}

function HealthCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: 'slate' | 'emerald' | 'amber' | 'red' | 'blue';
}) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className={`rounded-lg border px-3 py-2 ${tones[tone] || tones.slate}`}>
      <div className="text-[11px] uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

function ModelBadge({ model }: { model: string }) {
  const lower = model.toLowerCase();
  const tone = lower.includes('opus')
    ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
    : lower.includes('sonnet') || lower.includes('claude')
      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
      : lower.includes('gpt') || lower.includes('openai') || lower.includes('codex')
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      {model.replace('anthropic/', '').replace('openai-codex/', '')}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-600',
    researching: 'bg-blue-50 text-blue-700',
    review: 'bg-amber-50 text-amber-700',
    completed: 'bg-emerald-50 text-emerald-700',
    error: 'bg-red-50 text-red-700',
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

function QualityBadge({ score }: { score: number | null }) {
  if (score == null) return <span className="text-xs text-slate-400">--</span>;
  const color = score >= 4 ? 'bg-emerald-100 text-emerald-700' :
                score >= 3 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700';
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>{score}/5</span>;
}

interface PipelineRunSummary {
  model: string;
  pipeline_version: string;
  runtime_seconds: number | null;
  composite_score: number | null;
  review_scores: { overall: number } | null;
  reviewed_at: string | null;
  report_id: string | null;
}

interface PipelineHealthSummary {
  lookbackHours: number;
  runCompleted: number;
  runFailed: number;
  stageFailed: number;
  stageRetried: number;
  avgRuntimeSeconds: number | null;
  latestEventAt: string | null;
}

function isMissingTableError(error: any): boolean {
  const msg = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '').toLowerCase();
  return code === '42p01' || msg.includes('does not exist') || msg.includes('relation') || msg.includes('could not find the table');
}

async function getReportsWithRuns(): Promise<{
  reports: ReportRow[];
  pipelineRunMap: Record<string, PipelineRunSummary>;
  partialProjectIds: Set<string>;
  health: PipelineHealthSummary | null;
}> {
  try {
    const supabase = getSupabaseServerClient();

    const healthSince = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Fetch reports, pipeline runs, and research component counts in parallel
    const [reportsResult, runsResult, componentsResult, healthRunsResult, healthEventsResult] = await Promise.all([
      supabase
        .from('validation_projects')
        .select('id, program_name, client_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('pipeline_runs')
        .select('project_id, model, pipeline_version, runtime_seconds, composite_score, review_scores, reviewed_at, report_id')
        .order('created_at', { ascending: false }),
      supabase
        .from('research_components')
        .select('project_id, status'),
      supabase
        .from('pipeline_runs')
        .select('id, runtime_seconds, created_at')
        .gte('created_at', healthSince)
        .order('created_at', { ascending: false })
        .limit(250),
      supabase
        .from('pipeline_run_events')
        .select('event_type, created_at')
        .gte('created_at', healthSince)
        .order('created_at', { ascending: false })
        .limit(1000),
    ]);

    if (reportsResult.error) throw reportsResult.error;

    // Build a map of project_id -> latest run
    const pipelineRunMap: Record<string, PipelineRunSummary> = {};
    if (!runsResult.error && runsResult.data) {
      for (const run of runsResult.data) {
        if (!pipelineRunMap[run.project_id]) {
          pipelineRunMap[run.project_id] = {
            model: run.model,
            pipeline_version: run.pipeline_version,
            runtime_seconds: run.runtime_seconds,
            composite_score: run.composite_score,
            review_scores: run.review_scores as PipelineRunSummary['review_scores'],
            reviewed_at: run.reviewed_at,
            report_id: run.report_id,
          };
        }
      }
    }

    // Build set of project IDs that have research_components but no pipeline_runs
    const partialProjectIds = new Set<string>();
    if (!componentsResult.error && componentsResult.data) {
      const componentsByProject: Record<string, number> = {};
      for (const comp of componentsResult.data) {
        if (comp.status === 'completed') {
          componentsByProject[comp.project_id] = (componentsByProject[comp.project_id] || 0) + 1;
        }
      }
      for (const [projectId, count] of Object.entries(componentsByProject)) {
        if (count > 0 && !pipelineRunMap[projectId]) {
          partialProjectIds.add(projectId);
        }
      }
    }

    let health: PipelineHealthSummary | null = null;
    if (!healthRunsResult.error) {
      const healthRuns = healthRunsResult.data || [];
      const runtimeValues = healthRuns
        .map((r) => r.runtime_seconds)
        .filter((v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0);

      const safeEvents = healthEventsResult.error
        ? (isMissingTableError(healthEventsResult.error) ? [] : null)
        : (healthEventsResult.data || []);

      if (safeEvents !== null) {
        const runCompleted = safeEvents.filter((e) => e.event_type === 'run_completed').length;
        const runFailed = safeEvents.filter((e) => e.event_type === 'run_failed').length;
        const stageFailed = safeEvents.filter((e) => e.event_type === 'stage_failed').length;
        const stageRetried = safeEvents.filter((e) => e.event_type === 'stage_retry_scheduled').length;
        const latestEventAt = safeEvents[0]?.created_at || healthRuns[0]?.created_at || null;

        health = {
          lookbackHours: 24,
          runCompleted,
          runFailed,
          stageFailed,
          stageRetried,
          avgRuntimeSeconds: runtimeValues.length
            ? Number((runtimeValues.reduce((a, b) => a + b, 0) / runtimeValues.length).toFixed(2))
            : null,
          latestEventAt,
        };
      }
    }

    return { reports: reportsResult.data || [], pipelineRunMap, partialProjectIds, health };
  } catch (error) {
    console.error('[Admin Reports] Failed to fetch:', error);
    return { reports: [], pipelineRunMap: {}, partialProjectIds: new Set<string>(), health: null as PipelineHealthSummary | null };
  }
}

function isThisWeek(dateString: string): boolean {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return new Date(dateString) >= oneWeekAgo;
}
