import { callClaude } from '@/lib/ai/anthropic';
import { ResearchComponent } from '@/lib/types/database';

export interface QAIssue {
  type: 'hallucination' | 'false_action' | 'unverified_claim' | 'contradiction' | 'tone';
  severity: 'critical' | 'warning';
  location: string;
  original_text: string;
  explanation: string;
  suggested_fix: string;
}

export interface QAResult {
  issues: QAIssue[];
  cleanedMarkdown: string;
  issueCount: { critical: number; warning: number };
}

/**
 * QA/Fact-Check Agent — reviews the final report against source agent data.
 * Catches hallucinations, false present-tense actions, unverified claims,
 * contradictions between sections, and tone issues.
 */
export async function runQAReview(
  reportMarkdown: string,
  researchComponents: ResearchComponent[],
  projectContext: { program_name: string; client_name: string }
): Promise<QAResult> {
  const startTime = Date.now();

  // Build source data summary for fact-checking
  const sourceData = researchComponents
    .filter(c => c.status === 'completed')
    .map(comp => {
      const content = typeof comp.content === 'string'
        ? comp.content
        : JSON.stringify(comp.content, null, 2);
      return `## SOURCE: ${comp.component_type}\n${comp.markdown_output || content}`;
    })
    .join('\n\n---\n\n');

  const prompt = `You are a rigorous QA REVIEWER and FACT-CHECKER for a professional consulting report. Your job is to catch errors before this report is delivered to a paying client.

PROGRAM: ${projectContext.program_name}
CLIENT: ${projectContext.client_name}

## YOUR TASK

Review the FINAL REPORT against the SOURCE AGENT DATA below. Flag every issue you find. Then produce a CLEANED version of the report with all issues fixed.

## WHAT TO FLAG

### 1. HALLUCINATED FACTS (critical)
Claims that appear nowhere in the source data. Examples:
- "[School X] discontinued their program in [year]" — unless a source agent explicitly found this
- Specific statistics, percentages, or dollar amounts not traceable to source data
- Named individuals, specific grant awards, or events not in source data

### 2. FALSE PRESENT-TENSE ACTIONS (critical)
Statements implying something has already happened when it's actually a recommendation:
- "The grant application has been submitted" (it hasn't — it's a recommendation TO submit)
- "Partnerships have been established" (they haven't — it's recommended)
- "The program has secured funding" (it hasn't)
Rule: If it's a recommendation, it MUST use future/conditional tense ("should submit", "would need to", "recommend securing")

### 3. UNVERIFIED CLAIMS (warning)
Specific claims that COULD be true but aren't confirmed by source data:
- Competitor enrollment numbers not from source data
- Wage figures not from BLS/O*NET data provided
- Market share or growth rate claims without source

### 4. CONTRADICTIONS (critical)
Statements in one section that conflict with another section or with source data:
- Different enrollment projections in different sections
- Conflicting cost estimates
- Score rationale that contradicts the analysis

### 5. TONE ISSUES (warning)
- Anything implying the report was written by AI/automation
- References to "our AI agents" or "automated analysis"
- Language suggesting actions were taken on behalf of the client

### 6. ESTIMATION PASSED AS FACT (warning)
Statements presenting estimates or inferences as confirmed data:
- "40 annual hires" when source says "estimated 40 hires"
- "Program will enroll 25 students" when it's actually a projection
- "Competitors graduate 50 students per year" when that's calculated/inferred
Rule: Always qualify estimates with "estimated", "projected", "approximately", or "based on..."

### 7. DATA QUALITY NOT FLAGGED (warning)
Report fails to mention when key data is missing or APIs failed:
- Source says "SerpAPI failed, no job data available" but report presents job analysis
- O*NET returned wrong occupation code but report treats it as accurate
- BLS data unavailable but report discusses employment trends
Rule: If source agents flagged data issues, report MUST acknowledge limitations

### 8. UNSOURCED QUOTES (critical)
Direct or paraphrased quotes from employers, students, or survey respondents that don't appear in source data:
- "As one hospital HR director told us..." (no interviews were conducted)
- "Students prefer evening options, according to our survey" (no survey in source data)
- Employer testimonials or feedback not from actual research

### 9. OVERLY SPECIFIC PROJECTIONS (warning)
Projections that are more precise than justified by data:
- "Break-even in Month 27" when financial model shows "22-26 months"
- "Exactly 37 annual job openings" when data suggests "35-40 range"
- "ROI of 53.7%" when calculation is approximate
Rule: Match precision level to data quality

## SOURCE AGENT DATA (ground truth)

${sourceData}

## FINAL REPORT TO REVIEW

${reportMarkdown}

## OUTPUT FORMAT

Respond with a JSON block followed by the cleaned markdown.

\`\`\`json
{
  "issues": [
    {
      "type": "hallucination|false_action|unverified_claim|contradiction|tone",
      "severity": "critical|warning",
      "location": "Section name or heading where issue appears",
      "original_text": "The exact problematic text",
      "explanation": "Why this is an issue",
      "suggested_fix": "What it should say instead"
    }
  ]
}
\`\`\`

Then output:

---CLEANED_REPORT_START---

[The full report markdown with ALL issues fixed. Keep the same structure and sections, just fix the problematic content. Replace hallucinated facts with hedged language ("reports suggest" or remove entirely). Fix tense issues. Remove unverifiable specific claims.]

---CLEANED_REPORT_END---`;

  const { content, tokensUsed } = await callClaude(prompt, {
    maxTokens: 16000,
  });

  // Parse issues JSON
  let issues: QAIssue[] = [];
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      issues = parsed.issues || [];
    } catch (e) {
      console.warn('[QA Reviewer] Failed to parse issues JSON:', e);
    }
  }

  // Extract cleaned report
  let cleanedMarkdown = reportMarkdown; // fallback to original
  const cleanedMatch = content.match(/---CLEANED_REPORT_START---\s*([\s\S]*?)\s*---CLEANED_REPORT_END---/);
  if (cleanedMatch) {
    cleanedMarkdown = cleanedMatch[1].trim();
  }

  const critical = issues.filter(i => i.severity === 'critical').length;
  const warning = issues.filter(i => i.severity === 'warning').length;

  console.log(`[QA Reviewer] Found ${critical} critical, ${warning} warning issues in ${Date.now() - startTime}ms (${tokensUsed} tokens)`);

  return {
    issues,
    cleanedMarkdown,
    issueCount: { critical, warning },
  };
}
