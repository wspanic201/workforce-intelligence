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
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const activeFilter = filter || 'all';
  const { reports, pipelineRunMap, partialProjectIds } = await getReportsWithRuns();

  // Apply filter
  const filteredReports = reports.filter((r) => {
    if (activeFilter === 'all') return true;
    const run = pipelineRunMap[r.id];
    if (activeFilter === 'reviewed') return !!run?.reviewed_at;
    if (activeFilter === 'unreviewed') return run && !run.reviewed_at;
    if (activeFilter === 'partial') return partialProjectIds.has(r.id);
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1 text-sm">Validation reports and pipeline runs</p>
        </div>
        <Link
          href="/admin/intake"
          className="font-heading font-semibold text-sm py-2.5 px-5 rounded-xl text-white transition-all hover:-translate-y-0.5 inline-block"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #14b8a6 100%)' }}
        >
          + New Report
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Total Reports" value={reports.length} accent="purple" />
        <StatBox title="This Week" value={reports.filter(r => isThisWeek(r.created_at)).length} accent="blue" />
        <StatBox title="Pending" value={reports.filter(r => r.status === 'pending').length} accent="amber" />
        <StatBox title="Reviewed" value={Object.values(pipelineRunMap).filter(r => r?.reviewed_at).length} accent="teal" />
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
            href={tab.key === 'all' ? '/admin/reports' : `/admin/reports?filter=${tab.key}`}
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
                <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
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
                      <span className="text-xs text-slate-600">{run.model.replace('claude-', '')}</span>
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
                <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
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

async function getReportsWithRuns() {
  try {
    const supabase = getSupabaseServerClient();

    // Fetch reports, pipeline runs, and research component counts in parallel
    const [reportsResult, runsResult, componentsResult] = await Promise.all([
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

    return { reports: reportsResult.data || [], pipelineRunMap, partialProjectIds };
  } catch (error) {
    console.error('[Admin Reports] Failed to fetch:', error);
    return { reports: [], pipelineRunMap: {}, partialProjectIds: new Set<string>() };
  }
}

function isThisWeek(dateString: string): boolean {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return new Date(dateString) >= oneWeekAgo;
}
