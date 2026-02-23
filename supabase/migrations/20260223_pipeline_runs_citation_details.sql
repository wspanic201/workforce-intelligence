-- Add citation details column for storing full warning/correction text for admin review
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS citation_details JSONB DEFAULT '{}';

COMMENT ON COLUMN pipeline_runs.citation_details IS 'Full citation agent output: corrections, warnings, data sources — for internal admin review only, never shown to clients';
