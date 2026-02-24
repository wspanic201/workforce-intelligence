/**
 * Serverless PDF generation using PDFKit (no browser needed).
 * 
 * Converts markdown report to a clean, branded PDF.
 * Works on Vercel, AWS Lambda, etc.
 */

import PDFDocument from 'pdfkit';

interface PDFOptions {
  title: string;
  subtitle?: string;
  preparedFor?: string;
  date?: string;
  reportType: 'discovery' | 'validation';
}

// Brand colors
const COLORS = {
  primary: '#6B21A8',     // purple-800
  secondary: '#7C3AED',   // violet-600
  accent: '#F97316',      // orange-500
  text: '#1E293B',        // slate-800
  muted: '#64748B',       // slate-500
  light: '#F8FAFC',       // slate-50
  border: '#E2E8F0',      // slate-200
  white: '#FFFFFF',
};

const FONTS = {
  heading: 'Helvetica-Bold',
  body: 'Helvetica',
  italic: 'Helvetica-Oblique',
  mono: 'Courier',
};

/**
 * Parse markdown into structured blocks for PDF rendering.
 */
function parseMarkdown(markdown: string): Array<{
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'paragraph' | 'bullet' | 'numbered' | 'hr' | 'blockquote' | 'table_header' | 'table_row';
  text: string;
  level?: number;
}> {
  const blocks: Array<any> = [];
  const lines = markdown.split('\n');
  let inList = false;
  let listNum = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      inList = false;
      listNum = 0;
      continue;
    }

    // Headers
    if (trimmed.startsWith('#### ')) {
      blocks.push({ type: 'h4', text: trimmed.slice(5) });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4) });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3) });
    } else if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.slice(2) });
    }
    // Horizontal rule
    else if (trimmed.match(/^---+$/) || trimmed.match(/^\*\*\*+$/)) {
      blocks.push({ type: 'hr', text: '' });
    }
    // Blockquote
    else if (trimmed.startsWith('> ')) {
      blocks.push({ type: 'blockquote', text: trimmed.slice(2) });
    }
    // Bullet list
    else if (trimmed.match(/^[-*+] /)) {
      blocks.push({ type: 'bullet', text: trimmed.replace(/^[-*+] /, '') });
      inList = true;
    }
    // Numbered list
    else if (trimmed.match(/^\d+\. /)) {
      listNum++;
      blocks.push({ type: 'numbered', text: trimmed.replace(/^\d+\. /, ''), level: listNum });
      inList = true;
    }
    // Table header (pipes)
    else if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // Skip separator rows
      if (trimmed.match(/^\|[\s-:|]+\|$/)) continue;
      const cells = trimmed.split('|').filter(c => c.trim()).map(c => c.trim());
      if (blocks.length > 0 && blocks[blocks.length - 1].type === 'table_header') {
        blocks.push({ type: 'table_row', text: cells.join(' | ') });
      } else {
        blocks.push({ type: 'table_header', text: cells.join(' | ') });
      }
    }
    // Regular paragraph
    else {
      blocks.push({ type: 'paragraph', text: trimmed });
    }
  }

  return blocks;
}

/**
 * Strip markdown formatting for plain text rendering.
 */
function stripMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/~~(.+?)~~/g, '$1');
}

/**
 * Check if text has bold segments and return segments.
 */
function parseBoldSegments(text: string): Array<{ text: string; bold: boolean }> {
  const segments: Array<{ text: string; bold: boolean }> = [];
  const parts = text.split(/(\*\*.+?\*\*)/g);
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      segments.push({ text: part.slice(2, -2), bold: true });
    } else if (part) {
      segments.push({ text: stripMd(part), bold: false });
    }
  }
  return segments;
}

