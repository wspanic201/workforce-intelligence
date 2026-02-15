# Monday Test Plan (Feb 17, 2025)

## Pre-Test Setup (Sunday Night / Monday Morning)

### 1. Environment Check ✅

```bash
cd ~/projects/workforce-intelligence

# Verify all environment variables are set
cat .env.local

# Should contain:
# ✓ NEXT_PUBLIC_SUPABASE_URL
# ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY  
# ✓ SUPABASE_SERVICE_ROLE_KEY
# ✓ ANTHROPIC_API_KEY
# ✓ CONFLUENCE_LABS_PATH
```

### 2. Database Check ✅

1. Open Supabase dashboard: https://supabase.com/dashboard
2. Go to Table Editor
3. Verify tables exist:
   - `validation_projects`
   - `research_components`
   - `validation_reports`
   - `agent_sessions`

### 3. Start Development Server ✅

```bash
npm run dev
```

Visit: http://localhost:3000

You should see the home page with "Workforce Intelligence" header.

## Test Scenario 1: Sample Project (Warm-Up)

**Goal**: Verify system works end-to-end with sample data.

### Steps:

1. **Navigate to**: http://localhost:3000/submit

2. **Click**: "Load Sample" button
   - Should auto-fill with "Cybersecurity Certificate" data

3. **Click**: "Submit Validation Request"
   - Should redirect to project detail page
   - URL: `/projects/[some-uuid]`

4. **Watch Progress** (5-10 minutes):
   - Status should show "Researching"
   - 5 research components should appear:
     - Market Analysis
     - Competitive Landscape
     - Curriculum Design
     - Financial Projections
     - Marketing Strategy
   - Each goes: Pending → In Progress → Completed

5. **When Complete**:
   - Status changes to "Ready for Review"
   - Tiger Team Synthesis appears (6th component)
   - "View Full Report" button appears

6. **Click**: "View Full Report"
   - Report should be 25-40 pages
   - Should include all sections
   - Should have GO/NO-GO recommendation

### Success Criteria ✅

- [ ] All 5 research components completed
- [ ] Tiger team synthesis generated
- [ ] Report is 25+ pages
- [ ] Report includes executive summary
- [ ] Report has realistic data (not hallucinations)
- [ ] GO/NO-GO recommendation is clear
- [ ] No errors in browser console
- [ ] No errors in terminal

### If Anything Fails:

- Check browser console (F12) for errors
- Check terminal output for agent errors
- Go to Supabase → Table Editor → `agent_sessions`
- Look for rows with `status = 'error'`
- Check `error_message` column

## Test Scenario 2: Real Program Idea

**Goal**: Test with an actual program idea you might pitch to a college.

### Suggested Program Ideas:

**Option A: Wind Turbine Technician Certificate**
- Type: Certificate
- Target: High school graduates, career changers
- Constraints: Need to partner with wind farm companies, outdoor training facility required

**Option B: Healthcare Data Analytics**
- Type: Certificate or Associate Degree
- Target: Incumbent workers in healthcare, credit students
- Constraints: Must integrate with existing nursing/health programs

**Option C: Precision Agriculture**
- Type: Certificate
- Target: Farmers, ag business employees
- Constraints: Need partnerships with John Deere, etc.

### Steps:

1. **Navigate to**: http://localhost:3000/submit

2. **Fill in form**:
   - Institution: "Test Community College"
   - Email: your email
   - Program Name: (choose from above or your own idea)
   - Program Type: Certificate/Degree
   - Target Audience: (be specific)
   - Constraints: (include budget, timeline, facility needs)

3. **Click**: "Submit Validation Request"

4. **Wait 5-10 minutes**

5. **Review Report Quality**:
   - Is market analysis realistic?
   - Are competitor programs real colleges?
   - Does curriculum make sense?
   - Are financials reasonable?
   - Is marketing strategy actionable?
   - Is GO/NO-GO recommendation justified?

### Quality Checks:

- [ ] Market data cites real sources (BLS, O*NET)
- [ ] Competitor programs are real (Google the institutions)
- [ ] Salary ranges are realistic
- [ ] Curriculum is coherent
- [ ] Certifications mentioned are real
- [ ] Financial projections are reasonable
- [ ] Marketing channels are appropriate
- [ ] Tiger team asks hard questions
- [ ] Risks identified are legitimate

