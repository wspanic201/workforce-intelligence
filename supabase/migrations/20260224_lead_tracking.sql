-- Signal newsletter subscribers
create table if not exists signal_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text,
  institution text,
  source text default 'website',
  created_at timestamptz default now()
);

-- Pell audit tool usage (lead tracking)
create table if not exists pell_checks (
  id uuid primary key default gen_random_uuid(),
  institution_name text not null,
  state text,
  city text,
  email text,
  created_at timestamptz default now()
);

-- Indexes for cron queries
create index if not exists signal_subscribers_created_at on signal_subscribers(created_at desc);
create index if not exists pell_checks_created_at on pell_checks(created_at desc);
