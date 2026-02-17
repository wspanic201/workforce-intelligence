/**
 * Focused Markdown → HTML converter for WorkforceOS reports.
 * Handles the exact structures our Market Scans and Validation Reports produce.
 * No external dependencies.
 */

export function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  const html: string[] = [];
  let i = 0;
  let inList: 'ul' | 'ol' | null = null;
  let inTable = false;
  let tableHeaderDone = false;
  let inBlockquote = false;
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      html.push(`<p>${inlineFormat(paragraphBuffer.join(' '))}</p>`);
      paragraphBuffer = [];
    }
  };

  const flushList = () => {
    if (inList) {
      html.push(`</${inList}>`);
      inList = null;
    }
  };

  const flushTable = () => {
    if (inTable) {
      html.push('</tbody></table></div>');
      inTable = false;
      tableHeaderDone = false;
    }
  };

  const flushBlockquote = () => {
    if (inBlockquote) {
      html.push('</div>');
      inBlockquote = false;
    }
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushTable();
    flushBlockquote();
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushAll();
        inCodeBlock = true;
      }
      i++;
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(line);
      i++;
      continue;
    }

    // Blank line
    if (trimmed === '') {
      flushParagraph();
      if (!inTable && !inBlockquote) {
        flushList();
      }
      i++;
      continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
      flushAll();
      html.push('<hr>');
      i++;
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushAll();
      const level = headingMatch[1].length;
      const text = inlineFormat(headingMatch[2]);
      const id = headingMatch[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      html.push(`<h${level} id="${id}">${text}</h${level}>`);
      i++;
      continue;
    }

    // Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushParagraph();
      flushList();
      flushBlockquote();

      // Check if next line is separator
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const isSeparator = /^\|[\s\-:|]+\|$/.test(nextLine);

      if (!inTable) {
        // Start new table
        inTable = true;
        tableHeaderDone = false;
        html.push('<div class="table-wrapper"><table>');

        if (isSeparator) {
          // This line is the header
          const cells = parseCells(trimmed);
          html.push('<thead><tr>');
          cells.forEach(c => html.push(`<th>${inlineFormat(c)}</th>`));
          html.push('</tr></thead><tbody>');
          tableHeaderDone = true;
          i += 2; // skip header + separator
          continue;
        } else {
          html.push('<tbody>');
        }
      }

      // Skip separator lines
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
        if (!tableHeaderDone) {
          tableHeaderDone = true;
        }
        i++;
        continue;
      }

      // Data row
      const cells = parseCells(trimmed);
      html.push('<tr>');
      cells.forEach(c => html.push(`<td>${inlineFormat(c)}</td>`));
      html.push('</tr>');
      i++;
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Blockquotes
    if (trimmed.startsWith('> ')) {
      flushParagraph();
      flushList();
      flushTable();
      if (!inBlockquote) {
        inBlockquote = true;
        html.push('<div class="callout">');
      }
      html.push(`<p>${inlineFormat(trimmed.slice(2))}</p>`);
      i++;
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      flushTable();
      flushBlockquote();
      if (inList !== 'ul') {
        flushList();
        inList = 'ul';
        html.push('<ul>');
      }
      html.push(`<li>${inlineFormat(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
      i++;
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      flushTable();
      flushBlockquote();
      if (inList !== 'ol') {
        flushList();
        inList = 'ol';
        html.push('<ol>');
      }
      html.push(`<li>${inlineFormat(trimmed.replace(/^\d+\.\s+/, ''))}</li>`);
      i++;
      continue;
    }

    // Regular text → paragraph buffer
    // Two trailing spaces in markdown = line break
    if (inList) flushList();
    if (line.endsWith('  ')) {
      paragraphBuffer.push(trimmed + '<br>');
    } else {
      paragraphBuffer.push(trimmed);
    }
    i++;
  }

  flushAll();
  return html.join('\n');
}

/** Parse table cells from a pipe-delimited row */
function parseCells(row: string): string[] {
  return row
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(c => c.trim());
}

/** Escape HTML entities */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Apply inline formatting: bold, italic, links, score badges */
export function inlineFormat(text: string): string {
  // Line breaks: two trailing spaces → <br>
  text = text.replace(/ {2,}$/gm, '<br>');

  // Links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Bold + italic: ***text***
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

  // Bold: **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* (but not inside words with asterisks)
  text = text.replace(/(?<!\w)\*([^*]+?)\*(?!\w)/g, '<em>$1</em>');

  // Inline code: `text`
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Score badges: X.X/10 or X/10
  text = text.replace(/\b(\d+\.?\d*)\/10\b/g, (match, score) => {
    const num = parseFloat(score);
    const cls = num >= 8 ? 'score-green' : num >= 5 ? 'score-yellow' : 'score-red';
    return `<span class="score-badge ${cls}">${match}</span>`;
  });

  return text;
}
