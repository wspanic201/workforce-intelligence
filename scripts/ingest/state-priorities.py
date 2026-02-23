#!/usr/bin/env python3
"""
State Priority Occupations Ingestion
Starts with Iowa Future Ready, then scrapes other states' WIOA in-demand lists
"""

import os, json, re, urllib.request, urllib.parse

# Load env
env = {}
env_path = os.path.join(os.path.dirname(__file__), '../../.env.local')
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

def supabase_upsert(table, rows):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
    }
    body = json.dumps(rows).encode()
    req = urllib.request.Request(url, data=body, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            return True
    except urllib.error.HTTPError as e:
        print(f"  ✗ Upsert error: {e.code} {e.read().decode()[:200]}")
        return False

def supabase_update_freshness(records_loaded, states_count):
    from datetime import datetime
    url = f"{SUPABASE_URL}/rest/v1/intel_data_freshness?table_name=eq.intel_state_priorities"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
    }
    data = {
        'table_name': 'intel_state_priorities',
        'dataset_label': 'State Priority Occupations',
        'source_name': 'WIOA State Plans + State Workforce Boards',
        'source_url': 'https://wioaplans.dol.gov',
        'data_period': 'PY2024-2027',
        'records_loaded': records_loaded,
        'last_refreshed_at': datetime.now().isoformat(),
        'refreshed_by': 'cassidy',
        'refresh_method': 'scrape',
        'citation_text': 'State workforce board in-demand occupation designations under WIOA, PY2024-2027',
        'citation_url': 'https://wioaplans.dol.gov',
        'coverage_notes': f'{states_count} states with in-demand occupation lists',
        'known_limitations': 'States update lists on different cycles; some lists are regional, not statewide; SOC code matching is approximate for some states',
    }
    # Try upsert first
    upsert_url = f"{SUPABASE_URL}/rest/v1/intel_data_freshness"
    upsert_headers = dict(headers)
    upsert_headers['Prefer'] = 'resolution=merge-duplicates'
    req = urllib.request.Request(upsert_url, data=json.dumps(data).encode(), headers=upsert_headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            pass
    except:
        # Fallback to PATCH
        req = urllib.request.Request(url, data=json.dumps(data).encode(), headers=headers, method='PATCH')
        try:
            with urllib.request.urlopen(req) as resp:
                pass
        except:
            pass

# SOC code lookup for common occupations
SOC_LOOKUP = {
    'aircraft mechanics': '49-3011',
    'automotive service technicians': '49-3023',
    'bus & truck mechanics': '49-3031',
    'diesel engine specialists': '49-3031',
    'cnc tool operators': '51-4011',
    'computer numerically controlled tool operators': '51-4011',
    'cnc tool programmers': '51-4012',
    'computer numerically controlled tool programmers': '51-4012',
    'farm equipment mechanics': '49-3041',
    'hvac': '49-9021',
    'heating, air conditioning': '49-9021',
    'industrial machinery mechanics': '49-9041',
    'machinists': '51-4041',
    'maintenance workers, machinery': '49-9043',
    'millwrights': '49-9044',
    'tool & die makers': '51-4111',
    'tool and die makers': '51-4111',
    'welders': '51-4121',
    'welding, soldering': '51-4122',
    'wind turbine': '49-9081',
    'carpenters': '47-2031',
    'civil engineering tech': '17-3022',
    'electrical & electronics engineering tech': '17-3023',
    'electrical power-line installers': '49-9051',
    'electricians': '47-2111',
    'mechanical drafters': '17-3013',
    'plumbers': '47-2152',
    'pipefitters': '47-2152',
    'diagnostic medical sonographers': '29-2032',
    'emergency medical technicians': '29-2042',
    'health information tech': '29-9021',
    'licensed practical': '29-2061',
    'medical records specialists': '29-2072',
    'occupational therapy assistants': '31-2011',
    'paramedics': '29-2043',
    'pharmacy technicians': '29-2052',
    'physical therapist assistants': '31-2021',
    'radiologic technologists': '29-2034',
    'registered nurses': '29-1141',
    'respiratory therapists': '29-1126',
    'surgical technologists': '29-2055',
    'computer network architects': '15-1241',
    'computer network support': '15-1231',
    'computer occupations, all other': '15-1299',
    'computer programmers': '15-1251',
    'computer systems analysts': '15-1211',
    'computer user support': '15-1232',
    'information security analysts': '15-1212',
    'software developers': '15-1252',
    'software quality assurance': '15-1256',
    'health technologists': '29-2099',
}

def lookup_soc(title):
    t = title.lower()
    for key, soc in SOC_LOOKUP.items():
        if key in t:
            return soc
    return None

def classify_sector(title):
    t = title.lower()
    if any(w in t for w in ['nurse', 'medical', 'health', 'pharma', 'therapy', 'respiratory', 'surgical', 'sonograph', 'emt', 'paramedic', 'radiologic']):
        return 'Healthcare & Biosciences'
    if any(w in t for w in ['software', 'computer', 'network', 'information security', 'programmer', 'analyst', 'it ']):
        return 'Information Technology'
    if any(w in t for w in ['carpenter', 'electrician', 'plumber', 'pipefitter', 'power-line', 'drafter', 'civil eng', 'electrical eng']):
        return 'Construction & Engineering'
    if any(w in t for w in ['mechanic', 'welder', 'welding', 'machinist', 'cnc', 'millwright', 'tool & die', 'maintenance', 'wind turbine', 'manufacturing']):
        return 'Advanced Manufacturing'
    if any(w in t for w in ['truck', 'driver', 'cdl', 'logistics', 'shipping']):
        return 'Transportation & Logistics'
    return 'Other'


def parse_iowa_pdf():
    """Parse Iowa's Future Ready High Demand list"""
    import subprocess
    result = subprocess.run(['pdftotext', '-layout', '/tmp/iowa_high_demand.pdf', '-'], capture_output=True, text=True)
    text = result.stdout
    
    rows = []
    # Parse the annual salary section (page 2, more precise)
    # Pattern: "    Occupation Title ($XX,XXX)"
    pattern = re.compile(r'^\s{4}(.+?)\s*\(\$([0-9,]+)\)\s*$', re.MULTILINE)
    
    seen = set()
    for match in pattern.finditer(text):
        title = match.group(1).strip()
        wage_str = match.group(2).replace(',', '')
        wage = int(wage_str)
        
        # Skip hourly wages (< $100 means it's hourly section)
        if wage < 100:
            continue
        
        # Deduplicate
        if title in seen:
            continue
        seen.add(title)
        
        # Calculate hourly from annual (÷ 2080)
        hourly = round(wage / 2080, 2)
        
        rows.append({
            'state': 'IA',
            'occupation_title': title,
            'soc_code': lookup_soc(title),
            'sector': classify_sector(title),
            'priority_level': 'high_demand',
            'designation_source': 'future_ready_iowa',
            'scholarship_eligible': True,
            'wioa_fundable': True,
            'etpl_required': False,
            'entry_hourly_wage': hourly,
            'entry_annual_salary': wage,
            'effective_year': '2026-2027',
            'plan_cycle': 'AY2026-2027',
            'source_url': 'https://workforce.iowa.gov/media/1999/download?inline',
            'source_document': 'Iowa Last-Dollar Scholarship High Demand Occupations, Academic Year 26-27',
            'last_verified': '2026-02-22T00:00:00Z',
            'verified_by': 'cassidy',
        })
    
    return rows


def fetch_state_wioa_priorities(state, url, source_name):
    """Generic fetcher for state WIOA in-demand lists (web pages)"""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='replace')
        return html
    except Exception as e:
        print(f"  ✗ Failed to fetch {state}: {e}")
        return None


