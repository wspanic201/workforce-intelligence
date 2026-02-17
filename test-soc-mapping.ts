/**
 * Unit Test: SOC Code Mapping
 * 
 * Verifies that common occupations map to correct SOC codes
 */

import { findSOCCode, isValidSOCCode, getSOCTitle } from './lib/mappings/soc-codes';

console.log('Testing SOC Code Mapping...\n');

// Test cases: [occupation, expected SOC code]
const testCases = [
  ['Pharmacy Technician', '29-2052'],
  ['pharmacy tech', '29-2052'],
  ['Pharmacy Aide', '31-9095'],
  ['Medical Assistant', '31-9092'],
  ['Registered Nurse', '29-1141'],
  ['Software Developer', '15-1252'],
  ['Electrician', '47-2111'],
  ['HVAC Technician', '49-9021'],
  ['Web Developer', '15-1254'],
  ['Dental Hygienist', '29-1292'],
];

let passed = 0;
let failed = 0;

for (const [occupation, expectedSOC] of testCases) {
  const result = findSOCCode(occupation);
  
  if (result && result.code === expectedSOC) {
    console.log(`✅ "${occupation}" → ${result.code} (${result.title})`);
    passed++;
  } else {
    console.log(`❌ "${occupation}" → Expected ${expectedSOC}, got ${result?.code || 'null'}`);
    failed++;
  }
}

console.log(`\n${passed}/${testCases.length} tests passed`);

// Test SOC code validation
console.log('\n--- Testing SOC Code Validation ---');
console.log(`✅ "29-2052" is valid: ${isValidSOCCode('29-2052')}`);
console.log(`❌ "29-205" is invalid: ${!isValidSOCCode('29-205')}`);
console.log(`❌ "292052" is invalid: ${!isValidSOCCode('292052')}`);
console.log(`❌ "29-2052.00" is invalid: ${!isValidSOCCode('29-2052.00')}`);

// Test title lookup
console.log('\n--- Testing Title Lookup ---');
console.log(`SOC 29-2052: ${getSOCTitle('29-2052')}`);
console.log(`SOC 31-9095: ${getSOCTitle('31-9095')}`);
console.log(`SOC 15-1252: ${getSOCTitle('15-1252')}`);

process.exit(failed > 0 ? 1 : 0);
