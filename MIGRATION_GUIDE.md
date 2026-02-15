# Database Migration Guide

## Overview
This document explains how to apply the database migrations for the Program Validation System.

## Prerequisites
- Access to your Supabase project dashboard
- OR Supabase CLI installed (`npm install -g supabase`)

## Method 1: Manual Migration (Recommended for MVP)

1. **Log into Supabase**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor" in the left sidebar

2. **Run Base Schema** (if not already done)
   - Copy the contents of `supabase/schema.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Run Migration 001: API Cache**
   - Copy the contents of `supabase/migrations/001_add_api_cache.sql`
   - Paste into SQL Editor
   - Click "Run"
   - This creates:
     - `api_cache` table
     - Cache lookup functions
     - Performance indexes

4. **Run Migration 002: Disable RLS**
   - Copy the contents of `supabase/migrations/002_disable_rls_for_testing.sql`
   - Paste into SQL Editor
   - Click "Run"
   - This temporarily disables RLS for MVP testing
   - **NOTE:** Re-enable RLS with proper auth in Phase 2

## Method 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Verify Migrations

After running migrations, verify in Supabase Dashboard:

1. **Check Tables**
   - Go to "Table Editor"
   - Verify `api_cache` table exists
   - Check existing tables (validation_projects, research_components, etc.)

2. **Check Functions**
   - Go to "Database" > "Functions"
   - Verify functions exist:
     - `get_or_fetch_api_data`
     - `store_api_cache`
     - `cleanup_expired_cache`

3. **Check Policies**
   - Go to "Authentication" > "Policies"
   - Verify policies are open for testing (showing "true" condition)

## Testing the Cache

Once migrations are applied, test the cache:

```sql
-- Check cache table exists
SELECT * FROM api_cache LIMIT 1;

-- After submitting a project, check for cached data
SELECT 
  api_name, 
  cache_key, 
  query_params, 
  hit_count, 
  created_at, 
  expires_at 
FROM api_cache 
ORDER BY created_at DESC;

-- View cache hit statistics
SELECT 
  api_name, 
  COUNT(*) as total_calls, 
  SUM(hit_count) as cache_hits,
  AVG(hit_count) as avg_reuse
FROM api_cache 
GROUP BY api_name;
```

## Troubleshooting

### Error: "relation already exists"
- This means the table was already created
- Safe to ignore if the schema matches

### Error: "policy already exists"
- Some policies might already exist
- Safe to drop and recreate, or skip

### Error: "permission denied"
- Make sure you're using the SQL Editor as the project owner
- Check that service role key has proper permissions

## Rollback (if needed)

To rollback migrations:

```sql
-- Remove API cache
DROP TABLE IF EXISTS api_cache CASCADE;
DROP FUNCTION IF EXISTS get_or_fetch_api_data;
DROP FUNCTION IF EXISTS store_api_cache;
DROP FUNCTION IF EXISTS cleanup_expired_cache;

-- Re-enable strict RLS (restore original policies)
-- See supabase/schema.sql for original policy definitions
```

## Next Steps

After migrations are complete:
1. Update `.env.local` with Supabase credentials
2. Test the application locally: `npm run dev`
3. Submit a test project (e.g., "Cybersecurity Certificate")
4. Check console logs for "Cache HIT" and "Cache MISS" messages
5. Verify real data appears in reports (not hallucinated)
