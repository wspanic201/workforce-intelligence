-- Phase B: validation resumability + observability

CREATE TABLE IF NOT EXISTS validation_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES validation_projects(id) ON DELETE CASCADE,
  stage_key TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  attempts INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, stage_key)
);

CREATE TABLE IF NOT EXISTS pipeline_run_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_run_id UUID REFERENCES pipeline_runs(id) ON DELETE SET NULL,
  project_id UUID NOT NULL REFERENCES validation_projects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  stage_key TEXT,
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_validation_checkpoints_project
  ON validation_checkpoints(project_id);
CREATE INDEX IF NOT EXISTS idx_validation_checkpoints_created
  ON validation_checkpoints(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pipeline_run_events_project
  ON pipeline_run_events(project_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_run_events_run
  ON pipeline_run_events(pipeline_run_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_run_events_created
  ON pipeline_run_events(created_at DESC);

ALTER TABLE validation_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_run_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access only validation checkpoints" ON validation_checkpoints
  FOR ALL USING (true);

CREATE POLICY "Admin access only pipeline run events" ON pipeline_run_events
  FOR ALL USING (true);
