# Wavelength Intelligence Hub — Full Build Plan

**Created:** 2026-02-22
**Status:** Planning
**Goal:** A verified intelligence layer that agents query before web search, with a human-in-the-loop review system and admin UI for Matt to upload, curate, and manage verified data.

---

## Why This Exists

Every agent in the pipeline independently searches, infers, and sometimes invents facts. Seven agents producing one report = seven chances to hallucinate a statute, use stale wage data, or get a distance wrong. Today's QA is reactive (citation agent catches some errors post-hoc). This system makes QA proactive — agents pull from verified data first, web search is the fallback, and every claim is checked before delivery.

**The flywheel:** Every report run adds verified data to the system. Client orders a Feasibility Study → agents research → Matt reviews → verified facts added to DB → next report in that state/occupation is faster, cheaper, and more accurate.

---

## Database Schema

### Core Tables

#### 1. `intel_wages`
BLS wage data by SOC code, national and state/MSA level.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| soc_code | text | e.g., "29-2052" |
| occupation_title | text | e.g., "Pharmacy Technicians" |
| geo_level | enum | national, state, msa |
| geo_code | text | State FIPS, MSA code, or "national" |
| geo_name | text | "Iowa", "Cedar Rapids MSA", "National" |
| median_annual | integer | Median annual wage |
| mean_annual | integer | Mean annual wage |
| pct_10 | integer | 10th percentile |
| pct_25 | integer | 25th percentile |
| pct_75 | integer | 75th percentile |
| pct_90 | integer | 90th percentile |
| employment | integer | Total employment count |
| bls_release | text | "May 2024" |
| source_url | text | BLS URL |
| last_verified | timestamptz | When this was last confirmed |
| verified_by | text | "auto-import" or "matt" |
| notes | text | Optional notes |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Indexes:** (soc_code, geo_level, geo_code), (occupation_title)
**Seed:** Top 100 SOC codes relevant to CE programs × national + 50 states
**Refresh:** Annual when BLS releases new OEWS data (typically March/April)
**Auto-import:** BLS API v2 bulk pull script

---

