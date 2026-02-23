import { getSupabaseServerClient } from '@/lib/supabase/client';
import { markdownToHtml } from '@/lib/pdf/markdown-to-html';
import Link from 'next/link';
import { PrintButton } from '@/components/ui/PrintButton';

export default async function ReportViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data: report } = await supabase
    .from('validation_reports')
    .select('full_report_markdown, version, created_at, project_id')
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!report?.full_report_markdown) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-slate-400">No report found for this project.</p>
        <Link href={`/admin/reports/${id}`} className="text-purple-600 hover:underline text-sm mt-4 inline-block">
          ← Back to review
        </Link>
      </div>
    );
  }

  // Strip YAML frontmatter if present
  const cleaned = report.full_report_markdown.replace(/^---[\s\S]*?---\n/, '');
  const html = markdownToHtml(cleaned);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href={`/admin/reports/${id}`} className="text-sm text-purple-600 hover:underline">
          ← Back to review
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            v{report.version} · {new Date(report.created_at).toLocaleDateString()}
          </span>
          <PrintButton />
        </div>
      </div>
      <article
        className="prose prose-slate max-w-none prose-headings:font-heading prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:border-purple-200 prose-h2:pb-2 prose-table:text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
