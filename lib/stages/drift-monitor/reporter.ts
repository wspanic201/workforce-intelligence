import { callClaude } from '@/lib/ai/anthropic';
import type { DriftProgram, DriftScanResult, EmployerSkill } from './types';

export async function generateDriftNarrative(
  program: DriftProgram,
  result: Omit<DriftScanResult, 'narrative' | 'recommendations'>
): Promise<{ narrative: string; recommendations: string[] }> {

  const prompt = `You are a workforce intelligence analyst. Write a clear, actionable analysis of curriculum drift for a community college program.

PROGRAM: ${program.programName} at ${program.institutionName}
OCCUPATION: ${program.occupationTitle}
DRIFT SCORE: ${result.driftScore}/100 (${result.driftLevel.toUpperCase()})
POSTINGS ANALYZED: ${result.postingsAnalyzed}

TOP EMPLOYER SKILL GAPS (skills employers want that the program doesn't teach):
${result.gapSkills.slice(0, 10).join(', ')}

COVERED SKILLS (alignment strengths):
${result.coveredSkills.slice(0, 10).join(', ')}

POTENTIALLY STALE SKILLS (curriculum topics rarely mentioned by employers):
${result.staleSkills.slice(0, 5).join(', ')}

Write:
1. A 2-3 paragraph NARRATIVE explaining the drift situation in plain language a dean or VP would understand. Be specific about what's changing in the field. Don't be alarmist but be honest.
2. 4-6 specific RECOMMENDATIONS — concrete actions the program could take.

Return JSON:
{
  "narrative": "full narrative text...",
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}`;

  const result2 = await callClaude(prompt, { maxTokens: 2000 });

  try {
    const cleaned = result2.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      narrative: result2.content.slice(0, 1000),
      recommendations: ['Review curriculum against current job posting requirements', 'Consult with local employers about skill needs'],
    };
  }
}

export function generateDriftReportHTML(
  program: DriftProgram,
  scan: DriftScanResult,
  employerSkills: EmployerSkill[]
): string {
  const scoreColor = {
    aligned: '#16a34a',
    minor: '#ca8a04',
    moderate: '#ea580c',
    significant: '#dc2626',
    critical: '#7f1d1d',
  }[scan.driftLevel];

  const levelLabel = {
    aligned: '✅ Aligned',
    minor: '⚠️ Minor Drift',
    moderate: '🟠 Moderate Drift',
    significant: '🔴 Significant Drift',
    critical: '🚨 Critical Drift',
  }[scan.driftLevel];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

  @page { size: letter; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    color: #1e293b;
    background: #fff;
    width: 8.5in;
    min-height: 11in;
  }

  .cover {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
    color: white;
    padding: 1in 0.8in 0.6in;
    min-height: 2.5in;
  }
  .cover-brand { font-family: 'Space Grotesk', sans-serif; font-size: 11px; color: #64b5f6; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 0.4in; }
  .cover-title { font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 700; line-height: 1.2; margin-bottom: 12px; }
  .cover-subtitle { font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 0.3in; }
  .cover-meta { font-size: 10px; color: rgba(255,255,255,0.5); }

  .body { padding: 0.4in 0.6in; }

  .score-card {
    display: flex;
    align-items: center;
    gap: 20px;
    background: #f8fafc;
    border: 2px solid ${scoreColor};
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 20px;
  }
  .score-number {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 48px;
    font-weight: 700;
    color: ${scoreColor};
    line-height: 1;
    min-width: 80px;
  }
  .score-label { font-size: 18px; font-weight: 600; color: ${scoreColor}; }
  .score-desc { font-size: 11px; color: #64748b; margin-top: 4px; }

  h2 { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600; color: #0f172a; margin: 20px 0 10px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }

  .narrative { font-size: 11px; line-height: 1.7; color: #334155; margin-bottom: 16px; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10.5px; }
  th { background: #0f172a; color: white; padding: 6px 10px; text-align: left; font-weight: 500; }
  td { padding: 5px 10px; border-bottom: 1px solid #f1f5f9; }
  tr:nth-child(even) td { background: #f8fafc; }

  .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9.5px; font-weight: 500; margin: 2px; }
  .tag-gap { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .tag-covered { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  .tag-stale { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }

  .rec-list { list-style: none; }
  .rec-list li { padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 11px; line-height: 1.5; }
  .rec-list li::before { content: "→ "; color: #3b82f6; font-weight: 700; }

  .footer { margin-top: 0.3in; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-brand">Wavelength · Program Curriculum Drift Analysis</div>
  <div class="cover-title">Program Drift Alert</div>
  <div class="cover-subtitle">${program.programName} · ${program.institutionName}</div>
  <div class="cover-meta">Occupation: ${program.occupationTitle} ${program.socCode ? `(SOC ${program.socCode})` : ''} · Scanned ${new Date(scan.scannedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · ${scan.postingsAnalyzed} job postings analyzed</div>
</div>

<div class="body">

  <div class="score-card">
    <div class="score-number">${scan.driftScore}</div>
    <div>
      <div class="score-label">${levelLabel}</div>
      <div class="score-desc">Drift Score out of 100 · ${scan.coveredSkills.length} of ${scan.coveredSkills.length + scan.gapSkills.length} top employer skills covered in curriculum</div>
    </div>
  </div>

  <h2>Analysis</h2>
  <div class="narrative">${scan.narrative.replace(/\n\n/g, '</div><div class="narrative">').replace(/\n/g, '<br>')}</div>

  <h2>Skill Gap Analysis</h2>
  <div style="margin-bottom:12px">
    <strong style="font-size:10px;color:#64748b">GAPS — Employer Skills Not In Curriculum:</strong><br>
    ${scan.gapSkills.map(s => `<span class="tag tag-gap">${s}</span>`).join('')}
  </div>
  <div style="margin-bottom:12px">
    <strong style="font-size:10px;color:#64748b">COVERED — Employer Skills In Curriculum:</strong><br>
    ${scan.coveredSkills.map(s => `<span class="tag tag-covered">${s}</span>`).join('')}
  </div>
  ${scan.staleSkills.length > 0 ? `
  <div style="margin-bottom:16px">
    <strong style="font-size:10px;color:#64748b">POTENTIALLY STALE — Low Employer Demand:</strong><br>
    ${scan.staleSkills.map(s => `<span class="tag tag-stale">${s}</span>`).join('')}
  </div>` : ''}

  <h2>Top Employer Requirements</h2>
  <table>
    <tr><th>#</th><th>Skill / Requirement</th><th>Employer Frequency</th><th>In Curriculum?</th></tr>
    ${employerSkills.slice(0, 15).map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${s.skill}</td>
      <td>${s.frequency} postings</td>
      <td>${scan.coveredSkills.includes(s.skill) ? '<span style="color:#16a34a;font-weight:600">✓ Yes</span>' : '<span style="color:#dc2626;font-weight:600">✗ No</span>'}</td>
    </tr>`).join('')}
  </table>

  <h2>Recommendations</h2>
  <ul class="rec-list">
    ${scan.recommendations.map(r => `<li>${r}</li>`).join('')}
  </ul>

  <div class="footer">
    <span>Wavelength Program Curriculum Drift Analysis · withwavelength.com</span>
    <span>Confidential — Prepared for ${program.institutionName}</span>
  </div>

</div>
</body>
</html>`;
}
