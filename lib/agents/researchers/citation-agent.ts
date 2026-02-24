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
  corrections: Array<{
    componentType: string; // which agent's output to fix (e.g., 'labor_market', 'regulatory_compliance')
    original: string; // text to find
    corrected: string; // replacement text
    reason: string; // why (internal log only)
  }>;
  dataSources: string[]; // clean list for appendix ("U.S. Bureau of Labor Statistics — OES May 2024")
  warnings: string[]; // internal only, do NOT put in report
  summary: string;
}

export async function runCitationAgent(
  input: CitationAgentInput
): Promise<CitationAgentOutput> {
  console.log(`\n🔍 Running citation agent for ${input.occupation} in ${input.state}...`);

  const prompt = `You are a SOURCE VERIFICATION specialist for workforce intelligence reports.

Your PRIMARY job is to VERIFY that sources cited by other agents are accurate and support their claims, and to FIX any errors you find.

This is a QUALITY CONTROL step — you catch hallucinations and bad data before the client sees the report.

YOUR VERIFICATION PROCESS:
1. Extract every factual claim that has a source citation
2. Check if the source is SPECIFIC and OFFICIAL (.gov, state code, BLS, etc.)
3. Verify the claim MATCHES what that source actually says
4. When a mismatch is found, output a CORRECTION (original text → corrected text)
5. Flag claims with NO source or WEAK sources
6. Build a clean list of data sources used in the report for the appendix

PRIORITY CLAIMS TO VERIFY (in order):
1. Licensure/certification requirements (hours, exams, fees)
2. Continuing education requirements (hours, frequency, content)
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

SOURCE QUALITY HIERARCHY:
1. ✅ Official government sources (.gov domains, state codes) — primary evidence
2. ✅ Federal data (BLS, Census, O*NET) — primary evidence
3. ✅ State/regional data (state workforce boards) — primary evidence
4. ✅ Industry associations (ASHP, NCPA, PTCB) — supporting evidence
5. ✅ Employer career pages and official postings — active market signal
6. ⚠️ Reddit, student forums, Indeed/Glassdoor reviews, LinkedIn discussions — QUALITATIVE SIGNAL (see below)
7. ❌ Third-party aggregator sites for regulatory data (NOT acceptable for regulatory claims)

QUALITATIVE SOURCES — TRANSFORM, DO NOT DELETE:
Reddit, student forums (r/PharmacyTechnician, etc.), Indeed reviews, Glassdoor, rate-my-professor, LinkedIn discussions are LEGITIMATE market intelligence. They provide qualitative signal that government data cannot — competitor weaknesses, learner concerns, employer culture, real student experiences.

DO NOT strip these citations. Instead, TRANSFORM them:
❌ "Reddit r/PharmacyTechnician reports externship waitlists at DMACC"
✅ "Online community feedback among pharmacy technician students and practitioners indicates externship site availability constraints at DMACC"

❌ "According to Indeed reviews, Ashworth's curriculum is outdated"
✅ "Student and graduate reviews of Ashworth's program indicate concerns about curriculum currency relative to current PTCB exam content"

Rules for qualitative source handling:
- Change attribution to professional language ("online practitioner community feedback," "student-reported experiences," "publicly available program reviews")
- Downgrade claim strength: use "indicates," "suggests," "anecdotal reports suggest," not "confirms" or "shows"
- Only use qualitative signal to TRIANGULATE — it supports a finding from a stronger source, or fills a gap where no government data exists
- Qualitative signal about COMPETITORS is especially valuable — keep it, transform it

HOW TO VERIFY:
1. Use your knowledge to check facts
2. Check citation quality (specific and official?)
3. Look for red flags (round numbers for regulatory hours might be guesses)
4. Cross-check within report (if regulatory says 8 hours but financial uses 6, flag it)

WHEN YOU FIND AN ERROR — output a CORRECTION:
- componentType: which agent section the error appears in (use these values: "regulatory_compliance", "labor_market", "competitive_landscape", "financial_viability", "institutional_fit", "learner_demand", "employer_demand")
- original: the exact text snippet containing the error
- corrected: the CLIENT-READY replacement text. This text will be inserted DIRECTLY into a report that a paying client reads. It must read like polished prose — NO "NOTE:", "VERIFICATION:", "DATA ANOMALY", "[TO BE CONFIRMED]", or internal reasoning. Just the corrected factual statement. If a figure is wrong, replace it with the right figure. If a figure is unverifiable, omit it and state what IS known.
- reason: detailed internal reasoning about why this is wrong (this is for INTERNAL logging only, never shown to client — put ALL your analysis here, not in 'corrected')

⚠️ CRITICAL: The 'corrected' field goes DIRECTLY into the client report. The 'reason' field goes to the admin dashboard. Do NOT mix them up. If you cannot determine the correct figure, the correction should REMOVE the uncertain claim rather than flag it with brackets or notes.

EXAMPLE OF A GOOD CORRECTION:
{
  "original": "Iowa requires 8 hours of continuing education",
  "corrected": "Iowa requires 6 hours of continuing education every 2 years (Iowa Admin Code 481—944.2)",
  "reason": "Analyst cited 8 hours but Iowa Admin Code 481—944.2 specifies 6 hours biennially"
}

EXAMPLE OF A BAD CORRECTION (DO NOT DO THIS):
{
  "original": "Total Seat Hours | 160 hrs",
  "corrected": "Total Seat Hours | [TO BE CONFIRMED] | NOTE: The regulatory analysis cites 1,500 hours...",
  "reason": "..."
}
↑ This puts internal QA language into the client report. Instead, do:
{
  "original": "Total Seat Hours | 160 hrs | Iowa Board of Pharmacy Rule 657 IAC 8.19",
  "corrected": "Total Seat Hours | 160 hrs (regulatory minimum; actual program hours to be determined in curriculum design) | Iowa Administrative Code 657-3.19",
  "reason": "CRITICAL: The regulatory analysis cites 1,500 hours under Iowa Admin Code 657-3.19 while financial model uses 160 hours under a different rule number. These cannot both be correct. The 160-hour figure likely reflects only didactic hours. Full internal analysis in warnings."
}

WHEN A CONTRADICTION IS UNRESOLVABLE:
Do NOT inject flags, brackets, or QA notes into 'corrected'. Instead:
1. Use the most defensible figure in 'corrected' with a brief qualifying phrase (e.g., "regulatory minimum" or "based on BLS OES May 2024")
2. Put the full analysis of the contradiction in 'reason'
3. Add a WARNING to the warnings array describing the issue

VERIFICATION CONFIDENCE LEVELS:
- "verified" ✅: Official source AND claim is consistent with your knowledge
- "likely" ⚠️: Source is official but exact claim unconfirmable
- "unverified" ❓: No source, third-party source, or contradicts your knowledge

DATA SOURCES LIST:
Build a clean list of authoritative sources actually referenced in the analyses. Format each as a professional citation, e.g.:
- "U.S. Bureau of Labor Statistics — Occupational Employment and Wage Statistics (OES), May 2024"
- "O*NET OnLine — SOC 29-2052 Occupation Profile"
- "Iowa Workforce Development — Labor Market Information"

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
  "regulatoryCitations": [...],
  "marketCitations": [...],
  "corrections": [
    {
      "componentType": "regulatory_compliance",
      "original": "8 hours of continuing education required",
      "corrected": "6 hours of continuing education required every 2 years (Iowa Admin Code 481—944.2)",
      "reason": "Analyst cited 8 hours but Iowa Admin Code 481—944.2 specifies 6 hours. This is a factual error that could mislead program designers on compliance requirements."
    }
  ],
  "dataSources": [
    "U.S. Bureau of Labor Statistics — Occupational Employment and Wage Statistics (OES), May 2024",
    "O*NET OnLine — SOC 15-1212 Occupation Profile",
    "Iowa Workforce Development — Labor Market Information"
  ],
  "warnings": [
    "Enrollment projection (300 students/year) not verified - analyst estimate based on market size"
  ],
  "summary": "Verified 12 high-stakes claims. 2 corrections applied. 8 data sources cataloged."
}

CRITICAL RULES:
1. Regulatory hours: CHECK exact numbers from cited sources. If wrong, add a correction.
2. Source quality: Only accept .gov, official state code sites, and federal agency data for regulatory claims.
3. Vague citations: "Iowa regulations" is NOT acceptable. Require specific section.
4. Corrections: When you find an error, provide both the original AND corrected text so the system can auto-fix it.
5. dataSources: Build a clean, professional list of 6-12 data sources for the report appendix.
6. warnings: These are for INTERNAL use only — they will NOT appear in the client report. Be thorough.

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

    const parsed = JSON.parse(jsonMatch[0]);

    // Ensure backward compatibility — fill in new fields with defaults if missing
    const rawCorrections: typeof parsed.corrections = parsed.corrections || [];

    // Post-process corrections: ensure 'corrected' text is truly client-ready
    // Strip any QA language that leaked through despite prompt instructions
    const cleanedCorrections = rawCorrections.map((c: any) => {
      let corrected = c.corrected || '';
      // Strip common QA markers that should never appear in client text
      corrected = corrected.replace(/\b(VERIFICATION NOTE|NOTE|CAUTION|WARNING|DATA ANOMALY|INTERNAL NOTE|DO NOT CITE|TO BE CONFIRMED|MUST BE VERIFIED|NEEDS VERIFICATION)[:\s—–-]*/gi, '');
      corrected = corrected.replace(/\[(?:TO BE (?:CONFIRMED|VERIFIED)|VERIFY[^[\]]*|DATA ANOMALY[^[\]]*)\]/gi, '');
      // Strip sentences that are clearly internal reasoning (contain "must be resolved", "should be verified", "cannot both be correct")
      corrected = corrected.replace(/[^.]*(?:must be (?:resolved|confirmed|verified)|should be (?:verified|confirmed)|cannot both be correct|this (?:discrepancy|inconsistency) must)[^.]*\.\s*/gi, '');
      // Strip "This estimate requires validation..." type sentences
      corrected = corrected.replace(/[^.]*(?:requires? validation|requires? verification|must be confirmed against)[^.]*\.\s*/gi, '');
      // Collapse multiple spaces/newlines
      corrected = corrected.replace(/\s{2,}/g, ' ').trim();
      return { ...c, corrected };
    });

    const result: CitationAgentOutput = {
      verifiedClaims: parsed.verifiedClaims || [],
      regulatoryCitations: parsed.regulatoryCitations || [],
      marketCitations: parsed.marketCitations || [],
      corrections: cleanedCorrections,
      dataSources: parsed.dataSources || [],
      warnings: parsed.warnings || [],
      summary: parsed.summary || '',
    };

    console.log(`✅ Citation agent complete:`);
    console.log(`   - ${result.verifiedClaims.length} verified claims`);
    console.log(`   - ${result.regulatoryCitations.length} regulatory citations`);
    console.log(`   - ${result.marketCitations.length} market citations`);
    console.log(`   - ${result.corrections.length} corrections`);
    console.log(`   - ${result.dataSources.length} data sources cataloged`);
    console.log(`   - ${result.warnings.length} warnings (internal)`);

    if (result.corrections.length > 0) {
      console.log(`\n🔧 Citation Corrections:`);
      result.corrections.forEach((c) => console.log(`   - [${c.componentType}] "${c.original}" → "${c.corrected}" (${c.reason})`));
    }

    if (result.warnings.length > 0) {
      console.log(`\n⚠️  Citation Warnings (internal):`);
      result.warnings.forEach((w) => console.log(`   - ${w}`));
    }

    return result;
  } catch (error) {
    console.error('❌ Citation agent error:', error);
    throw error;
  }
}
