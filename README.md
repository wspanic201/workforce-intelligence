# Workforce Intelligence

AI-Powered Program Validation System for Community Colleges

## Overview

This system delivers professional 30-40 page workforce program validation reports in 48 hours using AI-powered research agents and multi-perspective analysis.

## Key Features

- **AI Research Agents**: 5 specialized agents conduct market analysis, competitive landscape research, curriculum design, financial projections, and marketing strategy
- **Confluence Labs Integration**: Multi-persona tiger team debates program viability from executive perspectives
- **Professional Reports**: Comprehensive markdown reports with executive summary, detailed analysis, and implementation roadmap
- **Real-Time Tracking**: Dashboard to monitor research progress and view completed reports

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude Sonnet 4.5
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel (or local)

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account
- Anthropic API key

### 2. Installation

```bash
# Clone and install dependencies
cd ~/projects/workforce-intelligence
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# Confluence Labs
CONFLUENCE_LABS_PATH=/Users/matt/projects/Confluence Labs
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the schema migration:

```bash
# Copy the SQL from supabase/schema.sql and run it in Supabase SQL Editor
```

Or connect via CLI:

```bash
supabase db push
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
workforce-intelligence/
├── app/
│   ├── api/
│   │   └── projects/          # API routes for CRUD operations
│   ├── dashboard/             # Project dashboard page
│   ├── projects/[id]/         # Project detail & report pages
│   ├── submit/                # Intake form page
│   ├── layout.tsx             # Root layout with navigation
│   └── page.tsx               # Home page
├── lib/
│   ├── agents/
│   │   ├── researchers/       # 5 research agents
│   │   ├── orchestrator.ts    # Main workflow coordinator
│   │   └── tiger-team.ts      # Multi-persona synthesis
│   ├── confluence-labs/
│   │   └── loader.ts          # Persona file loader
│   ├── ai/
│   │   └── anthropic.ts       # Claude API wrapper
│   ├── supabase/
│   │   └── client.ts          # Supabase client setup
│   └── types/
│       └── database.ts        # TypeScript types
├── supabase/
│   └── schema.sql             # Database schema
├── components/ui/             # shadcn/ui components
└── README.md
```

## How It Works

### 1. Intake

User submits program validation request via `/submit` form with:
- Program name
- Target audience
- Program type
- Constraints

### 2. Orchestration

The orchestrator agent (`lib/agents/orchestrator.ts`):
1. Creates project record in database
2. Spawns 5 research agents in parallel
3. Monitors progress
4. Triggers tiger team synthesis
5. Compiles final report

### 3. Research Agents

Each agent loads a Confluence Labs persona and researches a specific area:

| Agent | Persona | Research Area |
|-------|---------|---------------|
| Market Analyst | Tomas Reyes | Labor market demand, salaries, growth |
| Competitor Analyst | Claudette Beaumont | Competitive programs, market gaps |
| Curriculum Designer | Okonkwo Adeyemi | Course design, competencies, certifications |
| Financial Analyst | Marcus Reinholt (CFO) | Startup costs, revenue, ROI |
| Marketing Strategist | Valentina Rojas-Medina (CMO) | Positioning, channels, launch strategy |

### 4. Tiger Team Synthesis

Multi-persona executive debate:
- Product Manager: Market fit assessment
- CFO: Financial viability
- CMO: Go-to-market feasibility
- COO: Implementation capacity

Outputs:
- GO/NO-GO/CONDITIONAL recommendation
- Executive summary
- Critical success factors
- Top 5 risks with mitigation strategies

### 5. Report Generation

Compiles all research into professional markdown report:
- Executive Summary
- Market Analysis
- Competitive Landscape
- Program Design Recommendations
- Financial Projections
- Marketing Strategy
- Implementation Roadmap
- Risk Assessment
- Appendices (methodology, sources)

## API Routes

### Create Project
```
POST /api/projects/create
Body: { client_name, client_email, program_name, program_type, target_audience, constraints }
Returns: { projectId }
```

### Get All Projects
```
GET /api/projects
Returns: ValidationProject[]
```

### Get Project Details
```
GET /api/projects/[id]
Returns: ValidationProject
```

### Get Research Components
```
GET /api/projects/[id]/components
Returns: ResearchComponent[]
```

### Get Report
```
GET /api/projects/[id]/report
Returns: ValidationReport
```

## Database Schema

### `validation_projects`
- Project metadata, status tracking
- Status: `intake` → `researching` → `review` → `completed`

### `research_components`
- Individual research sections (market, competitive, etc.)
- Stores both structured data (JSON) and formatted markdown

### `validation_reports`
- Final compiled reports
- Full markdown + executive summary

### `agent_sessions`
- Logging for all AI agent calls
- Tracks prompts, responses, tokens, timing

## Confluence Labs Integration

Personas are loaded from `~/projects/Confluence Labs/` directory:

```typescript
const persona = await loadPersona('market-analyst');
// Returns full persona context to inject into AI prompts
```

Mapping:
- `market-analyst` → `Business & Strategy Division/tomas-reyes-market-analyst.md`
- `cfo` → `Foundation/marcus-reinholt-cfo.md`
- `cmo` → `Foundation/valentina-rojas-medina-cmo.md`
- etc.

## Testing

### Sample Project

Use the "Load Sample" button on `/submit` page to prefill with test data (Cybersecurity Certificate).

### Mock Mode

Set `MOCK_AGENTS=true` in `.env.local` to skip AI calls and use canned responses (for rapid testing).

## Deployment

### Vercel

```bash
vercel deploy
```

Add environment variables in Vercel dashboard.

### Local Production Build

```bash
npm run build
npm start
```

## Development Notes

- **Real Data Sources**: Agents use BLS, O*NET, college websites (no hallucinations)
- **Error Handling**: All agent calls wrapped in try/catch, errors logged to database
- **Progress Tracking**: Real-time status updates via polling
- **Idempotency**: Can re-run components without duplicating

## Quality Assurance

Before deploying:

1. ✅ Test full pipeline with sample project
2. ✅ Verify markdown report quality (30-40 pages)
3. ✅ Check all research sections are complete
4. ✅ Confirm tiger team provides actionable recommendations
5. ✅ Test dashboard real-time updates
6. ✅ Review error handling for failed API calls

## Troubleshooting

### "Failed to load persona"
- Check `CONFLUENCE_LABS_PATH` in `.env.local`
- Verify persona files exist at expected paths

### "Supabase connection error"
- Verify Supabase credentials in `.env.local`
- Check RLS policies are set up correctly

### "Claude API error"
- Verify `ANTHROPIC_API_KEY` is valid
- Check API quota/rate limits

### "Research component stuck"
- Check `agent_sessions` table for error messages
- Review orchestrator logs in console

## Roadmap

### Phase 2 (Future)
- [ ] PDF generation with charts
- [ ] Email notifications when reports complete
- [ ] Edit/revise workflow for QA
- [ ] Cost tracking dashboard
- [ ] User authentication
- [ ] Multi-client support

## Support

**Contact**: Matt Murphy  
**Email**: matt@murphyworkforce.com

---

© 2025 Murphy Workforce Intelligence
