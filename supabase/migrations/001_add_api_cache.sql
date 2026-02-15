-- API Response Cache
create table if not exists api_cache (
  id uuid primary key default gen_random_uuid(),
  api_name text not null, -- 'serpapi', 'onet', 'bls'
  cache_key text not null, -- hash of query parameters
  query_params jsonb not null, -- original query for debugging
  response_data jsonb not null,
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  hit_count int default 0
);

-- Index for fast lookups
create index idx_api_cache_lookup on api_cache(api_name, cache_key)
  where expires_at > now();

-- Unique constraint to prevent duplicates
create unique index idx_api_cache_unique on api_cache(api_name, cache_key);

-- Function to get or fetch API data
create or replace function get_or_fetch_api_data(
  p_api_name text,
  p_cache_key text,
  p_query_params jsonb,
  p_ttl_hours int default 168 -- 7 days default
) returns jsonb as $$
declare
  v_cached_data jsonb;
begin
  -- Try to get from cache
  select response_data into v_cached_data
  from api_cache
  where api_name = p_api_name
    and cache_key = p_cache_key
    and expires_at > now();
  
  if found then
    -- Update hit count
    update api_cache
    set hit_count = hit_count + 1
    where api_name = p_api_name and cache_key = p_cache_key;
    
    return v_cached_data;
  else
    -- Cache miss - caller should fetch and store
    return null;
  end if;
end;
$$ language plpgsql;

-- Function to store API response
create or replace function store_api_cache(
  p_api_name text,
  p_cache_key text,
  p_query_params jsonb,
  p_response_data jsonb,
  p_ttl_hours int default 168
) returns void as $$
begin
  insert into api_cache (
    api_name,
    cache_key,
    query_params,
    response_data,
    expires_at
  ) values (
    p_api_name,
    p_cache_key,
    p_query_params,
    p_response_data,
    now() + (p_ttl_hours || ' hours')::interval
  )
  on conflict (api_name, cache_key)
  do update set
    response_data = excluded.response_data,
    expires_at = excluded.expires_at,
    hit_count = api_cache.hit_count + 1;
end;
$$ language plpgsql;

-- Cleanup old cache entries (run via cron)
create or replace function cleanup_expired_cache()
returns void as $$
begin
  delete from api_cache where expires_at < now();
end;
$$ language plpgsql;
