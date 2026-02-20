/**
 * GET /api/signal-health
 *
 * Health check and monitoring dashboard for The Signal newsletter
 * Shows news source status, recent sends, and overall system health
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkNewsSourcesHealth } from '@/lib/signal/news-sources';
import { checkSendHealth, getRecentSends } from '@/lib/signal/send-tracker';

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  
  const querySecret = request.nextUrl.searchParams.get('secret');
  return querySecret === cronSecret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [sourcesHealth, sendHealth, recentSends] = await Promise.all([
      checkNewsSourcesHealth(),
      checkSendHealth(),
      getRecentSends(10),
    ]);

    // Check environment variables
    const envStatus = {
      braveApiKey: !!(process.env.BRAVE_API_KEY || process.env.BRAVE_SEARCH_API_KEY),
      newsApiKey: !!process.env.NEWSAPI_KEY,
      resendApiKey: !!process.env.RESEND_API_KEY,
      resendAudienceId: !!process.env.RESEND_AUDIENCE_ID_SIGNAL,
      cronSecret: !!process.env.CRON_SECRET,
      telegramBotToken: !!process.env.TELEGRAM_BOT_TOKEN,
    };

    const overallHealthy = 
      sendHealth.healthy &&
      (sourcesHealth.brave || sourcesHealth.newsapi || sourcesHealth.googleRss || sourcesHealth.cache) &&
      envStatus.resendApiKey &&
      envStatus.resendAudienceId;

    // HTML dashboard
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Signal Newsletter Health</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .header {
      background: white;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      margin-left: 10px;
    }
    .status-healthy { background: #d1fae5; color: #065f46; }
    .status-warning { background: #fef3c7; color: #92400e; }
    .status-error { background: #fee2e2; color: #991b1b; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .card h2 {
      font-size: 18px;
      margin-bottom: 15px;
      color: #111;
    }
    .metric {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .metric:last-child { border-bottom: none; }
    .metric-label {
      color: #6b7280;
      font-size: 14px;
    }
    .metric-value {
      font-weight: 600;
      font-size: 14px;
    }
    .check {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
      font-size: 12px;
    }
    .check-ok { background: #d1fae5; color: #065f46; }
    .check-fail { background: #fee2e2; color: #991b1b; }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      text-align: left;
      padding: 10px;
      border-bottom: 1px solid #f3f4f6;
      font-size: 14px;
    }
    th {
      font-weight: 600;
      color: #6b7280;
    }
    .actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    .btn {
      padding: 10px 20px;
      border-radius: 4px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      display: inline-block;
    }
    .btn-primary { background: #6366f1; color: white; }
    .btn-secondary { background: #e5e7eb; color: #374151; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>
        📊 The Signal Health Dashboard
        <span class="status-badge ${overallHealthy ? 'status-healthy' : 'status-warning'}">
          ${overallHealthy ? '✓ Healthy' : '⚠ Issues Detected'}
        </span>
      </h1>
      <p style="color: #6b7280; margin-top: 10px;">
        Last checked: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST
      </p>
    </div>

    <div class="grid">
      <div class="card">
        <h2>📰 News Sources</h2>
        <div class="metric">
          <span class="metric-label">Brave Search</span>
          <span class="check ${sourcesHealth.brave ? 'check-ok' : 'check-fail'}">
            ${sourcesHealth.brave ? '✓' : '✗'}
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">NewsAPI</span>
          <span class="check ${sourcesHealth.newsapi ? 'check-ok' : 'check-fail'}">
            ${sourcesHealth.newsapi ? '✓' : '✗'}
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Google News RSS</span>
          <span class="check ${sourcesHealth.googleRss ? 'check-ok' : 'check-fail'}">
            ${sourcesHealth.googleRss ? '✓' : '✗'}
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Cache Available</span>
          <span class="check ${sourcesHealth.cache ? 'check-ok' : 'check-fail'}">
            ${sourcesHealth.cache ? '✓' : '✗'}
          </span>
        </div>
      </div>

      <div class="card">
        <h2>⚙️ Configuration</h2>
        <div class="metric">
          <span class="metric-label">Brave API Key</span>
          <span class="check ${envStatus.braveApiKey ? 'check-ok' : 'check-fail'}">
            ${envStatus.braveApiKey ? '✓' : '✗'}
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">NewsAPI Key</span>
          <span class="check ${envStatus.newsApiKey ? 'check-ok' : 'check-fail'}">
            ${envStatus.newsApiKey ? '✓' : '✗'}
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Resend API</span>
          <span class="check ${envStatus.resendApiKey ? 'check-ok' : 'check-fail'}">
            ${envStatus.resendApiKey ? '✓' : '✗'}
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Audience ID</span>
          <span class="check ${envStatus.resendAudienceId ? 'check-ok' : 'check-fail'}">
            ${envStatus.resendAudienceId ? '✓' : '✗'}
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Telegram Alerts</span>
          <span class="check ${envStatus.telegramBotToken ? 'check-ok' : 'check-fail'}">
            ${envStatus.telegramBotToken ? '✓' : '✗'}
          </span>
        </div>
      </div>

      <div class="card">
        <h2>📬 Send Health</h2>
        <div class="metric">
          <span class="metric-label">Status</span>
          <span class="metric-value ${sendHealth.healthy ? 'status-healthy' : 'status-warning'}">
            ${sendHealth.healthy ? 'Healthy' : 'Needs Attention'}
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Days Since Success</span>
          <span class="metric-value">${sendHealth.daysSinceSuccess.toFixed(1)}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Recent Failures</span>
          <span class="metric-value">${sendHealth.recentFailures}/10</span>
        </div>
        ${sendHealth.lastSend ? `
          <div class="metric">
            <span class="metric-label">Last Send</span>
            <span class="metric-value">${sendHealth.lastSend.edition}</span>
          </div>
        ` : ''}
      </div>
    </div>

    <div class="card">
      <h2>📋 Recent Send History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Edition</th>
            <th>Status</th>
            <th>Source</th>
            <th>Stories</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${recentSends.length === 0 ? '<tr><td colspan="6" style="text-align: center; color: #6b7280;">No sends yet</td></tr>' : ''}
          ${recentSends.map(send => `
            <tr>
              <td>${new Date(send.timestamp).toLocaleDateString()}</td>
              <td>${send.edition || 'N/A'}</td>
              <td>
                <span class="status-badge ${
                  send.status === 'success' ? 'status-healthy' : 
                  send.status === 'partial' ? 'status-warning' : 
                  'status-error'
                }">
                  ${send.status}
                </span>
              </td>
              <td>${send.newsSource}</td>
              <td>${send.newsItemCount}</td>
              <td>${(send.durationMs / 1000).toFixed(1)}s</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="actions">
      <a href="/api/signal-preview?secret=${request.nextUrl.searchParams.get('secret')}" 
         class="btn btn-primary">
        📧 Preview Next Newsletter
      </a>
      <a href="/api/send-signal?secret=${request.nextUrl.searchParams.get('secret')}&test=true" 
         class="btn btn-secondary">
        🧪 Send Test
      </a>
      <a href="javascript:location.reload()" 
         class="btn btn-secondary">
        🔄 Refresh
      </a>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Signal:Health] Check failed:', errorMessage);

    return NextResponse.json(
      { error: 'Health check failed', details: errorMessage },
      { status: 500 }
    );
  }
}
