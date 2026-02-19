import { searchJobs } from '@/lib/apis/web-research';

export interface RawPosting {
  title: string;
  company: string;
  description: string;
  location?: string;
}

export async function scanJobPostings(
  occupationTitle: string,
  socCode?: string,
  options: { count?: number; location?: string } = {}
): Promise<RawPosting[]> {
  // Search for current job postings for this occupation
  // Use multiple query variations to get diverse results
  // Return array of postings with title + description

  const queries = [
    `"${occupationTitle}" job requirements skills`,
    `${occupationTitle} hiring qualifications`,
    ...(socCode ? [`${occupationTitle} ${socCode} job posting`] : []),
  ];

  const allPostings: RawPosting[] = [];

  for (const query of queries.slice(0, 2)) {
    try {
      const results = await searchJobs(query, options.location || 'United States');
      allPostings.push(...results.jobs.map(j => ({
        title: j.title,
        company: j.company,
        description: j.description,
        location: j.location,
      })));
    } catch (err) {
      console.warn(`[DriftScanner] Query failed: ${query}`, err);
    }
  }

  // Deduplicate by description similarity (simple: dedupe by company+title)
  const seen = new Set<string>();
  return allPostings.filter(p => {
    const key = `${p.company}:${p.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
