/**
 * build-pdf.ts
 * Shared PDF generation utility for the Wavelength validation pipeline.
 * Used by both the orchestrator (API-triggered runs) and run-validation.ts (CLI runs).
 *
 * This is a permanent part of the pipeline — every validation report produces a PDF.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { generatePDF } from '@/lib/pdf/generate-pdf';

export interface BuildPDFOptions {
  projectId: string;
  programName: string;
  clientName: string;
  fullReport: string;
  /** Optional: copy PDF to this local path (dev/CLI use only) */
  desktopPath?: string;
}

export interface BuildPDFResult {
  pageCount: number;
  sizeKB: number;
  storagePath: string;
}

/**
 * Cleans report markdown for PDF rendering:
 * - Strips frontmatter and cover page div
 * - Removes TOC (PDF uses heading styles for navigation)
 * - Removes page-break divs (PDF renderer handles pagination)
 * - Demotes heading levels (h1→h2, h2→h3, h3→h4) for PDF typography
 * - Collapses excessive blank lines
 */
export function prepareMarkdownForPDF(markdown: string): string {
  let md = markdown;
  md = md.replace(/^---[\s\S]*?---\n/, '');
  md = md.replace(/<div style="text-align:center[^>]*>[\s\S]*?<\/div>\s*<div style="page-break-after:\s*always;?\s*"><\/div>/i, '');
  md = md.replace(/^# Table of Contents\n[\s\S]*?<div style="page-break-after:\s*always;?\s*"><\/div>/m, '');
  md = md.replace(/<div style="page-break-after:\s*always;?\s*"><\/div>\s*/g, '');
  md = md.replace(/^### /gm, '#### ');
  md = md.replace(/^## /gm, '### ');
  md = md.replace(/^# /gm, '## ');
  md = md.replace(/\n{4,}/g, '\n\n').trim();
  return md;
}

/**
 * Generates a PDF from the full validation report markdown,
 * uploads it to Supabase Storage, and optionally copies it to a local path.
 *
 * Returns page count, size, and storage path.
 * Throws on failure — callers should wrap in try/catch.
 */
export async function buildValidationPDF(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  opts: BuildPDFOptions,
): Promise<BuildPDFResult> {
  const { projectId, programName, clientName, fullReport, desktopPath } = opts;

  const pdfMarkdown = prepareMarkdownForPDF(fullReport);
  const tmpPath = `/tmp/wavelength-${projectId.slice(0, 8)}-${Date.now()}.pdf`;

  const pdfResult = await generatePDF(pdfMarkdown, {
    title: programName || 'Program',
    subtitle: 'Program Validation Report',
    preparedFor: clientName || '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    reportType: 'validation',
    outputPath: tmpPath,
  });

  const { readFileSync, copyFileSync, unlinkSync } = await import('fs');

  if (desktopPath) {
    copyFileSync(tmpPath, desktopPath);
  }

  const pdfBuffer = readFileSync(tmpPath);
  const storagePath = `reports/${projectId}/validation-report.pdf`;

  await supabase.storage.from('reports').upload(storagePath, pdfBuffer, {
    contentType: 'application/pdf',
    upsert: true,
  });

  try { unlinkSync(tmpPath); } catch { /* cleanup is best-effort */ }

  return { pageCount: pdfResult.pageCount, sizeKB: pdfResult.sizeKB, storagePath };
}
