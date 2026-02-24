/**
 * data-renderer.ts
 *
 * Renders verified intelligence data (from _intelContext.raw) as clean
 * markdown/HTML blocks for the report generator.
 *
 * Data comes from government sources only (BLS, O*NET, Census, IPEDS).
 * No agent-written tables, no web-scraping contamination.
 */

import type { AgentIntelligenceContext } from '@/lib/intelligence/agent-context';

type RawContext = AgentIntelligenceContext['raw'];

// ─── formatting helpers ──────────────────────────────────────────────────────

function fmt$(n: number | null | undefined): string {
  if (n == null) return '—';
  return '$' + n.toLocaleString('en-US');
}

function fmtN(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('en-US');
}

function fmtPct(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toFixed(1) + '%';
}

function badge(label: string, color: string): string {
  return `<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;background:${color}20;color:${color};border:1px solid ${color}40">${label}</span>`;
}

function keyFinding(text: string): string {
  return `<div style="background:#f0f9ff;border-left:4px solid #0ea5e9;padding:14px 18px;margin:16px 0;border-radius:0 8px 8px 0;font-size:14px;line-height:1.6">${text}</div>`;
}

function dataTable(headers: string[], rows: string[][]): string {
  const th = headers.map(h => `<th style="background:#f8fafc;padding:8px 12px;text-align:left;font-weight:600;font-size:12px;color:#64748b;border-bottom:2px solid #e2e8f0">${h}</th>`).join('');
  const trs = rows.map(row =>
    `<tr>${row.map((cell, i) => `<td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;${i > 0 ? 'color:#374151' : 'font-weight:500'}">${cell}</td>`).join('')}</tr>`
  ).join('');
  return `<table style="width:100%;border-collapse:collapse;margin:12px 0">\n<thead><tr>${th}</tr></thead>\n<tbody>${trs}</tbody>\n</table>`;
}

// ─── wage data ───────────────────────────────────────────────────────────────

export function renderWageBlock(raw: RawContext | null): string {
  const occ = raw?.occupation;
  if (!occ?.wages) {
    return '_Wage data not available in the verified intelligence database for this occupation._';
  }

  const w = occ.wages;
  const title = w.occupation_title || 'This Occupation';
  const geo = w.geo_name || w.geo_code || 'State';
  const release = w.bls_release ? ` (${w.bls_release})` : '';

  const rows: string[][] = [];
  if (w.pct_10 != null) rows.push(['10th percentile', fmt$(w.pct_10)]);
  if (w.pct_25 != null) rows.push(['25th percentile', fmt$(w.pct_25)]);
  rows.push(['**Median**', w.median_annual != null ? `**${fmt$(w.median_annual)}**` : '—']);
  if (w.mean_annual != null) rows.push(['Mean', fmt$(w.mean_annual)]);
  if (w.pct_75 != null) rows.push(['75th percentile', fmt$(w.pct_75)]);
  if (w.pct_90 != null) rows.push(['90th percentile', fmt$(w.pct_90)]);

  const wageGap = occ.wageGap;
  const parts: string[] = [];

  parts.push(dataTable(
    ['Wage Percentile', `Annual Wage — ${geo}`],
    rows
  ));

  if (w.employment != null) {
    parts.push(`**Employed in ${geo}:** ${fmtN(w.employment)}`);
  }

  if (wageGap) {
    parts.push(keyFinding(
      `<strong>Faculty Wage Gap:</strong> ${title} industry median ${fmt$(wageGap.industryWage.median_annual)} vs. postsecondary instructor median ${fmt$(wageGap.facultyWage.median_annual)} — a ${fmt$(wageGap.facultyWage.median_annual != null && wageGap.industryWage.median_annual != null ? wageGap.facultyWage.median_annual - wageGap.industryWage.median_annual : null)} premium that strengthens faculty recruitment.`
    ));
  }

  parts.push(`_Source: U.S. Bureau of Labor Statistics — Occupational Employment and Wage Statistics${release}_`);

  return parts.join('\n\n');
}

// ─── projections ─────────────────────────────────────────────────────────────

