-- State Priority / In-Demand Occupations
-- Source: WIOA State Plans, Future Ready Iowa, state workforce board designations
-- Every state publishes a list of "in-demand" or "high-demand" occupations that qualify for WIOA funding

CREATE TABLE IF NOT EXISTS intel_state_priorities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL,                       -- 2-letter state code
  occupation_title TEXT NOT NULL,
  soc_code TEXT,                             -- SOC code if available
  sector TEXT,                               -- "Healthcare", "Manufacturing", "IT", etc.
  priority_level TEXT DEFAULT 'high_demand', -- 'high_demand', 'critical', 'emerging', 'priority_sector'
  
  -- Program/funding context
  designation_source TEXT NOT NULL,          -- 'wioa_state_plan', 'future_ready_iowa', 'governor_list', 'workforce_board'
  scholarship_eligible BOOLEAN DEFAULT false,-- Eligible for state last-dollar or similar programs
  wioa_fundable BOOLEAN DEFAULT true,       -- WIOA training funds can be used
  etpl_required BOOLEAN DEFAULT false,      -- Must be on ETPL to access funds
  
  -- Wage data from the state's own reporting
  entry_hourly_wage NUMERIC,               -- state-reported entry-level hourly
  entry_annual_salary INTEGER,             -- state-reported entry-level annual
  median_annual_wage INTEGER,              -- if state reports median
  
  -- Timeframe
  effective_year TEXT NOT NULL,             -- "2024-2025", "2024-2027" (plan cycle)
  plan_cycle TEXT,                          -- "PY2024-2027" for WIOA plan cycle
  
  -- Source
  source_url TEXT,
  source_document TEXT,                    -- "Iowa Last-Dollar Scholarship High Demand List AY 26-27"
  last_verified TIMESTAMPTZ DEFAULT now(),
  verified_by TEXT DEFAULT 'system',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(state, occupation_title, effective_year)
);

CREATE INDEX IF NOT EXISTS idx_state_prio_state ON intel_state_priorities(state);
CREATE INDEX IF NOT EXISTS idx_state_prio_soc ON intel_state_priorities(soc_code);
CREATE INDEX IF NOT EXISTS idx_state_prio_sector ON intel_state_priorities(sector);
CREATE INDEX IF NOT EXISTS idx_state_prio_level ON intel_state_priorities(priority_level);

ALTER TABLE intel_state_priorities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intel_state_prio_all" ON intel_state_priorities FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER set_updated_at_intel_state_prio
  BEFORE UPDATE ON intel_state_priorities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
