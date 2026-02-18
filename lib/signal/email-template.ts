/**
 * Signal Newsletter Email Template
 * Renders the "The Signal by Wavelength" newsletter as a complete HTML email.
 * Design: Clean, professional, mobile-responsive, print-friendly.
 */

import type { SignalContent, WorkforceNewsItem } from './generate-content';

export function renderSignalEmail(content: SignalContent): string {
  const { laborMarketSignal, workforceNews, industrySpotlight, edition } = content;

  const workforceNewsHtml = workforceNews
    .map(
      (item: WorkforceNewsItem) => `
        <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e8eaf0;">
          <a href="${escapeHtml(item.url)}" style="
            font-size: 16px;
            font-weight: 600;
            color: #1a1a2e;
            text-decoration: none;
            line-height: 1.4;
            display: block;
            margin-bottom: 8px;
          " target="_blank" rel="noopener noreferrer">${escapeHtml(item.headline)} ↗</a>
          <p style="
            font-size: 14px;
            color: #4a5568;
            line-height: 1.6;
            margin: 0;
          ">${escapeHtml(item.summary)}</p>
        </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>The Signal by Wavelength — ${escapeHtml(edition)}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 0 !important; }
      .email-body { padding: 24px 20px !important; }
      .header-inner { padding: 24px 20px !important; }
      .signal-number { font-size: 42px !important; }
    }
    @media print {
      .no-print { display: none !important; }
    }
  </style>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: #f0f2f7;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
">

  <!-- Preheader text (hidden) -->
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${escapeHtml(laborMarketSignal.headline)} — ${escapeHtml(edition)}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f2f7;">
    <tr>
      <td align="center" style="padding: 32px 16px;" class="email-wrapper">

        <!-- Email container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">

          <!-- ── HEADER ── -->
          <tr>
            <td style="background-color: #1a1a2e; border-radius: 12px 12px 0 0;" class="header-inner">
              <div style="padding: 32px 40px 28px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <div style="
                        font-size: 28px;
                        font-weight: 800;
                        letter-spacing: 3px;
                        color: #ffffff;
                        text-transform: uppercase;
                        margin-bottom: 4px;
                      ">THE SIGNAL</div>
                      <div style="
                        font-size: 13px;
                        color: #7b9cce;
                        letter-spacing: 1px;
                        font-weight: 500;
                      ">by Wavelength · Workforce Intelligence</div>
                    </td>
                    <td align="right" valign="middle">
                      <div style="
                        font-size: 12px;
                        color: #7b9cce;
                        text-align: right;
                        line-height: 1.5;
                      ">${escapeHtml(edition)}</div>
                    </td>
                  </tr>
                </table>
                <!-- Thin accent line -->
                <div style="
                  height: 2px;
                  background: linear-gradient(90deg, #0d6efd 0%, #4da3ff 50%, transparent 100%);
                  margin-top: 20px;
                  border-radius: 2px;
                "></div>
              </div>
            </td>
          </tr>

          <!-- ── BODY ── -->
          <tr>
            <td style="background-color: #ffffff;" class="email-body">
              <div style="padding: 40px 40px 32px 40px;">

                <!-- ── SECTION 1: Labor Market Signal ── -->
                <div style="margin-bottom: 40px;">
                  <div style="margin-bottom: 16px;">
                    <span style="
                      display: inline-block;
                      background-color: #0d6efd;
                      color: #ffffff;
                      font-size: 11px;
                      font-weight: 700;
                      letter-spacing: 1.5px;
                      text-transform: uppercase;
                      padding: 4px 12px;
                      border-radius: 20px;
                    ">📊 Labor Market Signal</span>
                  </div>
                  <h2 style="
                    font-size: 22px;
                    font-weight: 700;
                    color: #1a1a2e;
                    margin: 0 0 14px 0;
                    line-height: 1.3;
                  ">${escapeHtml(laborMarketSignal.headline)}</h2>
                  <p style="
                    font-size: 15px;
                    color: #3d4a5c;
                    line-height: 1.7;
                    margin: 0;
                  ">${escapeHtml(laborMarketSignal.body)}</p>
                </div>

                <!-- Divider -->
                <div style="height: 1px; background-color: #e8eaf0; margin-bottom: 40px;"></div>

                <!-- ── SECTION 2: Workforce News ── -->
                <div style="margin-bottom: 40px;">
                  <div style="margin-bottom: 20px;">
                    <span style="
                      display: inline-block;
                      background-color: #1a1a2e;
                      color: #ffffff;
                      font-size: 11px;
                      font-weight: 700;
                      letter-spacing: 1.5px;
                      text-transform: uppercase;
                      padding: 4px 12px;
                      border-radius: 20px;
                    ">📰 Workforce News</span>
                  </div>
                  ${workforceNewsHtml}
                </div>

                <!-- ── SECTION 3: Industry Spotlight ── -->
                <div style="
                  background-color: #f7f9ff;
                  border-left: 4px solid #0d6efd;
                  border-radius: 0 8px 8px 0;
                  padding: 28px 28px 24px 28px;
                  margin-bottom: 40px;
                ">
                  <div style="margin-bottom: 14px;">
                    <span style="
                      display: inline-block;
                      background-color: #e8f0fe;
                      color: #0d6efd;
                      font-size: 11px;
                      font-weight: 700;
                      letter-spacing: 1.5px;
                      text-transform: uppercase;
                      padding: 4px 12px;
                      border-radius: 20px;
                    ">🏭 Industry Spotlight · ${escapeHtml(industrySpotlight.sector)}</span>
                  </div>
                  <h3 style="
                    font-size: 18px;
                    font-weight: 700;
                    color: #1a1a2e;
                    margin: 0 0 12px 0;
                    line-height: 1.35;
                  ">${escapeHtml(industrySpotlight.headline)}</h3>
                  <p style="
                    font-size: 14px;
                    color: #3d4a5c;
                    line-height: 1.7;
                    margin: 0;
                  ">${escapeHtml(industrySpotlight.body)}</p>
                </div>

                <!-- ── CTA ── -->
                <div style="
                  background-color: #f7f9ff;
                  border: 1px solid #dde5f5;
                  border-radius: 10px;
                  padding: 24px 28px;
                  text-align: center;
                ">
                  <p style="
                    font-size: 15px;
                    color: #3d4a5c;
                    margin: 0 0 16px 0;
                    line-height: 1.6;
                  ">Curious what this means for your region?</p>
                  <a href="https://withwavelength.com" style="
                    display: inline-block;
                    background-color: #0d6efd;
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    padding: 12px 28px;
                    border-radius: 6px;
                    letter-spacing: 0.3px;
                  ">Run a free Wavelength scan →</a>
                </div>

              </div>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="
              background-color: #f7f8fc;
              border-top: 1px solid #e8eaf0;
              border-radius: 0 0 12px 12px;
            ">
              <div style="padding: 24px 40px;" class="no-print">
                <p style="
                  font-size: 12px;
                  color: #9aa5b8;
                  text-align: center;
                  margin: 0 0 8px 0;
                  line-height: 1.6;
                ">The Signal by Wavelength · <a href="https://withwavelength.com" style="color: #9aa5b8;">withwavelength.com</a></p>
                <p style="
                  font-size: 12px;
                  color: #b0bac9;
                  text-align: center;
                  margin: 0;
                ">You're receiving this because you subscribed to workforce intelligence from Wavelength.
                  <br><a href="{{ unsubscribe_url }}" style="color: #b0bac9; text-decoration: underline;">Unsubscribe</a>
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
