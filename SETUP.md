# Setup Guide

## Quick Start (5 minutes)

### 1. Get Anthropic API Key

1. Go to https://console.anthropic.com/
2. Navigate to API Keys
3. Create a new key
4. Copy the key (starts with `sk-ant-...`)

### 2. Set Up Supabase

Option A: **New Project** (Recommended for testing)

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: `workforce-intelligence`
4. Database Password: (create a strong one)
5. Region: Choose closest to you
6. Wait 2-3 minutes for provisioning

Option B: **Use Existing Project**

Skip if creating new project.

### 3. Run Database Migration

1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy entire contents of `supabase/schema.sql`
4. Paste and click "Run"
5. Verify tables created in Table Editor:
   - `validation_projects`
   - `research_components`
   - `validation_reports`
   - `agent_sessions`

### 4. Get Supabase Credentials

1. In Supabase dashboard, go to Settings → API
2. Copy these values:

```
Project URL: https://xxxxx.supabase.co
anon (public) key: eyJhbG...
service_role key: eyJhbG... (click "Reveal" first)
```

### 5. Configure Environment

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and fill in:

```bash
# Supabase (from step 4)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Anthropic (from step 1)
ANTHROPIC_API_KEY=sk-ant-...

# Confluence Labs (should already be correct for Matt)
CONFLUENCE_LABS_PATH=/Users/matt/projects/Confluence Labs

# Development
MOCK_AGENTS=false
```

### 6. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## Testing the System

### Test with Sample Project

1. Go to http://localhost:3000/submit
2. Click "Load Sample" button (fills in Cybersecurity Certificate)
3. Click "Submit Validation Request"
4. You'll be redirected to project detail page
5. Watch the research components update in real-time
6. After ~2-5 minutes, report should be ready

### What to Watch For

✅ **Success Indicators:**
- Dashboard shows project with "Researching" status
- Research components progress from "Pending" → "In Progress" → "Completed"
- After all components complete, status changes to "Ready for Review"
- "View Full Report" button appears
- Report is 30-40 pages of markdown

❌ **Potential Issues:**

**"Failed to load persona"**
- Check `CONFLUENCE_LABS_PATH` in `.env.local`
- Verify path exists: `ls ~/projects/Confluence\ Labs/`

**"Supabase connection error"**
- Verify all 3 Supabase keys in `.env.local`
- Check Supabase project is active (not paused)

**"Anthropic API error"**
- Verify API key is correct
- Check you have credits: https://console.anthropic.com/settings/billing

**Research component shows "Error"**
- Check browser console for errors
- Look at agent_sessions table in Supabase for error details
- Common cause: API rate limits or timeout

## First Run Checklist

Before testing with real client:

- [ ] Environment variables configured
- [ ] Supabase tables created
- [ ] Test project completes successfully
- [ ] Report is 30+ pages
- [ ] All 5 research sections present
- [ ] Tiger team synthesis includes GO/NO-GO recommendation
- [ ] No errors in browser console
- [ ] No errors in terminal logs

## Monitoring

### During Development

Watch terminal output for:
```
[Orchestrator] Starting validation for project xxx
[Orchestrator] Created 5 research components
[Orchestrator] Spawning research agents...
[Orchestrator] Research component xxx completed
[Orchestrator] Running tiger team synthesis...
[Orchestrator] Generating final report...
[Orchestrator] Validation complete
```

### Check Database

In Supabase Table Editor:

1. **validation_projects**: Should show project with status progression
2. **research_components**: Should have 6 rows (5 research + 1 tiger team)
3. **validation_reports**: Should have final report
4. **agent_sessions**: Should show all AI calls with tokens used

## Performance Notes

**Expected Timing:**
- Market Analysis: ~30-45 seconds
- Competitive Landscape: ~30-45 seconds  
- Curriculum Design: ~30-45 seconds
- Financial Projections: ~30-45 seconds
- Marketing Strategy: ~30-45 seconds
- Tiger Team: ~60-90 seconds
- **Total: ~4-6 minutes**

**Token Usage (approximate):**
- ~15,000-25,000 tokens total per validation
- Cost: ~$0.30-0.50 per report (at Claude Sonnet 4 pricing)

## Troubleshooting

### Agent Stuck in "In Progress"

1. Check terminal for errors
2. Look at `agent_sessions` table for that component
3. If timeout (>5 min), API might have failed
4. Safe to restart: delete project and re-submit

### Report Missing Sections

- Check `research_components` table - did all 5 complete?
- If some failed, check error_message column
- Re-run by creating new project (orchestrator will retry)

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Database Issues

If tables are messed up:

1. Drop all tables in Supabase SQL Editor:
```sql
DROP TABLE IF EXISTS agent_sessions CASCADE;
DROP TABLE IF EXISTS validation_reports CASCADE;
DROP TABLE IF EXISTS research_components CASCADE;
DROP TABLE IF EXISTS validation_projects CASCADE;
```

2. Re-run schema from `supabase/schema.sql`

## Next Steps

Once working locally:

1. Test with different program types (certificates, degrees, apprenticeships)
2. Review report quality - adjust agent prompts if needed
3. Consider deploying to Vercel for production
4. Set up monitoring/alerting for failures

## Production Deployment

See `README.md` for Vercel deployment instructions.

---

**Need Help?**

Check the logs:
- Browser console (F12)
- Terminal output
- Supabase Table Editor → agent_sessions
