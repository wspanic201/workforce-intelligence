/**
 * context.ts
 *
 * Shared pipeline context — pre-fetches external API data ONCE and makes
 * it available to all agents. Eliminates duplicate SerpAPI / Brave / O*NET
 * calls across agents running in the same pipeline.
 */

import { getProjectIntel, formatIntelBlock, type StructuredProjectIntel } from '@/lib/intelligence/project-intel';
import { searchGoogleJobs } from '@/lib/apis/serpapi';
import { searchJobsBraveEnhanced } from '@/lib/apis/brave-jobs';
import { withCache } from '@/lib/apis/cache';

// ── Types ───────────────────────────────────────────────────────────────────

export interface JobsSearchResult {
  count: number;
  topEmployers: Array<{ name: string; openings: number }>;
  source: 'serpapi' | 'brave' | 'none';
}

export interface PipelineContext {
  /** The enriched project data */
  project: Record<string, any>;
  /** Intel from lookup.ts (wages, projections, skills, etc.) */
  intel: StructuredProjectIntel;
  /** Formatted text block ready for prompt injection */
  intelBlock: string;
  /** Job postings data (SerpAPI or Brave fallback) */
  jobs: JobsSearchResult;
  /** Target occupation extracted from project */
  targetOccupation: string;
  /** Geographic location */
  location: string;
}

// ── Builder ─────────────────────────────────────────────────────────────────

/**
 * Build a shared pipeline context by pre-fetching all external data once.
 * Pass this context to every agent so they share the same data.
 */
export async function buildPipelineContext(
  project: Record<string, any>
): Promise<PipelineContext> {
  const targetOccupation = project.target_occupation ||
    (project.program_name || '').replace(/\s*(certificate|diploma|degree|program|associate|bachelor|training|course)/gi, '').trim();
  const location = project.geographic_area || 'United States';

  // Fetch intel and jobs in parallel
  const [intel, jobs] = await Promise.all([
    getProjectIntel(project),
    fetchJobs(targetOccupation, location),
  ]);

  const intelBlock = formatIntelBlock(intel);

  // Attach to project for backward compatibility
  project._mcpIntel = intel.text;
  project._mcpIntelBlock = intelBlock;
  project._pipelineContext = true;

  return {
    project,
    intel,
    intelBlock,
    jobs,
    targetOccupation,
    location,
  };
}

// ── Jobs fetcher (SerpAPI → Brave fallback) ─────────────────────────────────

async function fetchJobs(occupation: string, location: string): Promise<JobsSearchResult> {
  const noJobs: JobsSearchResult = { count: 0, topEmployers: [], source: 'none' };

  // Try SerpAPI first
  try {
    const jobsData = await withCache(
      'pipeline_jobs',
      { occupation, location },
      () => searchGoogleJobs(occupation, location),
      168 // 7 days
    );

    if (jobsData && jobsData.topEmployers.length > 0) {
      console.log(`[PipelineContext] SerpAPI: ~${jobsData.count} postings, top employer: ${jobsData.topEmployers[0]?.name}`);
      return {
        count: jobsData.count,
        topEmployers: jobsData.topEmployers.slice(0, 15),
        source: 'serpapi',
      };
    }
  } catch (err) {
    console.warn('[PipelineContext] SerpAPI failed, trying Brave:', (err as Error).message);
  }

  // Brave fallback
  try {
    const jobsData = await withCache(
      'pipeline_jobs_brave',
      { occupation, location },
      () => searchJobsBraveEnhanced(occupation, location),
      24 // 1 day
    );

    if (jobsData && jobsData.topEmployers.length > 0) {
      console.log(`[PipelineContext] Brave fallback: ~${jobsData.count} postings`);
      return {
        count: jobsData.count,
        topEmployers: jobsData.topEmployers.slice(0, 15),
        source: 'brave',
      };
    }
  } catch (err) {
    console.warn('[PipelineContext] Brave fallback failed:', (err as Error).message);
  }

  console.log('[PipelineContext] No job postings data available');
  return noJobs;
}