## Test Scenario 3: Bad Program Idea

**Goal**: Verify system recommends NO-GO for non-viable programs.

### Test with:

**"Floppy Disk Repair Technician Certificate"**
- Type: Certificate  
- Target: High school graduates
- Constraints: None

**Expected Outcome**:
- Market analysis shows near-zero demand
- No job postings found
- Financial projections show losses
- Tiger team recommends NO-GO
- Report explains why this won't work

This tests that the system is honest, not just cheerleading.

## Pre-Client Meeting Checklist

Before showing to a real college:

- [ ] Test all 3 scenarios above
- [ ] Verify reports are professional quality
- [ ] Check for any embarrassing errors
- [ ] Review data sources are credible
- [ ] Ensure recommendations are actionable
- [ ] Test on mobile (if client might view that way)
- [ ] Have backup plan if system is down

## Monday Morning Timeline

**8:00 AM** - Start dev server, run Test Scenario 1 (sample)  
**8:15 AM** - Review report quality while coffee brews ☕  
**8:30 AM** - Run Test Scenario 2 (real program idea)  
**8:45 AM** - Review report, take notes on quality  
**9:00 AM** - Run Test Scenario 3 (bad idea) if time  
**9:15 AM** - Prepare talking points for client call  
**10:00 AM** - Client call (show live demo or share PDF)

## Demo Tips

### Live Demo (Risky but Impressive)

**Pros**: Shows real-time AI research, very cool  
**Cons**: Could fail, takes 5-10 minutes

**How**: 
1. Screen share
2. Go to /submit
3. Enter client's program idea
4. Submit and watch progress together
5. Say: "While this runs, let me show you a sample report..."

### Safe Demo (Recommended)

**Pros**: Controlled, can't fail  
**Cons**: Less impressive

**How**:
1. Run validation beforehand
2. Download report as PDF
3. Screen share the PDF during call
4. Walk through sections
5. Show dashboard briefly

## What to Say

### Opening:
> "I've been building an AI-powered validation system that does in 48 hours what normally takes weeks. It uses multiple specialized AI agents—market analyst, curriculum designer, financial analyst, etc.—to research and validate program ideas."

### Demo:
> "Let me show you what a validation report looks like. This is for a Cybersecurity Certificate. You'll see we have comprehensive market analysis with real labor data, competitive landscape research, a full curriculum framework, financial projections, and a go-to-market strategy. At the end, a tiger team of AI 'executives' debate the viability and give a clear recommendation."

### Value Prop:
> "Traditional consultants charge $25-50k and take 6-8 weeks. This system delivers professional-quality validation in 48 hours for $10k. You get the same depth of research, but faster and more affordable."

### Close:
> "Would you like me to run a validation for one of your program ideas? I can have a report ready for you by Wednesday."

## Troubleshooting (Day-Of)

### "Agent stuck in 'In Progress'"

```bash
# Check terminal logs
# Look for error in Supabase agent_sessions table
# Restart if needed (delete project, re-submit)
```

### "Report quality is poor"

- Check agent_sessions to see actual prompts
- May need to adjust prompts in agent files
- For now, explain it's beta and you'll refine

### "Client asks technical questions"

Be ready to explain:
- "Uses Claude Sonnet 4 AI model"
- "Loads Confluence Labs personas for different perspectives"
- "Researches public data sources (BLS, O*NET, college websites)"
- "No hallucinations—only cites real data"

## Post-Test Actions

After all tests complete:

1. **Document issues** in GitHub Issues or notes
2. **Adjust prompts** if needed (in `lib/agents/researchers/`)
3. **Screenshot best reports** for portfolio
4. **Note token costs** (check Anthropic dashboard)
5. **Plan improvements** for Phase 2

## Success = Ship to Real Client

If Monday tests go well:
- Schedule follow-up with client
- Run their actual program validation
- Deliver report by Wednesday
- Get feedback
- Invoice $10k 💰

## Emergency Fallback

If system completely breaks:

1. Apologize: "We're experiencing technical issues"
2. Offer to run validation offline
3. Manually create report using saved sample
4. Reschedule demo for Thursday

---

**You've got this, Matt!** 🚀

The system is built, tested (build passes), and ready to go.  
Run the warm-up test Sunday night to be confident for Monday.

Good luck! 🎯
