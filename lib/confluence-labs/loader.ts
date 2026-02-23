import fs from 'fs/promises';
import path from 'path';

export interface Persona {
  name: string;
  slug: string;
  division: string;
  filePath: string;
  fullContext: string;
}

const CONFLUENCE_LABS_PATH = process.env.CONFLUENCE_LABS_PATH || '/Users/matt/projects/Confluence Labs';

// Persona mappings for research components and Wavelength advisory team
export const PERSONA_MAP: Record<string, { division: string; file: string }> = {
  // Business & Strategy
  'market-analyst': {
    division: 'Business & Strategy Division',
    file: 'tomas-reyes-market-analyst.md',
  },
  'research-director': {
    division: 'Business & Strategy Division',
    file: 'claudette-beaumont-research-director.md',
  },
  'financial-analyst': {
    division: 'Business & Strategy Division',
    file: 'fatima-al-rashid-financial-analyst.md',
  },
  'strategy-director': {
    division: 'Business & Strategy Division',
    file: 'priya-mehta-strategy-director.md',
  },
  'business-analyst': {
    division: 'Business & Strategy Division',
    file: 'derek-okonkwo-business-analyst.md',
  },
  'data-analyst': {
    division: 'Business & Strategy Division',
    file: 'yuna-park-data-analyst.md',
  },

  // Curriculum & Learning Design
  'curriculum-director': {
    division: 'Curriculum & Learning Design',
    file: 'okonkwo-adeyemi-director-curriculum.md',
  },
  'education-vp': {
    division: 'Curriculum & Learning Design',
    file: 'marcy-villanueva-chen-vp-education.md',
  },
  'adult-learning': {
    division: 'Curriculum & Learning Design',
    file: 'jan-thompkins-rivera-adult-learning.md',
  },
  'instructional-designer': {
    division: 'Curriculum & Learning Design',
    file: 'ty-nakamura-oberg-instructional-designer.md',
  },

  // Foundation (C-suite)
  'cfo': {
    division: 'Foundation',
    file: 'marcus-reinholt-cfo.md',
  },
  'cmo': {
    division: 'Foundation',
    file: 'valentina-rojas-medina-cmo.md',
  },
  'coo': {
    division: 'Foundation',
    file: 'henry-tran-coo.md',
  },
  'cto': {
    division: 'Foundation',
    file: 'sana-patel-cto.md',
  },

  // Growth & Marketing
  'growth-lead': {
    division: 'Growth & Marketing Division',
    file: 'growth-lead.md',
  },
  'partnerships-lead': {
    division: 'Growth & Marketing Division',
    file: 'partnerships-lead.md',
  },
  'performance-marketer': {
    division: 'Growth & Marketing Division',
    file: 'performance-marketer.md',
  },

  // Operations
  'operations-manager': {
    division: 'Operations Division',
    file: 'lucia-mendoza-operations-manager.md',
  },

  // Product & Design
  'product-manager': {
    division: 'Product & Design Division',
    file: 'senior-product-manager.md',
  },

  // Innovation
  'futurist': {
    division: 'Innovation Division',
    file: 'ingrid-lindqvist-futurist.md',
  },
  'trends-analyst': {
    division: 'Innovation Division',
    file: 'zara-okonkwo-hassan-trends-analyst.md',
  },
};

/**
 * Pre-defined team compositions for different engagement types.
 * Each team is curated for maximum relevance to the engagement.
 */
export const WAVELENGTH_TEAMS: Record<string, string[]> = {
  // Workforce program validation — the core Wavelength engagement
  'program-validation': [
    'education-vp',        // Marcy Villanueva-Chen — VP Education, workforce development expert, community college insider
    'financial-analyst',   // Fatima Al-Rashid — Financial modeling, program economics, honest with numbers
    'strategy-director',   // Priya Mehta — Strategic positioning, go/no-go decision frameworks
    'market-analyst',      // Tomas Reyes — Labor market analysis, competitive intelligence
    'adult-learning',      // Jan Thompkins-Rivera — Adult learner demographics, enrollment strategy
    'cmo',                 // Valentina Rojas-Medina — Marketing strategy, brand positioning
  ],

  // Discovery/opportunity scanning
  'discovery': [
    'strategy-director',
    'market-analyst',
    'data-analyst',
    'trends-analyst',
    'education-vp',
  ],

  // Financial deep-dive
  'financial-review': [
    'cfo',
    'financial-analyst',
    'business-analyst',
    'education-vp',
  ],
};

export async function loadPersona(personaSlug: string): Promise<Persona> {
  const mapping = PERSONA_MAP[personaSlug];
  
  if (!mapping) {
    throw new Error(`Unknown persona slug: ${personaSlug}`);
  }

  const filePath = path.join(CONFLUENCE_LABS_PATH, mapping.division, mapping.file);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract name from the markdown content (first heading)
    const nameMatch = content.match(/^#\s+(.+)$/m);
    const name = nameMatch ? nameMatch[1] : personaSlug;

    return {
      name,
      slug: personaSlug,
      division: mapping.division,
      filePath,
      fullContext: content,
    };
  } catch (error) {
    console.error(`Error loading persona ${personaSlug}:`, error);
    throw new Error(`Failed to load persona: ${personaSlug}`);
  }
}

export async function loadMultiplePersonas(personaSlugs: string[]): Promise<Persona[]> {
  return Promise.all(personaSlugs.map(slug => loadPersona(slug)));
}
