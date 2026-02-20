/**
 * Serverless PDF generation using @sparticuz/chromium + puppeteer-core.
 * Works on Vercel serverless (no local Chrome needed).
 * Falls back to local Chrome in development.
 */

import { markdownToHtml } from './markdown-to-html';
import { wrapInTemplate } from './template';
import type { PDFOptions } from './generate-pdf';

export type { PDFOptions };

export async function generatePDFBuffer(
  markdown: string,
  options: Omit<PDFOptions, 'outputPath'>
): Promise<Buffer> {
  // Strip H1 header block (cover page handles this)
  const cleaned = markdown.replace(
    /^# [^\n]+\n(?:\s*\*\*[^\n]+\n)*\s*---\s*\n?/,
    ''
  );

  const htmlContent = markdownToHtml(cleaned);
  const fullHtml = wrapInTemplate(htmlContent, { ...options, outputPath: '' });

  let browser;
  try {
    const puppeteer = (await import('puppeteer-core')).default;

    let executablePath: string;
    let args: string[] = [];
    let headless: boolean | 'shell' = true;

    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      // Serverless environment
      const chromium = (await import('@sparticuz/chromium')).default;
      executablePath = await chromium.executablePath();
      args = chromium.args;
      headless = chromium.headless;
    } else {
      // Local development
      executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    }

    browser = await puppeteer.launch({
      args,
      executablePath,
      headless,
    });

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    const reportTypeLabel = options.reportType === 'discovery'
      ? 'Market Scan'
      : 'Validation Report';
    const client = options.preparedFor || '';
    const date = options.date || '';

    const headerTemplate = `
      <div style="width: 100%; font-family: -apple-system, 'Segoe UI', sans-serif; font-size: 8px; padding: 10px 40px 0; display: flex; justify-content: space-between; align-items: center; color: #94a3b8; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; border-radius: 3px; font-weight: 800; font-size: 9px;">W</span>
          <span style="font-weight: 700; color: #1a2332; font-size: 9px; letter-spacing: -0.2px;">Wavelength</span>
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

    const pdfBuffer = await page.pdf({
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

    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
