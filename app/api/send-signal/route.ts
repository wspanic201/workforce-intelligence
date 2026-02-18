/**
 * POST/GET /api/send-signal
 *
 * Fetches recent workforce news via Brave Search, generates newsletter
 * content with Claude, renders the HTML template, and sends a broadcast
 * to the Resend audience for The Signal by Wavelength.
 *
 * Protected by x-cron-secret header (or ?secret= query param for GET cron calls).
 * Vercel cron fires this on a GET request, so both methods are supported.
 *
 * Schedule: Mon/Wed/Fri at 8:00 AM CST (13:00 UTC) — see vercel.json
 *
 * TODO: Create the Resend audience for The Signal and set RESEND_AUDIENCE_ID_SIGNAL
 * in Vercel environment variables before going live.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateSignalContent, type NewsItem } from '@/lib/signal/generate-content';
import { renderSignalEmail } from '@/lib/signal/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Auth helper ──────────────────────────────────────────────────────────────

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn('[Signal] CRON_SECRET not set — rejecting all requests');
    return false;
  }
  // Header check (POST usage and manual curl calls)
  const headerSecret = request.headers.get('x-cron-secret');
  if (headerSecret === cronSecret) return true;
  // Query param check (Vercel cron GET, useful for quick testing)
  const querySecret = request.nextUrl.searchParams.get('secret');
  if (querySecret === cronSecret) return true;
  return false;
}

// ── Brave Search ─────────────────────────────────────────────────────────────

interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
}

async function fetchWorkforceNews(): Promise<NewsItem[]> {
  // Support both BRAVE_API_KEY (spec) and BRAVE_SEARCH_API_KEY (existing project convention)
  const apiKey = process.env.BRAVE_API_KEY || process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) throw new Error('No Brave Search API key set (BRAVE_API_KEY or BRAVE_SEARCH_API_KEY)');

  const queries = [
    'workforce development community college training programs 2025',
    'labor market trends jobs hiring United States 2025',
    'workforce shortage skilled trades healthcare manufacturing 2025',
  ];

  const allResults: NewsItem[] = [];
  const seen = new Set<string>();

  for (const query of queries) {
    try {
      const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=4&freshness=pw`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        console.warn(`[Signal] Brave Search HTTP ${response.status} for query: "${query}"`);
        continue;
      }

      const data = await response.json();
      const results: BraveSearchResult[] = data.web?.results || [];

      for (const result of results) {
        if (seen.has(result.url)) continue;
        seen.add(result.url);
        allResults.push({
          title: result.title || '',
          url: result.url || '',
          snippet: result.description || '',
          date: result.age || undefined,
        });
      }
    } catch (err) {
      console.warn(`[Signal] Brave query failed: "${query}"`, err);
    }
  }

  console.log(`[Signal] Fetched ${allResults.length} news items from Brave Search`);
  return allResults.slice(0, 8); // Cap at 8 items for the prompt
}

// ── Resend audience broadcast ────────────────────────────────────────────────

async function sendBroadcast(htmlContent: string, edition: string): Promise<number> {
  const audienceId = process.env.RESEND_AUDIENCE_ID_SIGNAL;
  if (!audienceId) {
    throw new Error('RESEND_AUDIENCE_ID_SIGNAL not set. Create the audience in Resend and add this env var.');
  }

  // Fetch all contacts in the audience
  // Resend audiences: list contacts then send individual emails
  // (Resend does not have a single "broadcast to audience" API endpoint yet —
  //  broadcast is done via their "Broadcasts" feature or by iterating contacts)
  //
  // Using Resend Broadcasts API (available on paid plans):
  // POST /broadcasts with audienceId sends to all contacts in that audience.

  const broadcastRes = await resend.broadcasts.create({
    audienceId,
    from: 'The Signal <hello@signal.withwavelength.com>',
    subject: `The Signal · ${edition}`,
    html: htmlContent,
    name: `The Signal – ${edition}`,
  });

  if (broadcastRes.error) {
    throw new Error(`Resend broadcast creation failed: ${broadcastRes.error.message}`);
  }

  const broadcastId = broadcastRes.data?.id;
  if (!broadcastId) {
    throw new Error('Resend broadcast created but returned no ID');
  }

  // Send the broadcast immediately (no scheduledAt = send now)
  const sendRes = await resend.broadcasts.send(broadcastId);

  if (sendRes.error) {
    throw new Error(`Resend broadcast send failed: ${sendRes.error.message}`);
  }

  console.log(`[Signal] Broadcast sent. ID: ${broadcastId}`);

  // We don't know the exact recipient count without listing contacts,
  // but return the broadcast ID for logging.
  return broadcastId ? 1 : 0; // Placeholder — actual count is async in Resend
}

// ── Core handler ─────────────────────────────────────────────────────────────

async function handleSendSignal(): Promise<{ success: boolean; edition: string; broadcastId?: string }> {
  // 1. Fetch news
  const newsItems = await fetchWorkforceNews();
  if (newsItems.length < 2) {
    throw new Error('[Signal] Not enough news items fetched to generate newsletter');
  }

  // 2. Generate content with Claude
  const signalContent = await generateSignalContent(newsItems);

  // 3. Render HTML
  const html = renderSignalEmail(signalContent);

  // 4. Send broadcast via Resend
  await sendBroadcast(html, signalContent.edition);

  return {
    success: true,
    edition: signalContent.edition,
  };
}

// ── Route handlers ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await handleSendSignal();
    return NextResponse.json({ success: true, edition: result.edition });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Signal] Send failed:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Vercel cron jobs use GET requests
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await handleSendSignal();
    return NextResponse.json({ success: true, edition: result.edition });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Signal] Send failed:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
