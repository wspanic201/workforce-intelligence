export type ProjectStatus = 'intake' | 'researching' | 'review' | 'completed' | 'error';
export type ComponentStatus = 'pending' | 'in_progress' | 'completed' | 'error';
export type ComponentType = 
  | 'market_analysis'       // Stage 1: Labor Market (legacy name kept for compat)
  | 'labor_market'          // Stage 1: Labor Market (new)
  | 'competitive_landscape' // Stage 2
  | 'learner_demand'        // Stage 3
  | 'curriculum_design'     // Legacy
  | 'financial_projections' // Legacy
  | 'financial_viability'   // Stage 4
  | 'institutional_fit'     // Stage 5
  | 'regulatory_compliance' // Stage 6
  | 'employer_demand'       // Stage 7
  | 'marketing_strategy'    // Legacy
  | 'tiger_team_synthesis';

export type LearnerProfile = 'career_changers' | 'upskilling' | 'unemployed' | 'incumbent_workers' | 'other';
export type DeliveryFormat = 'in_person' | 'online' | 'hybrid' | 'self_paced';
export type FundingSource = 'perkins_v' | 'wioa' | 'employer_sponsored' | 'self_pay' | 'grant';

export interface ValidationProject {
  id: string;
  user_id?: string;
  client_name: string;
  client_email: string;
  program_name: string;
  program_type?: string;
  program_description?: string;
  target_audience?: string;
  target_occupation?: string;
  geographic_area?: string;
  constraints?: string;
  // New framework fields
  target_learner_profile?: LearnerProfile;
  delivery_format?: DeliveryFormat;
  estimated_program_length?: string;
  estimated_tuition?: string;
  institutional_capacity?: string;
  employer_interest?: string;
  strategic_context?: string;
  competing_programs?: string;
  soc_codes?: string;
  onet_codes?: string;
  industry_sector?: string;
  program_level?: string;
  target_enrollment_per_cohort?: number;
  desired_start_date?: string;
  stackable_credential?: boolean;
  funding_sources?: FundingSource[];
  // Status
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ResearchComponent {
  id: string;
  project_id: string;
  component_type: ComponentType;
  agent_persona: string;
  content: Record<string, any>;
  markdown_output?: string;
  status: ComponentStatus;
  error_message?: string;
  dimension_score?: number;
  score_rationale?: string;
  created_at: string;
  completed_at?: string;
}

export interface ValidationReport {
  id: string;
  project_id: string;
  executive_summary?: string;
  full_report_markdown: string;
  pdf_url?: string;
  version: number;
  composite_score?: number;
  recommendation?: string;
  scorecard?: Record<string, any>;
  created_at: string;
}

export interface AgentSession {
  id: string;
  project_id?: string;
  component_id?: string;
  agent_type: string;
  persona?: string;
  prompt?: string;
  response?: string;
  tokens_used?: number;
  duration_ms?: number;
  status?: 'success' | 'error';
  error_message?: string;
  created_at: string;
}
