/**
 * Smart JSON→prose converter for research component content.
 * Used as a fallback when markdown_output is not available.
 */

export function formatComponentContent(type: string, content: any): string {
  if (!content || typeof content !== 'object') return '';

  // Remove internal scoring fields from display
  const { _score, _scoreRationale, score, scoreRationale, ...displayContent } = content;
  const agentScore = _score ?? score;
  const rationale = _scoreRationale ?? scoreRationale;

  switch (type) {
    case 'labor_market':
      return formatLaborMarket(displayContent, agentScore, rationale);
    case 'competitive_landscape':
      return formatCompetitiveLandscape(displayContent, agentScore, rationale);
    case 'learner_demand':
      return formatLearnerDemand(displayContent, agentScore, rationale);
    case 'financial_viability':
      return formatFinancialViability(displayContent, agentScore, rationale);
    case 'institutional_fit':
      return formatInstitutionalFit(displayContent, agentScore, rationale);
    case 'regulatory_compliance':
      return formatRegulatoryCompliance(displayContent, agentScore, rationale);
    case 'employer_demand':
      return formatEmployerDemand(displayContent, agentScore, rationale);
    default:
      return formatGeneric(displayContent, agentScore, rationale);
  }
}

function scoreBlock(score: number | null | undefined, rationale: string | null | undefined): string {
  if (score == null) return '';
  const emoji = score >= 8 ? '🟢' : score >= 5 ? '🟡' : '🔴';
  return `> **Dimension Score: ${score}/10** ${emoji}\n${rationale ? `> ${rationale}\n` : ''}\n`;
}

function renderList(items: any[] | undefined, formatter?: (item: any) => string): string {
  if (!items || !Array.isArray(items) || items.length === 0) return '_No data available._\n';
  return items.map(item => `- ${formatter ? formatter(item) : String(item)}`).join('\n') + '\n';
}

function renderRecommendations(recs: any[] | string[] | undefined): string {
  if (!recs || !Array.isArray(recs) || recs.length === 0) return '';
  return '\n### Recommendations\n\n' + recs.map((r, i) => `${i + 1}. ${typeof r === 'string' ? r : r.recommendation || r.description || JSON.stringify(r)}`).join('\n\n') + '\n';
}

// ── Labor Market ──

function formatLaborMarket(c: any, score: number | null, rationale: string | null): string {
  const jobs = c.live_jobs || {};
  const onet = c.onet_data;

  let md = `## Section 1: Labor Market Analysis\n\n`;
  md += scoreBlock(score, rationale);

  if (jobs.count != null) {
    md += `The labor market analysis identified **${jobs.count} current job openings** in the target region, signaling ${jobs.count > 50 ? 'strong' : jobs.count > 20 ? 'moderate' : 'limited'} employer demand for this occupation.\n\n`;
  }

  if (jobs.salaries?.median) {
    md += `### Compensation Overview\n\n`;
    md += `The median salary across current postings is **$${Number(jobs.salaries.median).toLocaleString()}**, `;
    md += `with the full range spanning from $${Number(jobs.salaries.min || 0).toLocaleString()} to $${Number(jobs.salaries.max || 0).toLocaleString()}. `;
    md += `Entry-level positions typically offer ${jobs.salaries.ranges?.entry || 'data unavailable'}, `;
    md += `while mid-career roles range from ${jobs.salaries.ranges?.mid || 'data unavailable'}.\n\n`;
  }

  if (jobs.topEmployers?.length > 0) {
    md += `### Top Regional Employers\n\n`;
    md += `The following employers are actively hiring in this field:\n\n`;
    md += renderList(jobs.topEmployers, e => `**${e.name}** — ${e.openings} opening${e.openings > 1 ? 's' : ''}`);
    md += '\n';
  }

  if (jobs.requiredSkills?.length > 0) {
    md += `### In-Demand Skills\n\n`;
    md += `Analysis of job postings reveals the most frequently requested skills:\n\n`;
    md += renderList(jobs.requiredSkills, s => `**${s.skill}** — cited in ${s.frequency}% of postings`);
    md += '\n';
  }

  if (onet) {
    md += `### Occupational Standards (O*NET)\n\n`;
    md += `The O*NET classification for this occupation (${onet.code}) identifies it as **${onet.title}**: ${onet.description}\n\n`;
    if (onet.skills?.length > 0) {
      md += `**Core competencies** include ${onet.skills.slice(0, 5).map((s: any) => s.element_name || s).join(', ')}.\n\n`;
    }
  }

  md += renderRecommendations(c.recommendations);
  return md;
}

// ── Competitive Landscape ──

