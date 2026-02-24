-- Add human-readable report IDs to pipeline_runs
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS report_id text UNIQUE;

-- Create index for lookups
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_report_id ON pipeline_runs(report_id);

-- Backfill existing rows (all are claude-sonnet-4-6, dates 2026-02-23 and 2026-02-24)
-- Row ordering by created_at determines sequence number
WITH numbered AS (
  SELECT id, model, created_at,
    ROW_NUMBER() OVER (PARTITION BY DATE(created_at AT TIME ZONE 'UTC') ORDER BY created_at) as seq
  FROM pipeline_runs
  WHERE report_id IS NULL
)
UPDATE pipeline_runs p
SET report_id = 'WV-S46-' || TO_CHAR(n.created_at AT TIME ZONE 'UTC', 'YYYYMMDD') || '-' || LPAD(n.seq::text, 3, '0')
FROM numbered n
WHERE p.id = n.id;
