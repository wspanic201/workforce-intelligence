export interface GoogleJobsResult {
  jobs_count: number;
  jobs: Array<{
    title: string;
    company_name: string;
    location: string;
    description: string;
    detected_extensions?: {
      salary?: string;
      posted_at?: string;
    };
  }>;
}

export interface ProcessedJobData {
  count: number;
  salaries: {
    min: number;
    max: number;
    median: number;
    ranges: {
      entry: string;
      mid: string;
      senior: string;
    };
  };
  topEmployers: Array<{ name: string; openings: number }>;
  requiredSkills: Array<{ skill: string; frequency: number }>;
  certifications: Array<{ cert: string; frequency: number }>;
}

export async function searchGoogleJobs(
  occupation: string,
  location: string = 'United States'
): Promise<ProcessedJobData> {
  const params = new URLSearchParams({
    engine: 'google_jobs',
    q: occupation,
    location: location,
    api_key: process.env.SERPAPI_KEY!,
  });

  const response = await fetch(`https://serpapi.com/search.json?${params}`, {
    signal: AbortSignal.timeout(30000), // 30 sec timeout
  });

  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.statusText}`);
  }

  const data: GoogleJobsResult = await response.json();

  return processJobData(data);
}

function processJobData(data: GoogleJobsResult): ProcessedJobData {
  const jobs = data.jobs || [];

  // Extract salaries
  const salaries = jobs
    .map(j => j.detected_extensions?.salary)
    .filter((salary): salary is string => Boolean(salary))
    .map(parseSalaryRange)
    .filter(s => s.min > 0);

  const allSalaries = salaries.flatMap(s => [s.min, s.max]);
  const sortedSalaries = allSalaries.sort((a, b) => a - b);

  const salaryData = {
    min: sortedSalaries[0] || 0,
    max: sortedSalaries[sortedSalaries.length - 1] || 0,
    median: sortedSalaries[Math.floor(sortedSalaries.length / 2)] || 0,
    ranges: {
      entry: formatSalaryRange(
        sortedSalaries.slice(0, Math.floor(sortedSalaries.length * 0.33))
      ),
      mid: formatSalaryRange(
        sortedSalaries.slice(
          Math.floor(sortedSalaries.length * 0.33),
          Math.floor(sortedSalaries.length * 0.67)
        )
      ),
      senior: formatSalaryRange(
        sortedSalaries.slice(Math.floor(sortedSalaries.length * 0.67))
      ),
    },
  };

  // Extract top employers
  const employerCounts = new Map<string, number>();
  jobs.forEach(job => {
    const count = employerCounts.get(job.company_name) || 0;
    employerCounts.set(job.company_name, count + 1);
  });

  const topEmployers = Array.from(employerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, openings]) => ({ name, openings }));

  // Extract skills from job descriptions
  const skillKeywords = [
    'Python', 'Java', 'JavaScript', 'SQL', 'AWS', 'Azure', 'Docker',
    'Kubernetes', 'React', 'Node.js', 'Communication', 'Leadership',
    'Project Management', 'Agile', 'Scrum', 'CISSP', 'Security+',
    'CompTIA', 'CEH', 'CISM', 'PMP', 'Six Sigma', 'Lean',
    'Network Security', 'Penetration Testing', 'Firewall', 'IDS/IPS',
    'Risk Assessment', 'Incident Response', 'SIEM', 'Vulnerability Assessment',
  ];

  const skillCounts = new Map<string, number>();
  jobs.forEach(job => {
    const desc = job.description.toLowerCase();
    skillKeywords.forEach(skill => {
      if (desc.includes(skill.toLowerCase())) {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
      }
    });
  });

  const requiredSkills = Array.from(skillCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([skill, count]) => ({
      skill,
      frequency: Math.round((count / jobs.length) * 100),
    }));

  // Extract certifications
  const certKeywords = [
    'CISSP', 'Security+', 'CompTIA', 'CEH', 'CISM', 'CISA',
    'PMP', 'Six Sigma', 'Lean', 'CPA', 'CFA', 'AWS Certified',
    'Azure Certified', 'Google Cloud', 'CCNA', 'CCNP',
  ];

  const certCounts = new Map<string, number>();
  jobs.forEach(job => {
    const desc = job.description.toLowerCase();
    certKeywords.forEach(cert => {
      if (desc.includes(cert.toLowerCase())) {
        certCounts.set(cert, (certCounts.get(cert) || 0) + 1);
      }
    });
  });

  const certifications = Array.from(certCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([cert, count]) => ({
      cert,
      frequency: Math.round((count / jobs.length) * 100),
    }));

  return {
    count: data.jobs_count,
    salaries: salaryData,
    topEmployers,
    requiredSkills,
    certifications,
  };
}

function parseSalaryRange(salaryString: string): { min: number; max: number } {
  // Examples: "$75,000 - $95,000 per year", "$80K-$100K", "Up to $120,000"
  const numbers = salaryString.match(/\d+[,.]?\d*/g)?.map(n => parseInt(n.replace(/,/g, '')));
  
  if (!numbers || numbers.length === 0) return { min: 0, max: 0 };
  
  if (numbers.length === 1) {
    // Single number - assume it's max, estimate min as 80%
    return { min: Math.round(numbers[0] * 0.8), max: numbers[0] };
  }
  
  return { min: Math.min(...numbers), max: Math.max(...numbers) };
}

function formatSalaryRange(salaries: number[]): string {
  if (salaries.length === 0) return 'Not available';
  const min = Math.min(...salaries);
  const max = Math.max(...salaries);
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}
