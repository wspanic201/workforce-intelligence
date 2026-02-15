# Quick Test Guide - Program Validation System

**Purpose:** Verify the real API integration works before Monday demo  
**Time:** ~15 minutes  
**Prerequisites:** Database migrations run, API keys configured

---

## Step 1: Run Migrations (5 min)

### Option A: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" (left sidebar)
4. Create new query
5. Copy/paste contents of each file and run:
   - `supabase/schema.sql` (if not already done)
   - `supabase/migrations/001_add_api_cache.sql`
   - `supabase/migrations/002_disable_rls_for_testing.sql`

### Option B: Supabase CLI

```bash
supabase db push
```

### Verify Migrations

```sql
-- Check api_cache table exists
SELECT COUNT(*) FROM api_cache;

-- Check RLS policies (should show "true" for testing)
SELECT tablename, policyname, qual 
FROM pg_policies 
WHERE tablename = 'validation_projects';
```

Expected: No errors, tables exist

---

## Step 2: Verify Environment (1 min)

```bash
cd ~/projects/workforce-intelligence

# Check API keys
cat .env.local | grep -E "SERPAPI|ONET|ANTHROPIC|SUPABASE"
```

**Must show:**
```
SERPAPI_KEY=44cbfe58eec133980e9d93b942b27da67fda09a31da4110e79594a5ba58eb91d
ONET_API_PASSWORD=yud82aeukvm9xuvr2gncrfo5kza2iw0s
ANTHROPIC_API_KEY=sk-ant-... (your key)
NEXT_PUBLIC_SUPABASE_URL=https://... (your URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (your key)
```

---

## Step 3: Start Dev Server (1 min)

```bash
npm run dev
```

Wait for: `✓ Ready in 2.1s`

Open: http://localhost:3000

---

## Step 4: Submit Test Project (2 min)

1. Navigate to: http://localhost:3000/submit

2. Fill in form:
   ```
   Client Name: Iowa Valley Community College
   Client Email: test@example.com
   Program Name: Cybersecurity Certificate
   Program Type: certificate
   Target Audience: Working professionals, career changers
   Constraints: 6-month completion, fully online, must include CompTIA Security+
   ```

3. Click "Submit for Validation"

4. Should redirect to project detail page (`/projects/[uuid]`)

---

## Step 5: Monitor Console Logs (5 min)

### Terminal Running `npm run dev`

Watch for these log patterns:

**✅ Expected Pattern:**
```
[Orchestrator] Starting validation for project abc-123...
[Orchestrator] Created 5 research components
[Orchestrator] Spawning research agents...

[Market Analyst] Starting for "Cybersecurity Certificate"
[Cache MISS] serpapi_jobs:a3f9d7e1 - fetching...
[Cache MISS] onet_search:b4c8e2f3 - fetching...
[Market Analyst] Data fetched - Jobs: 347, O*NET: 15-1212.00
[Market Analyst] Completed in 23456ms

[Competitor Analyst] Starting for "Cybersecurity Certificate"
...

[Orchestrator] 5/5 research agents completed successfully
[Orchestrator] Running tiger team synthesis...
[Orchestrator] Generating final report...
[Orchestrator] Validation complete for project abc-123
```

**❌ Bad Patterns (Indicates Issues):**
```
Error: SERPAPI_KEY is not defined
Error: Failed to fetch from SerpAPI
Timeout after 300000ms
JSON parsing error
```

### Browser Console (Developer Tools)

Should see periodic polling requests (every 3 seconds):
```
GET /api/projects/abc-123
GET /api/projects/abc-123/components
```

---

## Step 6: Verify Real Data in Report (3 min)

### On Project Detail Page

Watch progress bar fill up. When complete:

1. Click "View Full Report"
2. Scroll to "Market Analysis" section

### ✅ What You Should See (REAL DATA):

```markdown
## Market Analysis: Cybersecurity Certificate

### Current Market Conditions
Current Openings in Iowa: 347
Source: Google Jobs via SerpAPI

### Salary Ranges
| Level | Salary Range |
|-------|-------------|
| Entry-Level | $55,000 - $75,000 |
| Mid-Career | $75,000 - $95,000 |
| Senior | $95,000 - $125,000 |
| Median | $87,500 |

Source: Analysis of 347 current job postings (Google Jobs, 2/15/2025)

### Top Employers Hiring
1. Principal Financial - 23 openings
2. Wells Fargo - 18 openings
3. UnityPoint Health - 15 openings
...

### Most Requested Skills
- Python: Mentioned in 67% of job postings
- SQL: Mentioned in 54% of job postings
- AWS: Mentioned in 42% of job postings
...

### Industry Certifications
- CISSP: Required/preferred in 38% of postings
- Security+: Required/preferred in 62% of postings
- CEH: Required/preferred in 24% of postings

## Occupational Standards (O*NET)
O*NET Code: 15-1212.00
Title: Information Security Analysts
...
```

### ❌ What You Should NOT See (Hallucinations):