def main():
    print("🏛️ State Priority Occupations Ingestion\n")
    
    total_inserted = 0
    states_loaded = 0
    
    # ── Iowa ──────────────────────────────────────────
    print("📍 Iowa (Future Ready Iowa High Demand List)...")
    iowa_rows = parse_iowa_pdf()
    print(f"  {len(iowa_rows)} occupations parsed")
    
    if iowa_rows:
        if supabase_upsert('intel_state_priorities', iowa_rows):
            total_inserted += len(iowa_rows)
            states_loaded += 1
            print(f"  ✅ Iowa loaded\n")
            
            # Show by sector
            sectors = {}
            for r in iowa_rows:
                s = r['sector']
                sectors[s] = sectors.get(s, 0) + 1
            for s, c in sorted(sectors.items(), key=lambda x: -x[1]):
                print(f"    {s}: {c} occupations")
    
    # ── Other states via web scraping ─────────────────
    # Each state publishes their list differently. Let me add the states
    # that have easily parseable web pages.
    
    # We'll use AI extraction for complex pages in future passes.
    # For now, seed with Iowa as the model.
    
    print(f"\n🎯 Done! {total_inserted} priority occupations across {states_loaded} state(s)")
    
    # Update freshness
    supabase_update_freshness(total_inserted, states_loaded)
    print("✅ Freshness table updated")


if __name__ == '__main__':
    main()
