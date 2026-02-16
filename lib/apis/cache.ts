import { getSupabaseServerClient } from '@/lib/supabase/client';
import crypto from 'crypto';

export async function withCache<T>(
  apiName: string,
  queryParams: Record<string, any>,
  fetcher: () => Promise<T>,
  ttlHours: number = 168 // 7 days
): Promise<T> {
  // TEMPORARY: Bypass cache until APIs are validated (poisoned cache issue)
  console.log(`[Cache BYPASS] Fetching fresh ${apiName} (cache disabled)`);
  return fetcher();
  
  const supabase = getSupabaseServerClient();

  // Generate cache key from query params
  const cacheKey = crypto
    .createHash('sha256')
    .update(JSON.stringify(queryParams))
    .digest('hex');

  try {
    // Check cache
    const { data: cached, error } = await supabase.rpc('get_or_fetch_api_data', {
      p_api_name: apiName,
      p_cache_key: cacheKey,
      p_query_params: queryParams,
      p_ttl_hours: ttlHours,
    });

    if (!error && cached) {
      console.log(`[Cache HIT] ${apiName}:${cacheKey.substring(0, 8)}`);
      return cached as T;
    }

    console.log(`[Cache MISS] ${apiName}:${cacheKey.substring(0, 8)} - fetching...`);

    // Cache miss - fetch fresh data
    const freshData = await fetcher();

    // Store in cache
    await supabase.rpc('store_api_cache', {
      p_api_name: apiName,
      p_cache_key: cacheKey,
      p_query_params: queryParams,
      p_response_data: freshData,
      p_ttl_hours: ttlHours,
    });

    return freshData;
  } catch (error) {
    console.error(`[Cache] Error for ${apiName}:`, error);
    // On cache error, fall back to direct fetch
    return fetcher();
  }
}
