import { readFileSync, writeFileSync } from 'fs';
import { marked } from 'marked';

const md = readFileSync('sample-report-clean.md', 'utf8');
// Strip front matter
const content = md.replace(/^---[\s\S]*?---\n/, '');
const html = await marked(content);

const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { margin: 1in; size: letter; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; max-width: 100%; }
  h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 8px; margin-top: 2em; page-break-after: avoid; }
  h2 { color: #1e3a5f; margin-top: 1.5em; page-break-after: avoid; }
  h3 { color: #374151; page-break-after: avoid; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 10pt; }
  th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
  th { background-color: #1e40af; color: white; font-weight: 600; }
  tr:nth-child(even) { background-color: #f9fafb; }
  strong { color: #111; }
  ul, ol { margin: 0.5em 0; }
  li { margin: 0.3em 0; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 2em 0; }
  em { color: #6b7280; }
  div[style*="page-break"] { page-break-after: always; }
  code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 10pt; }
</style>
</head>
<body>
${html}
</body>
</html>`;

writeFileSync('public/sample-report.html', fullHtml);
console.log('HTML generated: public/sample-report.html');
