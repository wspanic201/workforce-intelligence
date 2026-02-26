-- Ensure discovery_projects exists in remote environments.
create table if not exists public.discovery_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  institution_name text not null,
  geographic_area text not null,
  current_programs text[] default '{}',
  status text not null default 'pending',
  results jsonb,
  report_markdown text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_discovery_projects_user_id on public.discovery_projects(user_id);
create index if not exists idx_discovery_projects_status on public.discovery_projects(status);
create index if not exists idx_discovery_projects_created_at on public.discovery_projects(created_at desc);

create or replace function public.set_updated_at_discovery_projects()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_discovery_projects_updated_at on public.discovery_projects;
create trigger trg_discovery_projects_updated_at
before update on public.discovery_projects
for each row execute function public.set_updated_at_discovery_projects();