#### 2. `intel_statutes`
State regulatory codes, licensing statutes, and administrative rules.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| state | text | 2-letter state code |
| code_type | enum | statute, admin_rule, regulation |
| code_chapter | text | e.g., "157" |
| code_section | text | e.g., "157.1" (nullable) |
| title | text | "Barbering and Cosmetology" |
| summary | text | Plain-language summary of what this covers |
| full_text | text | Actual statute text (optional, can be long) |
| admin_code_ref | text | e.g., "IAC 481—Chapters 940-946" |
| regulatory_body | text | e.g., "DIAL" |
| status | enum | active, repealed, amended, pending |
| effective_date | date | When it took effect |
| repeal_date | date | If repealed, when |
| superseded_by | text | If repealed, what replaced it |
| source_url | text | Link to official source |
| source_pdf_path | text | Supabase Storage path to uploaded PDF |
| category | text | "cosmetology", "real_estate", "healthcare", etc. |
| tags | text[] | Searchable tags |
| last_verified | timestamptz | |
| verified_by | text | |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Indexes:** (state, code_chapter), (state, category), (tags GIN)
**Seed:** Start with Iowa (Matt's home state), expand state by state with each client
**Refresh:** Quarterly cron scans state legislative sites for amendments/repeals
**Manual:** Matt uploads statute PDFs and annotates key sections

---

#### 3. `intel_institutions`
Community college profiles — the canonical source of truth for institution data.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| ipeds_id | text | IPEDS unit ID (unique) |
| name | text | Official institution name |
| short_name | text | Common name (e.g., "Kirkwood") |
| state | text | 2-letter |
| city | text | |
| county | text | |
| zip | text | |
| latitude | numeric | |
| longitude | numeric | |
| type | enum | community_college, technical_college, 4yr_public, 4yr_private |
| system_name | text | e.g., "Iowa Community College System" |
| accreditor | text | e.g., "HLC" |
| website | text | |
| service_area_counties | text[] | Counties in service area |
| service_area_population | integer | Total service area population |
| total_enrollment | integer | Total enrollment (credit + noncredit) |
| credit_enrollment | integer | |
| noncredit_enrollment | integer | |
| program_count | integer | Total programs offered |
| annual_operating_budget | integer | |
| tuition_in_district | integer | Per-credit-hour |
| tuition_in_state | integer | Per-credit-hour |
| carnegie_class | text | |
| hsi_designation | boolean | Hispanic-Serving Institution |
| msi_designation | boolean | Minority-Serving Institution |
| rural_serving | boolean | |
| ipeds_year | text | "2023-24" |
| source_url | text | |
| last_verified | timestamptz | |
| verified_by | text | |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Indexes:** (ipeds_id unique), (state, city), (name), (service_area_counties GIN)
**Seed:** IPEDS bulk download → ~1,100 community colleges
**Refresh:** Annual with IPEDS release (fall each year)
**Manual:** Matt adds service area details, noncredit enrollment (not in IPEDS), local context

---

#### 4. `intel_institution_programs`
Programs offered by specific institutions — for competitive analysis and gap detection.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| institution_id | uuid | FK → intel_institutions |
| program_name | text | |
| cip_code | text | 6-digit CIP code |
| credential_level | enum | certificate, diploma, associate, bachelor |
| credit_type | enum | credit, noncredit, both |
| clock_hours | integer | For noncredit/clock-hour programs |
| credit_hours | integer | For credit programs |
| tuition | integer | Program tuition (if known) |
| delivery_mode | enum | in_person, online, hybrid |
| active | boolean | Currently offered? |
| accreditation | text | Program-specific accreditation (if any) |
| licensure_alignment | text | What license/cert this prepares for |
| source | text | How we know (catalog scrape, IPEDS, manual) |
| source_url | text | |
| last_verified | timestamptz | |
| verified_by | text | |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Indexes:** (institution_id, cip_code), (cip_code), (program_name)
**Seed:** IPEDS completions data gives credit programs. Noncredit is manual or catalog scrape.
**Use case:** Gap analysis ("Hawkeye offers 17 of 25 state-mandated programs"), competitive analysis ("3 colleges within 100 miles offer pharmacy tech")

---

#### 5. `intel_credentials`
State licensing and certification requirements — what training is legally required.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| state | text | |
| credential_name | text | "Licensed Barber", "Certified Pharmacy Technician" |
| credential_type | enum | license, certification, registration, permit |
| required_hours | integer | Training hours required |
| hour_type | enum | clock, credit, contact, clinical |
| education_requirement | text | Description of what's needed |
| exam_required | boolean | |
| exam_name | text | e.g., "PTCB", "NIC Barber" |
| regulatory_body | text | |
| statute_id | uuid | FK → intel_statutes (optional) |
| renewal_period_years | integer | |
| ce_hours_required | integer | For renewal |
| reciprocity_notes | text | Interstate recognition |
| soc_codes | text[] | Related SOC codes |
| source_url | text | |
| last_verified | timestamptz | |
| verified_by | text | |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Indexes:** (state, credential_name), (soc_codes GIN)
**Seed:** Start with Iowa, expand per client state
**Use case:** "Iowa requires 2,100 hours for barber licensure under Chapter 157" — verified, not hallucinated

---

#### 6. `intel_employers`
Major regional employers relevant to workforce programs.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| employer_name | text | |
| state | text | |
| city | text | |
| msa | text | MSA code or name |
| naics_code | text | |
| industry | text | Plain-language industry |
| estimated_employees | integer | |
| employee_count_source | text | "SEC 10-K 2024", "News article", "Company website" |
| employee_count_year | integer | What year is this count from |
| is_hiring | boolean | Known active hiring |
| key_occupations | text[] | SOC codes they hire for |
| recent_investments | text | e.g., "$4.1B expansion announced June 2024" |
| partnership_potential | text | Notes on training partnership opportunities |
| source_url | text | |
| last_verified | timestamptz | |
| verified_by | text | |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Indexes:** (state, msa), (employer_name), (key_occupations GIN)
**Seed:** Manual for now. Start with employers referenced in existing reports.
**Use case:** "Duke Health (~43,000 employees, Durham County's largest employer — Duke 2024 Impact Report)"

---

#### 7. `intel_distances`
Pre-computed driving distances between institutions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| from_institution_id | uuid | FK → intel_institutions |
| to_institution_id | uuid | FK → intel_institutions |
| driving_miles | numeric | |
| driving_minutes | integer | |
| source | text | "google_maps_api" |
| computed_at | timestamptz | |

**Indexes:** (from_institution_id, to_institution_id) unique
**Seed:** Compute on first lookup, cache forever
**Use case:** "DMACC (Ankeny) is 85 miles from Kirkwood (Cedar Rapids)" — never wrong again

---

#### 8. `intel_sources`
The source library — verified news articles, research papers, data sources.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| source_type | enum | government, research, news, industry, internal |
| title | text | Article/document title |
| publisher | text | "Bureau of Labor Statistics", "Iowa Capital Dispatch" |
| url | text | |
| published_date | date | |
| summary | text | Matt's summary or AI-extracted summary |
| full_text | text | Stored article text (for agent reference) |
| file_path | text | Supabase Storage path (for PDFs, reports) |
| states | text[] | Relevant states |
| topics | text[] | "workforce_pell", "apprenticeships", "cosmetology", etc. |
| institution_ids | uuid[] | Related institutions |
| soc_codes | text[] | Related occupations |
| reliability | enum | official, verified, unverified |
| last_verified | timestamptz | |
| verified_by | text | |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Indexes:** (source_type), (states GIN), (topics GIN), (published_date)
**Seed:** Import key government sources (BLS, IPEDS, state legislative databases)
**Manual:** Matt clips important articles, uploads PDFs, annotates with tags
**Use case:** Agents cite specific articles/sources instead of generic "according to our research"

---

#### 9. `intel_review_queue`
Claims from reports that need human review.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| report_id | text | Which report generated this claim |
| report_name | text | "Kirkwood Pharmacy Tech Feasibility Study" |
| claim_text | text | The factual claim made by the agent |
| claim_category | enum | wage, statute, distance, enrollment, employer, credential, other |
| verification_status | enum | verified, corrected, flagged, dismissed |
| verified_value | text | If corrected, what's the right answer |
| matched_record_id | uuid | FK to whichever intel table matched (nullable) |
| matched_table | text | "intel_wages", "intel_statutes", etc. |
| agent_source | text | Which agent made the claim |
| web_source | text | URL the agent cited |
| confidence | enum | high, medium, low |
| reviewed_by | text | |
| reviewed_at | timestamptz | |
| added_to_db | boolean | Was this claim added to the intelligence DB? |
| notes | text | |
| created_at | timestamptz | |

**Indexes:** (verification_status), (report_id), (claim_category)
**Use case:** After every report, unverified claims appear here. Matt reviews, approves, corrects, or adds to DB.

---

#### 10. `intel_institution_custom`
Institution-specific data that Matt uploads — stuff that's not in IPEDS or any public source.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| institution_id | uuid | FK → intel_institutions |
| data_category | text | "enrollment_detail", "program_history", "partnerships", "leadership", "facilities", "strategic_plan", etc. |
| data_key | text | Specific field name, e.g., "noncredit_enrollment_2024" |
| data_value | text | The value |
| data_type | enum | text, number, date, json, url |
| source | text | Where Matt got this info |
| source_url | text | |
| file_path | text | Supabase Storage (uploaded doc, catalog PDF, etc.) |
| confidence | enum | confirmed, estimated, reported |
| effective_date | date | When this data point is from |
| expiration_date | date | When it should be re-verified |
| last_verified | timestamptz | |
| verified_by | text | |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Indexes:** (institution_id, data_category), (institution_id, data_key)
**Examples of what goes here:**
- Kirkwood → "noncredit_enrollment_2024" → "8,234" → source: "Annual report"
- Kirkwood → "pharmacy_tech_launch_date" → "2024-08" → source: "Matt's knowledge"
- Kirkwood → "strategic_plan_pdf" → file_path → source: "Board meeting minutes"
- DMACC → "pharmacy_tech_cohort_size" → "18-22" → source: "Competitor research"
- DMACC → "pharmacy_tech_tuition" → "$2,995-$4,000" → source: "Website catalog 2025-26"
- Hawkeye → "cosmetology_facilities" → "none" → source: "Site visit 2025"

**This is the table that makes Wavelength reports uniquely valuable.** No competitor has this ground-truth institutional data.

---

## Admin UI Pages

### `/admin/intelligence` — Dashboard
- Cards showing record counts + verification % per table
- "Flagged for Review" count (links to review queue)
- "Stale Data" count (records past their refresh date)
- Recent activity feed (what was added/updated/verified)

### `/admin/intelligence/wages` — Wage Data Manager
- Search by SOC code or occupation name
- Filter by state, geo level
- Bulk import from BLS CSV
- Individual edit with source tracking
- "Stale" indicator if BLS has released newer data

### `/admin/intelligence/statutes` — Statute Manager
- Search by state + keyword
- Filter by category, status
- Individual entry with full text editor
- PDF upload for source documents
- Status workflow: active → amended → repealed
- "Superseded by" linking

### `/admin/intelligence/institutions` — Institution Manager
- Search by name, state, IPEDS ID
- Institution detail page with tabs:
  - **Profile** — basic info, enrollment, accreditation
  - **Programs** — program catalog (from `intel_institution_programs`)
  - **Custom Data** — Matt's uploads (from `intel_institution_custom`)
  - **Distances** — distances to other institutions
  - **Employers** — regional employers
  - **Reports** — past Wavelength reports for this institution
- Bulk import from IPEDS
- Individual edit with source tracking

### `/admin/intelligence/credentials` — Credential/Licensing Manager
- Search by state + credential name
- Links to related statutes
- Hour requirements, exam info, renewal cycles

### `/admin/intelligence/employers` — Employer Manager
- Search by name, state, MSA
- Employee count with source + year (transparency)
- Key occupations tagging
- Investment/expansion tracking

### `/admin/intelligence/sources` — Source Library
- Search by title, publisher, topic
- Filter by type, state, topic
- Web clipper: paste URL → auto-extract title, text, publish date
- PDF upload
- Tag with topics, states, institutions, SOC codes

### `/admin/intelligence/review` — Review Queue
- List of unverified/flagged claims from recent reports
- Per-claim actions: Approve, Correct, Dismiss, Add to DB
- Bulk actions for quick review
- Stats: claims verified vs. corrected vs. flagged over time

---

## Agent Integration

### How Agents Query the Intelligence Hub

New utility module: `lib/intelligence/lookup.ts`

```typescript
// Wage lookup — agents call this BEFORE web search
async function lookupWage(socCode: string, state?: string, msa?: string): Promise<VerifiedWage | null>

// Statute lookup — agents call this BEFORE citing a statute
async function lookupStatute(state: string, topic: string): Promise<VerifiedStatute[] | null>

// Institution lookup — canonical institution data
async function lookupInstitution(nameOrIpeds: string): Promise<VerifiedInstitution | null>

// Distance lookup — compute on miss, cache forever
async function lookupDistance(fromInstitution: string, toInstitution: string): Promise<VerifiedDistance | null>

// Credential lookup — licensing requirements
async function lookupCredential(state: string, credentialName: string): Promise<VerifiedCredential | null>

// Employer lookup — regional employers
async function lookupEmployers(state: string, msa?: string, socCode?: string): Promise<VerifiedEmployer[]>

// Source lookup — find relevant verified sources
async function lookupSources(topics: string[], states?: string[]): Promise<VerifiedSource[]>

// Custom institution data
async function lookupInstitutionCustom(institutionId: string, category?: string): Promise<CustomData[]>
```

### Agent Prompt Modification

Each research agent's system prompt gets a new section:

```
## Verified Intelligence
Before making any factual claim, check the Intelligence Hub:
- Wages: Use lookupWage(socCode, state) — ALWAYS prefer verified BLS data over web search
- Statutes: Use lookupStatute(state, topic) — NEVER cite a statute without verification
- Institutions: Use lookupInstitution(name) — canonical enrollment, location, program data
- Distances: Use lookupDistance(from, to) — pre-computed driving distances
- Credentials: Use lookupCredential(state, name) — licensing hour requirements

When citing verified data, include the source: "Median wage: $43,460 (BLS OEWS May 2024, SOC 29-2052)"
When using unverified web data, flag it: "[UNVERIFIED] Cedar Rapids MSA has 10 current pharmacy tech openings"
```

### QA Gate Integration

New pipeline step in `lib/agents/orchestrator.ts`:

```
1. Project Enrichment (existing)
2. Run 7 Research Agents (existing)
3. Citation Agent (existing)
4. ★ NEW: Intelligence Verification Gate
   - Extract all factual claims from agent outputs
   - Check each against Intelligence Hub
   - Verified claims: stamp with source
   - Mismatched claims: auto-correct from DB
   - Unverified claims: flag for review queue
   - Generate verification report
5. Report Generator (existing, now receives verified data)
6. Review Queue items created for Matt
```

---

## API Endpoints

### Internal (Agent-facing)
- `GET /api/intelligence/wages?soc=29-2052&state=IA` 
- `GET /api/intelligence/statutes?state=IA&topic=cosmetology`
- `GET /api/intelligence/institutions?name=kirkwood`
- `GET /api/intelligence/institutions/:id/programs`
- `GET /api/intelligence/institutions/:id/custom`
- `GET /api/intelligence/distances?from=kirkwood&to=dmacc`
- `GET /api/intelligence/credentials?state=IA&name=barber`
- `GET /api/intelligence/employers?state=IA&msa=cedar-rapids`
- `GET /api/intelligence/sources?topics=workforce_pell&states=IA`

### Admin (Matt-facing)
- `POST /api/admin/intelligence/:table` — Create record
- `PUT /api/admin/intelligence/:table/:id` — Update record
- `DELETE /api/admin/intelligence/:table/:id` — Soft delete
- `POST /api/admin/intelligence/import/bls` — Trigger BLS import
- `POST /api/admin/intelligence/import/ipeds` — Trigger IPEDS import
- `POST /api/admin/intelligence/import/csv` — Upload CSV
- `GET /api/admin/intelligence/review` — Get review queue
- `PUT /api/admin/intelligence/review/:id` — Approve/correct/dismiss
- `POST /api/admin/intelligence/clip` — Web clipper (URL → structured source)

---

## Auto-Import Scripts

### BLS OEWS Import (`scripts/import-bls-wages.ts`)
- Pulls from BLS API v2 for all relevant SOC codes
- National + all 50 states + top MSAs
- Runs annually (March/April) or on-demand
- Marks old records as superseded, inserts new vintage

### IPEDS Import (`scripts/import-ipeds.ts`)
- Downloads IPEDS data files (institutional characteristics, completions)
- Maps to `intel_institutions` + `intel_institution_programs`
- Runs annually (fall release)
- Preserves Matt's manual additions in `intel_institution_custom`

### Census Import (`scripts/import-census-population.ts`)
- ACS county population estimates
- Updates `intel_institutions.service_area_population` via county mapping
- Runs annually with ACS release

### Staleness Checker (`cron`)
- Daily scan: flag any record where `last_verified` is past its expected refresh date
- Weekly report to Matt: "12 wage records are from May 2023 — BLS May 2024 is available"

---

## Build Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Verified wages + statutes, basic admin UI, agents start querying

- [ ] Create Supabase tables: `intel_wages`, `intel_statutes`, `intel_review_queue`
- [ ] Seed `intel_wages` with BLS May 2024 OEWS (top 100 SOC codes × national + 50 states)
- [ ] Seed `intel_statutes` with Iowa statutes (barbering/cosmetology, real estate, food protection, mandatory reporter — the ones in the Hawkeye report)
- [ ] Build `lib/intelligence/lookup.ts` with wage + statute lookups
- [ ] Build basic admin pages: `/admin/intelligence`, `/admin/intelligence/wages`, `/admin/intelligence/statutes`
- [ ] Wire market analyst + compliance analyst to check Intelligence Hub before web search
- [ ] Basic review queue page

### Phase 2: Institutions + Programs (Week 3-4)
**Goal:** Full institution profiles, program catalogs, competitive intelligence

- [ ] Create Supabase tables: `intel_institutions`, `intel_institution_programs`, `intel_institution_custom`, `intel_distances`
- [ ] IPEDS bulk import script → seed 1,100+ community colleges
- [ ] Census population import → service area populations
- [ ] Build institution detail page with tabs (profile, programs, custom data, distances)
- [ ] Build `intel_institution_custom` UI for Matt's manual data entry
- [ ] Google Maps API integration for distance computation
- [ ] Wire institution/distance lookups into agents

### Phase 3: Credentials + Employers + Sources (Week 5-6)
**Goal:** Complete intelligence layer, source library

- [ ] Create tables: `intel_credentials`, `intel_employers`, `intel_sources`
- [ ] Build credential manager page
- [ ] Build employer manager page
- [ ] Build source library with web clipper (paste URL → auto-extract)
- [ ] Wire all lookups into agents
- [ ] Source citation formatting in report generator

### Phase 4: QA Gate + Review Workflow (Week 7-8)
**Goal:** Automated verification pipeline, Matt's daily review workflow

- [ ] Build QA Gate as orchestrator pipeline step
- [ ] Claim extraction from agent outputs (Claude-powered)
- [ ] Automated matching against Intelligence Hub
- [ ] Auto-correction for mismatches (with logging)
- [ ] Full review queue with approve/correct/dismiss/add-to-DB actions
- [ ] Verification report included with each delivered report
- [ ] Dashboard metrics: verification rate, correction rate, coverage gaps

### Phase 5: Auto-Refresh + Monitoring (Week 9-10)
**Goal:** Self-maintaining system

- [ ] BLS OEWS annual import cron
- [ ] IPEDS annual import cron
- [ ] Census ACS annual import cron
- [ ] Staleness checker (daily)
- [ ] Weekly intelligence report to Matt: "Here's what's stale, here's what was added, here's your verification rate"
- [ ] State legislative change scanner (quarterly) — check for statute amendments/repeals

### Phase 6: Client-Facing (Future)
**Goal:** Transparency as a selling point

- [ ] "Sources & Methodology" section in reports showing verification status
- [ ] "Powered by X,000 verified data points" on website
- [ ] Optional source appendix in reports (links to actual statutes, BLS tables)
- [ ] Client portal: view sources behind any claim in their report

---

## Security & Access

- All `/admin/intelligence/*` routes behind Supabase Auth (Matt only)
- RLS policies: admin role can read/write; agent API endpoints use service role with read-only access to intel tables
- `intel_review_queue` tracks who verified what and when (audit trail)
- No client data in intelligence tables — this is shared knowledge, not client-specific
- Client-specific data stays in existing project/validation tables

---

## Cost Estimates

| Item | Cost | Frequency |
|------|------|-----------|
| BLS API calls | Free | Annual |
| IPEDS data download | Free | Annual |
| Census API | Free | Annual |
| Google Maps Distance API | ~$5/1000 lookups | One-time per pair |
| Supabase storage (PDFs) | Included in plan | Ongoing |
| Additional Supabase rows | Included in plan | ~50K rows total |
| Claude API for QA Gate | ~$0.15-0.30/report | Per report |

**Total incremental cost:** Negligible. The data sources are free. The storage fits in the existing Supabase plan. The QA gate adds ~$0.20 per report.

---

## Success Metrics

- **Verification rate:** % of factual claims in reports that match verified data (target: 95%+)
- **Correction rate:** % of claims that QA gate auto-corrects (target: <5% — means agents are using the hub)
- **Flag rate:** % of claims requiring Matt's review (target: <10%, decreasing over time)
- **Coverage:** % of SOC codes, states, and institutions with verified data
- **Time saved:** Reduction in agent web searches (fewer API calls, faster reports)
- **Error rate:** Zero factual errors in delivered reports (the ultimate goal)

---

## Notes

- The `intel_institution_custom` table is the secret weapon. This is where Matt's 15 years of CE expertise becomes a moat. No AI competitor can replicate ground-truth institutional knowledge.
- Every table has `last_verified`, `verified_by`, and `notes` — full audit trail.
- Every table has `source_url` — agents MUST cite their source.
- The review queue creates a feedback loop: reports generate claims → Matt reviews → verified claims feed back into the DB → future reports are better.
- Start narrow (Iowa + top occupations), expand with each client engagement. Don't try to boil the ocean on day one.
