export type ProjectStatus = 'intake' | 'researching' | 'review' | 'completed' | 'error';
export type ComponentStatus = 'pending' | 'in_progress' | 'completed' | 'error';
export type ComponentType = 
  | 'market_analysis' 
  | 'competitive_landscape' 
  | 'curriculum_design' 
  | 'financial_projections' 
  | 'marketing_strategy'
  | 'tiger_team_synthesis';

export interface ValidationProject {
  id: string;
  user_id?: string;
  client_name: string;
  client_email: string;
  program_name: string;
  program_type?: string;
  target_audience?: string;
  constraints?: string;
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
