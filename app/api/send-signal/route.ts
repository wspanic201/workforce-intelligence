/**
 * POST/GET /api/send-signal
 *
 * Production-grade newsletter sender with:
 * - Multi-source news fetching (Brave → NewsAPI → Google RSS → Cache)
 * - Send tracking and monitoring
 * - Telegram alerts on success/failure
 * - Retry logic with exponential backoff
 * - Test mode (dry run)
 *
 * Protected by x-cron-secret header.
 * Schedule: Mon/Wed/Fri at 8:00 AM CST (13:00 UTC) — see vercel.json
 */

import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

import { Resend } from 'resend';
import { generateSignalContent } from '@/lib/signal/generate-content';
import { renderSignalEmail } from '@/lib/signal/email-template';
import { fetchNewsWithFallback } from '@/lib/signal/news-sources';
import { 
  logSendAttempt, 
  notifySuccess, 
  notifyFailure,
  notifyWarning,
  type SendAttempt 
} from '@/lib/signal/send-tracker';

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Auth ────────────────────────────────────────────────────────────────────

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn('[Signal] CRON_SECRET not set — rejecting all requests');
    return false;
  }
  
  const headerSecret = request.headers.get('x-cron-secret');
  if (headerSecret === cronSecret) return true;
  
  const querySecret = request.nextUrl.searchParams.get('secret');
  if (querySecret === cronSecret) return true;
  
  return false;
}

// ── Resend broadcast with retry ─────────────────────────────────────────────

async function sendBroadcastWithRetry(
  htmlContent: string,
  edition: string,
  maxRetries = 2
): Promise<{ broadcastId: string; recipientCount: number }> {
  const audienceId = process.env.RESEND_AUDIENCE_ID_SIGNAL;
  if (!audienceId) {
    throw new Error('RESEND_AUDIENCE_ID_SIGNAL not set');
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delayMs = Math.pow(2, attempt) * 1000; // 2s, 4s
        console.log(`[Signal] Retry ${attempt}/${maxRetries} after ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      // Create broadcast
      const broadcastRes = await resend.broadcasts.create({
        audienceId,
        from: 'The Signal <hello@signal.withwavelength.com>',
        subject: `The Signal · ${edition}`,
        html: htmlContent,
        name: `The Signal – ${edition}`,
      });

      if (broadcastRes.error) {
        throw new Error(`Broadcast creation failed: ${broadcastRes.error.message}`);
      }

      const broadcastId = broadcastRes.data?.id;
      if (!broadcastId) {
        throw new Error('Broadcast created but returned no ID');
      }

      // Send immediately
      const sendRes = await resend.broadcasts.send(broadcastId);

      if (sendRes.error) {
        throw new Error(`Broadcast send failed: ${sendRes.error.message}`);
      }

      console.log(`[Signal] ✓ Broadcast sent successfully (ID: ${broadcastId})`);

      // Estimate recipient count (Resend doesn't return exact count immediately)
      // We could fetch audience contacts, but that's an extra API call
      const recipientCount = 0; // Placeholder — actual delivery tracked async by Resend

      return { broadcastId, recipientCount };

    } catch (error) {
      lastError = error as Error;
      console.error(`[Signal] Broadcast attempt ${attempt + 1} failed:`, error);
    }
  }

  throw lastError || new Error('Broadcast failed after all retries');
}

// ── Main send handler ───────────────────────────────────────────────────────

async function handleSendSignal(testMode = false): Promise<{
  success: boolean;
  edition: string;
  newsSource: string;
  newsItemCount: number;
  broadcastId?: string;
  recipientCount?: number;
  error?: string;
  durationMs: number;
}> {
  const startTime = Date.now();
  const attemptId = `signal-${Date.now()}`;

  let attempt: SendAttempt = {
    id: attemptId,
    timestamp: new Date().toISOString(),
    edition: '',
    newsSource: '',
    newsItemCount: 0,
    status: 'failed',
    durationMs: 0,
  };

  try {
    // 1. Fetch news with fallback chain
    console.log('[Signal] Fetching news...');
    const newsResult = await fetchNewsWithFallback();

    if (newsResult.items.length < 3) {
      const error = 'Insufficient news items (minimum 3 required)';
      attempt = {
        ...attempt,
        newsSource: newsResult.source,
        newsItemCount: newsResult.items.length,
        error,
        durationMs: Date.now() - startTime,
      };
      await logSendAttempt(attempt);
      await notifyFailure(attempt);
      throw new Error(error);
    }

    // Warn if using fallback
    if (newsResult.source !== 'brave') {
      await notifyWarning(
        `⚠️ Using fallback news source: ${newsResult.source}\n` +
        `Primary source (Brave) failed. Newsletter will still send.`
      );
    }

    // 2. Generate content with Claude
    console.log('[Signal] Generating content...');
    const signalContent = await generateSignalContent(newsResult.items);

    // 3. Render HTML
    const html = renderSignalEmail(signalContent);

    // 4. Send broadcast (or skip if test mode)
    let broadcastId: string | undefined;
    let recipientCount: number | undefined;

    if (testMode) {
      console.log('[Signal] TEST MODE — skipping actual send');
      broadcastId = 'test-mode';
      recipientCount = 0;
    } else {
      const sendResult = await sendBroadcastWithRetry(html, signalContent.edition);
      broadcastId = sendResult.broadcastId;
      recipientCount = sendResult.recipientCount;
    }

    // 5. Log success
    attempt = {
      ...attempt,
      edition: signalContent.edition,
      newsSource: newsResult.source,
      newsItemCount: newsResult.items.length,
      status: 'success',
      broadcastId,
      recipientCount,
      durationMs: Date.now() - startTime,
    };

    await logSendAttempt(attempt);
    
    if (!testMode) {
      await notifySuccess(attempt);
    }

    return {
      success: true,
      edition: signalContent.edition,
      newsSource: newsResult.source,
      newsItemCount: newsResult.items.length,
      broadcastId,
      recipientCount,
      durationMs: attempt.durationMs,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    attempt = {
      ...attempt,
      status: 'failed',
      error: errorMessage,
      durationMs: Date.now() - startTime,
    };

    await logSendAttempt(attempt);
    await notifyFailure(attempt);

    return {
      success: false,
      edition: attempt.edition || 'unknown',
      newsSource: attempt.newsSource || 'unknown',
      newsItemCount: attempt.newsItemCount,
      error: errorMessage,
      durationMs: attempt.durationMs,
    };
  }
}

// ── Route handlers ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const testMode = body.testMode === true;

    const result = await handleSendSignal(testMode);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[Signal Route] Unhandled POST error:', msg);
    return NextResponse.json({ error: msg, unhandled: true }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testMode = request.nextUrl.searchParams.get('test') === 'true';
    const result = await handleSendSignal(testMode);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[Signal Route] Unhandled GET error:', msg);
    return NextResponse.json({ error: msg, unhandled: true }, { status: 500 });
  }
}
