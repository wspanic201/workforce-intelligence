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

// Persona mappings for research components
export const PERSONA_MAP: Record<string, { division: string; file: string }> = {
  'market-analyst': {
    division: 'Business & Strategy Division',
    file: 'tomas-reyes-market-analyst.md',
  },
  'research-director': {
    division: 'Business & Strategy Division',
    file: 'claudette-beaumont-research-director.md',
  },
  'curriculum-director': {
    division: 'Curriculum & Learning Design',
    file: 'okonkwo-adeyemi-director-curriculum.md',
  },
  'education-vp': {
    division: 'Curriculum & Learning Design',
    file: 'marcy-villanueva-chen-vp-education.md',
  },
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
  'product-manager': {
    division: 'Product & Design Division',
    file: 'senior-product-manager.md',
  },
  'operations-manager': {
    division: 'Operations Division',
    file: 'lucia-mendoza-operations-manager.md',
  },
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
