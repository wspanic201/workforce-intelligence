-- Add unique constraint for wage upserts
ALTER TABLE intel_wages ADD CONSTRAINT intel_wages_soc_geo_unique UNIQUE (soc_code, geo_level, geo_code);
