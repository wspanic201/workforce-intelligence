import { readFileSync } from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const mdContent = readFileSync('/Users/matt/.openclaw/workspace/encore-integration-stack.md', 'utf8')
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
    content: ''; position: absolute;
    top: -50%; left: -50%; width: 200%; height: 200%;
    background:
      radial-gradient(circle at 25% 35%, rgba(0,255,136,0.07) 0%, transparent 50%),
      radial-gradient(circle at 75% 65%, rgba(59,130,246,0.05) 0%, transparent 50%),
      radial-gradient(circle at 50% 80%, rgba(168,85,247,0.04) 0%, transparent 40%);
  }
  .cover-logo { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: var(--accent); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; position: relative; }
  .cover-domain { font-size: 11px; color: var(--text-muted); margin-bottom: 60px; position: relative; }
  .cover-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 500; color: var(--accent-blue); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; position: relative; }
  .cover-title { font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 700; color: white; text-align: center; line-height: 1.2; margin-bottom: 24px; position: relative; }
  .cover-sub { font-size: 14px; color: var(--text-muted); text-align: center; max-width: 500px; line-height: 1.7; margin-bottom: 50px; position: relative; }
  .cover-meta { display: flex; gap: 40px; position: relative; }
  .cover-meta-item { text-align: center; }
  .cover-meta-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .cover-meta-value { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 600; color: white; }
  .cover-footer { position: absolute; bottom: 40px; font-size: 10px; color: var(--text-muted); text-align: center; }

  .content { padding: 50px 55px; max-width: 210mm; background: var(--bg); }

  h1 { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: white; margin: 36px 0 14px 0; padding-bottom: 8px; border-bottom: 2px solid var(--accent); page-break-after: avoid; }
  h1:first-child { margin-top: 0; }
  h2 { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600; color: var(--accent); margin: 28px 0 10px 0; page-break-after: avoid; }
  h3 { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 600; color: var(--accent-blue); margin: 20px 0 8px 0; page-break-after: avoid; }
  h4 { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 600; color: var(--accent-purple); margin: 16px 0 6px 0; page-break-after: avoid; }

  p { margin: 8px 0; }
  strong { color: white; font-weight: 600; }
  em { color: var(--text-muted); }
  ul, ol { margin: 8px 0 8px 20px; }
  li { margin: 4px 0; }

  blockquote { border-left: 3px solid var(--accent); padding: 10px 16px; margin: 12px 0; background: rgba(0,255,136,0.05); border-radius: 0 6px 6px 0; font-style: italic; color: var(--text-muted); }

  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10px; page-break-inside: auto; }
  th { background: var(--surface); color: var(--accent); font-weight: 600; text-align: left; padding: 8px 10px; border-bottom: 2px solid var(--accent); font-family: 'Space Grotesk', sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 7px 10px; border-bottom: 1px solid var(--border); }
  tr:nth-child(even) td { background: rgba(255,255,255,0.02); }

  code { background: var(--surface); padding: 2px 5px; border-radius: 3px; font-size: 10px; color: var(--accent); }
  pre { background: var(--surface); padding: 14px 18px; border-radius: 6px; margin: 12px 0; border: 1px solid var(--border); font-size: 10px; line-height: 1.7; color: var(--text); overflow-x: auto; }
  pre code { background: none; padding: 0; color: var(--text); }

  hr { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
  a { color: var(--accent-blue); text-decoration: none; }

  h1, h2, h3, h4 { page-break-after: avoid; }
  li, p, blockquote { orphans: 3; widows: 3; }
  ul, ol { page-break-before: avoid; }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-logo">ENCORE</div>
  <div class="cover-domain">CE Registration Platform</div>
  <div class="cover-eyebrow">Integration Architecture</div>
  <div class="cover-title">Platform<br>Integration Stack</div>
  <div class="cover-sub">Every integration, API, and service that powers Encore — from payments to AI voice agents. The complete technical foundation for replacing legacy CE systems and manual operations.</div>
  <div class="cover-meta">
    <div class="cover-meta-item">
      <div class="cover-meta-label">Prepared For</div>
      <div class="cover-meta-value">Matt Murphy</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">Report Date</div>
      <div class="cover-meta-value">February 2026</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">Categories</div>
      <div class="cover-meta-value">12 Integration Areas</div>
    </div>
  </div>
  <div class="cover-footer">Prepared by Cassidy · FERPA compliance assessed · Pricing verified · Decision-ready</div>
</div>

<div class="content">
${bodyHtml}
</div>

</body>
</html>`;

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

await page.pdf({
  path: '/Users/matt/Library/Mobile Documents/com~apple~CloudDocs/Businesses/Encore/Encore-Integration-Stack.pdf',
  format: 'A4',
  printBackground: true,
});

await browser.close();
console.log('🎉 PDF ready');