```markdown
# BAD - This indicates APIs aren't working:

Job Demand: Strong demand in the cybersecurity field
Salary Range: Competitive salaries in the industry
Top Employers: Major companies in the area
Skills Required: Various technical skills needed

# These are vague hallucinations, not real data!
```

---

## Step 7: Test Cache Hit (2 min)

1. Go back to `/submit`
2. Submit another project:
   ```
   Client Name: Des Moines Area Community College
   Program Name: Cybersecurity Specialist Certificate
   (rest same as before)
   ```

3. Watch console logs:
   ```
   [Market Analyst] Starting for "Cybersecurity Specialist Certificate"
   [Cache HIT] serpapi_jobs:a3f9d7e1
   [Cache HIT] onet_search:b4c8e2f3
   [Market Analyst] Data fetched - Jobs: 347, O*NET: 15-1212.00
   [Market Analyst] Completed in 3456ms  ← Much faster!
   ```

4. Check database:
   ```sql
   SELECT 
     api_name, 
     query_params->'occupation' as occupation,
     hit_count,
     created_at
   FROM api_cache 
   ORDER BY created_at DESC;
   ```

   Should show:
   ```
   api_name       | occupation           | hit_count | created_at
   ---------------|----------------------|-----------|-------------------
   serpapi_jobs   | "Cybersecurity..."   | 2         | 2025-02-15 00:52:13
   onet_search    | "Cybersecurity..."   | 2         | 2025-02-15 00:52:13
   ```

---

## Success Checklist

- [ ] Database migrations ran without errors
- [ ] Dev server starts successfully
- [ ] Can submit a project (redirects to detail page)
- [ ] Console shows `[Cache MISS]` on first submission
- [ ] Console shows real numbers: "Jobs: 347, O*NET: 15-1212.00"
- [ ] Report shows specific employer names (Principal Financial, etc.)
- [ ] Report shows O*NET code (15-1212.00)
- [ ] Report shows salary ranges with dollar amounts
- [ ] Report shows skills with percentages (Python 67%)
- [ ] Second submission shows `[Cache HIT]`
- [ ] Database shows `hit_count > 0` in `api_cache` table

---

## Troubleshooting

### Error: "relation api_cache does not exist"
**Fix:** Run migration `001_add_api_cache.sql`

### Error: "SERPAPI_KEY is not defined"
**Fix:** Add API keys to `.env.local`, restart dev server

### Report shows vague descriptions instead of numbers
**Fix:** Check console for API errors, verify SERPAPI_KEY is valid

### Console shows "Timeout after 300000ms"
**Fix:** Expected for slow agents, but market analyst should complete in <30s

### No data in report (blank sections)
**Fix:** 
1. Check Supabase connection (verify keys)
2. Check RLS policies are disabled
3. Check console for errors

---

## Expected Timing

| Phase | Duration |
|-------|----------|
| Database migrations | 5 min |
| Environment setup | 1 min |
| Start server | 1 min |
| Submit project | 1 min |
| Research agents run | 3-5 min |
| Report generation | 1 min |
| Verify real data | 2 min |
| Test cache hit | 2 min |
| **Total** | **15-20 min** |

---

## What Success Looks Like

✅ **Console Output:**
```
[Market Analyst] Starting for "Cybersecurity Certificate"
[Cache MISS] serpapi_jobs:a3f9d7e1 - fetching...
[Market Analyst] Data fetched - Jobs: 347, O*NET: 15-1212.00
[Market Analyst] Completed in 23456ms
Claude API call completed in 4523ms, 2847 tokens
```

✅ **Report Content:**
```
Current Openings in Iowa: 347
Top Employers: Principal Financial (23 openings)
Salary Range: $55,000 - $125,000 (median: $87,500)
O*NET Code: 15-1212.00
Skills: Python (67%), SQL (54%), AWS (42%)
```

✅ **Database:**
```sql
SELECT * FROM api_cache;
-- Shows cached SerpAPI and O*NET responses
-- hit_count increases on repeat queries
```

---

## If Everything Works

🎉 **Congratulations! The system is ready for Monday demo.**

You now have:
- ✅ Real labor market data from Google Jobs
- ✅ Occupational standards from O*NET
- ✅ Intelligent caching to reduce API costs
- ✅ Timeout protection against hangs
- ✅ Robust error handling

**Demo Script:**
1. Show the intake form (professional, clean UI)
2. Submit "Cybersecurity Certificate" project
3. Show real-time progress updates (3-second polling)
4. Show final report with REAL data:
   - "347 current openings" (not "strong demand")
   - Specific employers (Principal Financial, Wells Fargo)
   - O*NET Code 15-1212.00
   - Salary ranges from actual job postings
5. Submit second project, show cache hit in console
6. Query `api_cache` table to show cost savings

---

**Questions?** Check:
- `IMPLEMENTATION_COMPLETE.md` - Full implementation details
- `MIGRATION_GUIDE.md` - Database setup
- `SUBAGENT_REPORT.md` - What was fixed and why

**Good luck! 🚀**
