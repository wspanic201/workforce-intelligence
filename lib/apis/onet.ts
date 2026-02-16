export interface ONETOccupation {
  code: string;
  title: string;
  description: string;
}

export interface ONETSkill {
  element_name: string;
  scale_value: number;
  description?: string;
}

export interface ONETKnowledge {
  element_name: string;
  scale_value: number;
  description?: string;
}

export interface ONETTechnology {
  example: string;
  hot_technology?: boolean;
}

export interface ONETCompetencies {
  code: string;
  title: string;
  description: string;
  skills: ONETSkill[];
  knowledge: ONETKnowledge[];
  technology: ONETTechnology[];
  education: string;
}

export async function searchONET(keyword: string): Promise<string | null> {
  const auth = Buffer.from(':' + process.env.ONET_API_PASSWORD).toString('base64');

  const response = await fetch(
    `https://services.onetcenter.org/ws/online/search?keyword=${encodeURIComponent(keyword)}`,
    {
      headers: { Authorization: `Basic ${auth}` },
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!response.ok) {
    console.warn(`[O*NET] API returned ${response.status} ${response.statusText} — skipping O*NET data`);
    return null;
  }

  const data = await response.json();
  return data.occupation?.[0]?.code || null;
}

export async function getONETCompetencies(onetCode: string): Promise<ONETCompetencies> {
  const auth = Buffer.from(':' + process.env.ONET_API_PASSWORD).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const [occupationRes, skillsRes, knowledgeRes, technologyRes] = await Promise.all([
    fetch(`https://services.onetcenter.org/ws/online/occupations/${onetCode}`, { headers, signal: AbortSignal.timeout(30000) }),
    fetch(`https://services.onetcenter.org/ws/online/occupations/${onetCode}/summary/skills`, { headers, signal: AbortSignal.timeout(30000) }),
    fetch(`https://services.onetcenter.org/ws/online/occupations/${onetCode}/summary/knowledge`, { headers, signal: AbortSignal.timeout(30000) }),
    fetch(`https://services.onetcenter.org/ws/online/occupations/${onetCode}/summary/technology_skills`, { headers, signal: AbortSignal.timeout(30000) }),
  ]);

  // Check if any response failed (e.g. expired API key)
  if (!occupationRes.ok) {
    console.warn(`[O*NET] Competencies API returned ${occupationRes.status} — skipping O*NET data`);
    return {
      code: onetCode,
      title: 'Unknown',
      description: 'O*NET data unavailable',
      skills: [],
      knowledge: [],
      technology: [],
      education: 'Not specified',
    };
  }

  const [occupation, skillsData, knowledgeData, technologyData] = await Promise.all([
    occupationRes.json(),
    skillsRes.ok ? skillsRes.json() : { skill: [] },
    knowledgeRes.ok ? knowledgeRes.json() : { knowledge: [] },
    technologyRes.ok ? technologyRes.json() : { technology: [] },
  ]);

  return {
    code: onetCode,
    title: occupation.title,
    description: occupation.description,
    skills: skillsData.skill || [],
    knowledge: knowledgeData.knowledge || [],
    technology: technologyData.technology || [],
    education: occupation.education?.description || 'Not specified',
  };
}
