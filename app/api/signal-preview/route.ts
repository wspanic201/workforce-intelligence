/**
 * GET /api/signal-preview
 *
 * Generates a preview of the Signal newsletter HTML without sending it.
 * Returns the HTML directly so you can view it in a browser.
 *
 * Protected by CRON_SECRET (pass as ?secret=... or x-cron-secret header).
 *
 * Usage:
 *   curl -s "http://localhost:3000/api/signal-preview?secret=YOUR_CRON_SECRET" > preview.html && open preview.html
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSignalContent, type NewsItem } from '@/lib/signal/generate-content';
import { renderSignalEmail } from '@/lib/signal/email-template';

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn('[Signal Preview] CRON_SECRET not set');
    return false;
  }
  const headerSecret = request.headers.get('x-cron-secret');
  if (headerSecret === cronSecret) return true;
  const querySecret = request.nextUrl.searchParams.get('secret');
  if (querySecret === cronSecret) return true;
  return false;
}

async function fetchWorkforceNews(): Promise<NewsItem[]> {
  const apiKey = process.env.BRAVE_API_KEY || process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    console.warn('[Signal Preview] No Brave API key — using mock data');
    return getMockNewsItems();
  }

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
        console.warn(`[Signal Preview] Brave HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const results = data.web?.results || [];
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
      console.warn(`[Signal Preview] Brave query failed`, err);
    }
  }

  return allResults.length >= 2 ? allResults.slice(0, 8) : getMockNewsItems();
}

function getMockNewsItems(): NewsItem[] {
  return [
    {
      title: 'Healthcare sector faces 3.2 million worker shortage by 2026, new report warns',
      url: 'https://example.com/healthcare-shortage',
      snippet: 'A new workforce analysis projects a critical gap in healthcare workers, particularly in nursing, medical assisting, and allied health roles across rural and suburban regions.',
      date: 'this week',
    },
    {
      title: 'Manufacturing automation is creating new roles faster than workers can be trained',
      url: 'https://example.com/manufacturing-automation',
      snippet: 'Industry groups report that while automation is displacing some roles, demand for technicians who can operate, maintain, and program new equipment is surging.',
      date: 'this week',
    },
    {
      title: 'Community colleges see surge in short-term credential enrollment post-pandemic',
      url: 'https://example.com/cc-credentials',
      snippet: 'Enrollment in workforce-focused short-term credentials at community colleges is up 18% compared to pre-pandemic levels, with highest demand in healthcare, IT, and skilled trades.',
      date: 'this week',
    },
    {
      title: 'Workforce Pell expansion opens new funding doors for certificate programs',
      url: 'https://example.com/pell-expansion',
      snippet: 'Short-term Pell implementation is moving forward, creating a funding pathway for programs under 600 clock hours that previously had no federal financial aid access.',
      date: 'this week',
    },
    {
      title: 'Construction sector reports record unfilled positions despite wage increases',
      url: 'https://example.com/construction-workforce',
      snippet: 'The construction industry has over 400,000 unfilled positions nationally, with employers reporting that even 20-30% wage increases have not resolved pipeline shortages.',
      date: 'this week',
    },
    {
      title: 'Cybersecurity bootcamp graduates outpacing four-year degree holders in hiring',
      url: 'https://example.com/cybersecurity-hiring',
      snippet: 'Employers report high satisfaction rates with bootcamp and certificate graduates for entry-level security roles, signaling opportunity for community college programs in this space.',
      date: 'this week',
    },
  ];
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('[Signal Preview] Fetching news items...');
    const newsItems = await fetchWorkforceNews();

    console.log('[Signal Preview] Generating content with Claude...');
    const signalContent = await generateSignalContent(newsItems);

    console.log('[Signal Preview] Rendering HTML...');
    const html = renderSignalEmail(signalContent);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Signal Preview] Failed:', message);
    return new NextResponse(`Error generating preview: ${message}`, { status: 500 });
  }
}
