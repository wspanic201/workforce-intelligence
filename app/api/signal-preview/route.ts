/**
 * GET /api/signal-preview
 *
 * Generates and displays a preview of the next Signal newsletter
 * without sending it. Useful for reviewing before broadcast.
 *
 * Query params:
 *   ?secret=<cron-secret> - Required for auth
 *   ?raw=true - Return raw HTML instead of rendered page
 */

import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

import { generateSignalContent } from '@/lib/signal/generate-content';
import { renderSignalEmail } from '@/lib/signal/email-template';
import { fetchNewsWithFallback, type NewsItem } from '@/lib/signal/news-sources';
import { getSupabaseServerClient } from '@/lib/supabase/client';

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const querySecret = request.nextUrl.searchParams.get('secret');
  return querySecret === cronSecret;
}

async function emergencyBackfillNews(existing: NewsItem[]): Promise<NewsItem[]> {
  const items = [...existing];

  // 1) Pull from intelligence DB without strict source-type filters
  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from('intel_sources')
      .select('title,url,summary,publisher,updated_at')
      .order('updated_at', { ascending: false })
      .limit(10);

    for (const row of data || []) {
      if (items.length >= 3) break;
      if (!row.title) continue;
      items.push({
        title: row.title,
        url: row.url || 'https://withwavelength.com/admin/intelligence/sources',
        snippet: row.summary || `Source: ${row.publisher || 'Intelligence Hub'}`,
        date: row.updated_at || new Date().toISOString(),
        source: row.publisher || 'Intelligence Hub',
      } as NewsItem);
    }
  } catch {
    // ignore
  }

  // 2) Absolute last resort: evergreen seeds so preview still renders
  const seeds: NewsItem[] = [
    {
      title: 'AI skill requirements are being added to frontline job descriptions',
      url: 'https://withwavelength.com/signal',
      snippet: 'Employers are signaling that practical AI fluency is becoming baseline across admin and technical roles.',
      date: new Date().toISOString(),
      source: 'Wavelength',
    },
    {
      title: 'Community colleges are expanding short-cycle workforce credentials',
      url: 'https://withwavelength.com/signal',
      snippet: 'Programs tied directly to employer demand are accelerating due to faster hiring cycles and skills gaps.',
      date: new Date().toISOString(),
      source: 'Wavelength',
    },
    {
      title: 'Grant and public funding is increasingly tied to measurable outcomes',
      url: 'https://withwavelength.com/signal',
      snippet: 'Institutions are expected to show placement, completion, and wage impact in workforce program proposals.',
      date: new Date().toISOString(),
      source: 'Wavelength',
    },
  ];

  for (const seed of seeds) {
    if (items.length >= 3) break;
    items.push(seed);
  }

  return items.slice(0, 10);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = request.nextUrl.searchParams.get('raw') === 'true';

  try {
    console.log('[Signal:Preview] Generating preview...');

    // Fetch news
    const newsResult = await fetchNewsWithFallback();
    let previewItems = newsResult.items;
    let degradedMode = false;

    if (previewItems.length < 3) {
      degradedMode = true;
      previewItems = await emergencyBackfillNews(previewItems);
    }

    if (previewItems.length < 3) {
      return new NextResponse(
        `<html><body style="font-family: sans-serif; padding: 40px;">
          <h1>⚠️ Preview Generation Failed</h1>
          <p>Insufficient news items: ${previewItems.length} found (minimum 3 required)</p>
          <p>Source attempted: ${newsResult.source}</p>
          <p>Error: ${newsResult.error || 'Unknown'}</p>
          <p><a href="/api/signal-health?secret=${request.nextUrl.searchParams.get('secret')}">Check health status</a></p>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Generate content
    const signalContent = await generateSignalContent(previewItems);
    const html = renderSignalEmail(signalContent);

    if (raw) {
      // Return raw HTML for email clients
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Wrap in preview interface
    const previewHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Signal Newsletter Preview</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
    }
    .preview-header {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .preview-header h1 {
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .preview-info {
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: #666;
    }
    .preview-actions {
      margin-top: 15px;
      display: flex;
      gap: 10px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      display: inline-block;
    }
    .btn-primary {
      background: #6366f1;
      color: white;
    }
    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }
    .email-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-success { background: #d1fae5; color: #065f46; }
    .status-warning { background: #fef3c7; color: #92400e; }
  </style>
</head>
<body>
  <div class="preview-header">
    <h1>📧 The Signal Newsletter Preview</h1>
    <div class="preview-info">
      <div>
        <strong>Edition:</strong> ${signalContent.edition}
      </div>
      <div>
        <strong>News Source:</strong> 
        <span class="status ${newsResult.source === 'brave' ? 'status-success' : 'status-warning'}">
          ${newsResult.source.toUpperCase()}
        </span>
      </div>
      <div>
        <strong>Stories:</strong> ${previewItems.length}
      </div>
    </div>
    ${degradedMode ? `<p style="margin-top:10px;color:#92400e;background:#FEF3C7;padding:8px 10px;border-radius:6px;font-size:13px;">⚠️ Degraded preview mode: external news sources were light, so intelligence DB/seed items were used to generate this preview.</p>` : ''}
    <div class="preview-actions">
      <a href="/api/send-signal?secret=${request.nextUrl.searchParams.get('secret')}&test=true" 
         class="btn btn-primary">
        Send Test (to yourself)
      </a>
      <a href="/api/signal-preview?secret=${request.nextUrl.searchParams.get('secret')}&raw=true" 
         class="btn btn-secondary" target="_blank">
        View Raw HTML
      </a>
      <a href="/api/signal-health?secret=${request.nextUrl.searchParams.get('secret')}" 
         class="btn btn-secondary">
        Health Check
      </a>
    </div>
  </div>
  
  <div class="email-container">
    ${html}
  </div>
</body>
</html>`;

    return new NextResponse(previewHtml, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Signal:Preview] Failed:', errorMessage);

    return new NextResponse(
      `<html><body style="font-family: sans-serif; padding: 40px;">
        <h1>❌ Preview Generation Failed</h1>
        <pre style="background: #fee; padding: 20px; border-radius: 4px;">${errorMessage}</pre>
        <p><a href="/api/signal-health?secret=${request.nextUrl.searchParams.get('secret')}">Check health status</a></p>
      </body></html>`,
      { 
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}
