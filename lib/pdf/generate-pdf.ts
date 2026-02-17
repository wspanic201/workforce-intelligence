/**
 * PDF generation for WorkforceOS Discovery Briefs and Validation Reports.
 * 
 * Pipeline: Markdown → HTML → Branded Template → Puppeteer → PDF
 * 
 * Usage:
 *   const result = await generatePDF(markdown, {
 *     title: 'Program Discovery Brief',
 *     preparedFor: 'Kirkwood Community College',
 *     reportType: 'discovery',
 *     outputPath: '/tmp/report.pdf',
 *   });
 */

import { markdownToHtml } from './markdown-to-html';
import { wrapInTemplate } from './template';
import { statSync } from 'fs';

export interface PDFOptions {
  title: string;
  subtitle?: string;
  preparedFor?: string;
  date?: string;
  reportType: 'discovery' | 'validation';
  outputPath: string;
}

export async function generatePDF(
  markdown: string,
  options: PDFOptions
): Promise<{ path: string; pageCount: number; sizeKB: number }> {
  // 1. Strip the H1 header block (cover page handles this)
  let cleaned = markdown.replace(
    /^# [^\n]+\n(?:\s*\*\*[^\n]+\n)*\s*---\s*\n?/,
    ''
  );

  // Convert markdown to HTML
  const htmlContent = markdownToHtml(cleaned);

  // 2. Wrap in branded template
  const fullHtml = wrapInTemplate(htmlContent, options);

  // 3. Launch browser and render PDF
  let browser;
  try {
    const puppeteer = (await import('puppeteer-core')).default;
    browser = await puppeteer.launch({
      headless: true,
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    });
    const page = await browser.newPage();

    // Set content and wait for rendering
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    // Build header/footer templates
    const reportTypeLabel = options.reportType === 'discovery'
      ? 'Discovery Brief'
      : 'Validation Report';
    const client = options.preparedFor || '';
    const date = options.date || '';

    const headerTemplate = `
      <div style="width: 100%; font-family: -apple-system, 'Segoe UI', sans-serif; font-size: 8px; padding: 10px 40px 0; display: flex; justify-content: space-between; align-items: center; color: #94a3b8; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="background: #1a2332; color: white; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; border-radius: 3px; font-weight: 800; font-size: 9px;">W</span>
          <span style="font-weight: 700; color: #1a2332; font-size: 9px; letter-spacing: -0.2px;">WorkforceOS</span>
        </div>
        <div style="font-weight: 500; color: #64748b; font-size: 8px;">${reportTypeLabel}</div>
      </div>
    `;

    const footerTemplate = `
      <div style="width: 100%; font-family: -apple-system, 'Segoe UI', sans-serif; font-size: 7.5px; padding: 8px 40px 10px; display: flex; justify-content: space-between; align-items: center; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        <div>${client ? `Confidential — Prepared for ${client}` : 'Confidential'}</div>
        <div style="font-weight: 600; color: #64748b;">Page <span class="pageNumber"></span></div>
        <div>${date}</div>
      </div>
    `;

    // Generate PDF
    const pdfBuffer = await page.pdf({
      path: options.outputPath,
      format: 'Letter',
      margin: {
        top: '1.1in',
        right: '0.75in',
        bottom: '1in',
        left: '0.75in',
      },
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      printBackground: true,
      preferCSSPageSize: false,
    });

    // Get stats
    const stats = statSync(options.outputPath);
    const sizeKB = Math.round(stats.size / 1024);

    // Count pages from the PDF buffer
    const pdfStr = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer.toString('latin1')
      : typeof pdfBuffer === 'string'
        ? pdfBuffer
        : Buffer.from(pdfBuffer).toString('latin1');
    // Match /Type /Page but not /Type /Pages (the catalog)
    const pageMatches = pdfStr.match(/\/Type\s*\/Page\b(?!s)/g);
    const pageCount = pageMatches ? pageMatches.length : 0;

    return {
      path: options.outputPath,
      pageCount,
      sizeKB,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
