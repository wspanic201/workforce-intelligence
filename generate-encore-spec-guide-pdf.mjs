import { readFileSync } from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const mdContent = readFileSync('/Users/matt/.openclaw/workspace/encore-agent-spec-guide.md', 'utf8')
  .replace(/^---[\s\S]*?---\n/, '');

const bodyHtml = await marked(mdContent);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

  :root {
    --bg: #0a0f1a;
    --surface: #111827;
    --border: #1e293b;
    --text: rgba(255,255,255,0.87);
    --text-muted: rgba(255,255,255,0.6);
    --accent: #00ff88;
    --accent-blue: #3b82f6;
    --accent-purple: #a855f7;
  }

  @page { size: A4; margin: 0; }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11px; line-height: 1.6;
    color: var(--text); background: var(--bg);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .cover {
    width: 210mm; min-height: 297mm;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    background: linear-gradient(135deg, #0a0f1a 0%, #0d1a2e 50%, #0a0f1a 100%);
    padding: 60px; page-break-after: always;
    position: relative; overflow: hidden;
  }
  .cover::before {
    content: '';
    position: absolute; inset: 0;
    background: 
      radial-gradient(ellipse at 20% 20%, rgba(0,255,136,0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(59,130,246,0.08) 0%, transparent 50%);
  }
  .cover-badge {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 3px;
    text-transform: uppercase; color: var(--accent);
    margin-bottom: 32px; position: relative;
  }
  .cover-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 44px; font-weight: 700; line-height: 1.1;
    text-align: center; margin-bottom: 16px;
    color: white; position: relative;
  }
  .cover-subtitle {
    font-size: 16px; color: var(--text-muted);
    text-align: center; max-width: 480px;
    line-height: 1.5; margin-bottom: 48px; position: relative;
  }
  .cover-meta {
    display: flex; gap: 32px; position: relative;
  }
  .cover-meta-item {
    text-align: center;
  }
  .cover-meta-label {
    font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--text-muted); margin-bottom: 4px;
  }
  .cover-meta-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px; font-weight: 600; color: white;
  }
  .cover-accent-line {
    width: 60px; height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--accent-blue));
    margin: 32px auto; position: relative;
  }

  .content {
    padding: 32px 48px;
    max-width: 210mm;
  }

  h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 28px; font-weight: 700;
    color: white; margin: 40px 0 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
    page-break-after: avoid;
  }
  h1:first-child { margin-top: 0; }

  h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 18px; font-weight: 600;
    color: var(--accent); margin: 32px 0 12px;
    page-break-after: avoid;
  }

  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px; font-weight: 600;
    color: rgba(255,255,255,0.9); margin: 24px 0 10px;
    page-break-after: avoid;
  }

  h4 {
    font-size: 12px; font-weight: 600;
    color: var(--accent-blue); margin: 16px 0 8px;
    page-break-after: avoid;
  }

  p {
    margin-bottom: 12px;
    color: var(--text);
  }

  ul, ol {
    margin: 8px 0 16px 20px;
    color: var(--text);
  }

  li {
    margin-bottom: 6px;
  }

  li > ul, li > ol {
    margin-top: 4px; margin-bottom: 4px;
  }

  strong {
    color: white; font-weight: 600;
  }

  em {
    color: var(--text-muted); font-style: italic;
  }

  code {
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 10px;
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 1px 5px;
    color: var(--accent);
  }

  pre {
    background: #0d1117;
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent-blue);
    border-radius: 6px;
    padding: 16px 20px;
    margin: 16px 0;
    overflow: hidden;
    page-break-inside: avoid;
  }

  pre code {
    background: none;
    border: none;
    padding: 0;
    color: rgba(255,255,255,0.8);
    font-size: 9.5px;
    line-height: 1.5;
  }

  blockquote {
    border-left: 3px solid var(--accent);
    background: rgba(0,255,136,0.05);
    padding: 12px 16px;
    margin: 16px 0;
    border-radius: 0 6px 6px 0;
    page-break-inside: avoid;
  }

  blockquote p {
    margin: 0;
    color: var(--text-muted);
    font-style: italic;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 10px;
    page-break-inside: avoid;
  }

  th {
    background: rgba(255,255,255,0.06);
    color: white; font-weight: 600;
    padding: 8px 12px;
    text-align: left;
    border: 1px solid var(--border);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 10px;
  }

  td {
    padding: 7px 12px;
    border: 1px solid var(--border);
    color: var(--text);
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background: rgba(255,255,255,0.02);
  }

  hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 32px 0;
  }

  a {
    color: var(--accent-blue);
    text-decoration: none;
  }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-badge">Encore Platform</div>
  <div class="cover-title">Agent Development<br>Spec Guide</div>
  <div class="cover-subtitle">What to build before you build — a guide to speccing Encore for AI coding agents</div>
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

const outputPath = '/Users/matt/Library/Mobile Documents/com~apple~CloudDocs/Businesses/Encore/Encore-Agent-Spec-Guide.pdf';

await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' }
});

await browser.close();
console.log('✅ PDF saved to:', outputPath);
