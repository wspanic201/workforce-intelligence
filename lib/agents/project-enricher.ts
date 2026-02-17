import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { findSOCCode } from '@/lib/mappings/soc-codes';

export interface EnrichedProjectData {
  target_occupation: string;
  geographic_area: string;
  soc_codes: string | null;
  industry_sector: string;
  program_level: string;
}

/**
 * Enrich project with missing fields before validation
 * 
 * Extracts:
 * - Target occupation (strips "Certificate", "Diploma" from program name)
 * - Geographic area (defaults to "United States" if not specified)
 * - SOC code (looks up from validated mapping)
 * - Industry sector
 * - Program level (certificate, diploma, associate, bachelor)
 */
export async function enrichProject(project: ValidationProject): Promise<EnrichedProjectData> {
  console.log(`[Enricher] Enriching project: "${project.program_name}"`);
  
  // Extract target occupation (remove program qualifiers)
  const targetOccupation = project.program_name
    .replace(/\s*(certificate|diploma|degree|program|associate|bachelor|training|course|AAS|AS|BS|BA|AA)\b/gi, '')
    .trim();
  
  console.log(`[Enricher] Occupation: "${targetOccupation}"`);
  
  // Try to find SOC code from our validated mapping
  let socCode: string | null = null;
  const mapped = findSOCCode(targetOccupation);
  if (mapped) {
    socCode = mapped.code;
    console.log(`[Enricher] ✓ Mapped to SOC ${socCode} (${mapped.title})`);
  } else {
    console.log(`[Enricher] No SOC code found in mapping for "${targetOccupation}" — will search O*NET during validation`);
  }
  
  // Use AI to determine program level, industry sector, and extract geographic area
  // Check all available fields for geographic hints
  const existingGeo = (project as any).geographic_area || '';
  const constraints = project.constraints || '';
  const targetAudience = project.target_audience || '';
  const clientName = project.client_name || '';
  
  const prompt = `Analyze this program and return JSON with the following fields:

Program: ${project.program_name}
Type: ${project.program_type || 'Not specified'}
Institution: ${clientName}
Constraints: ${constraints}
Target Audience: ${targetAudience}
${existingGeo ? `Geographic Area (provided): ${existingGeo}` : ''}

Return ONLY valid JSON (no markdown, no explanation):
{
  "program_level": "certificate" | "diploma" | "associate" | "bachelor" | "other",
  "industry_sector": "Healthcare" | "Information Technology" | "Skilled Trades" | "Business" | "Education" | "Other",
  "geographic_area": "<extracted geographic area>"
}

Rules:
- Use "certificate" for short-term certificates (< 1 year)
- Use "diploma" for 1-2 year non-degree programs
- Use "associate" for AAS, AS degrees
- Use "bachelor" for BS, BA, 4-year degrees
- Infer industry from occupation name
- For geographic_area: Extract the region/location from constraints, target_audience, institution name, or any available context
  - If the institution is "Kirkwood Community College", the region is "Cedar Rapids and Iowa City, Iowa"
  - If constraints mention a specific region (e.g. "Cedar Rapids and Iowa City, Iowa region"), use that
  - If no geographic hints exist, use "United States"
  - Format as "City, State" or "City and City, State" — keep it clean`;

  try {
    const { content } = await callClaude(prompt, {
      maxTokens: 500,
      temperature: 0.3,
    });
    
    const enrichment = extractJSON(content) as {
      program_level: string;
      industry_sector: string;
      geographic_area: string;
    };
    
    console.log(`[Enricher] ✓ Level: ${enrichment.program_level}, Sector: ${enrichment.industry_sector}, Region: ${enrichment.geographic_area}`);
    
    return {
      target_occupation: targetOccupation,
      geographic_area: enrichment.geographic_area || 'United States',
      soc_codes: socCode,
      industry_sector: enrichment.industry_sector,
      program_level: enrichment.program_level,
    };
  } catch (err) {
    console.warn('[Enricher] AI enrichment failed, using defaults:', err);
    
    // Fallback to simple defaults
    return {
      target_occupation: targetOccupation,
      geographic_area: 'United States',
      soc_codes: socCode,
      industry_sector: 'Other',
      program_level: project.program_type?.toLowerCase().includes('certificate') ? 'certificate' : 'other',
    };
  }
}
