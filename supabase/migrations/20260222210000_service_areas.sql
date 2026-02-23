-- Service Area Mapping: Institutions → Counties
-- Maps each institution to the counties in its service area
-- Enables aggregated economic profiles (CBP + demographics + wages)

CREATE TABLE IF NOT EXISTS intel_service_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES intel_institutions(id) ON DELETE CASCADE,
  county_fips TEXT NOT NULL,           -- 5-digit FIPS (state + county)
  county_name TEXT NOT NULL,
  state TEXT NOT NULL,                 -- 2-letter state code
  is_primary BOOLEAN DEFAULT false,    -- County where main campus is located
  source TEXT,                         -- 'official_designation', 'state_map', 'self_reported'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, county_fips)
);

CREATE INDEX IF NOT EXISTS idx_service_area_inst ON intel_service_areas(institution_id);
CREATE INDEX IF NOT EXISTS idx_service_area_county ON intel_service_areas(county_fips);
CREATE INDEX IF NOT EXISTS idx_service_area_state ON intel_service_areas(state);

ALTER TABLE intel_service_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intel_service_areas_all" ON intel_service_areas FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER set_updated_at_intel_service_areas
  BEFORE UPDATE ON intel_service_areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