function formatCompetitiveLandscape(c: any, score: number | null, rationale: string | null): string {
  let md = `## Section 2: Competitive Landscape\n\n`;
  md += scoreBlock(score, rationale);

  if (c.competitors?.length > 0) {
    md += `### Existing Competitors\n\nThe analysis identified **${c.competitors.length} existing program${c.competitors.length > 1 ? 's' : ''}** in the competitive landscape:\n\n`;
    md += renderList(c.competitors, comp => {
      const name = comp.institution || comp.name || comp;
      const prog = comp.program_name ? ` — ${comp.program_name}` : '';
      const details = comp.tuition ? ` (Tuition: ${comp.tuition})` : '';
      return `**${name}**${prog}${details}`;
    });
    md += '\n';
  }

  if (c.market_gaps?.length > 0) {
    md += `### Market Gaps & Opportunities\n\nSeveral gaps in the current market present opportunities for differentiation:\n\n`;
    md += renderList(c.market_gaps);
    md += '\n';
  }

  if (c.competitive_advantages?.length > 0) {
    md += `### Competitive Advantages\n\n`;
    md += renderList(c.competitive_advantages);
    md += '\n';
  }

  if (c.threats?.length > 0) {
    md += `### Competitive Threats\n\n`;
    md += renderList(c.threats);
    md += '\n';
  }

  if (c.differentiation_opportunities?.length > 0) {
    md += `### Differentiation Strategies\n\n`;
    md += renderList(c.differentiation_opportunities);
    md += '\n';
  }

  md += renderRecommendations(c.recommendations);
  return md;
}

// ── Learner Demand ──

function formatLearnerDemand(c: any, score: number | null, rationale: string | null): string {
  let md = `## Section 3: Target Learner Analysis\n\n`;
  md += scoreBlock(score, rationale);

  if (c.demand_signals?.length > 0) {
    md += `### Demand Signals\n\nThe following indicators suggest learner interest in this program:\n\n`;
    md += renderList(c.demand_signals);
    md += '\n';
  }

  const barriers = c.barriers || {};
  const hasBarriers = barriers.financial?.length || barriers.logistical?.length || barriers.awareness?.length;
  if (hasBarriers) {
    md += `### Enrollment Barriers\n\n`;
    if (barriers.financial?.length) {
      md += `**Financial Barriers:** ${renderList(barriers.financial)}\n`;
    }
    if (barriers.logistical?.length) {
      md += `**Logistical Barriers:** ${renderList(barriers.logistical)}\n`;
    }
    if (barriers.awareness?.length) {
      md += `**Awareness Barriers:** ${renderList(barriers.awareness)}\n`;
    }
  }

  if (c.recruitment_strategies?.length > 0) {
    md += `### Recommended Recruitment Strategies\n\n`;
    md += renderList(c.recruitment_strategies);
    md += '\n';
  }

  md += renderRecommendations(c.recommendations);
  return md;
}

// ── Financial Viability ──

function formatFinancialViability(c: any, score: number | null, rationale: string | null): string {
  let md = `## Section 4: Financial Model\n\n`;
  md += scoreBlock(score, rationale);

  if (c.startup_costs) {
    const costs = c.startup_costs;
    if (typeof costs === 'object' && !Array.isArray(costs)) {
      const total = costs.total || Object.values(costs).reduce((sum: number, v: any) => sum + (typeof v === 'number' ? v : 0), 0);
      md += `### Startup Investment\n\nThe estimated startup cost for this program is **$${Number(total).toLocaleString()}**. Key cost components include:\n\n`;
      md += Object.entries(costs)
        .filter(([k, v]) => k !== 'total' && typeof v === 'number')
        .map(([k, v]) => `- **${k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:** $${Number(v).toLocaleString()}`)
        .join('\n') + '\n\n';
    } else {
      md += `### Startup Costs\n\n${JSON.stringify(costs)}\n\n`;
    }
  }

  if (c.revenue_projections) {
    md += `### Revenue Projections\n\n`;
    if (Array.isArray(c.revenue_projections)) {
      md += c.revenue_projections.map((r: any) => `- **Year ${r.year || r.period}:** $${Number(r.revenue || r.amount || 0).toLocaleString()}`).join('\n') + '\n\n';
    } else if (typeof c.revenue_projections === 'object') {
      md += Object.entries(c.revenue_projections).map(([k, v]) => `- **${k}:** $${Number(v).toLocaleString()}`).join('\n') + '\n\n';
    }
  }

  if (c.break_even) {
    md += `### Break-Even Analysis\n\n`;
    if (typeof c.break_even === 'string') {
      md += `${c.break_even}\n\n`;
    } else if (typeof c.break_even === 'object') {
      md += `The program is projected to break even in **${c.break_even.timeline || c.break_even.months || c.break_even.years || 'TBD'}**${c.break_even.enrollment_needed ? ` with a minimum enrollment of ${c.break_even.enrollment_needed} students` : ''}.\n\n`;
    }
  }

  if (c.ROI != null || c.roi != null) {
    const roi = c.ROI ?? c.roi;
    md += `### Return on Investment\n\n`;
    md += typeof roi === 'object'
      ? `Projected ROI: **${roi.percentage || roi.value || JSON.stringify(roi)}**\n\n`
      : `Projected ROI: **${roi}**\n\n`;
  }

  md += renderRecommendations(c.recommendations);
  return md;
}

