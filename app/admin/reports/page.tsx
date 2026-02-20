/**
 * Reports Management Page
 * View, filter, and manage validation reports
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
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Validation reports and pipeline runs</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
          + New Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Total Reports" value={reports.length} />
        <StatBox title="This Week" value={reports.filter(r => isThisWeek(r.created_at)).length} />
        <StatBox title="Pending" value={reports.filter(r => r.status === 'pending').length} />
        <StatBox title="Completed" value={reports.filter(r => r.status === 'review' || r.status === 'completed').length} />
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {report.program_name || 'Untitled'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {report.client_name || 'Unknown'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={report.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(report.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link 
                    href={`/admin/reports/${report.id}`}
                    className="text-purple-600 hover:text-purple-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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

// Helper components
function StatBox({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-gray-100 text-gray-800',
    researching: 'bg-blue-100 text-blue-800',
    review: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors] || colors.pending}`}>
      {status}
    </span>
  );
}

// Data helpers
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
