/**
 * Article deduplication for The Signal newsletter.
 * Stores used article URLs in Supabase to prevent repeats across editions.
 * 
 * Uses a simple key-value approach on the signal_used_articles table.
 * Falls back gracefully if Supabase is unavailable — newsletter still sends,
 * just without dedup guarantees.
 */

import { getSupabaseServerClient } from '@/lib/supabase/client';

const TABLE = 'signal_used_articles';
const MAX_AGE_DAYS = 14; // Articles older than 2 weeks can be reused

/**
 * Filter out articles that were used in recent Signal editions.
 * Returns only articles whose URLs haven't been seen in the last MAX_AGE_DAYS.
 */
export async function filterUsedArticles(
  articles: { url: string; [key: string]: any }[]
): Promise<typeof articles> {
  try {
    const supabase = getSupabaseServerClient();
    const urls = articles.map(a => a.url).filter(Boolean);
    
    if (urls.length === 0) return articles;

    const { data: usedRows, error } = await supabase
      .from(TABLE)
      .select('url')
      .in('url', urls);

    if (error) {
      // Table might not exist yet — that's fine, return all articles
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('[Signal:Dedup] Table does not exist yet — skipping dedup');
        return articles;
      }
      console.warn('[Signal:Dedup] Query failed, skipping dedup:', error.message);
      return articles;
    }

    const usedUrls = new Set((usedRows || []).map(r => r.url));
    const filtered = articles.filter(a => !usedUrls.has(a.url));

    const removed = articles.length - filtered.length;
    if (removed > 0) {
      console.log(`[Signal:Dedup] Filtered out ${removed} previously used articles`);
    }

    return filtered;
  } catch (err) {
    console.warn('[Signal:Dedup] Error during dedup, proceeding without:', err);
    return articles;
  }
}

/**
 * Mark articles as used after a successful newsletter send.
 * Call this AFTER the broadcast succeeds.
 */
export async function markArticlesUsed(urls: string[]): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    const validUrls = urls.filter(Boolean);
    
    if (validUrls.length === 0) return;

    const rows = validUrls.map(url => ({
      url,
      used_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from(TABLE)
      .upsert(rows, { onConflict: 'url' });

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('[Signal:Dedup] Table does not exist — skipping mark. Run migration to enable dedup.');
        return;
      }
      console.warn('[Signal:Dedup] Failed to mark articles:', error.message);
      return;
    }

    console.log(`[Signal:Dedup] Marked ${validUrls.length} articles as used`);
  } catch (err) {
    console.warn('[Signal:Dedup] Error marking articles:', err);
  }
}

/**
 * Clean up old entries (call periodically or on each run).
 */
export async function cleanupOldArticles(): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from(TABLE)
      .delete()
      .lt('used_at', cutoff);

    if (error && error.code !== '42P01') {
      console.warn('[Signal:Dedup] Cleanup failed:', error.message);
    }
  } catch (err) {
    // Silent fail — cleanup is best-effort
  }
}
