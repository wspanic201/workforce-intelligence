import { readFileSync } from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const mdContent = readFileSync('/Users/matt/.openclaw/workspace/ai-voice-agency-report.md', 'utf8')
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

  @page {
    size: A4;
    margin: 40px 45px;
  }
  @page:first {
    margin: 0;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11px;
    line-height: 1.6;
    color: var(--text);
    background: var(--bg);
  }

  /* ── COVER PAGE ── */
  .cover {
    width: 210mm;
    min-height: 297mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #0a0f1a 0%, #1a1040 50%, #0a0f1a 100%);
    padding: 60px;
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }

  .cover::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at 30% 40%, rgba(0,255,136,0.08) 0%, transparent 50%),
                radial-gradient(circle at 70% 60%, rgba(59,130,246,0.06) 0%, transparent 50%);
  }

  .cover-logo {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 8px;
    position: relative;
  }

  .cover-domain {
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 60px;
    position: relative;
  }

  .cover-eyebrow {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: var(--accent);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 16px;
    position: relative;
  }

  .cover-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 36px;
    font-weight: 700;
    color: white;
    text-align: center;
    line-height: 1.2;
    margin-bottom: 24px;
    position: relative;
  }

  .cover-sub {
    font-size: 14px;
    color: var(--text-muted);
    text-align: center;
    max-width: 480px;
    line-height: 1.7;
    margin-bottom: 50px;
    position: relative;
  }

  .cover-meta {
    display: flex;
    gap: 40px;
    position: relative;
  }

  .cover-meta-item {
    text-align: center;
  }

  .cover-meta-label {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }

  .cover-meta-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: white;
  }

  .cover-footer {
    position: absolute;
    bottom: 40px;
    font-size: 10px;
    color: var(--text-muted);
    text-align: center;
  }

  /* ── CONTENT ── */
  .content {
    padding: 50px 55px;
    max-width: 210mm;
  }

  h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: white;
    margin: 40px 0 16px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--accent);
    page-break-after: avoid;
  }

  h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--accent);
    margin: 30px 0 12px 0;
    page-break-after: avoid;
  }

  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--accent-blue);
    margin: 20px 0 8px 0;
    page-break-after: avoid;
  }

  h4 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent-purple);
    margin: 16px 0 8px 0;
  }

  p {
    margin: 8px 0;
    color: var(--text);
  }

  strong { color: white; font-weight: 600; }

  ul, ol {
    margin: 8px 0 8px 20px;
    color: var(--text);
  }

  li { margin: 4px 0; }

  blockquote {
    border-left: 3px solid var(--accent);
    padding: 10px 16px;
    margin: 12px 0;
    background: rgba(0,255,136,0.05);
    border-radius: 0 6px 6px 0;
    font-style: italic;
    color: var(--text-muted);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 10px;
  }

  th {
    background: var(--surface);
    color: var(--accent);
    font-weight: 600;
    text-align: left;
    padding: 8px 10px;
    border-bottom: 2px solid var(--accent);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    padding: 7px 10px;
    border-bottom: 1px solid var(--border);
    color: var(--text);
  }

  tr:nth-child(even) td {
    background: rgba(255,255,255,0.02);
  }

  code {
    background: var(--surface);
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    color: var(--accent);
  }

  hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 24px 0;
  }

  em { color: var(--text-muted); }

  /* Emoji headers */
  h1,h2,h3,h4 { page-break-after: avoid; }
  li,p,blockquote { orphans: 3; widows: 3; }
  table { page-break-inside: avoid; }
  ul,ol { page-break-before: avoid; }
  h3:first-letter { margin-right: 4px; }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-logo">WAVELENGTH</div>
  <div class="cover-domain">withwavelength.com</div>
  <div class="cover-eyebrow">Strategic Research Report</div>
  <div class="cover-title">CE Registration Platform<br>Competitive Landscape</div>
  <div class="cover-sub">A comprehensive analysis of the community college continuing education software market — incumbent players, pricing intelligence, feature gaps, and the strategic opportunity for a modern, technology-forward platform.</div>
  <div class="cover-meta">
    <div class="cover-meta-item">
      <div class="cover-meta-label">Prepared For</div>
      <div class="cover-meta-value">Matt Murphy</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">Report Date</div>
      <div class="cover-meta-value">February 17, 2026</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">Classification</div>
      <div class="cover-meta-value">Confidential</div>
    </div>
  </div>
  <div class="cover-footer">Prepared by Wavelength · Proprietary research methodology · 50+ sources cited</div>
</div>

<!-- CONTENT -->
<div class="content">
${bodyHtml}
</div>

</body>
</html>`;

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox']
});

const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

const outPath = '/Users/matt/Library/Mobile Documents/com~apple~CloudDocs/Businesses/AI Voice Agency Report.pdf';
await page.pdf({
  path: outPath,
  format: 'A4',
  printBackground: true
});

await browser.close();
console.log('🎉 PDF ready:', outPath);
