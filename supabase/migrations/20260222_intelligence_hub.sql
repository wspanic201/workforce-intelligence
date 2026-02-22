-- Intelligence Hub: Verified data layer for Wavelength reports
-- Created: 2026-02-22

-- Enums
CREATE TYPE intel_geo_level AS ENUM ('national', 'state', 'msa');
CREATE TYPE intel_code_type AS ENUM ('statute', 'admin_rule', 'regulation');
CREATE TYPE intel_status AS ENUM ('active', 'repealed', 'amended', 'pending');
CREATE TYPE intel_institution_type AS ENUM ('community_college', 'technical_college', '4yr_public', '4yr_private');
CREATE TYPE intel_credential_level AS ENUM ('certificate', 'diploma', 'associate', 'bachelor');
CREATE TYPE intel_credit_type AS ENUM ('credit', 'noncredit', 'both');
CREATE TYPE intel_delivery_mode AS ENUM ('in_person', 'online', 'hybrid');
CREATE TYPE intel_credential_type AS ENUM ('license', 'certification', 'registration', 'permit');
CREATE TYPE intel_source_type AS ENUM ('government', 'research', 'news', 'industry', 'internal');
CREATE TYPE intel_reliability AS ENUM ('official', 'verified', 'unverified');
CREATE TYPE intel_data_type AS ENUM ('text', 'number', 'date', 'json', 'url');
CREATE TYPE intel_confidence AS ENUM ('confirmed', 'estimated', 'reported', 'high', 'medium', 'low');
CREATE TYPE intel_review_status AS ENUM ('verified', 'corrected', 'flagged', 'dismissed');
CREATE TYPE intel_claim_category AS ENUM ('wage', 'statute', 'distance', 'enrollment', 'employer', 'credential', 'other');

-- 1. intel_wages
CREATE TABLE intel_wages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  soc_code text NOT NULL,
  occupation_title text NOT NULL,
  geo_level intel_geo_level NOT NULL DEFAULT 'national',
  geo_code text NOT NULL DEFAULT 'national',
  geo_name text NOT NULL DEFAULT 'National',
  median_annual integer,
  mean_annual integer,
  pct_10 integer,
  pct_25 integer,
  pct_75 integer,
  pct_90 integer,
  employment integer,
  bls_release text NOT NULL,
  source_url text,
  last_verified timestamptz DEFAULT now(),
  verified_by text DEFAULT 'auto-import',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_intel_wages_soc ON intel_wages (soc_code, geo_level, geo_code);
CREATE INDEX idx_intel_wages_title ON intel_wages USING gin (to_tsvector('english', occupation_title));

-- 2. intel_statutes
CREATE TABLE intel_statutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL,
  code_type intel_code_type NOT NULL DEFAULT 'statute',
  code_chapter text NOT NULL,
  code_section text,
  title text NOT NULL,
  summary text,
  full_text text,
  admin_code_ref text,
  regulatory_body text,
  status intel_status NOT NULL DEFAULT 'active',
  effective_date date,
  repeal_date date,
  superseded_by text,
  source_url text,
  source_pdf_path text,
  category text,
  tags text[] DEFAULT '{}',
  last_verified timestamptz DEFAULT now(),
  verified_by text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_intel_statutes_state ON intel_statutes (state, code_chapter);
CREATE INDEX idx_intel_statutes_category ON intel_statutes (state, category);
CREATE INDEX idx_intel_statutes_tags ON intel_statutes USING gin (tags);

-- 3. intel_institutions
CREATE TABLE intel_institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ipeds_id text UNIQUE,
  name text NOT NULL,
  short_name text,
  state text NOT NULL,
  city text,
  county text,
  zip text,
  latitude numeric,
  longitude numeric,
  type intel_institution_type DEFAULT 'community_college',
  system_name text,
  accreditor text,
  website text,
  service_area_counties text[] DEFAULT '{}',
  service_area_population integer,
  total_enrollment integer,
  credit_enrollment integer,
  noncredit_enrollment integer,
  program_count integer,
  annual_operating_budget integer,
  tuition_in_district integer,
  tuition_in_state integer,
  carnegie_class text,
  hsi_designation boolean DEFAULT false,
  msi_designation boolean DEFAULT false,
  rural_serving boolean DEFAULT false,
  ipeds_year text,
  source_url text,
  last_verified timestamptz DEFAULT now(),
  verified_by text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_intel_institutions_state ON intel_institutions (state, city);
CREATE INDEX idx_intel_institutions_name ON intel_institutions USING gin (to_tsvector('english', name));
CREATE INDEX idx_intel_institutions_counties ON intel_institutions USING gin (service_area_counties);

-- 4. intel_institution_programs
CREATE TABLE intel_institution_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES intel_institutions(id) ON DELETE CASCADE,
  program_name text NOT NULL,
  cip_code text,
  credential_level intel_credential_level,
  credit_type intel_credit_type,
  clock_hours integer,
  credit_hours integer,
  tuition integer,
  delivery_mode intel_delivery_mode,
  active boolean DEFAULT true,
  accreditation text,
  licensure_alignment text,
  source text,
  source_url text,
  last_verified timestamptz DEFAULT now(),
  verified_by text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_intel_programs_inst ON intel_institution_programs (institution_id, cip_code);
CREATE INDEX idx_intel_programs_cip ON intel_institution_programs (cip_code);

