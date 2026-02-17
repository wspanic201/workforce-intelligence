-- ============================================================
-- WorkforceOS Multi-Tenant Schema Migration
-- ============================================================
-- Adds institution-scoped tables for the full 8-stage pipeline.
-- Existing validation_projects/research_components/validation_reports
-- tables are preserved — this migration adds NEW tables alongside them.
-- Future migration will backfill existing data into new schema.
-- ============================================================

-- ── 1. Institutions (Clients/Tenants) ──

CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,                          -- "Kirkwood Community College"
  
  -- Service Region
  primary_city text,                           -- "Cedar Rapids"
  additional_cities text[] DEFAULT '{}',       -- {"Iowa City","Coralville","Marion"}
  metro_area text,                             -- "Cedar Rapids-Iowa City Corridor"
  counties text,                               -- "Linn, Johnson, Benton..."
  state text,                                  -- "Iowa"
  website text,
  
  -- Contact
  contact_name text,
  contact_email text,
  contact_phone text,
  
  -- Metadata
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── 2. Programs (Central Entity — one per program opportunity) ──

CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Program Identity
  title text NOT NULL,                         -- "Sterile Processing Technician Certificate"
  description text,
  occupation text,                             -- "Medical Equipment Preparers"
  soc_code text,                               -- "31-9093"
  sector text,                                 -- "Healthcare"
  level text,                                  -- "certificate", "diploma", "associate"
  
  -- Discovery Scores (populated by Discovery stage)
  discovery_score numeric,                     -- composite score (e.g., 8.7)
  discovery_tier text,                         -- "quick_win", "strategic_build", "emerging", "blue_ocean"
  discovery_method text,                       -- for blue ocean: "employer_pain_point", "supply_chain", etc.
  
  -- Validation Scores (populated by Validation stage)
  validation_score numeric,                    -- composite score
  validation_recommendation text,              -- "strong_go", "conditional_go", "cautious_proceed", "defer", "no_go"
  
  -- Lifecycle Status
  status text DEFAULT 'discovered' CHECK (status IN (
    'discovered',       -- Found by Discovery
    'validating',       -- Validation in progress
    'validated',        -- Validation complete
    'designing',        -- Curriculum Design in progress
    'designed',         -- Curriculum complete
    'in_development',   -- Content being built
    'marketing',        -- Marketing stage
    'launching',        -- Launch preparation
    'active',           -- Live program
    'archived'          -- No longer active
  )),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_programs_institution ON programs(institution_id);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_sector ON programs(sector);

-- ── 3. Program Stages (Tracks which stages have been run) ──

CREATE TABLE IF NOT EXISTS program_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Stage Identity
  stage_type text NOT NULL CHECK (stage_type IN (
    'discovery', 'validation', 'curriculum_design', 'pathway_dev',
    'content', 'marketing', 'launch', 'qc'
  )),
  stage_number smallint,                       -- 1-8
  
  -- Execution Status
  status text DEFAULT 'pending' CHECK (status IN (
    'pending', 'running', 'complete', 'error', 'partial'
  )),
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer,
  
  -- Run Metrics
  total_searches integer DEFAULT 0,
  total_api_calls integer DEFAULT 0,
  model_used text,                             -- "claude-sonnet-4-5"
  cost_estimate numeric,                       -- estimated API cost in USD
  error_message text,
  
  -- Flexible metadata (phase timing, search counts, config, etc.)
  metadata jsonb DEFAULT '{}',
  
  created_at timestamptz DEFAULT now(),
  
  -- One stage of each type per program
  UNIQUE(program_id, stage_type)
);

CREATE INDEX idx_program_stages_program ON program_stages(program_id);
CREATE INDEX idx_program_stages_institution ON program_stages(institution_id);
CREATE INDEX idx_program_stages_type ON program_stages(stage_type);

-- ── 4. Stage Outputs (The actual deliverables) ──

