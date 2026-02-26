alter table public.run_jobs
  add column if not exists model_override text,
  add column if not exists model_profile text,
  add column if not exists persona_slugs text[];

create index if not exists idx_run_jobs_model_profile on public.run_jobs(model_profile);
