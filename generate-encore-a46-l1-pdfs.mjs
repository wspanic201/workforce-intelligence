import puppeteer from 'puppeteer-core';
import { readFileSync } from 'fs';
import { join } from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = `${process.env.HOME}/Library/Mobile Documents/com~apple~CloudDocs/Businesses/Encore`;
const WORKSPACE = `${process.env.HOME}/.openclaw/workspace`;

const DOCS = [
  { file: 'encore-a46-offering-type-taxonomy.md',   title: 'Offering Type Taxonomy',         id: 'A46', out: 'Encore-A46-Offering-Type-Taxonomy.pdf' },
  { file: 'encore-a47-automated-course-catalog.md', title: 'Automated Course Catalog',        id: 'A47', out: 'Encore-A47-Automated-Course-Catalog.pdf' },
  { file: 'encore-a48-student-procured-materials.md', title: 'Student-Procured Materials',    id: 'A48', out: 'Encore-A48-Student-Procured-Materials.pdf' },
  { file: 'encore-l1-tcpa-consent.md',              title: 'TCPA Consent Capture Spec',       id: 'L1',  out: 'Encore-L1-TCPA-Consent-Spec.pdf' },
];

function parseMarkdown(md) {
  return md
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/^---$/gm, '<hr>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre class="code"><code>$1</code></pre>')
    .replace(/^\| (.+) \|$/gm, (line) => {
      const cells = line.split('|').filter(c => c.trim());
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
    })
    .replace(/^- \[ \] (.+)$/gm, '<li class="todo">☐ $1</li>')
    .replace(/^- \[x\] (.+)$/gm, '<li class="done">☑ $1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ordered"><span class="num">$1.</span> $2</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .split('\n\n')
    .map(block => {
      if (!block.trim()) return '';
      if (block.match(/^<(h[1-4]|pre|hr|tr)/)) return block;
      if (block.includes('<li')) return `<ul>${block}</ul>`;
      return `<p>${block.replace(/\n/g, ' ')}</p>`;
    })
    .join('\n');
}

