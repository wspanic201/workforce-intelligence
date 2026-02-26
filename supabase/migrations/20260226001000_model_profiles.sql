-- Phase C+ admin model profile CRUD

create table if not exists model_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  model text not null,
  description text,
  is_active boolean not null default true,
  is_default boolean not null default false,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_model_profiles_active on model_profiles (is_active);
create index if not exists idx_model_profiles_default on model_profiles (is_default);

insert into model_profiles (slug, display_name, model, description, is_active, is_default)
values
  ('balanced-sonnet', 'Balanced (Sonnet 4.6)', 'claude-sonnet-4-6', 'Default quality/speed tradeoff for production runs.', true, true),
  ('deep-opus', 'Deep Reasoning (Opus 4.6)', 'claude-opus-4-6', 'Higher-depth analysis, slower and costlier.', true, false),
  ('fast-haiku', 'Fast Draft (Haiku 3.5)', 'claude-3-5-haiku-20241022', 'Cheapest/faster checks and dry runs.', true, false)
on conflict (slug) do nothing;

-- Keep a single default profile.
with preferred as (
  select id from model_profiles where slug = 'balanced-sonnet' limit 1
), fallback as (
  select id from model_profiles order by created_at asc limit 1
), chosen as (
  select id from preferred
  union all
  select id from fallback where not exists (select 1 from preferred)
  limit 1
)
update model_profiles
set is_default = (id = (select id from chosen));