// ── Institutional Fit ──

function formatInstitutionalFit(c: any, score: number | null, rationale: string | null): string {
  let md = `## Section 5: Institutional Readiness\n\n`;
  md += scoreBlock(score, rationale);

  if (c.alignment) {
    md += `### Strategic Alignment\n\n`;
    md += Array.isArray(c.alignment) ? renderList(c.alignment) + '\n' : `${c.alignment}\n\n`;
  }

  if (c.capacity) {
    md += `### Institutional Capacity\n\n`;
    md += typeof c.capacity === 'string' ? `${c.capacity}\n\n` : renderList(Array.isArray(c.capacity) ? c.capacity : Object.entries(c.capacity).map(([k, v]) => `**${k}:** ${v}`)) + '\n';
  }

  if (c.resource_requirements?.length > 0) {
    md += `### Resource Requirements\n\n`;
    md += renderList(c.resource_requirements);
    md += '\n';
  }

  if (c.risks?.length > 0) {
    md += `### Implementation Risks\n\n`;
    md += renderList(c.risks, r => typeof r === 'string' ? r : `**${r.risk || r.name}** — ${r.mitigation || r.description || ''}`);
    md += '\n';
  }

  md += renderRecommendations(c.recommendations);
  return md;
}

// ── Regulatory Compliance ──

function formatRegulatoryCompliance(c: any, score: number | null, rationale: string | null): string {
  let md = `## Section 6: Regulatory & Compliance\n\n`;
  md += scoreBlock(score, rationale);

  if (c.requirements?.length > 0) {
    md += `### Regulatory Requirements\n\nThe following regulatory requirements must be met for program approval:\n\n`;
    md += renderList(c.requirements);
    md += '\n';
  }

  if (c.accreditation) {
    md += `### Accreditation\n\n`;
    md += Array.isArray(c.accreditation) ? renderList(c.accreditation) + '\n' : `${c.accreditation}\n\n`;
  }

  if (c.licensing) {
    md += `### Licensing & Certification\n\n`;
    md += Array.isArray(c.licensing) ? renderList(c.licensing) + '\n' : `${c.licensing}\n\n`;
  }

  if (c.timeline) {
    md += `### Compliance Timeline\n\n`;
    if (Array.isArray(c.timeline)) {
      md += c.timeline.map((t: any) => `- **${t.milestone || t.phase || t.step}:** ${t.date || t.duration || t.timeline || ''}`).join('\n') + '\n\n';
    } else {
      md += `${c.timeline}\n\n`;
    }
  }

  md += renderRecommendations(c.recommendations);
  return md;
}

// ── Employer Demand ──

function formatEmployerDemand(c: any, score: number | null, rationale: string | null): string {
  let md = `## Section 7: Employer Demand & Partnerships\n\n`;
  md += scoreBlock(score, rationale);

  if (c.employer_partners?.length > 0) {
    md += `### Potential Employer Partners\n\nThe following employers represent strong partnership opportunities:\n\n`;
    md += renderList(c.employer_partners, e => typeof e === 'string' ? e : `**${e.name || e.employer}**${e.industry ? ` (${e.industry})` : ''}${e.hiring_volume ? ` — ${e.hiring_volume} positions` : ''}`);
    md += '\n';
  }

  if (c.skills_needed?.length > 0) {
    md += `### Employer-Identified Skills Needs\n\n`;
    md += renderList(c.skills_needed);
    md += '\n';
  }

  if (c.partnership_models?.length > 0) {
    md += `### Partnership Models\n\n`;
    md += renderList(c.partnership_models);
    md += '\n';
  }

  if (c.placement_rates != null) {
    md += `### Placement Rate Projections\n\n`;
    md += typeof c.placement_rates === 'object'
      ? Object.entries(c.placement_rates).map(([k, v]) => `- **${k}:** ${v}`).join('\n') + '\n\n'
      : `Projected placement rate: **${c.placement_rates}**\n\n`;
  }

  md += renderRecommendations(c.recommendations);
  return md;
}

// ── Generic Fallback ──

function formatGeneric(c: any, score: number | null, rationale: string | null): string {
  let md = scoreBlock(score, rationale);

  for (const [key, value] of Object.entries(c)) {
    if (key.startsWith('_') || value == null) continue;
    const heading = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    md += `### ${heading}\n\n`;
    if (Array.isArray(value)) {
      md += renderList(value);
    } else if (typeof value === 'object') {
      md += Object.entries(value).map(([k, v]) => `- **${k}:** ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n') + '\n';
    } else {
      md += `${value}\n`;
    }
    md += '\n';
  }
  return md;
}
