import { ValidationProject, ResearchComponent } from '@/lib/types/database';
import { ProgramScore } from '@/lib/scoring/program-scorer';
import { callClaude } from '@/lib/ai/anthropic';

interface Input {
  project: ValidationProject;
  components: ResearchComponent[];
  programScore: ProgramScore;
  tigerTeamMarkdown?: string;
}

function section(type: string, title: string, content?: string) {
  if (!content?.trim()) return '';
  return `## ${title}\n\n${content.trim()}`;
}

function getComp(components: ResearchComponent[], type: string) {
  return components.find(c => c.component_type === type);
}

function shortSummary(md?: string, max = 900) {
  if (!md) return 'No narrative provided.';
  const cleaned = md.replace(/```[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n').trim();
  return cleaned.length > max ? `${cleaned.slice(0, max)}...` : cleaned;
}

export async function writeValidationBrief(input: Input): Promise<string> {
  const { project, components, programScore, tigerTeamMarkdown } = input;
  const rec = programScore.recommendation;
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const labor = shortSummary(getComp(components, 'labor_market')?.markdown_output);
  const competitive = shortSummary(getComp(components, 'competitive_landscape')?.markdown_output);
  const learner = shortSummary(getComp(components, 'learner_demand')?.markdown_output);
  const financial = shortSummary(getComp(components, 'financial_viability')?.markdown_output);
  const fit = shortSummary(getComp(components, 'institutional_fit')?.markdown_output);
  const regulatory = shortSummary(getComp(components, 'regulatory_compliance')?.markdown_output);
  const employer = shortSummary(getComp(components, 'employer_demand')?.markdown_output);

  const prompt = `You are editing a workforce validation report so it reads like a polished discovery brief.

Hard constraints:
- Keep all facts, scores, and recommendation unchanged.
- Tone: confident, clear, practical for CE leaders.
- No AI/meta language.
- Short paragraphs. No fluff.
- For each major section, end with three bullets exactly: Signal, Risk, Action.

Context:
Program: ${project.program_name}
Institution: ${project.client_name}
Date: ${date}
Recommendation: ${rec}
Composite score: ${programScore.compositeScore}/10

Dimension scores:
${programScore.dimensions.map(d => `- ${d.dimension}: ${d.score}/10 (${(d.weight*100).toFixed(0)}%)`).join('\n')}

Tiger Team Synthesis:
${tigerTeamMarkdown || 'Not available'}

Source section summaries:
- Labor Market: ${labor}
- Competitive: ${competitive}
- Learner Demand: ${learner}
- Financial: ${financial}
- Institutional Fit: ${fit}
- Regulatory: ${regulatory}
- Employer Demand: ${employer}

Return markdown only with this structure:
1) # Program Validation Report
2) Executive Summary
3) Validation Scorecard (markdown table)
4) Seven section narrative (Labor, Competitive, Learner, Financial, Fit, Regulatory, Employer)
5) Recommendations & Next Steps
6) Methodology & Limitations

Do not invent numbers. If uncertain, use cautious wording.`;

  const { content } = await callClaude(prompt, { maxTokens: 4000, temperature: 0.4 });
  return content.trim();
}
