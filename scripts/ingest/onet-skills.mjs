#!/usr/bin/env node
/**
 * O*NET Skills, Knowledge, and Technology Ingestion
 * Source: O*NET Database 29.0 bulk download (tab-delimited text files)
 * Loads Skills, Knowledge, and Technology Skills into intel_occupation_skills
 */

import { supabase } from './env-helper.mjs';
import { readFileSync } from 'fs';

const ONET_DIR = '/tmp/onet/db_30_1_text';

function parseTSV(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  const headers = lines[0].split('\t');
  return lines.slice(1).map(line => {
    const values = line.split('\t');
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (values[i] || '').trim());
    return obj;
  });
}

// Load occupation titles
function loadOccupationTitles() {
  const data = parseTSV(`${ONET_DIR}/Occupation Data.txt`);
  const map = {};
  for (const row of data) {
    // Normalize SOC: "29-2052.00" → "29-2052"
    const soc = row['O*NET-SOC Code']?.replace(/\.00$/, '');
    if (soc) map[soc] = row['Title'];
  }
  return map;
}

async function main() {
  console.log('🧠 Starting O*NET data ingestion...\n');
  
  const titles = loadOccupationTitles();
  console.log(`📖 ${Object.keys(titles).length} occupations found in O*NET\n`);

  let totalInserted = 0;

  // ── Skills (IM = Importance scale) ──────────────────────
  console.log('📊 Loading Skills...');
  const skills = parseTSV(`${ONET_DIR}/Skills.txt`);
  const skillRows = [];
  
  for (const row of skills) {
    if (row['Scale ID'] !== 'IM') continue; // Only importance ratings
    if (row['Recommend Suppress'] === 'Y') continue;
    
    const soc = row['O*NET-SOC Code']?.replace(/\.00$/, '');
    if (!soc) continue;
    
    const importance = parseFloat(row['Data Value']);
    if (isNaN(importance)) continue;
    
    // Find matching LV (level) row
    const lvRow = skills.find(r => 
      r['O*NET-SOC Code'] === row['O*NET-SOC Code'] && 
      r['Element ID'] === row['Element ID'] && 
      r['Scale ID'] === 'LV'
    );
    const level = lvRow ? parseFloat(lvRow['Data Value']) : null;
    
    skillRows.push({
      soc_code: soc,
      occupation_title: titles[soc] || null,
      skill_type: 'skill',
      skill_name: row['Element Name'],
      importance,
      level: level && !isNaN(level) ? level : null,
      category: row['Element ID']?.split('.').slice(0, 3).join('.'),
      source: 'onet_30.1',
    });
  }
  console.log(`  ${skillRows.length} skill records prepared`);

  // ── Knowledge ──────────────────────────────────────────
  console.log('📊 Loading Knowledge...');
  const knowledge = parseTSV(`${ONET_DIR}/Knowledge.txt`);
  const knowledgeRows = [];
  
  for (const row of knowledge) {
    if (row['Scale ID'] !== 'IM') continue;
    if (row['Recommend Suppress'] === 'Y') continue;
    
    const soc = row['O*NET-SOC Code']?.replace(/\.00$/, '');
    if (!soc) continue;
    
    const importance = parseFloat(row['Data Value']);
    if (isNaN(importance)) continue;
    
    const lvRow = knowledge.find(r => 
      r['O*NET-SOC Code'] === row['O*NET-SOC Code'] && 
      r['Element ID'] === row['Element ID'] && 
      r['Scale ID'] === 'LV'
    );
    const level = lvRow ? parseFloat(lvRow['Data Value']) : null;
    
    knowledgeRows.push({
      soc_code: soc,
      occupation_title: titles[soc] || null,
      skill_type: 'knowledge',
      skill_name: row['Element Name'],
      importance,
      level: level && !isNaN(level) ? level : null,
      category: row['Element ID']?.split('.').slice(0, 3).join('.'),
      source: 'onet_30.1',
    });
  }
  console.log(`  ${knowledgeRows.length} knowledge records prepared`);

  // ── Technology Skills ──────────────────────────────────
  console.log('📊 Loading Technology Skills...');
  const tech = parseTSV(`${ONET_DIR}/Technology Skills.txt`);
  const techRows = [];
  const seenTech = new Set(); // Deduplicate
  
  for (const row of tech) {
    const soc = row['O*NET-SOC Code']?.replace(/\.00$/, '');
    if (!soc) continue;
    
    const toolName = row['Example'];
    const category = row['Commodity Title'];
    if (!toolName) continue;
    
    const key = `${soc}|technology|${toolName}`;
    if (seenTech.has(key)) continue;
    seenTech.add(key);
    
    const isHot = row['Hot Technology'] === 'Y';
    
    techRows.push({
      soc_code: soc,
      occupation_title: titles[soc] || null,
      skill_type: 'technology',
      skill_name: toolName,
      importance: isHot ? 5.0 : 3.0, // Hot tech = high importance
      level: null,
      category: category || null,
      source: 'onet_30.1',
    });
  }
  console.log(`  ${techRows.length} technology records prepared`);

  // ── Insert all rows ────────────────────────────────────
  const allRows = [...skillRows, ...knowledgeRows, ...techRows];
  console.log(`\n📤 Upserting ${allRows.length} total records...`);
  
  const BATCH_SIZE = 500;
  for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
    const chunk = allRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('intel_occupation_skills')
      .upsert(chunk, { onConflict: 'soc_code,skill_type,skill_name' });
    
    if (error) {
      console.error(`  ✗ Batch ${Math.floor(i/BATCH_SIZE)+1} error: ${error.message}`);
    } else {
      totalInserted += chunk.length;
      if ((i / BATCH_SIZE) % 20 === 0) {
        process.stdout.write(`  ${totalInserted.toLocaleString()} / ${allRows.length.toLocaleString()}\r`);
      }
    }
  }

  // Update freshness
  await supabase.from('intel_data_freshness').update({
    data_period: 'O*NET 30.1 (February 2025)',
    data_release_date: '2024-08-05',
    next_expected_release: 'August 2025 (O*NET 31.0)',
    records_loaded: totalInserted,
    last_refreshed_at: new Date().toISOString(),
    refreshed_by: 'cassidy',
    refresh_method: 'api_bulk',
    citation_text: 'O*NET OnLine, National Center for O*NET Development, Database Version 30.1',
    citation_url: 'https://www.onetcenter.org/database.html',
    coverage_notes: `${Object.keys(titles).length} occupations — skills, knowledge, and technology`,
    known_limitations: 'Technology skills use hot-tech flag as importance proxy (5.0=hot, 3.0=standard)',
  }).eq('table_name', 'intel_occupation_skills');

  console.log(`\n\n🎯 Done! ${totalInserted.toLocaleString()} O*NET records inserted`);
  console.log(`  Skills: ${skillRows.length}`);
  console.log(`  Knowledge: ${knowledgeRows.length}`);
  console.log(`  Technology: ${techRows.length}`);
}

main().catch(console.error);
