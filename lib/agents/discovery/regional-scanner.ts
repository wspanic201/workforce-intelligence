import { callClaude } from '@/lib/ai/anthropic';
import { getBLSData } from '@/lib/apis/bls';
import { searchJobsBrave } from '@/lib/apis/web-fallbacks';
import { withCache } from '@/lib/apis/cache';

export interface OccupationDemand {
  occupation: string;
  socCode: string;
  employmentCount: number | null;
  medianWage: number | null;
  growthTrend: 'strong' | 'moderate' | 'weak';
  jobPostingVolume: number | null;
  demandScore: number; // 1-10
  rationale: string;
}

export interface RegionalScanResult {
  region: string;
  scanDate: string;
  topOccupations: OccupationDemand[];
  marketOverview: string;
  industryTrends: string[];
}

/**
 * Regional Labor Market Scanner
 * Scans BLS employment data and job posting volumes to identify
 * top 20-30 occupations with strongest demand signals in the region.
 */
export async function scanRegionalLaborMarket(
  geographicArea: string
): Promise<RegionalScanResult> {
  console.log(`[Regional Scanner] Scanning labor market for: ${geographicArea}`);

  // Step 1: Get high-demand SOC codes for the region using AI analysis
  const occupationListPrompt = `You are a labor market analyst. Based on current economic trends, identify the top 30 occupations with strongest demand in ${geographicArea}.

Consider:
- Healthcare (aging population, post-pandemic needs)
- Technology (software, cybersecurity, data)
- Skilled trades (electricians, HVAC, plumbing)
- Business services (accounting, HR, sales)
- Manufacturing (if applicable to region)
- Education and training
- Logistics and supply chain

Return ONLY a JSON array of objects with this structure:
[
  {
    "occupation": "Registered Nurses",
    "socCode": "29-1141",
    "reasoning": "Aging population and healthcare expansion"
  }
]

Important:
- Use real 6-digit SOC codes (XX-XXXX format)
- Focus on middle-skill and high-skill occupations that require certificates/degrees
- Avoid low-skill, low-wage positions
- Prioritize occupations where community colleges can provide training
- Return exactly 30 occupations`;

  const { content } = await callClaude(occupationListPrompt, {
    maxTokens: 4000,
    temperature: 0.7,
  });

  // Parse SOC codes from AI response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  let occupationList: Array<{ occupation: string; socCode: string; reasoning: string }> = [];
  
  if (jsonMatch) {
    try {
      occupationList = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('[Regional Scanner] Failed to parse AI response, using defaults');
      occupationList = getDefaultOccupations();
    }
  } else {
    occupationList = getDefaultOccupations();
  }

  console.log(`[Regional Scanner] Analyzing ${occupationList.length} occupations...`);

  // Step 2: Fetch real data for each occupation
  const occupationDemands = await Promise.all(
    occupationList.slice(0, 30).map(async (occ) => {
      // Fetch BLS data (employment + wage)
      const blsData = await withCache(
        'bls_data',
        { socCode: occ.socCode },
        () => getBLSData(occ.socCode),
        168 // 7 days
      ).catch(() => null);

      // Fetch job posting volume from Brave Search
      const jobData = await withCache(
        'brave_jobs',
        { occupation: occ.occupation, location: geographicArea },
        () => searchJobsBrave(occ.occupation, geographicArea),
        24 // 1 day
      ).catch(() => null);

      // Calculate demand score (1-10)
      const demandScore = calculateDemandScore({
        employment: blsData?.employment_total || null,
        wage: blsData?.median_wage || null,
        jobPostings: jobData?.estimated_job_count || null,
      });

      // Determine growth trend
      const growthTrend = determineGrowthTrend(demandScore);

      return {
        occupation: occ.occupation,
        socCode: occ.socCode,
        employmentCount: blsData?.employment_total || null,
        medianWage: blsData?.median_wage || null,
        growthTrend,
        jobPostingVolume: jobData?.estimated_job_count || null,
        demandScore,
        rationale: occ.reasoning,
      };
    })
  );

  // Sort by demand score and take top 30
  const topOccupations = occupationDemands
    .sort((a, b) => b.demandScore - a.demandScore)
    .slice(0, 30);

  console.log(`[Regional Scanner] Top 5 occupations:`);
  topOccupations.slice(0, 5).forEach((occ, i) => {
    console.log(`  ${i + 1}. ${occ.occupation} - Score: ${occ.demandScore}/10`);
  });

  // Step 3: Generate market overview using AI
  const overviewPrompt = `Based on the following labor market data for ${geographicArea}, provide a 2-3 paragraph market overview highlighting the strongest sectors and demand patterns.

Top occupations by demand:
${topOccupations.slice(0, 10).map((occ, i) => 
  `${i + 1}. ${occ.occupation} (SOC ${occ.socCode}) - ${occ.employmentCount?.toLocaleString() || 'N/A'} employed, $${occ.medianWage?.toLocaleString() || 'N/A'} median wage, ${occ.jobPostingVolume || 'N/A'} current openings`
).join('\n')}

Provide insights on:
- Dominant industries
- Wage trends
- Emerging opportunities
- Regional economic drivers

Keep it professional and data-focused. No fluff.`;

  const { content: marketOverview } = await callClaude(overviewPrompt, {
    maxTokens: 1500,
  });

  // Extract industry trends
  const industryTrends = extractIndustryTrends(topOccupations);

  return {
    region: geographicArea,
    scanDate: new Date().toISOString(),
    topOccupations,
    marketOverview,
    industryTrends,
  };
}