export function renderProjectionsBlock(raw: RawContext | null): string {
  const occ = raw?.occupation;
  if (!occ?.projections) {
    return '_Employment projections not available in the verified intelligence database for this occupation._';
  }

  const p = occ.projections;
  const geo = p.geo_code === 'US' ? 'National' : (p.geo_code || 'State');

  const growthColor = (p.change_percent ?? 0) >= 10 ? '#059669' : (p.change_percent ?? 0) >= 5 ? '#d97706' : '#dc2626';

  const rows: string[][] = [
    ['Base Employment', `${fmtN(p.employment_base)} (${p.base_year ?? '—'})`],
    ['Projected Employment', `${fmtN(p.employment_projected)} (${p.projected_year ?? '—'})`],
    ['Net New Jobs', fmtN(p.change_number)],
    ['Growth Rate', p.change_percent != null ? `${p.change_percent.toFixed(1)}%` : '—'],
    ['Annual Openings', fmtN(p.annual_openings)],
  ];

  const parts: string[] = [];

  parts.push(dataTable(['Metric', `${geo} — ${p.base_year ?? ''}–${p.projected_year ?? ''}`], rows));

  if (p.annual_openings != null && p.change_percent != null) {
    parts.push(keyFinding(
      `${badge(`${p.change_percent.toFixed(1)}% growth`, growthColor)} &nbsp; ${badge(`${fmtN(p.annual_openings)} annual openings`, '#7c3aed')} &nbsp; <strong>${p.occupation_title || 'This occupation'} is ${p.change_percent >= 7 ? 'growing faster than average' : 'growing at average pace'}.</strong>`
    ));
  }

  parts.push(`_Source: ${geo === 'National' ? 'U.S. Bureau of Labor Statistics' : 'State Workforce Development / Projections Central'} — Employment Projections 2022–2032_`);

  return parts.join('\n\n');
}

// ─── skills (O*NET only — no web-scraping contamination) ─────────────────────

export function renderSkillsBlock(raw: RawContext | null): string {
  const occ = raw?.occupation;
  if (!occ?.skills || occ.skills.length === 0) {
    return '_Skills data not available from O*NET for this occupation._';
  }

  // Filter to relevant skill types, exclude obvious tech contamination
  const EXCLUDE_ARTIFACTS = ['aws', 'react', 'angular', 'vue', 'node.js', 'python', 'java ', 'javascript', 'docker', 'kubernetes'];
  const skills = occ.skills.filter(s => {
    const name = s.skill_name.toLowerCase();
    return !EXCLUDE_ARTIFACTS.some(bad => name.includes(bad));
  });

  const byType: Record<string, typeof skills> = {};
  for (const s of skills) {
    const type = s.skill_type || 'skill';
    if (!byType[type]) byType[type] = [];
    byType[type].push(s);
  }

  const typeLabels: Record<string, string> = {
    skill: 'Core Skills',
    knowledge: 'Knowledge Areas',
    technology: 'Technology Tools',
    tool: 'Tools & Equipment',
    ability: 'Abilities',
  };

  const rows: string[][] = skills.slice(0, 12).map(s => [
    s.skill_name,
    typeLabels[s.skill_type] || s.skill_type,
    s.importance != null ? s.importance.toFixed(1) : '—',
  ]);

  const parts: string[] = [];
  parts.push(dataTable(['Skill / Knowledge / Tool', 'Category', 'Importance (1–7)'], rows));
  parts.push(`_Source: O*NET OnLine — Occupation Profile for SOC ${occ.soc}_`);

  return parts.join('\n\n');
}

// ─── state priority & WIOA status ────────────────────────────────────────────

export function renderStatePriorityBlock(raw: RawContext | null): string {
  const occ = raw?.occupation;
  if (!occ?.statePriority?.isPriority) {
    return '';  // Only render if actually on priority list
  }

  const sp = occ.statePriority;
  const d = sp.data;

  const badges: string[] = [];
  if (sp.isPriority) badges.push(badge('In-Demand Occupation', '#059669'));
  if (sp.wioaFundable) badges.push(badge('WIOA Fundable', '#7c3aed'));
  if (sp.scholarshipEligible) badges.push(badge('Scholarship Eligible', '#0ea5e9'));

  const parts: string[] = [];

  if (badges.length > 0) {
    parts.push(badges.join(' &nbsp; '));
  }

  if (d) {
    const rows: string[][] = [];
    if (d.sector) rows.push(['Sector', d.sector]);
    if (d.priority_level) rows.push(['Priority Level', d.priority_level.replace(/_/g, ' ')]);
    if (d.entry_annual_salary) rows.push(['Entry Annual Salary', fmt$(d.entry_annual_salary)]);
    if (d.wioa_fundable) rows.push(['WIOA Eligible', 'Yes — Individual Training Account funding available']);
    if (d.scholarship_eligible) rows.push(['Scholarship Eligible', 'Yes']);
    if (d.effective_year) rows.push(['Designation Year', d.effective_year]);

    if (rows.length > 0) {
      parts.push(dataTable(['Category', 'Detail'], rows));
    }

    parts.push(keyFinding(
      `This occupation is on the state in-demand list${sp.wioaFundable ? ' and qualifies for WIOA Individual Training Account funding' : ''}. Eligible students may be able to attend at <strong>no out-of-pocket cost</strong> — a powerful enrollment conversion lever for cost-sensitive adult learners.`
    ));
  }

  parts.push(`_Source: State Workforce Development Board — In-Demand Occupations / WIOA Eligible Training Provider List_`);

  return parts.join('\n\n');
}

