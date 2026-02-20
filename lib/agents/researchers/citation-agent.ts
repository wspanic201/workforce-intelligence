import { callClaude } from '../../ai/anthropic';

interface CitationAgentInput {
  projectId: string;
  occupation: string;
  state: string;
  regulatoryAnalysis?: string;
  marketAnalysis?: string;
  employerAnalysis?: string;
  financialAnalysis?: string;
  academicAnalysis?: string;
  demographicAnalysis?: string;
  competitiveAnalysis?: string;
}

interface VerifiedClaim {
  claim: string;
  source: string;
  sourceType: 'statute' | 'regulation' | 'government_data' | 'academic' | 'industry';
  confidence: 'verified' | 'likely' | 'unverified';
  citation: string; // formatted citation for inline use
}

interface CitationAgentOutput {
  verifiedClaims: VerifiedClaim[];
  regulatoryCitations: VerifiedClaim[];
  marketCitations: VerifiedClaim[];
  warnings: string[];
  summary: string;
}

export async function runCitationAgent(
  input: CitationAgentInput
): Promise<CitationAgentOutput> {
  console.log(`\n🔍 Running citation agent for ${input.occupation} in ${input.state}...`);

  const prompt = `You are a SOURCE VERIFICATION specialist for workforce intelligence reports.

Your PRIMARY job is to VERIFY that sources cited by other agents are accurate and support their claims.

This is a QUALITY CONTROL step - a second chance to catch hallucinations and bad data before delivery.

YOUR VERIFICATION PROCESS:
1. Extract every factual claim that has a source citation
2. Check if the source is SPECIFIC and OFFICIAL (.gov, state code, BLS, etc.)
3. Verify the claim MATCHES what that source actually says
4. Flag MISMATCHES between claims and sources (this is the hallucination check)
5. Flag claims with NO source or WEAK sources (third-party websites, assumptions)

PRIORITY CLAIMS TO VERIFY (in order):
1. Licensure/certification requirements (hours, exams, fees) ← HIGHEST RISK
2. Continuing education requirements (hours, frequency, content) ← HIGHEST RISK
3. Employment statistics (job openings, growth rates, wages)
4. Regulatory requirements (state laws, accreditation standards)
5. Market data (competitor programs, enrollment numbers)

HALLUCINATION PATTERNS TO CATCH:
- Citing "Iowa Code §157.10" but getting the hours wrong
- Citing a source that doesn't actually contain the claimed data
- Vague citations ("Iowa regulations" instead of specific code section)
- Third-party sources for regulatory data (should be .gov only)
- Estimates presented as official data

ANALYSIS TO REVIEW:
${input.regulatoryAnalysis ? `\n## Regulatory Analysis\n${input.regulatoryAnalysis}` : ''}
${input.marketAnalysis ? `\n## Market Analysis\n${input.marketAnalysis}` : ''}
${input.employerAnalysis ? `\n## Employer Analysis\n${input.employerAnalysis}` : ''}
${input.financialAnalysis ? `\n## Financial Analysis\n${input.financialAnalysis}` : ''}
${input.academicAnalysis ? `\n## Academic Analysis\n${input.academicAnalysis}` : ''}
${input.demographicAnalysis ? `\n## Demographic Analysis\n${input.demographicAnalysis}` : ''}
${input.competitiveAnalysis ? `\n## Competitive Analysis\n${input.competitiveAnalysis}` : ''}

GOOD CITATION EXAMPLES (accept these):
✅ "Iowa Admin Code 481—944.2 requires 6 hours of continuing education every 2 years"
   → Specific statute, verifiable claim
✅ "Median wage: $38,350 (BLS OES, May 2024, SOC 29-2052)"
   → Official data source, specific occupation code, recent date
✅ "Kirkwood Community College offers a 32-credit pharmacy tech certificate"
   → Competitor website is the RIGHT source for competitor programs

BAD CITATION EXAMPLES (flag these):
❌ "Iowa regulations require 8 hours of continuing education"
   → Vague source ("regulations"), and 8 hours is WRONG (actual is 6 hours)
❌ "State law requires 1,600 hours for licensure"
   → No specific statute cited
❌ "According to CosmetologySchools.com, Iowa requires..."
   → Third-party website for regulatory data (should be legis.iowa.gov)
❌ "Estimated 300 students per year based on market analysis"
   → This is fine! It's an estimate, just note it as such in warnings (not critical)

SOURCE QUALITY HIERARCHY:
1. ✅ Official government sources (.gov domains, state codes) ← REQUIRE for regulatory claims
2. ✅ Federal data (BLS, Census, O*NET)
3. ✅ State/regional data (state workforce boards)
4. ⚠️ Industry associations (acceptable with verification)
5. ⚠️ Competitor websites (acceptable for competitor analysis only)
6. ❌ Third-party aggregator sites (NOT acceptable for regulatory data)

HOW TO VERIFY (since you can't fetch sources directly):
1. **Use your knowledge:** If analyst says "Iowa cosmetology requires 8 hours CEU" but you know it's actually 6 hours per Iowa Admin Code 481—944.2, FLAG IT as a critical warning
2. **Check citation quality:** Is the source specific and official? "Iowa Admin Code 481—944.2" = good. "Iowa regulations" = bad.
3. **Look for red flags:** Round numbers (8, 10, 16) for regulatory hours might be guesses. Specific numbers (1,600, 2,052) are more likely accurate.
4. **Cross-check within report:** If regulatory analyst says 8 hours but financial analyst uses 6 hours, that's a mismatch - flag it.

VERIFICATION CONFIDENCE LEVELS:
- "verified" ✅: Analyst provided specific official source (statute, BLS report) AND claim is consistent with your knowledge
- "likely" ⚠️: Source is official but you can't independently confirm the exact claim (benefit of doubt)
- "unverified" ❓: No source provided, or source is third-party, or claim contradicts your knowledge

WHEN TO USE EACH LEVEL:
- **verified:** "Iowa Code §157.10 requires 1,600 hours" + you know that's correct = verified
- **likely:** "Iowa Admin Code 645-60.18 requires continuing education" + you're not sure of exact hours = likely  
- **unverified:** "8 hours CEU required" + you know it's actually 6 hours = unverified + WARNING

Return a JSON object with this structure:
{
  "verifiedClaims": [
    {
      "claim": "Cosmetology licensure requires 1,600 hours of training",
      "source": "https://legis.iowa.gov/...",
      "sourceType": "statute",
      "confidence": "verified",
      "citation": "Iowa Code §157.10"
    }
  ],
  "regulatoryCitations": [
    {
      "claim": "6 hours of continuing education required every 2 years",
      "source": "https://www.legis.iowa.gov/...",
      "sourceType": "regulation",
      "confidence": "verified",
      "citation": "Iowa Admin Code 481—944.2"
    }
  ],
  "marketCitations": [
    {
      "claim": "450,000 pharmacy technicians employed nationally",
      "source": "https://www.bls.gov/oes/...",
      "sourceType": "government_data",
      "confidence": "verified",
      "citation": "BLS OES, May 2024"
    }
  ],
  "warnings": [
    "Enrollment projection (300 students/year) not verified - analyst estimate based on market size",
    "Competitor pricing ($250/credit) from program websites, not official sources"
  ],
  "summary": "Verified 12 high-stakes claims. 2 regulatory requirements confirmed from state code. 3 market statistics from BLS. 4 claims flagged as estimates."
}

CRITICAL VERIFICATION RULES:
1. **Regulatory hours (licensure, CEU):** If analyst cites "Iowa Code §157.10" and says "8 hours" - CHECK if that statute actually says 8 hours. If you can't verify the exact number from the cited source, FLAG IT as a warning.
2. **Source quality:** Only accept .gov, official state code sites, and federal agency data for regulatory claims. Third-party sites are NOT acceptable sources for legal requirements.
3. **Vague citations:** "Iowa regulations" is NOT acceptable. Require "Iowa Admin Code 481—944.2" (specific section).
4. **No citation:** If a high-stakes claim (licensure, CEU, legal requirement) has NO citation, that's a CRITICAL warning.
5. **Projections vs. facts:** Enrollment projections and revenue estimates are fine WITHOUT citations (they're analyst estimates). Just mark them as "unverified" in warnings.

WHAT TO FLAG AS WARNINGS:
- ⚠️ Regulatory claim cites a source but you can't verify the numbers match
- ⚠️ High-stakes claim (licensure, CEU) has no source at all
- ⚠️ Source is third-party website for regulatory data (should be .gov)
- ⚠️ Citation is vague ("state law" instead of specific statute)
- ℹ️ Projection/estimate presented without noting it's an estimate (minor - just note it)

WHAT NOT TO FLAG:
- ✅ Market projections without citations (these are analyst estimates - that's expected)
- ✅ Competitor analysis from program websites (that's the right source)
- ✅ Qualitative assessments ("strong demand", "competitive market") - these don't need citations

YOUR MISSION: Catch the Iowa cosmetology 8-hour CEU hallucination before it ships.
If an analyst says "Iowa Admin Code 481—944.2 requires 8 hours CEU" but you can't verify that exact number from an official source, FLAG IT.

Focus on HIGH-STAKES CLAIMS where errors cause real harm (legal compliance, program costs).
Be strict on regulatory data. Be lenient on market estimates.

Respond with ONLY valid JSON.`;

  try {
    const { content: fullContent } = await callClaude(prompt, {
      model: 'claude-sonnet-4-6',
      maxTokens: 16000,
      temperature: 0.3, // Lower temperature for fact-checking
    });

    // Parse JSON response
    const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in citation agent response');
    }

    const result = JSON.parse(jsonMatch[0]) as CitationAgentOutput;

    console.log(`✅ Citation agent complete:`);
    console.log(`   - ${result.verifiedClaims.length} verified claims`);
    console.log(`   - ${result.regulatoryCitations.length} regulatory citations`);
    console.log(`   - ${result.marketCitations.length} market citations`);
    console.log(`   - ${result.warnings.length} warnings`);

    if (result.warnings.length > 0) {
      console.log(`\n⚠️  Citation Warnings:`);
      result.warnings.forEach((w) => console.log(`   - ${w}`));
    }

    return result;
  } catch (error) {
    console.error('❌ Citation agent error:', error);
    throw error;
  }
}
