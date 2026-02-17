import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { ReportViewer } from './components/ReportViewer';
import type { ReportData } from './types';

interface PageProps {
  params: Promise<{ token: string }>;
}

async function loadReportData(token: string): Promise<ReportData | null> {
  if (token === 'demo') {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'demo-report.json');
      const raw = fs.readFileSync(dataPath, 'utf-8');
      const data = JSON.parse(raw);
      return {
        ...data,
        reportConfig: {
          token,
          hasPassword: false,
          generatedAt: data.brief?.generatedAt || new Date().toISOString(),
        },
      } as ReportData;
    } catch {
      return null;
    }
  }
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const data = await loadReportData(token);
  if (!data) return { title: 'Report Not Found' };
  const institution = data.structuredData?.regionalIntelligence?.institution?.name || 'Institution';
  return {
    title: `${institution} — Program Market Scan | Wavelength`,
    description: `Program discovery analysis for ${institution}. ${data.brief?.programCount || 0} program opportunities identified.`,
    robots: { index: false, follow: false },
  };
}

export default async function ReportPage({ params }: PageProps) {
  const { token } = await params;
  const data = await loadReportData(token);

  if (!data) {
    notFound();
  }

  return <ReportViewer data={data} token={token} />;
}
