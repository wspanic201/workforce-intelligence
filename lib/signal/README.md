# The Signal Newsletter - Production System

**Status:** Production-ready with robust error handling and monitoring

## Overview

The Signal is Wavelength's newsletter for community college leaders. It's sent Mon/Wed/Fri at 8am CST and features curated workforce development news.

This implementation is designed for **production reliability** with:
- Multi-source news fetching (automatic failover)
- Send tracking and monitoring
- Telegram alerts on success/failure
- Preview interface for quality control
- Test mode for safe validation

## Architecture

```
Vercel Cron (Mon/Wed/Fri 8am CST)
  ↓
POST /api/send-signal
  ↓
1. Fetch news (Brave → NewsAPI → Google RSS → Cache)
2. Generate content (Claude)
3. Render HTML (email template)
4. Send broadcast (Resend with retry)
5. Log attempt + Send Telegram alert
```

## Key Features

### 1. Multi-Source News Fetching

**Fallback chain:**
1. **Brave Search** (primary) - Free tier: 2,000 queries/month
2. **NewsAPI.org** (fallback #1) - Free tier: 100 requests/day
3. **Google News RSS** (fallback #2) - No auth required
4. **Cached content** (last resort) - From last successful fetch

If primary source fails, system automatically tries the next source without manual intervention.

### 2. Send Tracking & Monitoring

Every send attempt is logged to `data/signal-sends.json` with:
- Timestamp, edition, news source used
- Success/failure status
- News item count, duration
- Error details if failed

**Telegram alerts** notify Matt of:
- ✅ Successful sends (with recipient count)
- 🚨 Failed sends (with error details)
- ⚠️ Warnings (e.g., using fallback source)

### 3. Preview & Testing

**Preview:** `/api/signal-preview?secret=<cron-secret>`
- See exactly what will be sent
- Check news source health
- Review before broadcast

**Test mode:** `/api/send-signal?secret=<cron-secret>&test=true`
- Generates newsletter but doesn't send
- Useful for validating changes

### 4. Health Dashboard

**URL:** `/api/signal-health?secret=<cron-secret>`

Shows:
- News source status (✓/✗ for each)
- Environment variable configuration
- Recent send history (last 10)
- Overall system health

## Environment Variables

**Required:**
- `RESEND_API_KEY` - Resend API key
- `RESEND_AUDIENCE_ID_SIGNAL` - Resend audience ID (f77b0858-a84c-4bbe-b688-722cf7104766)
- `CRON_SECRET` - Auth secret for endpoints
- `ANTHROPIC_API_KEY` - For content generation

**Recommended (news sources):**
- `BRAVE_API_KEY` - Primary news source (https://brave.com/search/api/)
- `NEWSAPI_KEY` - Fallback #1 (https://newsapi.org/)

**Optional:**
- `TELEGRAM_BOT_TOKEN` - For success/failure alerts
- `TELEGRAM_MATT_CHAT_ID` - Default: 8562817832

## Deployment

### Initial Setup

1. **Create Resend audience:**
   ```
   Login to Resend → Audiences → Create audience "The Signal"
   Copy audience ID → Add to Vercel env vars as RESEND_AUDIENCE_ID_SIGNAL
   ```

2. **Get Brave Search API key:**
   ```
   Sign up at https://brave.com/search/api/
   Free tier: 2,000 queries/month
   Add to Vercel as BRAVE_API_KEY
   ```

3. **(Optional) Get NewsAPI key:**
   ```
   Sign up at https://newsapi.org/
   Free tier: 100 requests/day
   Add to Vercel as NEWSAPI_KEY
   ```

4. **Set cron secret:**
   ```bash
   vercel env add CRON_SECRET production
   # Enter a long random string
   ```

### Deploy

```bash
cd ~/projects/workforce-intelligence
git add -A
git commit -m "Add production-grade Signal newsletter system"
git push
```

Vercel will automatically deploy. The cron job is configured in `vercel.json`.

## Testing

### 1. Health check
```bash
curl "https://withwavelength.com/api/signal-health?secret=<cron-secret>"
```

### 2. Preview
Open in browser:
```
https://withwavelength.com/api/signal-preview?secret=<cron-secret>
```

### 3. Test send (doesn't actually send)
```bash
curl -X POST "https://withwavelength.com/api/send-signal" \
  -H "x-cron-secret: <cron-secret>" \
  -H "Content-Type: application/json" \
  -d '{"testMode": true}'
```

### 4. Real send (production)
```bash
curl -X POST "https://withwavelength.com/api/send-signal" \
  -H "x-cron-secret: <cron-secret>"
```

## Monitoring

### Check if it's working

1. **Health dashboard:** Visit `/api/signal-health?secret=<cron-secret>`
2. **Telegram alerts:** Matt gets notified on every send
3. **Send logs:** Check `data/signal-sends.json` on server

### What to do if it fails

1. Check health dashboard - which news source failed?
2. Check Telegram alert for error details
3. Try manual send via preview interface
4. If all sources fail, check API keys in Vercel env vars

### Expected behavior

- **Mon/Wed/Fri 8am CST:** Cron fires, newsletter sends
- **Telegram notification:** Success message with recipient count
- **If Brave fails:** Automatically tries NewsAPI, then Google RSS
- **If all fail:** Uses cached content from last successful send

## File Structure

```
lib/signal/
  ├── news-sources.ts       # Multi-source fetching with fallback
  ├── send-tracker.ts       # Logging and Telegram alerts
  ├── generate-content.ts   # Claude content generation
  ├── email-template.ts     # HTML email rendering
  └── README.md             # This file

app/api/
  ├── send-signal/          # Main cron endpoint
  ├── signal-preview/       # Preview interface
  └── signal-health/        # Health dashboard

data/
  └── signal-sends.json     # Send history log (not in git)
```

## Troubleshooting

**Problem:** Newsletter not sending

1. Check health dashboard for red X's
2. Verify environment variables in Vercel
3. Check if cron is enabled in Vercel dashboard
4. Look at deployment logs in Vercel

**Problem:** Using fallback sources too often

- Brave API quota exceeded (2,000/month)
- Get NewsAPI key as backup
- Upgrade Brave plan if needed

**Problem:** No Telegram alerts

- Check `TELEGRAM_BOT_TOKEN` is set
- Verify bot can send messages to Matt's chat

## Future Enhancements

Possible improvements:
- [ ] A/B test subject lines
- [ ] Subscriber preference management (topic tags)
- [ ] Delivery analytics (open rate, click rate)
- [ ] Scheduled sends with approval workflow
- [ ] RSS feed for The Signal archives

## Support

For issues or questions:
- Check health dashboard first
- Review recent send logs
- Test with preview endpoint
- Contact Matt if persistent issues
