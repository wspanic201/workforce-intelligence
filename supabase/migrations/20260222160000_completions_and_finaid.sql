-- Intelligence Hub: Program Completions + Financial Aid
-- Source: IPEDS via Urban Institute API

-- Completions by CIP code per institution per year
CREATE TABLE IF NOT EXISTS intel_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES intel_institutions(id) ON DELETE CASCADE,
  ipeds_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  cip_code TEXT NOT NULL,           -- 6-digit CIP (e.g., "51.0805")
  cip_title TEXT,
  award_level TEXT,                  -- certificate, associate, bachelor, etc.
  completions_total INTEGER DEFAULT 0,
  completions_men INTEGER DEFAULT 0,
  completions_women INTEGER DEFAULT 0,
  source TEXT DEFAULT 'ipeds',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ipeds_id, year, cip_code, award_level)
);

CREATE INDEX IF NOT EXISTS idx_completions_ipeds ON intel_completions(ipeds_id);
CREATE INDEX IF NOT EXISTS idx_completions_cip ON intel_completions(cip_code);
CREATE INDEX IF NOT EXISTS idx_completions_inst ON intel_completions(institution_id);
CREATE INDEX IF NOT EXISTS idx_completions_year ON intel_completions(year);

-- Financial aid summary per institution per year
CREATE TABLE IF NOT EXISTS intel_financial_aid (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES intel_institutions(id) ON DELETE CASCADE,
  ipeds_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  pct_pell NUMERIC,                 -- % of undergrads receiving Pell
  pct_federal_loan NUMERIC,         -- % receiving federal loans
  avg_net_price INTEGER,            -- average net price after aid
  avg_net_price_0_30k INTEGER,      -- net price for $0-30K family income
  avg_net_price_30_48k INTEGER,
  avg_net_price_48_75k INTEGER,
  avg_net_price_75_110k INTEGER,
  avg_net_price_110k_plus INTEGER,
  total_pell_recipients INTEGER,
  total_grant_aid INTEGER,          -- total grant/scholarship $ awarded
  in_state_tuition INTEGER,
  out_state_tuition INTEGER,
  source TEXT DEFAULT 'ipeds',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ipeds_id, year)
);

CREATE INDEX IF NOT EXISTS idx_finaid_ipeds ON intel_financial_aid(ipeds_id);
CREATE INDEX IF NOT EXISTS idx_finaid_inst ON intel_financial_aid(institution_id);

-- RLS
ALTER TABLE intel_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_financial_aid ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intel_completions_all" ON intel_completions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "intel_finaid_all" ON intel_financial_aid FOR ALL USING (true) WITH CHECK (true);

-- Updated_at triggers
CREATE TRIGGER set_updated_at_intel_completions
  BEFORE UPDATE ON intel_completions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_intel_finaid
  BEFORE UPDATE ON intel_financial_aid
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
