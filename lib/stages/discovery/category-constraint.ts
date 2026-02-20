/**
 * Category constraint utilities for focused Discovery scans.
 * 
 * When a category is set, every agent in the pipeline constrains its
 * research, analysis, and recommendations to that category only.
 */

/**
 * Returns a prompt block to inject into Claude calls when category is active.
 * Place this BEFORE the main instructions to set the constraint.
 */
export function getCategoryConstraint(category: string | undefined): string {
  if (!category) return '';

  return `
## ⚠️ CATEGORY CONSTRAINT — MANDATORY
This is a **Category Deep Dive** scan, NOT a general scan.

**Category: ${category}**

ALL research, analysis, signals, gaps, and recommendations MUST be within the "${category}" domain.
- ONLY search for, analyze, and recommend programs in this category
- ONLY identify employers, demand signals, and job postings relevant to this category
- ONLY map competitors' offerings within this category
- IGNORE opportunities outside this scope, even if they look promising
- If an employer is relevant to multiple categories, only discuss their ${category}-related workforce needs

This constraint is absolute. A focused deep dive is more valuable than a broad scan.
---

`;
}

/**
 * Returns search keyword modifiers for category-constrained queries.
 * Append these to search queries to narrow results.
 */
export function getCategorySearchTerms(category: string | undefined): string {
  if (!category) return '';

  // Map common category names to search-friendly keyword sets
  const categoryKeywords: Record<string, string> = {
    'Business & Professional Development': 'business management leadership accounting finance HR entrepreneurship',
    'Healthcare': 'healthcare nursing medical clinical health allied health',
    'Manufacturing & Skilled Trades': 'manufacturing welding machining CNC industrial maintenance trades',
    'Technology & IT': 'technology IT cybersecurity networking programming software data',
    'Transportation & Logistics': 'CDL trucking logistics supply chain transportation warehouse',
    'Construction & Building Trades': 'construction electrician plumbing HVAC building trades',
    'Education & Training': 'education teaching childcare early childhood paraprofessional',
    'Agriculture & Natural Resources': 'agriculture farming agribusiness horticulture natural resources',
    'Hospitality & Culinary': 'hospitality culinary food service hotel restaurant tourism',
    'Public Safety': 'law enforcement fire EMS emergency paramedic corrections',
  };

  // Check for exact or partial match
  for (const [key, terms] of Object.entries(categoryKeywords)) {
    if (category.toLowerCase().includes(key.toLowerCase().split(' & ')[0])) {
      return terms;
    }
  }

  // Fallback: use the category name itself as search terms
  return category;
}

/**
 * Returns the category label for report headers and titles.
 */
export function getCategoryLabel(category: string | undefined): string {
  if (!category) return 'Program Market Scan';
  return `${category} — Category Deep Dive`;
}
