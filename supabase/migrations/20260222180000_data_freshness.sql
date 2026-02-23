-- Data Freshness Tracking
-- Tracks: what the source data covers (vintage) vs when we last refreshed it

CREATE TABLE IF NOT EXISTS intel_data_freshness (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,                    -- e.g. 'intel_wages', 'intel_completions'
  dataset_label TEXT NOT NULL,                 -- human label: "BLS OES Wages", "IPEDS Completions"
  source_name TEXT NOT NULL,                   -- "Bureau of Labor Statistics", "IPEDS via Urban Institute"
  source_url TEXT,                             -- canonical URL for the source
  
  -- Source data vintage (what period does this data cover?)
  data_period TEXT NOT NULL,                   -- "May 2024", "2021-22 Academic Year", "2022-2032"
  data_release_date DATE,                      -- when the source agency published this release
  next_expected_release TEXT,                  -- "March 2025", "Fall 2026", etc.
  
  -- Our refresh tracking
  records_loaded INTEGER DEFAULT 0,            -- how many records we imported
  last_refreshed_at TIMESTAMPTZ DEFAULT now(), -- when WE last pulled/imported
  refreshed_by TEXT DEFAULT 'system',          -- 'system', 'matt', 'cassidy'
  refresh_method TEXT,                         -- 'api_bulk', 'api_incremental', 'manual_import', 'csv_upload', 'scrape'
  
  -- For reports / citation generation
  citation_text TEXT,                          -- ready-to-use citation: "Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2024"
  citation_url TEXT,                           -- direct link to the data release
  coverage_notes TEXT,                         -- "National + 50 states", "Iowa only", "All public 2-year institutions"
  known_limitations TEXT,                      -- "Credit programs only; excludes noncredit", "2022 not yet available"
  
  -- Staleness tracking
  is_stale BOOLEAN DEFAULT false,              -- manually flag if we know newer data exists
  stale_reason TEXT,                           -- "May 2025 OES released March 2026"
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(table_name)
);

CREATE INDEX IF NOT EXISTS idx_freshness_table ON intel_data_freshness(table_name);
CREATE INDEX IF NOT EXISTS idx_freshness_stale ON intel_data_freshness(is_stale) WHERE is_stale = true;

ALTER TABLE intel_data_freshness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intel_freshness_all" ON intel_data_freshness FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER set_updated_at_intel_freshness
  BEFORE UPDATE ON intel_data_freshness
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Seed with what we've already loaded ────────────────

INSERT INTO intel_data_freshness (table_name, dataset_label, source_name, source_url, data_period, data_release_date, next_expected_release, records_loaded, refreshed_by, refresh_method, citation_text, citation_url, coverage_notes, known_limitations) VALUES

('intel_institutions', 'Community College Directory', 'IPEDS via Urban Institute', 'https://educationdata.urban.org/documentation/colleges.html', '2022-23', '2024-09-01', 'Fall 2025', 900, 'cassidy', 'api_bulk',
 'National Center for Education Statistics, Integrated Postsecondary Education Data System (IPEDS), Institutional Characteristics 2022-23',
 'https://nces.ed.gov/ipeds/', 'All public 2-year institutions (900 community/technical colleges)', 'Credit enrollment only; noncredit not reported in IPEDS'),

('intel_completions', 'Program Completions by CIP', 'IPEDS via Urban Institute', 'https://educationdata.urban.org/documentation/colleges.html', '2020-21 Academic Year', '2023-01-01', 'Early 2025', 46981, 'cassidy', 'api_bulk',
 'National Center for Education Statistics, IPEDS Completions Survey 2020-21, by 6-digit CIP code',
 'https://nces.ed.gov/ipeds/use-the-data', 'All public 2-year institutions, aggregate totals (sex=99, race=99, majornum=1)', 'Credit completions only; 2021-22 data not yet available via Urban Institute API'),

