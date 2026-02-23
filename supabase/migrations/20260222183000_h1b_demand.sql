-- H-1B LCA Demand Signals
-- Aggregated from DOL disclosure data — shows which occupations have high visa demand
-- Great signal for: international talent needs = training gap opportunities

CREATE TABLE IF NOT EXISTS intel_h1b_demand (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  soc_code TEXT NOT NULL,
  soc_title TEXT,
  state TEXT NOT NULL,                   -- 2-letter state code, or 'US' for national
  fiscal_year TEXT NOT NULL,             -- 'FY2025'
  applications_total INTEGER DEFAULT 0,  -- total LCA applications
  applications_certified INTEGER DEFAULT 0,
  applications_denied INTEGER DEFAULT 0,
  applications_withdrawn INTEGER DEFAULT 0,
  median_prevailing_wage INTEGER,        -- median prevailing wage from LCAs
  median_offered_wage INTEGER,           -- median wage offered to H-1B workers
  top_employers TEXT[],                  -- top 5 employers by volume
  top_metro_areas TEXT[],                -- top 5 MSAs
  source TEXT DEFAULT 'dol_lca',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(soc_code, state, fiscal_year)
);

CREATE INDEX IF NOT EXISTS idx_h1b_soc ON intel_h1b_demand(soc_code);
CREATE INDEX IF NOT EXISTS idx_h1b_state ON intel_h1b_demand(state);
CREATE INDEX IF NOT EXISTS idx_h1b_volume ON intel_h1b_demand(applications_total DESC);

ALTER TABLE intel_h1b_demand ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intel_h1b_all" ON intel_h1b_demand FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER set_updated_at_intel_h1b
  BEFORE UPDATE ON intel_h1b_demand
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
