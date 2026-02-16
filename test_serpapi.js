require('dotenv').config({ path: '.env.local' });

async function testSerpAPI() {
  const { searchGoogleJobs } = require('./lib/apis/serpapi.ts');
  
  try {
    console.log('Testing SerpAPI with fixed code...');
    const result = await searchGoogleJobs('Pharmacy Technician', 'Iowa');
    console.log('\n✅ SUCCESS!');
    console.log('Job count:', result.count);
    console.log('Median salary:', result.salaries.median);
    console.log('Top 3 employers:', result.topEmployers.slice(0, 3).map(e => `${e.name} (${e.openings})`));
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    console.error(error.stack);
  }
}

testSerpAPI();
