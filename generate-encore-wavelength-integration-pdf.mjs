import puppeteer from 'puppeteer-core';
import { readFileSync } from 'fs';
import { join } from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = `${process.env.HOME}/Library/Mobile Documents/com~apple~CloudDocs/Businesses/Encore`;
const SOURCE = `${process.env.HOME}/.openclaw/workspace/encore-wavelength-integration.md`;

const content = readFileSync(SOURCE, 'utf8');

function parseMarkdown(md) {
  return md
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^\| (.+) \|$/gm, (line) => {
      const cells = line.split('|').filter(c => c.trim());
      const isHeader = false;
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
    })
    .replace(/^- \[ \] (.+)$/gm, '<li class="todo">☐ $1</li>')
    .replace(/^- \[x\] (.+)$/gm, '<li class="done">☑ $1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ordered"><span class="num">$1.</span> $2</li>')
    .replace(/```typescript([\s\S]*?)```/g, '<pre class="code typescript"><code>$1</code></pre>')
    .replace(/```([\s\S]*?)```/g, '<pre class="code"><code>$1</code></pre>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .split('\n\n')
    .map(block => {
      if (block.startsWith('<h') || block.startsWith('<pre') || block.startsWith('<hr') || block.startsWith('<tr')) return block;
      if (block.includes('<li')) return `<ul>${block}</ul>`;
      if (block.trim()) return `<p>${block.replace(/\n/g, ' ')}</p>`;
      return '';
    })
    .join('\n');
}

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    font-family: 'Georgia', serif;
    font-size: 11pt;
    line-height: 1.65;
    color: #1a1a2e;
    background: #fff;
  }

  .cover {
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a3e 50%, #0d2137 100%);
    color: white;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px;
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }

  .cover::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(100,200,255,0.08) 0%, transparent 70%);
    border-radius: 50%;
  }

  .cover-label {
    font-family: 'Arial', sans-serif;
    font-size: 10pt;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(100,200,255,0.7);
    margin-bottom: 24px;
  }

  .cover-doc-id {
    font-family: 'Arial', sans-serif;
    font-size: 13pt;
    letter-spacing: 3px;
    color: rgba(100,200,255,0.9);
    margin-bottom: 16px;
    font-weight: bold;
  }

  .cover h1 {
    font-size: 36pt;
    font-weight: normal;
    color: #ffffff;
    line-height: 1.2;
    margin-bottom: 32px;
    max-width: 600px;
  }

  .cover-sub {
    font-size: 14pt;
    color: rgba(255,255,255,0.65);
    margin-bottom: 60px;
    max-width: 540px;
    line-height: 1.5;
  }

  .cover-meta {
    display: flex;
    gap: 48px;
    margin-top: 40px;
  }

  .cover-meta-item {
    font-family: 'Arial', sans-serif;
  }

  .cover-meta-label {
    font-size: 8pt;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(100,200,255,0.5);
    margin-bottom: 4px;
  }

  .cover-meta-value {
    font-size: 11pt;
    color: rgba(255,255,255,0.85);
  }

  .cover-brand {
    position: absolute;
    bottom: 60px;
    right: 80px;
    font-family: 'Arial', sans-serif;
    font-size: 18pt;
    font-weight: bold;
    color: rgba(100,200,255,0.4);
    letter-spacing: 2px;
  }

  .body {
    padding: 60px 72px;
    max-width: 100%;
  }

  h1 { font-size: 22pt; color: #0d2137; margin: 36px 0 16px; border-bottom: 2px solid #0d2137; padding-bottom: 8px; }
  h2 { font-size: 16pt; color: #1a3a5c; margin: 32px 0 12px; border-bottom: 1px solid #d0dde8; padding-bottom: 6px; }
  h3 { font-size: 13pt; color: #1a3a5c; margin: 24px 0 10px; }
  h4 { font-size: 11pt; color: #2a5a8c; margin: 18px 0 8px; font-style: italic; }

  p { margin-bottom: 12px; }

  ul { margin: 10px 0 14px 24px; }
  li { margin-bottom: 5px; }
  li.todo { list-style: none; margin-left: -8px; color: #444; }
  li.done { list-style: none; margin-left: -8px; color: #2a7a2a; }
  li.ordered { list-style: none; display: flex; gap: 8px; }
  .num { font-weight: bold; color: #1a3a5c; min-width: 24px; }

  pre.code {
    background: #f4f7fb;
    border: 1px solid #d0dde8;
    border-left: 4px solid #4a90d9;
    border-radius: 4px;
    padding: 16px 20px;
    margin: 14px 0;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 8.5pt;
    line-height: 1.5;
    color: #1a2a3a;
    white-space: pre-wrap;
    word-break: break-word;
  }

  code {
    font-family: 'Courier New', monospace;
    font-size: 9pt;
    background: #eef2f8;
    padding: 1px 5px;
    border-radius: 3px;
    color: #1a3a6c;
  }

  pre.code code {
    background: none;
    padding: 0;
    color: inherit;
    font-size: inherit;
  }

  table { width: 100%; border-collapse: collapse; margin: 14px 0; }
  tr { border-bottom: 1px solid #d0dde8; }
  tr:first-child { background: #1a3a5c; color: white; font-weight: bold; font-family: Arial, sans-serif; font-size: 9pt; }
  td { padding: 8px 12px; font-size: 10pt; vertical-align: top; }
  tr:nth-child(even) { background: #f4f7fb; }

  hr { border: none; border-top: 1px solid #d0dde8; margin: 28px 0; }

  strong { color: #0d2137; }
  a { color: #1a3a8c; }

  .flywheel {
    background: #f4f7fb;
    border: 1px solid #d0dde8;
    border-radius: 6px;
    padding: 20px 24px;
    margin: 16px 0;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    color: #1a3a5c;
    white-space: pre-wrap;
  }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-label">Integration Architecture</div>
  <div class="cover-doc-id">G1</div>
  <h1>Wavelength ↔ Encore Integration Architecture</h1>
  <div class="cover-sub">The data contracts, API design, and integration touchpoints that connect workforce intelligence to CE program management — closing the loop from discovery to outcomes.</div>
  <div class="cover-meta">
    <div class="cover-meta-item">
      <div class="cover-meta-label">Version</div>
      <div class="cover-meta-value">1.0 Draft</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">Date</div>
      <div class="cover-meta-value">February 2026</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">Products</div>
      <div class="cover-meta-value">Wavelength + Encore</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">Status</div>
      <div class="cover-meta-value">Foundational</div>
    </div>
  </div>
  <div class="cover-brand">WAVELENGTH</div>
</div>

<div class="body">
${parseMarkdown(content.replace(/^# .+\n\*\*Version:.+\n\*\*Status:.+\n\*\*Purpose:.+\n\n---\n\n/, ''))}
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

const outPath = join(OUTPUT_DIR, 'Encore-Wavelength-Integration-Architecture.pdf');
await page.pdf({
  path: outPath,
  format: 'Letter',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' }
});

await browser.close();
console.log(`✅ PDF saved: ${outPath}`);
