create table if not exists public.run_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  project_id uuid not null references public.validation_projects(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','running','completed','failed')),
  attempts int not null default 0,
  max_attempts int not null default 3,
  requested_by text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_run_jobs_status_created_at on public.run_jobs(status, created_at);
create index if not exists idx_run_jobs_order_id on public.run_jobs(order_id);
create index if not exists idx_run_jobs_project_id on public.run_jobs(project_id);

create or replace function public.set_updated_at_run_jobs()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_run_jobs_updated_at on public.run_jobs;
create trigger trg_run_jobs_updated_at
before update on public.run_jobs
for each row execute function public.set_updated_at_run_jobs();
