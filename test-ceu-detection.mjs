#!/usr/bin/env node
/**
 * Test CEU Detection & Financial Routing
 * 
 * Tests the licensure vs. continuing education detection system:
 * 1. Regulatory analyst should detect this as "continuing_education"
 * 2. Financial analyst should route to CEU model
 * 3. Financial projections should show high margin, low tuition
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

// Mock Supabase calls since we're not using the database
const mockSupabase = {
  from: () => ({
    insert: () => ({ select: () => ({ single: () => ({}) }) }),
    select: () => ({ eq: () => ({ single: () => ({ data: null }) }) }),
  }),
};

// Mock project data - Iowa Cosmetology CEU Renewal
const testProject = {
  id: 'test-ceu-detection',
  program_name: 'Cosmetology License Renewal - Continuing Education',
  client_name: 'Test Community College',
  program_type: 'Continuing Education',
  target_audience: 'Licensed cosmetologists seeking renewal credits',
  geographic_area: 'Iowa City, Iowa (Johnson County)',
  estimated_tuition: '$155',
  total_seat_hours: 6,
  sections_per_year: 8,
  delivery_format: 'in-person',
  has_existing_lab_space: true,
  created_at: new Date().toISOString(),
};

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  CEU Detection & Financial Routing Test                      ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

console.log('Test Program:', testProject.program_name);
console.log('Tuition:', testProject.estimated_tuition);
console.log('Contact Hours:', testProject.total_seat_hours);
console.log('Location:', testProject.geographic_area);
console.log('\n' + '─'.repeat(60) + '\n');

// Step 1: Run Regulatory Analyst
console.log('STEP 1: Running Regulatory Analyst...\n');

try {
  const { runRegulatoryCompliance } = await import('./lib/agents/researchers/regulatory-analyst.ts');
  
  console.log('Analyzing regulatory requirements for cosmetology CEU...');
  const regulatoryResult = await runRegulatoryCompliance(testProject.id, testProject);
  
  console.log('\n✅ Regulatory Analysis Complete\n');
  console.log('Program Type Detected:', regulatoryResult.data.programType);
  console.log('Rationale:', regulatoryResult.data.programTypeRationale);
  
  if (regulatoryResult.data.licensure?.continuingEducation) {
    const ceu = regulatoryResult.data.licensure.continuingEducation;
    console.log('\nContinuing Education Requirements:');
    console.log('  Renewal Cycle:', ceu.renewalCycle);
    console.log('  Required Hours:', ceu.requiredHours, 'hours');
    console.log('  Typical Cost:', ceu.typicalCost);
    console.log('  State Law:', ceu.stateLawReference);
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Step 2: Run Financial Analyst with detected program type
  console.log('STEP 2: Running Financial Analyst with programType =', regulatoryResult.data.programType, '\n');
  
  const { runFinancialAnalysis } = await import('./lib/agents/researchers/financial-analyst.ts');
  
  // Mock the regulatory component query to return our detected program type
  global.mockRegulatoryProgramType = regulatoryResult.data.programType;
  
  console.log('Building financial model...');
  const financialResult = await runFinancialAnalysis(
    testProject.id,
    testProject,
    regulatoryResult.data.programType // Pass programType explicitly
  );
  
  console.log('\n✅ Financial Analysis Complete\n');
  console.log('Viability Score:', financialResult.data.score, '/ 10');
  console.log('Score Rationale:', financialResult.data.scoreRationale);
  
  const model = financialResult.data.financialModel;
  if (model) {
    const base = model.scenarios.base;
    const y2 = model.year2Base;
    const y3 = model.year3Base;
    
    console.log('\nFinancial Projections:');
    console.log('┌─────────┬──────────────┬─────────────┬─────────────┬────────┐');
    console.log('│ Year    │ Students     │ Revenue     │ Net         │ Margin │');
    console.log('├─────────┼──────────────┼─────────────┼─────────────┼────────┤');
    console.log(`│ Year 1  │ ${String(base.enrollment).padEnd(12)} │ $${String(base.revenue.total.toLocaleString()).padEnd(10)} │ $${String(base.netPosition.toLocaleString()).padEnd(10)} │ ${(base.margin * 100).toFixed(0)}%    │`);
    console.log(`│ Year 2  │ ${String(y2.enrollment).padEnd(12)} │ $${String(y2.revenue.total.toLocaleString()).padEnd(10)} │ $${String(y2.netPosition.toLocaleString()).padEnd(10)} │ ${(y2.margin * 100).toFixed(0)}%    │`);
    console.log(`│ Year 3  │ ${String(y3.enrollment).padEnd(12)} │ $${String(y3.revenue.total.toLocaleString()).padEnd(10)} │ $${String(y3.netPosition.toLocaleString()).padEnd(10)} │ ${(y3.margin * 100).toFixed(0)}%    │`);
    console.log('└─────────┴──────────────┴─────────────┴─────────────┴────────┘');
    
    console.log('\nBreak-Even Enrollment:', model.breakEvenEnrollment, 'students');
    console.log('Year 1 Tuition per Student:', testProject.estimated_tuition);
    console.log('Contact Hours:', testProject.total_seat_hours);
    console.log('Sections per Year:', testProject.sections_per_year);
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Validation
  console.log('TEST VALIDATION:\n');
  
  const programTypeCorrect = regulatoryResult.data.programType === 'continuing_education';
  const highMargin = model?.scenarios.base.margin > 0.50;
  const lowBreakEven = model?.breakEvenEnrollment < 15;
  const highScore = financialResult.data.score >= 8;
  
  console.log(programTypeCorrect ? '✅' : '❌', 'Program Type Detection:', regulatoryResult.data.programType);
  console.log(highMargin ? '✅' : '❌', 'High Margin (>50%):', model?.scenarios.base.margin ? `${(model.scenarios.base.margin * 100).toFixed(1)}%` : 'N/A');
  console.log(lowBreakEven ? '✅' : '❌', 'Low Break-Even (<15 students):', model?.breakEvenEnrollment || 'N/A');
  console.log(highScore ? '✅' : '❌', 'High Viability Score (≥8):', financialResult.data.score);
  
  const allPassed = programTypeCorrect && highMargin && lowBreakEven && highScore;
  
  console.log('\n' + '═'.repeat(60));
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED - CEU Detection & Financial Routing Working!');
  } else {
    console.log('❌ SOME TESTS FAILED - Review output above');
  }
  console.log('═'.repeat(60) + '\n');
  
  process.exit(allPassed ? 0 : 1);
  
} catch (error) {
  console.error('\n❌ Error running test:', error);
  console.error(error.stack);
  process.exit(1);
}
