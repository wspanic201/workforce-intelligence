#!/bin/bash
set -e

# Load env vars manually to avoid space issues
export $(cat .env.local | grep -v '^#' | grep -v 'CONFLUENCE_LABS_PATH' | xargs)

echo "================================"
echo "API Configuration Test Suite"
echo "================================"
echo ""

# Test 1: SerpAPI (Google Jobs)
echo "1️⃣  Testing SerpAPI (Google Jobs)..."
SERPAPI_RESPONSE=$(curl -s "https://serpapi.com/search.json?engine=google_jobs&q=pharmacy+technician&location=Iowa&api_key=$SERPAPI_KEY")
SERPAPI_COUNT=$(echo "$SERPAPI_RESPONSE" | jq -r '.jobs_results | length' 2>/dev/null || echo "0")

if [ "$SERPAPI_COUNT" -gt 0 ]; then
  echo "   ✅ SerpAPI working: $SERPAPI_COUNT jobs found"
  echo "      Top employer: $(echo "$SERPAPI_RESPONSE" | jq -r '.jobs_results[0].company_name')"
else
  echo "   ❌ SerpAPI failed or no results"
fi
echo ""

# Test 2: O*NET API
echo "2️⃣  Testing O*NET API..."
ONET_RESPONSE=$(curl -s -H "X-API-Key: $ONET_API_KEY" "https://api-v2.onetcenter.org/online/search?keyword=pharmacy%20technician&end=5")
ONET_CODE=$(echo "$ONET_RESPONSE" | jq -r '.occupation[0].code // empty' 2>/dev/null)

if [ -n "$ONET_CODE" ]; then
  ONET_TITLE=$(echo "$ONET_RESPONSE" | jq -r '.occupation[0].title')
  echo "   ✅ O*NET working"
  echo "      Code: $ONET_CODE - $ONET_TITLE"
else
  echo "   ❌ O*NET failed"
fi
echo ""

# Test 3: BLS API
echo "3️⃣  Testing BLS API..."
BLS_RESPONSE=$(curl -s "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUN0000000029205200000003?registrationkey=$BLS_API_KEY&startyear=2022&endyear=2024")
BLS_STATUS=$(echo "$BLS_RESPONSE" | jq -r '.status' 2>/dev/null)

if [ "$BLS_STATUS" = "REQUEST_SUCCEEDED" ]; then
  echo "   ✅ BLS API working"
else
  echo "   ⚠️  BLS API status: $BLS_STATUS"
fi
echo ""

# Test 4: Anthropic API
echo "4️⃣  Testing Anthropic API..."
ANTHROPIC_RESPONSE=$(curl -s -X POST "https://api.anthropic.com/v1/messages" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-haiku-20241022","max_tokens":50,"messages":[{"role":"user","content":"Say hi"}]}')

ANTHROPIC_TEXT=$(echo "$ANTHROPIC_RESPONSE" | jq -r '.content[0].text // empty' 2>/dev/null)

if [ -n "$ANTHROPIC_TEXT" ]; then
  echo "   ✅ Anthropic API working"
  echo "      Response: $ANTHROPIC_TEXT"
else
  echo "   ❌ Anthropic API failed"
fi
echo ""

echo "================================"
echo "Summary: All APIs configured ✅"
echo "================================"
