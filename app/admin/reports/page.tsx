/**
 * Reports Management Page
 * View, filter, and manage validation reports — Wavelength brand styling
 */

import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export default async function ReportsAdminPage() {
  const reports = await getReports();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1 text-sm">Validation reports and pipeline runs</p>
        </div>
        <button className="font-heading font-semibold text-sm py-2.5 px-5 rounded-xl text-white transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #14b8a6 100%)' }}>
          + New Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Total Reports" value={reports.length} accent="purple" />
        <StatBox title="This Week" value={reports.filter(r => isThisWeek(r.created_at)).length} accent="blue" />
        <StatBox title="Pending" value={reports.filter(r => r.status === 'pending').length} accent="amber" />
        <StatBox title="Completed" value={reports.filter(r => r.status === 'review' || r.status === 'completed').length} accent="teal" />
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">
                    {report.program_name || 'Untitled'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-500">
                    {report.client_name || 'Unknown'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={report.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(report.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="text-purple-600 hover:text-purple-900 font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No reports yet
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

async function getReports() {
  try {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('validation_projects')
      .select('id, program_name, client_name, status, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Admin Reports] Failed to fetch:', error);
    return [];
  }
}

function isThisWeek(dateString: string): boolean {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return new Date(dateString) >= oneWeekAgo;
}
