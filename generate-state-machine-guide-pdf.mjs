import puppeteer from 'puppeteer-core';
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
import { readFileSync } from 'fs';
import { marked } from 'marked';

const MD_PATH = './encore-state-machine-interview-guide.md';
const OUTPUT_DIR = `${process.env.HOME}/Library/Mobile Documents/com~apple~CloudDocs/Businesses/Encore/State Machines`;
const OUTPUT_FILE = `${OUTPUT_DIR}/Encore-State-Machine-Interview-Guide.pdf`;

const md = readFileSync(MD_PATH, 'utf8');
const body = marked.parse(md);

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  /* Cover page */
  .cover {
    height: 100vh;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 80px;
    box-sizing: border-box;
    page-break-after: always;
  }
  .cover-eyebrow {
    font-family: 'Courier New', monospace;
    font-size: 11px;
    color: #14b8a6;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .cover-title {
    font-family: Georgia, serif;
    font-size: 44px;
    color: #f8fafc;
    line-height: 1.15;
    margin-bottom: 16px;
    max-width: 600px;
  }
  .cover-subtitle {
    font-family: Georgia, serif;
    font-size: 20px;
    color: #94a3b8;
    font-style: italic;
    margin-bottom: 48px;
    max-width: 520px;
  }
  .cover-meta {
    font-family: 'Courier New', monospace;
    font-size: 11px;
    color: #475569;
    letter-spacing: 1px;
  }
  .cover-divider {
    width: 60px;
    height: 3px;
    background: #14b8a6;
    margin-bottom: 40px;
  }

  /* Body */
  body {
    font-family: Georgia, serif;
    font-size: 13px;
    line-height: 1.75;
    color: #1e293b;
    max-width: 750px;
    margin: 0 auto;
    padding: 48px 60px;
    background: #ffffff;
  }

  h1 { 
    font-size: 26px; 
    color: #0f172a; 
    border-bottom: 2px solid #14b8a6;
    padding-bottom: 10px;
    margin-top: 48px;
    margin-bottom: 20px;
  }
  h2 { 
    font-size: 20px; 
    color: #0f172a;
    margin-top: 40px;
    margin-bottom: 12px;
  }
  h2:first-of-type { margin-top: 0; }
  h3 { 
    font-size: 15px; 
    color: #1e40af;
    margin-top: 28px;
    margin-bottom: 8px;
    font-family: 'Courier New', monospace;
    font-weight: bold;
  }

  p { margin-bottom: 12px; }

  ul, ol {
    margin: 10px 0 16px 24px;
    padding: 0;
  }
  li { margin-bottom: 6px; }

  /* Question number callout */
  h3 {
    background: #f0f9ff;
    border-left: 4px solid #0ea5e9;
    padding: 8px 14px;
    border-radius: 0 6px 6px 0;
  }

  /* State machine section headers */
  h1 {
    page-break-before: always;
  }
  h1:first-of-type {
    page-break-before: avoid;
  }

  /* Special callout blocks */
  blockquote {
    background: #f8fafc;
    border-left: 4px solid #14b8a6;
    margin: 16px 0;
    padding: 12px 18px;
    border-radius: 0 8px 8px 0;
    color: #334155;
    font-style: italic;
  }

  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 12px;
  }
  th {
    background: #0f172a;
    color: #f8fafc;
    padding: 10px 12px;
    text-align: left;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    letter-spacing: 0.5px;
  }
  td {
    padding: 9px 12px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #f8fafc; }
  tr:first-child td { font-weight: bold; }

  /* HOW TO USE section */
  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 32px 0;
  }

  strong { color: #0f172a; }

  /* Section dividers between machines */
  h1::before {
    content: '';
    display: block;
    height: 4px;
    background: linear-gradient(90deg, #14b8a6, transparent);
    margin-bottom: 16px;
  }

  /* Footer note */
  em:last-of-type {
    display: block;
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
    color: #94a3b8;
    font-size: 11px;
  }

  @media print {
    body { padding: 32px 48px; }
    h1 { page-break-before: always; font-size: 22px; }
    h1:first-of-type { page-break-before: avoid; }
  }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-eyebrow">Encore CE Platform</div>
  <div class="cover-title">State Machine Interview Guide</div>
  <div class="cover-subtitle">A reference for dictating your CE workflows so Cassidy can build the formal state machines</div>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    COVERS: A5 Section Lifecycle · A2 Enrollment · A3 Payment · A4 Completion · A1 Schema Notes<br>
    VERSION 1.0 · FEBRUARY 2026
  </div>
</div>

${body}

</body>
</html>`;

const browser = await puppeteer.launch({ headless: true, executablePath: chromePath, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });

await page.pdf({
  path: OUTPUT_FILE,
  format: 'Letter',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
});

await browser.close();
console.log(`✅ PDF saved to: ${OUTPUT_FILE}`);
