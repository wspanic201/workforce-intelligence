-- County-level demographics from Census ACS 5-year estimates
-- Powers service area profiles on institution pages

CREATE TABLE IF NOT EXISTS intel_county_demographics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state_fips TEXT NOT NULL,
  county_fips TEXT NOT NULL,                -- 3-digit county FIPS
  fips_code TEXT NOT NULL,                  -- full 5-digit FIPS (state+county)
  county_name TEXT NOT NULL,
  state TEXT NOT NULL,                      -- 2-letter state code
  
  -- Population
  total_population INTEGER,
  
  -- Education Attainment (25+)
  pop_bachelors INTEGER,                   -- bachelor's degree
  pop_masters INTEGER,                     -- master's degree
  pop_professional INTEGER,                -- professional school degree
  pop_doctorate INTEGER,                   -- doctorate degree
  pct_bachelors_plus NUMERIC,              -- calculated: (bach+master+prof+doc)/total*100
  
  -- Income & Poverty
  median_household_income INTEGER,
  persons_below_poverty INTEGER,
  poverty_rate NUMERIC,                    -- calculated: poverty/total*100
  
  -- Labor Force (optional, can add later)
  labor_force_total INTEGER,
  unemployment_rate NUMERIC,
  
  -- Source metadata
  acs_year TEXT NOT NULL,                  -- "2022" (5-year estimate ending year)
  source TEXT DEFAULT 'census_acs',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(fips_code, acs_year)
);

CREATE INDEX IF NOT EXISTS idx_county_demo_fips ON intel_county_demographics(fips_code);
CREATE INDEX IF NOT EXISTS idx_county_demo_state ON intel_county_demographics(state);
CREATE INDEX IF NOT EXISTS idx_county_demo_state_fips ON intel_county_demographics(state_fips);

ALTER TABLE intel_county_demographics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intel_county_demo_all" ON intel_county_demographics FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER set_updated_at_intel_county_demo
  BEFORE UPDATE ON intel_county_demographics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
