import { readFileSync } from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const INPUT = '/Users/matt/.openclaw/workspace/wavelength-backend-docs.md';
const OUTPUT = '/Users/matt/Library/Mobile Documents/com~apple~CloudDocs/Businesses/Wavelength/Wavelength-Backend-Technical-Documentation.pdf';

const md = readFileSync(INPUT, 'utf8');
const body = marked(md);

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    line-height: 1.65;
    color: #1a1a2e;
    background: #ffffff;
    padding: 48px 52px;
    max-width: 900px;
    margin: 0 auto;
  }

  /* Cover-style header for first H1 */
  h1:first-of-type {
    font-size: 28px;
    font-weight: 800;
    color: #1a1a2e;
    margin-bottom: 6px;
    padding-bottom: 16px;
    border-bottom: 3px solid #7c3aed;
    letter-spacing: -0.02em;
  }

  h1 { font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 32px 0 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
  h2 { font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 24px 0 8px; }
  h3 { font-size: 13px; font-weight: 700; color: #374151; margin: 18px 0 6px; }
  h4 { font-size: 12px; font-weight: 600; color: #4b5563; margin: 14px 0 4px; }

  p { margin-bottom: 10px; color: #374151; }

  ul, ol { margin: 8px 0 12px 20px; }
  li { margin-bottom: 4px; color: #374151; }

  code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 10px;
    background: #f3f4f6;
    color: #7c3aed;
    padding: 1px 5px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  }

  pre {
    background: #1e1e2e;
    color: #cdd6f4;
    padding: 14px 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 12px 0;
    font-size: 10px;
    line-height: 1.6;
    border: 1px solid #313244;
  }
  pre code {
    background: none;
    color: inherit;
    padding: 0;
    border: none;
    font-size: 10px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 18px;
    font-size: 10.5px;
  }
  th {
    background: #7c3aed;
    color: white;
    padding: 7px 10px;
    text-align: left;
    font-weight: 600;
    font-size: 10px;
    letter-spacing: 0.03em;
  }
  td {
    padding: 6px 10px;
    border-bottom: 1px solid #e5e7eb;
    color: #374151;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #f9fafb; }

  blockquote {
    border-left: 3px solid #7c3aed;
    padding: 8px 16px;
    background: #faf5ff;
    margin: 12px 0;
    color: #4b5563;
    font-style: italic;
  }

  hr {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 24px 0;
  }

  strong { color: #1a1a2e; }

  /* Page header/footer */
  @page {
    margin: 60px 52px 52px;
    @top-right { content: "Wavelength — Internal Documentation"; font-size: 9px; color: #9ca3af; }
    @bottom-right { content: counter(page); font-size: 9px; color: #9ca3af; }
  }

  @media print {
    h1, h2, h3 { page-break-after: avoid; }
    pre, table { page-break-inside: avoid; }
  }
</style>
</head>
<body>
${body}
</body>
</html>`;

console.log('Launching Chrome...');
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.pdf({
  path: OUTPUT,
  format: 'Letter',
  printBackground: true,
  margin: { top: '0.75in', bottom: '0.75in', left: '0.65in', right: '0.65in' },
});
await browser.close();
console.log(`✓ PDF saved: ${OUTPUT}`);
