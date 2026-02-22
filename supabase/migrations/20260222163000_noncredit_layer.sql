-- Noncredit Intelligence Layer
-- Data sources: BLS Projections, O*NET, DOL RAPIDS, FMCSA, CareerOneStop, State ETPL

-- ── Occupation Projections (BLS 10-year) ───────────────────────────

CREATE TABLE IF NOT EXISTS intel_occupation_projections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  soc_code TEXT NOT NULL,
  occupation_title TEXT NOT NULL,
  base_year INTEGER NOT NULL,          -- e.g. 2022
  projected_year INTEGER NOT NULL,     -- e.g. 2032
  employment_base INTEGER,             -- employment in base year
  employment_projected INTEGER,        -- projected employment
  change_number INTEGER,               -- numeric change
  change_percent NUMERIC,              -- percent change
  annual_openings INTEGER,             -- avg annual openings (growth + replacement)
  median_annual_wage INTEGER,          -- from same BLS release
  typical_education TEXT,              -- "Postsecondary nondegree award", "High school diploma", etc.
  typical_experience TEXT,             -- "None", "Less than 5 years", etc.
  typical_training TEXT,               -- "Short-term OJT", "Moderate-term OJT", "Apprenticeship", etc.
  growth_category TEXT,                -- 'much_faster', 'faster', 'average', 'slower', 'declining'
  geo_level TEXT DEFAULT 'national',   -- national, state
  geo_code TEXT DEFAULT 'US',
  source TEXT DEFAULT 'bls_projections',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(soc_code, base_year, geo_level, geo_code)
);

CREATE INDEX IF NOT EXISTS idx_occ_proj_soc ON intel_occupation_projections(soc_code);
CREATE INDEX IF NOT EXISTS idx_occ_proj_growth ON intel_occupation_projections(change_percent DESC);
CREATE INDEX IF NOT EXISTS idx_occ_proj_education ON intel_occupation_projections(typical_education);

-- ── Occupation Skills & Knowledge (O*NET) ──────────────────────────