-- 5. intel_institution_custom
CREATE TABLE intel_institution_custom (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES intel_institutions(id) ON DELETE CASCADE,
  data_category text NOT NULL,
  data_key text NOT NULL,
  data_value text,
  data_type intel_data_type DEFAULT 'text',
  source text,
  source_url text,
  file_path text,
  confidence intel_confidence DEFAULT 'confirmed',
  effective_date date,
  expiration_date date,
  last_verified timestamptz DEFAULT now(),
  verified_by text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_intel_custom_inst ON intel_institution_custom (institution_id, data_category);
CREATE INDEX idx_intel_custom_key ON intel_institution_custom (institution_id, data_key);

-- 6. intel_credentials
CREATE TABLE intel_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL,
  credential_name text NOT NULL,
  credential_type intel_credential_type NOT NULL,
  required_hours integer,
  hour_type text,
  education_requirement text,
  exam_required boolean DEFAULT false,
  exam_name text,
  regulatory_body text,
  statute_id uuid REFERENCES intel_statutes(id),
  renewal_period_years integer,
  ce_hours_required integer,
  reciprocity_notes text,
  soc_codes text[] DEFAULT '{}',
  source_url text,
  last_verified timestamptz DEFAULT now(),
  verified_by text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_intel_credentials_state ON intel_credentials (state, credential_name);
CREATE INDEX idx_intel_credentials_soc ON intel_credentials USING gin (soc_codes);

-- 7. intel_employers
CREATE TABLE intel_employers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_name text NOT NULL,
  state text,
  city text,
  msa text,
  naics_code text,
  industry text,
  estimated_employees integer,
  employee_count_source text,
  employee_count_year integer,
  is_hiring boolean DEFAULT false,
  key_occupations text[] DEFAULT '{}',
  recent_investments text,
  partnership_potential text,
  source_url text,
  last_verified timestamptz DEFAULT now(),
  verified_by text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_intel_employers_state ON intel_employers (state, msa);
CREATE INDEX idx_intel_employers_name ON intel_employers USING gin (to_tsvector('english', employer_name));
CREATE INDEX idx_intel_employers_soc ON intel_employers USING gin (key_occupations);

-- 8. intel_distances
CREATE TABLE intel_distances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_institution_id uuid NOT NULL REFERENCES intel_institutions(id) ON DELETE CASCADE,
  to_institution_id uuid NOT NULL REFERENCES intel_institutions(id) ON DELETE CASCADE,
  driving_miles numeric,
  driving_minutes integer,
  source text DEFAULT 'google_maps_api',
  computed_at timestamptz DEFAULT now(),
  UNIQUE(from_institution_id, to_institution_id)
);
CREATE INDEX idx_intel_distances_from ON intel_distances (from_institution_id);

-- 9. intel_sources
CREATE TABLE intel_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type intel_source_type NOT NULL DEFAULT 'news',
  title text NOT NULL,
  publisher text,
  url text,
  published_date date,
  summary text,
  full_text text,
  file_path text,
  states text[] DEFAULT '{}',
  topics text[] DEFAULT '{}',
  institution_ids uuid[] DEFAULT '{}',
  soc_codes text[] DEFAULT '{}',
  reliability intel_reliability DEFAULT 'verified',
  last_verified timestamptz DEFAULT now(),
  verified_by text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_intel_sources_type ON intel_sources (source_type);
CREATE INDEX idx_intel_sources_states ON intel_sources USING gin (states);
CREATE INDEX idx_intel_sources_topics ON intel_sources USING gin (topics);

-- 10. intel_review_queue
CREATE TABLE intel_review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id text,
  report_name text,
  claim_text text NOT NULL,
  claim_category intel_claim_category NOT NULL DEFAULT 'other',
  verification_status intel_review_status NOT NULL DEFAULT 'flagged',
  verified_value text,
  matched_record_id uuid,
  matched_table text,
  agent_source text,
  web_source text,
  confidence intel_confidence DEFAULT 'medium',
  reviewed_by text,
  reviewed_at timestamptz,
  added_to_db boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_intel_review_status ON intel_review_queue (verification_status);
CREATE INDEX idx_intel_review_report ON intel_review_queue (report_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION intel_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER trg_intel_wages_updated BEFORE UPDATE ON intel_wages FOR EACH ROW EXECUTE FUNCTION intel_update_timestamp();
CREATE TRIGGER trg_intel_statutes_updated BEFORE UPDATE ON intel_statutes FOR EACH ROW EXECUTE FUNCTION intel_update_timestamp();
CREATE TRIGGER trg_intel_institutions_updated BEFORE UPDATE ON intel_institutions FOR EACH ROW EXECUTE FUNCTION intel_update_timestamp();
CREATE TRIGGER trg_intel_programs_updated BEFORE UPDATE ON intel_institution_programs FOR EACH ROW EXECUTE FUNCTION intel_update_timestamp();
CREATE TRIGGER trg_intel_custom_updated BEFORE UPDATE ON intel_institution_custom FOR EACH ROW EXECUTE FUNCTION intel_update_timestamp();
CREATE TRIGGER trg_intel_credentials_updated BEFORE UPDATE ON intel_credentials FOR EACH ROW EXECUTE FUNCTION intel_update_timestamp();
CREATE TRIGGER trg_intel_employers_updated BEFORE UPDATE ON intel_employers FOR EACH ROW EXECUTE FUNCTION intel_update_timestamp();
CREATE TRIGGER trg_intel_sources_updated BEFORE UPDATE ON intel_sources FOR EACH ROW EXECUTE FUNCTION intel_update_timestamp();

-- RLS: Enable on all tables, allow service_role full access
ALTER TABLE intel_wages ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_statutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_institution_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_institution_custom ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_distances ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_review_queue ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (agents + admin API)
CREATE POLICY "service_role_all" ON intel_wages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON intel_statutes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON intel_institutions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON intel_institution_programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON intel_institution_custom FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON intel_credentials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON intel_employers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON intel_distances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON intel_sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON intel_review_queue FOR ALL USING (true) WITH CHECK (true);
