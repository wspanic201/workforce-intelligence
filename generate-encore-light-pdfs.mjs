import { readFileSync } from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const ICLOUD = '/Users/matt/Library/Mobile Documents/com~apple~CloudDocs/Businesses/Encore';

const docs = [
  {
    src: '/Users/matt/.openclaw/workspace/ce-platform-ux-research.md',
    out: `${ICLOUD}/Encore-CE-Platform-UX-Research.pdf`,
    title: 'CE Platform\nUX Research',
    badge: 'Encore Platform',
  },
  {
    src: '/Users/matt/.openclaw/workspace/encore-integration-stack.md',
    out: `${ICLOUD}/Encore-Integration-Stack.pdf`,
    title: 'Integration\nStack',
    badge: 'Encore Platform',
  },
  {
    src: '/Users/matt/.openclaw/workspace/encore-agent-spec-guide.md',
    out: `${ICLOUD}/Encore-Agent-Spec-Guide.pdf`,
    title: 'Agent Development\nSpec Guide',
    badge: 'Encore Platform',
  },
];

function buildHtml(bodyHtml, title, badge) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

  :root {
    --bg: #ffffff;
    --surface: #f8f9fa;
    --border: #dee2e6;
    --text: #212529;
    --text-muted: #6c757d;
    --accent: #0d6efd;
    --accent-green: #198754;
    --accent-purple: #6f42c1;
    --cover-bg: #1a1a2e;
    --cover-accent: #0d6efd;
    --cover-text: #ffffff;
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

  /* Cover page stays dark for visual identity */
  .cover {
    width: 210mm; min-height: 297mm;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    background: var(--cover-bg);
    padding: 60px; page-break-after: always;
    position: relative; overflow: hidden;
  }
  .cover::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at 20% 20%, rgba(13,110,253,0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(111,66,193,0.12) 0%, transparent 50%);
  }
  .cover-badge {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 3px;
    text-transform: uppercase; color: var(--cover-accent);
    margin-bottom: 32px; position: relative;
  }
  .cover-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 44px; font-weight: 700; line-height: 1.1;
    text-align: center; margin-bottom: 16px;
    color: white; position: relative;
    white-space: pre-line;
  }
  .cover-subtitle {
    font-size: 14px; color: rgba(255,255,255,0.6);
    text-align: center; max-width: 480px;
    line-height: 1.5; margin-bottom: 48px; position: relative;
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
  .cover-accent-line {
    width: 60px; height: 2px;
    background: linear-gradient(90deg, var(--cover-accent), var(--accent-purple));
    margin: 32px auto; position: relative;
  }

  /* Content area — white/light */
  .content {
    padding: 36px 52px;
    background: var(--bg);
  }

  h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 26px; font-weight: 700;
    color: #1a1a2e; margin: 40px 0 14px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--accent);
    page-break-after: avoid;
  }
  h1:first-child { margin-top: 0; }

  h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 17px; font-weight: 600;
    color: var(--accent); margin: 28px 0 10px;
    page-break-after: avoid;
  }

  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px; font-weight: 600;
    color: #1a1a2e; margin: 20px 0 8px;
    page-break-after: avoid;
  }

  h4 {
    font-size: 12px; font-weight: 600;
    color: var(--accent-purple); margin: 14px 0 6px;
    page-break-after: avoid;
  }

  p { margin-bottom: 10px; color: var(--text); }

  ul, ol { margin: 6px 0 14px 22px; color: var(--text); }
  li { margin-bottom: 5px; }
  li > ul, li > ol { margin-top: 4px; margin-bottom: 4px; }

  strong { color: #1a1a2e; font-weight: 600; }
  em { color: var(--text-muted); font-style: italic; }

  code {
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 10px;
    background: #f0f4ff;
    border: 1px solid #c8d8ff;
    border-radius: 3px;
    padding: 1px 5px;
    color: var(--accent);
  }

  pre {
    background: #f6f8fa;
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    border-radius: 6px;
    padding: 14px 18px;
    margin: 14px 0;
    overflow: hidden;
    page-break-inside: avoid;
  }

  pre code {
    background: none;
    border: none;
    padding: 0;
    color: #24292f;
    font-size: 9.5px;
    line-height: 1.55;
  }

  blockquote {
    border-left: 3px solid var(--accent);
    background: #f0f4ff;
    padding: 10px 14px;
    margin: 14px 0;
    border-radius: 0 6px 6px 0;
    page-break-inside: avoid;
  }
  blockquote p { margin: 0; color: #495057; font-style: italic; }

  table {
    width: 100%; border-collapse: collapse;
    margin: 14px 0; font-size: 10px;
    page-break-inside: avoid;
  }
  th {
    background: #1a1a2e;
    color: white; font-weight: 600;
    padding: 8px 12px; text-align: left;
    border: 1px solid #1a1a2e;
    font-family: 'Space Grotesk', sans-serif; font-size: 10px;
  }
  td {
    padding: 7px 12px;
    border: 1px solid var(--border);
    color: var(--text); vertical-align: top;
  }
  tr:nth-child(even) td { background: #f8f9fa; }

  hr { border: none; border-top: 1px solid var(--border); margin: 28px 0; }

  a { color: var(--accent); text-decoration: none; }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-badge">${badge}</div>
  <div class="cover-title">${title}</div>
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
}

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

for (const doc of docs) {
  console.log(`Generating: ${doc.out.split('/').pop()}...`);
  const mdContent = readFileSync(doc.src, 'utf8').replace(/^---[\s\S]*?---\n/, '');
  const bodyHtml = await marked(mdContent);
  const html = buildHtml(bodyHtml, doc.title, doc.badge);

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: doc.out,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  await page.close();
  console.log(`  ✅ Done`);
}

await browser.close();
console.log('\n✅ All 3 PDFs regenerated with light theme.');