// ─── completions (IPEDS) ─────────────────────────────────────────────────────

export function renderCompletionsBlock(raw: RawContext | null): string {
  const comp = raw?.completions;
  if (!comp?.found || !comp.data || !Array.isArray(comp.data) || comp.data.length === 0) {
    return '_IPEDS program completions data not available for this CIP code and state._';
  }

  // Expect array of { institution, city, completions, year }
  const rows = (comp.data as Array<{ institution?: string; institution_name?: string; city?: string; completions?: number; total_completions?: number; year?: number }>)
    .slice(0, 10)
    .map(r => [
      r.institution || r.institution_name || '—',
      r.city || '—',
      fmtN(r.completions ?? r.total_completions),
    ]);

  if (rows.length === 0) return '_No IPEDS completions records found._';

  const parts: string[] = [];
  parts.push(dataTable(['Institution', 'City', 'Annual Completers'], rows));
  parts.push(`_Source: IPEDS Program Completions — Annual completers (graduates) by institution. These are annual completions, not enrollment or cohort size figures._`);

  return parts.join('\n\n');
}

// ─── demographics summary ─────────────────────────────────────────────────────

export function renderDemographicsBlock(raw: RawContext | null): string {
  const sa = raw?.serviceArea;
  const demos = raw?.stateDemographics;

  if (sa?.found && sa.data) {
    const d = sa.data as { totalPopulation?: number; avgMedianIncome?: number; avgPovertyRate?: number; avgBachelorsRate?: number; avgUnemployment?: number; counties?: Array<{ name: string; is_primary: boolean }> };
    const rows: string[][] = [];
    if (d.totalPopulation) rows.push(['Total Population', fmtN(d.totalPopulation)]);
    if (d.avgMedianIncome) rows.push(['Median Household Income', fmt$(d.avgMedianIncome)]);
    if (d.avgPovertyRate) rows.push(['Poverty Rate', fmtPct(d.avgPovertyRate)]);
    if (d.avgBachelorsRate) rows.push(["Bachelor's Degree+", fmtPct(d.avgBachelorsRate)]);
    if (d.avgUnemployment) rows.push(['Unemployment Rate', fmtPct(d.avgUnemployment)]);
    if (rows.length === 0) return '';
    return dataTable(['Demographic Indicator', 'Service Area Value'], rows) +
      '\n\n_Source: U.S. Census Bureau — American Community Survey (ACS 5-Year Estimates)_';
  }

  if (demos?.found && demos.data) {
    const d = demos.data;
    const rows: string[][] = [];
    if (d.totalPopulation) rows.push(['Total Population', fmtN(d.totalPopulation)]);
    if (d.avgMedianIncome) rows.push(['Median Household Income', fmt$(d.avgMedianIncome)]);
    if (d.avgPovertyRate) rows.push(['Poverty Rate', fmtPct(d.avgPovertyRate)]);
    if (d.avgBachelorsRate) rows.push(["Bachelor's Degree+", fmtPct(d.avgBachelorsRate)]);
    if (d.avgUnemployment) rows.push(['Unemployment Rate', fmtPct(d.avgUnemployment)]);
    if (rows.length === 0) return '';
    return dataTable(['Demographic Indicator', 'Statewide Value'], rows) +
      '\n\n_Source: U.S. Census Bureau — American Community Survey (ACS 5-Year Estimates)_';
  }

  return '';
}
