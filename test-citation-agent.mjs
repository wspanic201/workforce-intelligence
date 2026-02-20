#!/usr/bin/env node

/**
 * Test script for citation agent
 * Usage: npx tsx test-citation-agent.mjs
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const FAKE_REGULATORY_ANALYSIS = `# Regulatory & Compliance Analysis

## Iowa Cosmetology Continuing Education

### Licensure Requirements
Initial cosmetology licensure in Iowa requires 1,600 hours of training from an accredited program.

Source: Iowa Code §157.10

### Continuing Education Requirements
Licensed cosmetologists in Iowa must complete **8 hours of continuing education every 2 years** to maintain their license.

The breakdown:
- 4 hours of discipline-specific training
- 2 hours of Iowa law, rules, and infection control  
- 2 hours of elective content

Source: Iowa Admin Code 645-60.18(157)

### Accreditation
Programs must be approved by the Iowa Board of Cosmetology Arts & Sciences.
`;

const FAKE_MARKET_ANALYSIS = `# Labor Market Analysis

## Employment Data
According to the Bureau of Labor Statistics, there are approximately **450,000 pharmacy technicians** employed nationally as of May 2024.

Median wage: $38,350 annually
Source: BLS OES, May 2024

## Regional Demand
Johnson County, Iowa shows strong demand with 125 open positions for pharmacy technicians across 3 major employers.
`;

async function testCitationAgent() {
  console.log('🧪 Testing Citation Agent - Source Verification\n');
  console.log('═'.repeat(80));
  console.log('TEST SCENARIO:');
  console.log('  Regulatory analyst claims: "8 hours CEU required (Iowa Admin Code 645-60.18)"');
  console.log('  ACTUAL Iowa requirement: 6 hours per Iowa Admin Code 481—944.2');
  console.log('');
  console.log('EXPECTED RESULT:');
  console.log('  Citation agent should FLAG this as incorrect/unverified');
  console.log('  Warning should appear explaining the mismatch');
  console.log('═'.repeat(80));
  console.log('');

  try {
    // Dynamic import of TypeScript module
    const { runCitationAgent } = await import('./lib/agents/researchers/citation-agent.ts');
    
    const result = await runCitationAgent({
      projectId: 'test-citation-001',
      occupation: 'Cosmetology',
      state: 'Iowa',
      regulatoryAnalysis: FAKE_REGULATORY_ANALYSIS,
      marketAnalysis: FAKE_MARKET_ANALYSIS,
    });

    console.log('\n📊 Citation Agent Results:\n');
    console.log(`Summary: ${result.summary}\n`);
    
    console.log(`Verified Claims: ${result.verifiedClaims.length}`);
    if (result.verifiedClaims.length > 0) {
      result.verifiedClaims.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.claim}`);
        console.log(`     Source: ${c.citation} (${c.confidence})`);
      });
    }
    
    console.log(`\nRegulatory Citations: ${result.regulatoryCitations.length}`);
    if (result.regulatoryCitations.length > 0) {
      result.regulatoryCitations.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.claim}`);
        console.log(`     Source: ${c.citation} (${c.confidence})`);
        
        // CHECK FOR THE HALLUCINATION
        if (c.claim.includes('8 hours')) {
          console.log(`     ⚠️  WARNING: This claim says 8 hours but actual Iowa requirement is 6 hours!`);
        }
      });
    }
    
    console.log(`\nWarnings: ${result.warnings.length}`);
    if (result.warnings.length > 0) {
      result.warnings.forEach((w, i) => {
        console.log(`  ${i + 1}. ${w}`);
      });
    }

    console.log('\n' + '═'.repeat(80));
    console.log('TEST RESULTS:');
    console.log('═'.repeat(80));
    
    // Check if agent caught the error
    const found8HourClaim = result.regulatoryCitations.some(c => 
      c.claim.toLowerCase().includes('8 hour')
    ) || result.verifiedClaims.some(c => 
      c.claim.toLowerCase().includes('8 hour')
    );
    
    const flaggedAs8Hour = found8HourClaim && result.regulatoryCitations.some(c =>
      c.claim.toLowerCase().includes('8 hour') && c.confidence !== 'verified'
    );
    
    const has6HourWarning = result.warnings.some(w => 
      w.toLowerCase().includes('6 hour') || 
      (w.toLowerCase().includes('8 hour') && w.toLowerCase().includes('incorrect'))
    );
    
    const hasGeneralWarning = result.warnings.some(w =>
      w.toLowerCase().includes('cosmetology') ||
      w.toLowerCase().includes('continuing education') ||
      w.toLowerCase().includes('ceu')
    );
    
    console.log('\n📊 Error Detection:');
    console.log(`  Found 8-hour claim: ${found8HourClaim ? '✅ Yes' : '❌ No'}`);
    console.log(`  Flagged as unverified/incorrect: ${flaggedAs8Hour ? '✅ Yes' : '❌ No'}`);
    console.log(`  Specific warning about 6 vs 8 hours: ${has6HourWarning ? '✅ Yes' : '❌ No'}`);
    console.log(`  General warning about CEU data: ${hasGeneralWarning ? '✅ Yes' : '❌ No'}`);
    
    console.log('\n' + '═'.repeat(80));
    
    if (has6HourWarning || (flaggedAs8Hour && hasGeneralWarning)) {
      console.log('✅ SUCCESS: Citation agent caught the hallucination!');
      console.log('   The 8-hour CEU claim was flagged as incorrect.');
    } else if (flaggedAs8Hour || hasGeneralWarning) {
      console.log('⚠️  PARTIAL SUCCESS: Agent flagged something but not explicitly the 6 vs 8 error');
      console.log('   Review warnings above to see what was caught.');
    } else {
      console.log('❌ FAILURE: Citation agent did NOT catch the error');
      console.log('   The 8-hour claim may have been marked as "verified"');
      console.log('   This means hallucinations could slip through to production reports.');
    }
    console.log('═'.repeat(80));

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testCitationAgent();
