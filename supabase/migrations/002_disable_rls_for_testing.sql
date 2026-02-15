-- TEMPORARY: Disable RLS for MVP testing
-- Re-enable with proper auth in Phase 2

drop policy if exists "Users can view their own projects" on validation_projects;
drop policy if exists "Users can create their own projects" on validation_projects;
drop policy if exists "Users can update their own projects" on validation_projects;

create policy "Public can view all projects during testing"
  on validation_projects for select
  using (true);

create policy "Public can create projects during testing"
  on validation_projects for insert
  with check (true);

create policy "Public can update projects during testing"
  on validation_projects for update
  using (true);

-- Similar for research_components
drop policy if exists "Users can view components of their projects" on research_components;
drop policy if exists "System can create research components" on research_components;
drop policy if exists "System can update research components" on research_components;

create policy "Public can view all components" on research_components for select using (true);
create policy "Public can insert components" on research_components for insert with check (true);
create policy "Public can update components" on research_components for update using (true);

-- Similar for validation_reports
drop policy if exists "Users can view reports of their projects" on validation_reports;
drop policy if exists "System can create reports" on validation_reports;

create policy "Public can view all reports" on validation_reports for select using (true);
create policy "Public can insert reports" on validation_reports for insert with check (true);

-- Similar for agent_sessions
drop policy if exists "Users can view session logs of their projects" on agent_sessions;
drop policy if exists "System can create session logs" on agent_sessions;

create policy "Public can view all sessions" on agent_sessions for select using (true);
create policy "Public can insert sessions" on agent_sessions for insert with check (true);

-- Add comment for Phase 2
comment on table validation_projects is 'RLS disabled for MVP testing - re-enable with Supabase Auth in Phase 2';
comment on table research_components is 'RLS disabled for MVP testing - re-enable with Supabase Auth in Phase 2';
comment on table validation_reports is 'RLS disabled for MVP testing - re-enable with Supabase Auth in Phase 2';
comment on table agent_sessions is 'RLS disabled for MVP testing - re-enable with Supabase Auth in Phase 2';
