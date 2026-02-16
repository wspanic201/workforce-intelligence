-- Create discovery_projects table for Program Discovery Report product
-- This is the lower-ticket ($997-$1,497) product that feeds into full validations

CREATE TABLE IF NOT EXISTS discovery_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Input fields
  institution_name TEXT NOT NULL,
  geographic_area TEXT NOT NULL,
  current_programs JSONB DEFAULT '[]'::jsonb,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  -- Status values: pending, scanning, analyzing_gaps, mapping_programs, scoring, completed, partial, error
  
  -- Results storage
  results JSONB,
  -- Structure: { regionalScan, gapAnalysis, programRecommendations, executiveSummary, errors }
  
  report_markdown TEXT,
  -- The full markdown report ready for customer delivery
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_discovery_projects_user_id ON discovery_projects(user_id);
CREATE INDEX idx_discovery_projects_status ON discovery_projects(status);
CREATE INDEX idx_discovery_projects_created_at ON discovery_projects(created_at DESC);

-- Enable Row Level Security
ALTER TABLE discovery_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own discovery projects
CREATE POLICY "Users can view own discovery projects"
  ON discovery_projects
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert their own discovery projects
CREATE POLICY "Users can create discovery projects"
  ON discovery_projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own discovery projects
CREATE POLICY "Users can update own discovery projects"
  ON discovery_projects
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can delete their own discovery projects
CREATE POLICY "Users can delete own discovery projects"
  ON discovery_projects
  FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Add comment for documentation
COMMENT ON TABLE discovery_projects IS 'Program Discovery Report projects - lower-ticket product that scans regional labor markets and delivers ranked program opportunities';

COMMENT ON COLUMN discovery_projects.institution_name IS 'Name of the institution (college/university)';
COMMENT ON COLUMN discovery_projects.geographic_area IS 'Geographic region to scan (e.g., "Cedar Rapids, Iowa")';
COMMENT ON COLUMN discovery_projects.current_programs IS 'Array of existing programs the institution offers (optional)';
COMMENT ON COLUMN discovery_projects.status IS 'Current status: pending, scanning, analyzing_gaps, mapping_programs, scoring, completed, partial, error';
COMMENT ON COLUMN discovery_projects.results IS 'Full results from discovery scan (regionalScan, gapAnalysis, programRecommendations, etc.)';
COMMENT ON COLUMN discovery_projects.report_markdown IS 'Professional markdown report ready for customer delivery';
