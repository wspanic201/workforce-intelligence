import { readFileSync } from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const mdContent = readFileSync('/Users/matt/.openclaw/workspace/encore-retell-callflow.md', 'utf8')
  .replace(/^---[\s\S]*?---\n/, '');

const bodyHtml = await marked(mdContent);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 10.5px; line-height: 1.6;
    color: #212529; background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .cover {
    width: 210mm; min-height: 297mm;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    background: #0a0a1a;
    padding: 60px; page-break-after: always;
    position: relative; overflow: hidden;
  }
  .cover::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at 15% 25%, rgba(139,92,246,0.2) 0%, transparent 50%),
      radial-gradient(ellipse at 85% 75%, rgba(20,184,166,0.15) 0%, transparent 50%);
  }
  .cover-badge {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 3px;
    text-transform: uppercase; color: #a78bfa;
    margin-bottom: 32px; position: relative;
  }
  .cover-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 40px; font-weight: 700; line-height: 1.1;
    text-align: center; margin-bottom: 16px;
    color: white; position: relative;
  }
  .cover-subtitle {
    font-size: 15px; color: rgba(255,255,255,0.6);
    text-align: center; max-width: 500px;
    line-height: 1.5; margin-bottom: 48px; position: relative;
  }
  .cover-accent-line {
    width: 60px; height: 2px;
    background: linear-gradient(90deg, #8b5cf6, #14b8a6);
    margin: 32px auto; position: relative;
  }
  .cover-meta { display: flex; gap: 32px; position: relative; }
  .cover-meta-item { text-align: center; }
  .cover-meta-label {
    font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
    color: rgba(255,255,255,0.4); margin-bottom: 4px;
  }
  .cover-meta-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px; font-weight: 600; color: white;
  }

  .content { padding: 36px 52px; background: #ffffff; }

  h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 24px; font-weight: 700;
    color: #0a0a1a; margin: 36px 0 12px;
    padding-bottom: 10px;
    border-bottom: 2px solid #8b5cf6;
    page-break-after: avoid;
  }
  h1:first-child { margin-top: 0; }

  h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px; font-weight: 600;
    color: #6d28d9; margin: 28px 0 10px;
    page-break-after: avoid;
  }

  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px; font-weight: 600;
    color: #0a0a1a; margin: 20px 0 8px;
    page-break-after: avoid;
  }

  h4 {
    font-size: 11px; font-weight: 600;
    color: #6d28d9; margin: 14px 0 6px;
    page-break-after: avoid;
  }

  p { margin-bottom: 10px; color: #212529; }
  ul, ol { margin: 6px 0 12px 22px; color: #212529; }
  li { margin-bottom: 5px; }
  li > ul, li > ol { margin-top: 4px; margin-bottom: 4px; }

  strong { color: #0a0a1a; font-weight: 600; }
  em { color: #6c757d; font-style: italic; }

  code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 9.5px;
    background: #f5f3ff;
    border: 1px solid #ddd6fe;
    border-radius: 3px;
    padding: 1px 5px;
    color: #6d28d9;
  }

  pre {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-left: 3px solid #8b5cf6;
    border-radius: 6px;
    padding: 14px 18px;
    margin: 14px 0;
    overflow: hidden;
    page-break-inside: avoid;
  }
  pre code {
    background: none; border: none; padding: 0;
    color: #24292f; font-size: 9px; line-height: 1.55;
  }

  blockquote {
    border-left: 3px solid #8b5cf6;
    background: #f5f3ff;
    padding: 10px 14px;
    margin: 14px 0;
    border-radius: 0 6px 6px 0;
    page-break-inside: avoid;
  }
  blockquote p { margin: 0; color: #4c1d95; font-style: italic; }

  table {
    width: 100%; border-collapse: collapse;
    margin: 14px 0; font-size: 9.5px;
    page-break-inside: avoid;
  }
  th {
    background: #0a0a1a; color: white; font-weight: 600;
    padding: 8px 10px; text-align: left;
    border: 1px solid #0a0a1a;
    font-family: 'Space Grotesk', sans-serif; font-size: 9.5px;
  }
  td {
    padding: 6px 10px;
    border: 1px solid #dee2e6;
    color: #212529; vertical-align: top;
  }
  tr:nth-child(even) td { background: #faf9ff; }

  hr { border: none; border-top: 1px solid #dee2e6; margin: 24px 0; }
  a { color: #6d28d9; text-decoration: none; }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-badge">Encore Platform — Voice AI Design</div>
  <div class="cover-title">Retell AI Voice Agent<br>Call Flow Design</div>
  <div class="cover-subtitle">Complete architecture, call flows for all 10 intents, identity verification, 5 voice API endpoints, FERPA/TCPA compliance, and pricing reality check</div>
  <div class="cover-accent-line"></div>
  <div class="cover-meta">
    <div class="cover-meta-item">
      <div class="cover-meta-label">Prepared By</div>
      <div class="cover-meta-value">Cassidy</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">Project</div>
      <div class="cover-meta-value">Encore CE Platform</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">Date</div>
      <div class="cover-meta-value">February 2026</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">Classification</div>
      <div class="cover-meta-value">Internal Use Only</div>
    </div>
  </div>
</div>

<div class="content">
${bodyHtml}
</div>

</body>
</html>`;

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });

const outputPath = '/Users/matt/Library/Mobile Documents/com~apple~CloudDocs/Businesses/Encore/Encore-Retell-AI-Call-Flow.pdf';

await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' }
});

await browser.close();
console.log('🎉 PDF ready');
console.log('✅ PDF saved to:', outputPath);