/**
 * Calculate demand score based on available data
 */
function calculateDemandScore(data: {
  employment: number | null;
  wage: number | null;
  jobPostings: number | null;
}): number {
  let score = 5; // baseline

  // Employment size (0-2 points)
  if (data.employment) {
    if (data.employment > 500000) score += 2;
    else if (data.employment > 100000) score += 1.5;
    else if (data.employment > 50000) score += 1;
  }

  // Wage level (0-3 points)
  if (data.wage) {
    if (data.wage > 80000) score += 3;
    else if (data.wage > 60000) score += 2;
    else if (data.wage > 45000) score += 1;
  }

  // Job posting volume (0-2 points)
  if (data.jobPostings) {
    if (data.jobPostings > 1000) score += 2;
    else if (data.jobPostings > 500) score += 1.5;
    else if (data.jobPostings > 100) score += 1;
  }

  return Math.min(Math.round(score * 10) / 10, 10);
}

function determineGrowthTrend(demandScore: number): 'strong' | 'moderate' | 'weak' {
  if (demandScore >= 7) return 'strong';
  if (demandScore >= 5) return 'moderate';
  return 'weak';
}

function extractIndustryTrends(occupations: OccupationDemand[]): string[] {
  const trends: string[] = [];

  // Count by sector (simplified categorization)
  const healthcare = occupations.filter(o => o.socCode.startsWith('29-') || o.socCode.startsWith('31-')).length;
  const tech = occupations.filter(o => o.socCode.startsWith('15-')).length;
  const business = occupations.filter(o => o.socCode.startsWith('11-') || o.socCode.startsWith('13-')).length;
  const trades = occupations.filter(o => o.socCode.startsWith('47-') || o.socCode.startsWith('49-')).length;

  if (healthcare >= 5) trends.push('Strong healthcare sector demand');
  if (tech >= 3) trends.push('Growing technology sector');
  if (business >= 3) trends.push('Business services expansion');
  if (trades >= 3) trends.push('Skilled trades shortage');

  return trends;
}

function getDefaultOccupations(): Array<{ occupation: string; socCode: string; reasoning: string }> {
  return [
    { occupation: 'Registered Nurses', socCode: '29-1141', reasoning: 'Healthcare demand' },
    { occupation: 'Software Developers', socCode: '15-1252', reasoning: 'Tech growth' },
    { occupation: 'Medical and Health Services Managers', socCode: '11-9111', reasoning: 'Healthcare administration' },
    { occupation: 'Electricians', socCode: '47-2111', reasoning: 'Infrastructure needs' },
    { occupation: 'Paralegals and Legal Assistants', socCode: '23-2011', reasoning: 'Legal services' },
    { occupation: 'Accountants and Auditors', socCode: '13-2011', reasoning: 'Business services' },
    { occupation: 'Licensed Practical Nurses', socCode: '29-2061', reasoning: 'Healthcare support' },
    { occupation: 'Computer Systems Analysts', socCode: '15-1211', reasoning: 'IT consulting' },
    { occupation: 'Industrial Machinery Mechanics', socCode: '49-9041', reasoning: 'Manufacturing support' },
    { occupation: 'Medical Assistants', socCode: '31-9092', reasoning: 'Clinical support' },
    { occupation: 'HVAC Mechanics and Installers', socCode: '49-9021', reasoning: 'Building trades' },
    { occupation: 'Web Developers', socCode: '15-1254', reasoning: 'Digital economy' },
    { occupation: 'Physical Therapist Assistants', socCode: '31-2021', reasoning: 'Rehabilitation services' },
    { occupation: 'Network and Computer Systems Administrators', socCode: '15-1244', reasoning: 'IT infrastructure' },
    { occupation: 'Dental Hygienists', socCode: '29-1292', reasoning: 'Oral health' },
  ];
}
