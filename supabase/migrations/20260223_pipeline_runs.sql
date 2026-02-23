-- Pipeline run tracking for internal quality management
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES validation_projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Pipeline config snapshot
  pipeline_version TEXT NOT NULL DEFAULT 'v2.0',
  model TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  prompt_version TEXT,
  report_template TEXT DEFAULT 'professional-v2',
  config JSONB DEFAULT '{}',

  -- Execution metrics
  runtime_seconds NUMERIC,
  total_tokens INTEGER,
  estimated_cost_usd NUMERIC(8,4),
  agents_run TEXT[] DEFAULT '{}',
  agent_scores JSONB DEFAULT '{}',
  composite_score NUMERIC(3,1),
  recommendation TEXT,
  citation_corrections INTEGER DEFAULT 0,
  citation_warnings INTEGER DEFAULT 0,
  intel_tables_used INTEGER DEFAULT 0,
  tiger_team_enabled BOOLEAN DEFAULT true,

  -- Internal quality review (admin fills in after reviewing)
  review_scores JSONB,  -- {accuracy: 4, narrative: 5, actionability: 4, citations: 5, formatting: 3, overall: 4}
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT DEFAULT 'matt',

  -- Report output reference
  report_version INTEGER DEFAULT 1,
  report_markdown_hash TEXT,  -- SHA256 of the markdown for change detection
  report_page_count INTEGER,
  report_size_kb INTEGER
);

CREATE INDEX idx_pipeline_runs_project ON pipeline_runs(project_id);
CREATE INDEX idx_pipeline_runs_created ON pipeline_runs(created_at DESC);
CREATE INDEX idx_pipeline_runs_reviewed ON pipeline_runs(reviewed_at) WHERE reviewed_at IS NOT NULL;

-- No RLS — admin-only table accessed via service role
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;

-- Admin policy (service role bypasses RLS, but add a permissive policy for safety)
CREATE POLICY "Admin access only" ON pipeline_runs
  FOR ALL USING (true);