export async function generatePDFServerless(
  markdown: string,
  options: PDFOptions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
      info: {
        Title: options.title,
        Author: 'Wavelength Intelligence',
        Subject: `${options.reportType === 'discovery' ? 'Market Scan' : 'Validation Report'} — ${options.preparedFor || ''}`,
        Creator: 'Wavelength Platform',
      },
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - 144; // 72 margin each side
    const date = options.date || new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    // ═══ COVER PAGE ═══
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.primary);

    // Title
    doc.fontSize(36).font(FONTS.heading).fillColor(COLORS.white)
      .text(options.title, 72, 200, { width: pageWidth, align: 'left' });

    if (options.subtitle) {
      doc.moveDown(0.5).fontSize(18).font(FONTS.body).fillColor('#D8B4FE')
        .text(options.subtitle, { width: pageWidth, align: 'left' });
    }

    // Prepared for
    if (options.preparedFor) {
      doc.moveDown(2).fontSize(14).font(FONTS.body).fillColor('#D8B4FE')
        .text('Prepared for', { width: pageWidth })
        .fontSize(20).font(FONTS.heading).fillColor(COLORS.white)
        .text(options.preparedFor, { width: pageWidth });
    }

    // Date and branding
    doc.fontSize(12).font(FONTS.body).fillColor('#D8B4FE')
      .text(date, 72, doc.page.height - 140, { width: pageWidth })
      .moveDown(0.5)
      .fontSize(10).fillColor('#A78BFA')
      .text('Wavelength Intelligence Platform', { width: pageWidth })
      .text('withwavelength.com', { width: pageWidth });

    // ═══ CONTENT PAGES ═══
    doc.addPage();

    const blocks = parseMarkdown(markdown);
    let currentY = doc.y;

    for (const block of blocks) {
      // Check if we need a new page
      const spaceNeeded = block.type === 'h1' ? 60 : block.type === 'h2' ? 50 : block.type === 'h3' ? 40 : 30;
      if (currentY > doc.page.height - 100 - spaceNeeded) {
        doc.addPage();
        currentY = 72;
      }

      switch (block.type) {
        case 'h1':
          doc.moveDown(1).fontSize(24).font(FONTS.heading).fillColor(COLORS.primary)
            .text(stripMd(block.text), { width: pageWidth });
          // Underline
          doc.moveTo(72, doc.y + 4).lineTo(72 + pageWidth, doc.y + 4)
            .strokeColor(COLORS.accent).lineWidth(2).stroke();
          doc.moveDown(0.8);
          break;

        case 'h2':
          doc.moveDown(0.8).fontSize(18).font(FONTS.heading).fillColor(COLORS.primary)
            .text(stripMd(block.text), { width: pageWidth });
          doc.moveTo(72, doc.y + 2).lineTo(72 + pageWidth * 0.4, doc.y + 2)
            .strokeColor(COLORS.border).lineWidth(1).stroke();
          doc.moveDown(0.5);
          break;

        case 'h3':
          doc.moveDown(0.6).fontSize(14).font(FONTS.heading).fillColor(COLORS.secondary)
            .text(stripMd(block.text), { width: pageWidth });
          doc.moveDown(0.3);
          break;

        case 'h4':
          doc.moveDown(0.4).fontSize(12).font(FONTS.heading).fillColor(COLORS.text)
            .text(stripMd(block.text), { width: pageWidth });
          doc.moveDown(0.2);
          break;

        case 'hr':
          doc.moveDown(0.5);
          doc.moveTo(72, doc.y).lineTo(72 + pageWidth, doc.y)
            .strokeColor(COLORS.border).lineWidth(0.5).stroke();
          doc.moveDown(0.5);
          break;

        case 'blockquote':
          doc.moveDown(0.3);
          const bqX = 80;
          doc.moveTo(76, doc.y).lineTo(76, doc.y + 20)
            .strokeColor(COLORS.accent).lineWidth(3).stroke();
          doc.fontSize(10).font(FONTS.italic).fillColor(COLORS.muted)
            .text(stripMd(block.text), bqX, doc.y, { width: pageWidth - 16, indent: 8 });
          doc.moveDown(0.3);
          break;

        case 'bullet': {
          const segments = parseBoldSegments(block.text);
          doc.fontSize(10).fillColor(COLORS.text);
          // Bullet character
          doc.font(FONTS.body).text('•', 80, doc.y, { continued: true, width: 12 });
          doc.text(' ', { continued: true, width: 4 });
          // Render segments with bold
          for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            const isLast = i === segments.length - 1;
            doc.font(seg.bold ? FONTS.heading : FONTS.body)
              .text(seg.text, { continued: !isLast, width: pageWidth - 24 });
          }
          doc.moveDown(0.15);
          break;
        }

        case 'numbered':
          doc.fontSize(10).font(FONTS.body).fillColor(COLORS.text)
            .text(`${block.level}.`, 80, doc.y, { continued: true, width: 16 })
            .text(stripMd(block.text), { width: pageWidth - 24 });
          doc.moveDown(0.15);
          break;

        case 'table_header':
          doc.moveDown(0.3);
          doc.fontSize(9).font(FONTS.heading).fillColor(COLORS.primary)
            .text(stripMd(block.text), 72, doc.y, { width: pageWidth });
          doc.moveTo(72, doc.y + 2).lineTo(72 + pageWidth, doc.y + 2)
            .strokeColor(COLORS.border).lineWidth(0.5).stroke();
          doc.moveDown(0.2);
          break;

        case 'table_row':
          doc.fontSize(9).font(FONTS.body).fillColor(COLORS.text)
            .text(stripMd(block.text), 72, doc.y, { width: pageWidth });
          doc.moveDown(0.1);
          break;

        case 'paragraph':
        default: {
          const segments = parseBoldSegments(block.text);
          doc.fontSize(10).fillColor(COLORS.text);
          for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            const isLast = i === segments.length - 1;
            doc.font(seg.bold ? FONTS.heading : FONTS.body)
              .text(seg.text, { continued: !isLast, width: pageWidth });
          }
          doc.moveDown(0.4);
          break;
        }
      }

      currentY = doc.y;
    }

    // ═══ PAGE NUMBERS ═══
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 1; i < pageCount; i++) { // Skip cover page
      doc.switchToPage(i);
      doc.fontSize(8).font(FONTS.body).fillColor(COLORS.muted)
        .text(
          `${options.title} — ${options.preparedFor || ''} | Page ${i} of ${pageCount - 1}`,
          72, doc.page.height - 50,
          { width: pageWidth, align: 'center' }
        );
    }

    doc.end();
  });
}

// Alias for backward compatibility
export const generatePDFBuffer = generatePDFServerless;
