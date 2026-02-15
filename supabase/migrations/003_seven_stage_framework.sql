-- Migration: 7-Stage Program Validator Framework
-- Adds scoring columns and expanded project fields

-- Add score columns to research_components
ALTER TABLE research_components ADD COLUMN IF NOT EXISTS dimension_score DECIMAL;
ALTER TABLE research_components ADD COLUMN IF NOT EXISTS score_rationale TEXT;

-- Add overall score to validation_reports
ALTER TABLE validation_reports ADD COLUMN IF NOT EXISTS composite_score DECIMAL;
ALTER TABLE validation_reports ADD COLUMN IF NOT EXISTS recommendation TEXT;
ALTER TABLE validation_reports ADD COLUMN IF NOT EXISTS scorecard JSONB;

-- Add expanded intake fields to validation_projects
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS program_description TEXT;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS target_occupation TEXT;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS geographic_area TEXT DEFAULT 'Iowa';
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS target_learner_profile TEXT;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS delivery_format TEXT;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS estimated_program_length TEXT;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS estimated_tuition TEXT;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS institutional_capacity TEXT;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS employer_interest TEXT;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS strategic_context TEXT;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS competing_programs TEXT;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS soc_codes TEXT;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS onet_codes TEXT;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS target_enrollment_per_cohort INTEGER;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS desired_start_date TEXT;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS stackable_credential BOOLEAN DEFAULT FALSE;
ALTER TABLE validation_projects ADD COLUMN IF NOT EXISTS funding_sources JSONB DEFAULT '[]'::JSONB;
