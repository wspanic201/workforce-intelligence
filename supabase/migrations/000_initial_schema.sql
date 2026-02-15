-- Program Validation System Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Validation Projects
create table if not exists validation_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  client_name text not null,
  client_email text not null,
  program_name text not null,
  program_type text,
  target_audience text,
  constraints text,
  status text not null default 'intake',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

-- Research Components
create table if not exists research_components (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references validation_projects not null,
  component_type text not null,
  agent_persona text not null,
  content jsonb not null default '{}'::jsonb,
  markdown_output text,
  status text not null default 'pending',
  error_message text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Final Reports
create table if not exists validation_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references validation_projects not null,
  executive_summary text,
  full_report_markdown text not null,
  pdf_url text,
  version int default 1,
  created_at timestamptz default now()
);

-- Agent Sessions Log
create table if not exists agent_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references validation_projects,
  component_id uuid references research_components,
  agent_type text not null,
  persona text,
  prompt text,
  response text,
  tokens_used int,
  duration_ms int,
  status text,
  error_message text,
  created_at timestamptz default now()
);

-- Row Level Security (RLS) Policies
alter table validation_projects enable row level security;
alter table research_components enable row level security;
alter table validation_reports enable row level security;
alter table agent_sessions enable row level security;

-- Policies for validation_projects
create policy "Users can view their own projects"
  on validation_projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on validation_projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on validation_projects for update
  using (auth.uid() = user_id);

-- Policies for research_components
create policy "Users can view components of their projects"
  on research_components for select
  using (
    exists (
      select 1 from validation_projects
      where validation_projects.id = research_components.project_id
      and validation_projects.user_id = auth.uid()
    )
  );

create policy "System can create research components"
  on research_components for insert
  with check (true);

create policy "System can update research components"
  on research_components for update
  using (true);

-- Policies for validation_reports
create policy "Users can view reports of their projects"
  on validation_reports for select
  using (
    exists (
      select 1 from validation_projects
      where validation_projects.id = validation_reports.project_id
      and validation_projects.user_id = auth.uid()
    )
  );

create policy "System can create reports"
  on validation_reports for insert
  with check (true);

-- Policies for agent_sessions
create policy "Users can view session logs of their projects"
  on agent_sessions for select
  using (
    exists (
      select 1 from validation_projects
      where validation_projects.id = agent_sessions.project_id
      and validation_projects.user_id = auth.uid()
    )
  );

create policy "System can create session logs"
  on agent_sessions for insert
  with check (true);

-- Indexes for performance
create index idx_validation_projects_user_id on validation_projects(user_id);
create index idx_validation_projects_status on validation_projects(status);
create index idx_research_components_project_id on research_components(project_id);
create index idx_research_components_status on research_components(status);
create index idx_validation_reports_project_id on validation_reports(project_id);
create index idx_agent_sessions_project_id on agent_sessions(project_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for validation_projects
create trigger update_validation_projects_updated_at
  before update on validation_projects
  for each row
  execute function update_updated_at_column();