function buildHTML(doc, content) {
  const body = parseMarkdown(content.replace(/^# .+\n(\*\*Version.*\n)?(\*\*Status.*\n)?(\*\*Phase.*\n)?(\*\*Risk.*\n)?(\*\*Must.*\n)?\n?---\n\n?/, ''));
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: Georgia, serif; font-size: 11pt; line-height: 1.65; color: #1a1a2e; background: #fff; }

.cover {
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a3e 50%, #0d2137 100%);
  color: white; height: 100vh; display: flex; flex-direction: column;
  justify-content: center; padding: 80px; page-break-after: always; position: relative; overflow: hidden;
}
.cover::before {
  content: ''; position: absolute; top: -100px; right: -100px;
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(100,200,255,0.08) 0%, transparent 70%);
  border-radius: 50%;
}
.cover-label { font-family: Arial, sans-serif; font-size: 10pt; letter-spacing: 4px; text-transform: uppercase; color: rgba(100,200,255,0.7); margin-bottom: 20px; }
.cover-doc-id { font-family: Arial, sans-serif; font-size: 13pt; letter-spacing: 3px; color: rgba(100,200,255,0.9); margin-bottom: 14px; font-weight: bold; }
.cover h1 { font-size: 32pt; font-weight: normal; color: #fff; line-height: 1.2; margin-bottom: 28px; max-width: 580px; }
.cover-sub { font-size: 13pt; color: rgba(255,255,255,0.6); margin-bottom: 50px; max-width: 520px; line-height: 1.5; }
.cover-meta { display: flex; gap: 48px; margin-top: 36px; }
.cover-meta-label { font-family: Arial,sans-serif; font-size: 8pt; letter-spacing: 2px; text-transform: uppercase; color: rgba(100,200,255,0.5); margin-bottom: 4px; }
.cover-meta-value { font-family: Arial,sans-serif; font-size: 11pt; color: rgba(255,255,255,0.85); }
.cover-brand { position: absolute; bottom: 60px; right: 80px; font-family: Arial,sans-serif; font-size: 18pt; font-weight: bold; color: rgba(100,200,255,0.35); letter-spacing: 2px; }

.body { padding: 56px 72px; }
h1 { font-size: 20pt; color: #0d2137; margin: 32px 0 14px; border-bottom: 2px solid #0d2137; padding-bottom: 6px; }
h2 { font-size: 15pt; color: #1a3a5c; margin: 28px 0 10px; border-bottom: 1px solid #d0dde8; padding-bottom: 5px; }
h3 { font-size: 12pt; color: #1a3a5c; margin: 20px 0 8px; }
h4 { font-size: 11pt; color: #2a5a8c; margin: 16px 0 6px; font-style: italic; }
p { margin-bottom: 10px; }
ul { margin: 8px 0 12px 22px; }
li { margin-bottom: 4px; }
li.todo, li.done { list-style: none; margin-left: -6px; }
li.done { color: #2a7a2a; }
li.ordered { list-style: none; display: flex; gap: 8px; }
.num { font-weight: bold; color: #1a3a5c; min-width: 22px; }
pre.code { background: #f4f7fb; border: 1px solid #d0dde8; border-left: 4px solid #4a90d9; border-radius: 4px; padding: 14px 18px; margin: 12px 0; font-family: 'Courier New', monospace; font-size: 8.5pt; line-height: 1.5; color: #1a2a3a; white-space: pre-wrap; word-break: break-word; }
code { font-family: 'Courier New', monospace; font-size: 9pt; background: #eef2f8; padding: 1px 4px; border-radius: 3px; color: #1a3a6c; }
pre.code code { background: none; padding: 0; color: inherit; font-size: inherit; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }
tr { border-bottom: 1px solid #d0dde8; }
tr:first-child { background: #1a3a5c; color: white; font-weight: bold; font-family: Arial, sans-serif; font-size: 9pt; }
td { padding: 7px 10px; font-size: 10pt; vertical-align: top; }
tr:nth-child(even) { background: #f4f7fb; }
hr { border: none; border-top: 1px solid #d0dde8; margin: 24px 0; }
strong { color: #0d2137; }
a { color: #1a3a8c; }
blockquote { border-left: 3px solid #4a90d9; padding-left: 16px; margin: 12px 0; color: #445; font-style: italic; }
</style></head><body>
<div class="cover">
  <div class="cover-label">Encore CE Platform — Spec Document</div>
  <div class="cover-doc-id">${doc.id}</div>
  <h1>${doc.title}</h1>
  <div class="cover-sub">Operational specification for the Encore CE registration and management platform.</div>
  <div class="cover-meta">
    <div><div class="cover-meta-label">Document</div><div class="cover-meta-value">${doc.id}</div></div>
    <div><div class="cover-meta-label">Version</div><div class="cover-meta-value">1.0 Draft</div></div>
    <div><div class="cover-meta-label">Date</div><div class="cover-meta-value">February 2026</div></div>
    <div><div class="cover-meta-label">Phase</div><div class="cover-meta-value">${doc.id === 'L1' ? '3B — Legal & Compliance' : '2'}</div></div>
  </div>
  <div class="cover-brand">ENCORE</div>
</div>
<div class="body">${body}</div>
</body></html>`;
}

console.log(`Generating ${DOCS.length} PDFs...`);
const browser = await puppeteer.launch({
  executablePath: CHROME_PATH, headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

let success = 0;
for (const doc of DOCS) {
  try {
    const content = readFileSync(join(WORKSPACE, doc.file), 'utf8');
    const html = buildHTML(doc, content);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const outPath = join(OUTPUT_DIR, doc.out);
    await page.pdf({ path: outPath, format: 'Letter', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
    await page.close();
    console.log(`  ✅ ${doc.out}`);
    success++;
  } catch (err) {
    console.error(`  ❌ ${doc.file}: ${err.message}`);
  }
}

await browser.close();
console.log(`\nDone: ${success}/${DOCS.length} PDFs → iCloud Encore folder`);