CREATE TABLE IF NOT EXISTS stage_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL REFERENCES program_stages(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Output Identity
  output_type text NOT NULL CHECK (output_type IN (
    'brief_markdown',      -- Discovery brief
    'validation_report',   -- Validation report
    'curriculum_doc',      -- Curriculum design document
    'structured_data',     -- Raw JSON structured data
    'executive_summary',   -- Short summary
    'pdf_path',            -- Path to generated PDF
    'agent_output'         -- Individual agent raw output
  )),
  
  -- Content
  content text,                                -- markdown, JSON string, or file path
  content_format text DEFAULT 'markdown' CHECK (content_format IN (
    'markdown', 'json', 'pdf_path', 'html'
  )),
  
  -- Metrics
  word_count integer,
  page_count integer,
  version integer DEFAULT 1,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_stage_outputs_stage ON stage_outputs(stage_id);
CREATE INDEX idx_stage_outputs_institution ON stage_outputs(institution_id);
CREATE INDEX idx_stage_outputs_type ON stage_outputs(output_type);

-- ── 5. Stage Citations (Evidence/sources for every data claim) ──

CREATE TABLE IF NOT EXISTS stage_citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL REFERENCES program_stages(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Citation Data (matches the Universal Data Point Schema)
  finding text NOT NULL,                       -- plain language claim
  source_name text NOT NULL,                   -- exact source name
  source_url text,
  retrieval_date date DEFAULT CURRENT_DATE,
  data_period text,                            -- "2024 Q3", "Annual 2025"
  confidence text CHECK (confidence IN ('high', 'medium', 'low')),
  methodology text,
  
  -- Provenance
  agent_name text,                             -- which agent produced this
  program_title text,                          -- which program this relates to
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_stage_citations_stage ON stage_citations(stage_id);
CREATE INDEX idx_stage_citations_institution ON stage_citations(institution_id);

-- ── 6. Row-Level Security ──

-- Enable RLS on all new tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_citations ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (for agent operations)
-- These policies allow the service role full access
-- and restrict anon/authenticated users to their institution

-- Institutions: users see only their own
CREATE POLICY "institutions_select" ON institutions
  FOR SELECT USING (
    id = current_setting('app.current_institution_id', true)::uuid
    OR current_setting('role') = 'service_role'
  );

CREATE POLICY "institutions_insert" ON institutions
  FOR INSERT WITH CHECK (true);  -- service role creates institutions

CREATE POLICY "institutions_update" ON institutions
  FOR UPDATE USING (
    id = current_setting('app.current_institution_id', true)::uuid
    OR current_setting('role') = 'service_role'
  );

-- Programs: scoped to institution
CREATE POLICY "programs_select" ON programs
  FOR SELECT USING (
    institution_id = current_setting('app.current_institution_id', true)::uuid
    OR current_setting('role') = 'service_role'
  );

CREATE POLICY "programs_all" ON programs
  FOR ALL USING (
    institution_id = current_setting('app.current_institution_id', true)::uuid
    OR current_setting('role') = 'service_role'
  );

-- Program Stages: scoped to institution
CREATE POLICY "program_stages_select" ON program_stages
  FOR SELECT USING (
    institution_id = current_setting('app.current_institution_id', true)::uuid
    OR current_setting('role') = 'service_role'
  );

CREATE POLICY "program_stages_all" ON program_stages
  FOR ALL USING (
    institution_id = current_setting('app.current_institution_id', true)::uuid
    OR current_setting('role') = 'service_role'
  );

-- Stage Outputs: scoped to institution
CREATE POLICY "stage_outputs_select" ON stage_outputs
  FOR SELECT USING (
    institution_id = current_setting('app.current_institution_id', true)::uuid
    OR current_setting('role') = 'service_role'
  );

CREATE POLICY "stage_outputs_all" ON stage_outputs
  FOR ALL USING (
    institution_id = current_setting('app.current_institution_id', true)::uuid
    OR current_setting('role') = 'service_role'
  );

-- Stage Citations: scoped to institution
CREATE POLICY "stage_citations_select" ON stage_citations
  FOR SELECT USING (
    institution_id = current_setting('app.current_institution_id', true)::uuid
    OR current_setting('role') = 'service_role'
  );

CREATE POLICY "stage_citations_all" ON stage_citations
  FOR ALL USING (
    institution_id = current_setting('app.current_institution_id', true)::uuid
    OR current_setting('role') = 'service_role'
  );

-- ── 7. Helper Functions ──

-- Set institution context (call on every authenticated request)
CREATE OR REPLACE FUNCTION set_institution_context(inst_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_institution_id', inst_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- Get current institution (for use in queries/policies)
CREATE OR REPLACE FUNCTION current_institution_id()
RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.current_institution_id', true)::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
