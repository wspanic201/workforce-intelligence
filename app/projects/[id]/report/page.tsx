'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ValidationReport } from '@/lib/types/database';
import ReactMarkdown from 'react-markdown';

export default function ReportPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [report, setReport] = useState<ValidationReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [projectId]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/report`);
      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadMarkdown = () => {
    if (!report) return;
    const blob = new Blob([report.full_report_markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validation-report.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Report not found</p>
        <Link href={`/projects/${projectId}`}>
          <Button className="mt-4">Back to Project</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 flex justify-between items-center">
        <Link href={`/projects/${projectId}`}>
          <Button variant="ghost">← Back to Project</Button>
        </Link>
        <div className="flex gap-2">
          <Button onClick={downloadMarkdown}>Download Markdown</Button>
          <Button variant="outline" onClick={() => window.print()}>
            Print / Save PDF
          </Button>
        </div>
      </div>

      <Card className="p-8 md:p-12 prose prose-slate max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-4xl font-bold mb-6 mt-8 first:mt-0">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-3xl font-semibold mb-4 mt-8 border-b pb-2">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-2xl font-semibold mb-3 mt-6">{children}</h3>
            ),
            p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
            ),
            li: ({ children }) => <li className="leading-7">{children}</li>,
            table: ({ children }) => (
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-300">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50">{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>
            ),
            tr: ({ children }) => <tr>{children}</tr>,
            th: ({ children }) => (
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{children}</td>
            ),
            hr: () => <hr className="my-8 border-gray-300" />,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            ),
          }}
        >
          {report.full_report_markdown}
        </ReactMarkdown>
      </Card>
    </div>
  );
}