('intel_financial_aid', 'Financial Aid & Tuition', 'College Scorecard', 'https://collegescorecard.ed.gov/data/', 'Latest available (mixed 2021-23)', NULL, 'Rolling updates', 515, 'cassidy', 'api_bulk',
 'U.S. Department of Education, College Scorecard Data, latest available release',
 'https://collegescorecard.ed.gov/', '515 of 900 community colleges with data', 'Pell rate is undergraduate share; median earnings measured 10 years after entry'),

('intel_employers', 'Employers by Industry & County', 'U.S. Census Bureau, County Business Patterns', 'https://www.census.gov/programs-surveys/cbp.html', '2021', '2023-04-01', 'Spring 2025 (2022 data)', 39101, 'cassidy', 'api_bulk',
 'U.S. Census Bureau, County Business Patterns 2021, by NAICS industry code',
 'https://data.census.gov/table/CBP2021.CB2100CBP', 'All counties in states with community colleges, 15 key NAICS industries', 'Employer counts suppressed in small counties for confidentiality; uses establishment counts'),

('intel_occupation_projections', 'Employment Projections (10yr)', 'Bureau of Labor Statistics', 'https://www.bls.gov/emp/', '2022-2032', '2023-09-01', 'Fall 2025 (2023-33 projections)', 42, 'cassidy', 'api_bulk',
 'Bureau of Labor Statistics, Employment Projections 2022-2032',
 'https://www.bls.gov/emp/tables.htm', '42 key workforce occupations (national)', 'Curated subset; full BLS dataset covers 800+ occupations'),

('intel_wages', 'Occupational Wages', 'Bureau of Labor Statistics, OES', 'https://www.bls.gov/oes/', '—', NULL, NULL, 0, 'system', NULL,
 'Bureau of Labor Statistics, Occupational Employment and Wage Statistics',
 'https://www.bls.gov/oes/', '—', 'Not yet loaded'),

('intel_occupation_skills', 'Skills & Knowledge by Occupation', 'O*NET OnLine', 'https://www.onetonline.org/', '—', NULL, NULL, 0, 'system', NULL,
 'O*NET OnLine, National Center for O*NET Development',
 'https://www.onetonline.org/', '—', 'Not yet loaded; API key expired, bulk download available'),

('intel_statutes', 'State Statutes & Regulations', 'Manual Research + AI', NULL, 'Current', NULL, 'Ongoing', 0, 'system', NULL,
 NULL, NULL, '—', 'Manually curated; varies by state'),

('intel_credentials', 'Credentials & Licensing Requirements', 'CareerOneStop / Manual', 'https://www.careeronestop.org/Developers/', '—', NULL, NULL, 0, 'system', NULL,
 'CareerOneStop, U.S. Department of Labor, Employment and Training Administration',
 'https://www.careeronestop.org/', '—', 'Not yet loaded; needs free API key registration'),

('intel_training_providers', 'Noncredit Training Providers', 'State ETPL / FMCSA / Manual', NULL, '—', NULL, NULL, 0, 'system', NULL,
 NULL, NULL, '—', 'Not yet loaded'),

('intel_apprenticeships', 'Registered Apprenticeships', 'DOL RAPIDS', 'https://www.apprenticeship.gov/', '—', NULL, NULL, 0, 'system', NULL,
 'U.S. Department of Labor, Registered Apprenticeship Partners Information Database System (RAPIDS)',
 'https://www.apprenticeship.gov/partner-finder', '—', 'Not yet loaded'),

('intel_license_counts', 'Active Licensee Counts', 'State Licensing Boards', NULL, '—', NULL, NULL, 0, 'system', NULL,
 NULL, NULL, '—', 'Not yet loaded; requires state-by-state FOIA or scraping'),

('intel_sources', 'Clipped Sources & Research', 'Manual Curation', NULL, 'Ongoing', NULL, 'Ongoing', 0, 'matt', 'manual_import',
 NULL, NULL, 'Research articles, gov reports, industry data saved manually', NULL),

('intel_distances', 'Institution Distances', 'Computed (Google Maps / Haversine)', NULL, '—', NULL, NULL, 0, 'system', NULL,
 NULL, NULL, '—', 'Not yet computed')

ON CONFLICT (table_name) DO NOTHING;