CREATE TABLE IF NOT EXISTS intel_occupation_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  soc_code TEXT NOT NULL,
  occupation_title TEXT,
  skill_type TEXT NOT NULL,            -- 'skill', 'knowledge', 'ability', 'technology', 'tool'
  skill_name TEXT NOT NULL,
  importance NUMERIC,                  -- 1-5 scale
  level NUMERIC,                       -- 1-7 scale (how much is needed)
  category TEXT,                       -- grouping category from O*NET
  source TEXT DEFAULT 'onet',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(soc_code, skill_type, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_occ_skills_soc ON intel_occupation_skills(soc_code);
CREATE INDEX IF NOT EXISTS idx_occ_skills_type ON intel_occupation_skills(skill_type);
CREATE INDEX IF NOT EXISTS idx_occ_skills_importance ON intel_occupation_skills(importance DESC);

-- ── Training Providers (noncredit — ETPL, CDL, trade schools) ──────

CREATE TABLE IF NOT EXISTS intel_training_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL,         -- 'etpl', 'cdl_school', 'apprenticeship_sponsor', 'trade_school', 'bootcamp', 'employer_training'
  state TEXT,
  city TEXT,
  county TEXT,
  zip TEXT,
  program_names TEXT[],                -- programs offered
  occupations_served TEXT[],           -- SOC codes served
  cip_codes TEXT[],                    -- CIP codes if applicable
  credential_awarded TEXT,             -- what you get: cert, license, etc.
  program_length TEXT,                 -- "40 hours", "6 weeks", "600 clock hours"
  cost_range TEXT,                     -- "$500-2,000"
  etpl_approved BOOLEAN DEFAULT false, -- on state ETPL list?
  wioa_eligible BOOLEAN DEFAULT false, -- eligible for WIOA funding?
  pell_eligible BOOLEAN DEFAULT false, -- eligible for Pell?
  accreditor TEXT,
  website TEXT,
  phone TEXT,
  registry_id TEXT,                    -- FMCSA ID, ETPL ID, etc.
  data_source TEXT NOT NULL,           -- 'fmcsa_tpr', 'state_etpl', 'rapids', 'manual'
  last_verified TIMESTAMPTZ DEFAULT now(),
  verified_by TEXT DEFAULT 'system',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tp_state ON intel_training_providers(state);
CREATE INDEX IF NOT EXISTS idx_tp_type ON intel_training_providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_tp_etpl ON intel_training_providers(etpl_approved) WHERE etpl_approved = true;

-- ── Registered Apprenticeships (DOL RAPIDS) ────────────────────────

CREATE TABLE IF NOT EXISTS intel_apprenticeships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_name TEXT NOT NULL,
  sponsor_type TEXT,                   -- 'employer', 'group', 'joint'
  occupation_title TEXT,
  rapids_code TEXT,
  soc_code TEXT,
  state TEXT,
  city TEXT,
  county TEXT,
  program_type TEXT,                   -- 'time_based', 'competency_based', 'hybrid'
  program_length_months INTEGER,
  related_instruction_hours INTEGER,   -- classroom hours required
  ojt_hours INTEGER,                   -- on-the-job training hours
  journeyworker_wage NUMERIC,
  active_apprentices INTEGER,
  completions_total INTEGER,
  status TEXT DEFAULT 'active',        -- 'active', 'inactive', 'pending'
  registration_date TEXT,
  data_source TEXT DEFAULT 'rapids',
  last_verified TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apprentice_state ON intel_apprenticeships(state);
CREATE INDEX IF NOT EXISTS idx_apprentice_soc ON intel_apprenticeships(soc_code);
CREATE INDEX IF NOT EXISTS idx_apprentice_active ON intel_apprenticeships(status) WHERE status = 'active';

-- ── Active Licensee Counts (state licensing boards) ────────────────

CREATE TABLE IF NOT EXISTS intel_license_counts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL,
  occupation TEXT NOT NULL,
  license_type TEXT,                   -- 'license', 'certification', 'registration'
  active_count INTEGER,                -- total active licensees
  new_issued_year INTEGER,             -- new licenses issued that year
  new_issued_count INTEGER,
  renewal_count INTEGER,
  geo_level TEXT DEFAULT 'state',      -- 'state', 'county', 'msa'
  geo_code TEXT,                       -- county FIPS or MSA code
  reporting_year INTEGER NOT NULL,
  regulatory_body TEXT,
  source_url TEXT,
  data_source TEXT DEFAULT 'state_board',
  last_verified TIMESTAMPTZ DEFAULT now(),
  verified_by TEXT DEFAULT 'system',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(state, occupation, geo_level, geo_code, reporting_year)
);

CREATE INDEX IF NOT EXISTS idx_lic_counts_state ON intel_license_counts(state);
CREATE INDEX IF NOT EXISTS idx_lic_counts_occ ON intel_license_counts(occupation);

-- ── RLS ────────────────────────────────────────────────────────────

ALTER TABLE intel_occupation_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_occupation_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_training_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_apprenticeships ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_license_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intel_occ_proj_all" ON intel_occupation_projections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "intel_occ_skills_all" ON intel_occupation_skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "intel_tp_all" ON intel_training_providers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "intel_apprentice_all" ON intel_apprenticeships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "intel_lic_counts_all" ON intel_license_counts FOR ALL USING (true) WITH CHECK (true);

-- ── Triggers ───────────────────────────────────────────────────────

CREATE TRIGGER set_updated_at_intel_occ_proj BEFORE UPDATE ON intel_occupation_projections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_intel_tp BEFORE UPDATE ON intel_training_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_intel_apprentice BEFORE UPDATE ON intel_apprenticeships FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_intel_lic_counts BEFORE UPDATE ON intel_license_counts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
