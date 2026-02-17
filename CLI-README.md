# WorkforceOS CLI

Command-line tool for running the WorkforceOS program intelligence pipeline.

## Quick Start

```bash
cd ~/projects/workforce-intelligence

# Run Discovery for a new institution (interactive)
npx tsx cli.ts discover

# Run Discovery with flags (no prompts)
npx tsx cli.ts discover \
  --college "Kirkwood Community College" \
  --city "Cedar Rapids" \
  --state "Iowa" \
  --cities "Iowa City,Coralville,Marion" \
  --counties "Linn, Johnson, Benton, Iowa, Jones, Cedar, Washington" \
  --metro "Cedar Rapids-Iowa City Corridor" \
  --focus "Healthcare, Manufacturing, Technology"

# Validate top programs from cached Discovery
npx tsx cli.ts validate --top 3

# Full pipeline (Discovery → pick programs → Validation)
npx tsx cli.ts pipeline --college "DMACC" --city "Des Moines" --state "Iowa" --top 2

# View cached data / manage reports
npx tsx cli.ts report
```

## Commands

### `discover` — What should we build?

Runs the 6-phase Discovery pipeline:
1. **Regional Intelligence** — employer mapping, economic trends, demographics
2. **Demand Signals** — job postings, BLS data, grant opportunities
3. **Competitive Landscape** — nearby providers, program catalogs, gaps
4. **Opportunity Scoring** — weighted composite (demand 30%, competition 25%, revenue 20%, wages 15%, speed 10%)
5. **Blue Ocean Scanner** — hidden opportunities via 6 creative research strategies
6. **Brief Writer** — consulting-grade markdown report

**Output:** Discovery Brief (markdown) + structured JSON data
**Time:** ~10-12 min | **Cost:** ~$5-8 (production) or ~$0.50 (test mode)

### `validate` — Should we build it?

Runs 7-agent validation on programs found during Discovery:
- Market Analyst, Competitive Analyst, Learner Demand
- Financial Analyst, Institutional Fit, Regulatory Compliance
- Employer Demand Analysis
- Tiger Team synthesis (C-suite debate)

**Output:** Validation Report with go/no-go recommendation + composite score
**Time:** ~8 min per program | **Cost:** ~$5 per program (production)

### `pipeline` — Discovery + Validation in one run

Combines discover → select programs → validate. Ideal for new clients.

### `report` — Manage cached data

List all cached Discovery runs, regenerate briefs, or clean up.

## Key Flags

| Flag | Description | Example |
|------|-------------|---------|
| `--test` | Cheap mode (Haiku model, lower tokens) | `--test` |
| `--college` | Institution name | `--college "DMACC"` |
| `--city` | Primary city | `--city "Des Moines"` |
| `--state` | State | `--state "Iowa"` |
| `--cities` | Additional cities (comma-sep) | `--cities "Ames,Ankeny"` |
| `--counties` | Service area counties | `--counties "Polk, Story"` |
| `--metro` | Metro area label | `--metro "Des Moines Metro"` |
| `--focus` | Sector focus areas | `--focus "Healthcare, IT"` |
| `--context` | Extra institutional context | `--context "Largest CC in state"` |
| `--top N` | Validate top N programs | `--top 3` |
| `--program` | Search program by name | `--program "sterile"` |
| `--programs` | Specific scored indices | `--programs 0,2,5` |
| `--bo` | Specific blue ocean indices | `--bo 0,1` |
| `--output` | Output directory | `--output ~/reports` |
| `--json` | Also save structured JSON | `--json` |
| `--no-blue-ocean` | Skip Blue Ocean phase | `--no-blue-ocean` |
| `--cache` | Use specific cache file | `--cache kirkwood-community-college` |

## npm Shortcuts

```bash
npm run wos -- discover
npm run wos -- validate --top 2
npm run wos -- pipeline --test
npm run wos -- report
```

## Cache

Discovery results are cached at `~/.workforceos/<institution-slug>.json`.

This lets you:
- Run Discovery once, then validate different programs without re-running
- Come back days later and run validation on the same data
- Share cache files between machines

## File Output

Reports default to `~/Desktop/`. Each run produces:

- `<Institution>-Discovery-Brief-<date>.md` — Full discovery brief
- `<Institution>-<Program>-Validation-<date>.md` — Per-program validation report
- With `--json`: structured data files alongside

## Test Mode

Use `--test` during development to run cheap (~$0.50):
- Uses Claude Haiku instead of Sonnet
- Lower token limits (4K vs 8-16K)
- Same pipeline, same structure, lower quality prose
- Great for testing workflow changes without burning $5-8 per run

## Environment

Requires `.env.local` with:
```
ANTHROPIC_API_KEY=sk-ant-...
SERPAPI_API_KEY=...
ONET_API_KEY=...
BLS_API_KEY=...
```
