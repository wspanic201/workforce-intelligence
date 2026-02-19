/**
 * WorkforceOS Database Types
 * Matches the schema in supabase/migrations/001_workforceos_schema.sql
 */

// ── Enums ──

export type ProgramStatus =
  | 'discovered'
  | 'validating'
  | 'validated'
  | 'designing'
  | 'designed'
  | 'in_development'
  | 'marketing'
  | 'launching'
  | 'active'
  | 'archived';

export type StageType =
  | 'discovery'
  | 'validation'
  | 'curriculum_design'
  | 'pathway_dev'
  | 'content'
  | 'marketing'
  | 'launch'
  | 'qc';

export type StageStatus = 'pending' | 'running' | 'complete' | 'error' | 'partial';

export type OutputType =
  | 'brief_markdown'
  | 'validation_report'
  | 'curriculum_doc'
  | 'structured_data'
  | 'executive_summary'
  | 'pdf_path'
  | 'agent_output';

export type ContentFormat = 'markdown' | 'json' | 'pdf_path' | 'html';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type DiscoveryTier = 'quick_win' | 'strategic_build' | 'emerging' | 'blue_ocean';

export type ValidationRecommendation = 'strong_go' | 'conditional_go' | 'cautious_proceed' | 'defer' | 'no_go';

// ── Table Types ──

export interface Institution {
  id: string;
  name: string;
  primary_city: string | null;
  additional_cities: string[];
  metro_area: string | null;
  counties: string | null;
  state: string | null;
  website: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  institution_id: string;
  title: string;
  description: string | null;
  occupation: string | null;
  soc_code: string | null;
  sector: string | null;
  level: string | null;
  discovery_score: number | null;
  discovery_tier: DiscoveryTier | null;
  discovery_method: string | null;
  validation_score: number | null;
  validation_recommendation: ValidationRecommendation | null;
  status: ProgramStatus;
  created_at: string;
  updated_at: string;
}

export interface ProgramStage {
  id: string;
  program_id: string;
  institution_id: string;
  stage_type: StageType;
  stage_number: number | null;
  status: StageStatus;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  total_searches: number;
  total_api_calls: number;
  model_used: string | null;
  cost_estimate: number | null;
  error_message: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface StageOutput {
  id: string;
  stage_id: string;
  institution_id: string;
  output_type: OutputType;
  content: string | null;
  content_format: ContentFormat;
  word_count: number | null;
  page_count: number | null;
  version: number;
  created_at: string;
}

export interface StageCitation {
  id: string;
  stage_id: string;
  institution_id: string;
  finding: string;
  source_name: string;
  source_url: string | null;
  retrieval_date: string;
  data_period: string | null;
  confidence: ConfidenceLevel | null;
  methodology: string | null;
  agent_name: string | null;
  program_title: string | null;
  created_at: string;
}

// ── Insert Types (omit auto-generated fields) ──

export type InstitutionInsert = Omit<Institution, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type ProgramInsert = Omit<Program, 'id' | 'created_at' | 'updated_at' | 'status'> & {
  id?: string;
  status?: ProgramStatus;
};

export type ProgramStageInsert = {
  program_id: string;
  institution_id: string;
  stage_type: StageType;
  id?: string;
  stage_number?: number | null;
  status?: StageStatus;
  started_at?: string | null;
  completed_at?: string | null;
  duration_seconds?: number | null;
  total_searches?: number;
  total_api_calls?: number;
  model_used?: string | null;
  cost_estimate?: number | null;
  error_message?: string | null;
  metadata?: Record<string, any>;
};

export type StageOutputInsert = {
  stage_id: string;
  institution_id: string;
  output_type: OutputType;
  id?: string;
  content?: string | null;
  content_format?: ContentFormat;
  word_count?: number | null;
  page_count?: number | null;
  version?: number;
};

export type StageCitationInsert = {
  stage_id: string;
  institution_id: string;
  finding: string;
  source_name: string;
  id?: string;
  source_url?: string | null;
  retrieval_date?: string;
  data_period?: string | null;
  confidence?: ConfidenceLevel | null;
  methodology?: string | null;
  agent_name?: string | null;
  program_title?: string | null;
};


// ── Curriculum Drift Analysis Types ──

export interface DriftProgram {
  id: string;
  institution_name: string;
  contact_email: string | null;
  program_name: string;
  occupation_title: string;
  soc_code: string | null;
  curriculum_description: string;
  last_curriculum_update: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriftProgramInsert {
  institution_name: string;
  contact_email?: string;
  program_name: string;
  occupation_title: string;
  soc_code?: string;
  curriculum_description: string;
  last_curriculum_update?: string;
}

export interface DriftScan {
  id: string;
  program_id: string;
  scanned_at: string;
  postings_analyzed: number | null;
  employer_skills: Record<string, unknown>[] | null;
  covered_skills: string[] | null;
  gap_skills: string[] | null;
  stale_skills: string[] | null;
  drift_score: number | null;
  drift_level: 'aligned' | 'minor' | 'moderate' | 'significant' | 'critical' | null;
  drift_delta: number | null;
  narrative: string | null;
  recommendations: string[] | null;
  report_html: string | null;
  report_pdf_path: string | null;
}
