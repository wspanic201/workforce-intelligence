-- Run this in Supabase Dashboard > SQL Editor
CREATE TABLE IF NOT EXISTS discovery_checkpoints (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  run_key text NOT NULL,
  institution_name text NOT NULL,
  phase_number integer NOT NULL,
  phase_name text NOT NULL,
  phase_output jsonb NOT NULL,
  input_config jsonb NOT NULL DEFAULT '{}',
  runtime_seconds numeric,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(run_key, phase_number)
);

CREATE INDEX IF NOT EXISTS idx_discovery_checkpoints_run_key ON discovery_checkpoints(run_key);
CREATE INDEX IF NOT EXISTS idx_discovery_checkpoints_institution ON discovery_checkpoints(institution_name);
