/**
 * Send tracking and monitoring for The Signal newsletter
 * Logs every send attempt, tracks delivery, sends alerts
 */

import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface SendAttempt {
  id: string;
  timestamp: string;
  edition: string;
  newsSource: string;
  newsItemCount: number;
  status: 'success' | 'failed' | 'partial';
  broadcastId?: string;
  recipientCount?: number;
  error?: string;
  durationMs: number;
}

const SEND_LOG_PATH = path.join(process.cwd(), 'data', 'signal-sends.json');

// ── Log management ──────────────────────────────────────────────────────────

// Note: Vercel serverless has a read-only filesystem.
// Send logging is best-effort — falls back gracefully if writes fail.

async function loadSendLog(): Promise<SendAttempt[]> {
  try {
    if (!existsSync(SEND_LOG_PATH)) {
      return [];
    }
    const data = await readFile(SEND_LOG_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.warn('[Signal:Tracker] Failed to load send log:', err);
    return [];
  }
}

async function saveSendLog(log: SendAttempt[]) {
  try {
    const dir = path.dirname(SEND_LOG_PATH);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(SEND_LOG_PATH, JSON.stringify(log, null, 2));
  } catch (err) {
    // Vercel serverless filesystem is read-only — this is expected
    console.warn('[Signal:Tracker] Could not save send log (read-only fs):', (err as Error).message);
  }
}

export async function logSendAttempt(attempt: SendAttempt) {
  const log = await loadSendLog();
  log.unshift(attempt); // Most recent first
  
  // Keep last 100 sends
  if (log.length > 100) {
    log.splice(100);
  }
  
  await saveSendLog(log);
  console.log(`[Signal:Tracker] Logged send attempt: ${attempt.status} (${attempt.edition})`);
}

export async function getRecentSends(limit: number = 10): Promise<SendAttempt[]> {
  const log = await loadSendLog();
  return log.slice(0, limit);
}

export async function getLastSuccessfulSend(): Promise<SendAttempt | null> {
  const log = await loadSendLog();
  return log.find(s => s.status === 'success') || null;
}

// ── Telegram alerts ─────────────────────────────────────────────────────────

export async function sendTelegramAlert(
  type: 'success' | 'warning' | 'error',
  message: string
) {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_MATT_CHAT_ID || '8562817832';
  
  if (!telegramBotToken) {
    console.warn('[Signal:Telegram] No bot token configured, skipping alert');
    return;
  }

  const emoji = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '🚨';
  const text = `${emoji} **The Signal Newsletter**\n\n${message}`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text,
          parse_mode: 'Markdown',
        }),
      }
    );

    if (!response.ok) {
      console.warn(`[Signal:Telegram] Failed to send alert: HTTP ${response.status}`);
    }
  } catch (err) {
    console.warn('[Signal:Telegram] Alert send failed:', err);
  }
}

// ── Success/failure notifications ───────────────────────────────────────────

export async function notifySuccess(attempt: SendAttempt) {
  const message = 
    `📧 **Newsletter sent successfully**\n\n` +
    `Edition: ${attempt.edition}\n` +
    `Recipients: ${attempt.recipientCount || 'unknown'}\n` +
    `Source: ${attempt.newsSource}\n` +
    `Stories: ${attempt.newsItemCount}\n` +
    `Duration: ${(attempt.durationMs / 1000).toFixed(1)}s\n\n` +
    `🔗 [View newsletter](https://withwavelength.com/signal)`;
  
  await sendTelegramAlert('success', message);
}

export async function notifyFailure(attempt: SendAttempt) {
  const message =
    `🚨 **Newsletter send FAILED**\n\n` +
    `Edition: ${attempt.edition}\n` +
    `Error: ${attempt.error}\n` +
    `News source: ${attempt.newsSource}\n` +
    `Stories fetched: ${attempt.newsItemCount}\n\n` +
    `Check logs and retry manually if needed.`;
  
  await sendTelegramAlert('error', message);
}

export async function notifyWarning(warning: string) {
  await sendTelegramAlert('warning', warning);
}

// ── Health monitoring ───────────────────────────────────────────────────────

export async function checkSendHealth(): Promise<{
  healthy: boolean;
  lastSend?: SendAttempt;
  daysSinceSuccess: number;
  recentFailures: number;
}> {
  const log = await loadSendLog();
  const lastSuccess = log.find(s => s.status === 'success');
  const recentLog = log.slice(0, 10);
  const recentFailures = recentLog.filter(s => s.status === 'failed').length;

  let daysSinceSuccess = 999;
  if (lastSuccess) {
    const ageMs = Date.now() - new Date(lastSuccess.timestamp).getTime();
    daysSinceSuccess = ageMs / (1000 * 60 * 60 * 24);
  }

  const healthy = daysSinceSuccess < 5 && recentFailures < 3;

  return {
    healthy,
    lastSend: log[0],
    daysSinceSuccess,
    recentFailures,
  };
}
