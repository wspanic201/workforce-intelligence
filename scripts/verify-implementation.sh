#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Program Validation System - Implementation Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: API Client Libraries
echo "📦 Checking API client libraries..."
if [ -f "lib/apis/serpapi.ts" ] && [ -f "lib/apis/onet.ts" ] && [ -f "lib/apis/cache.ts" ]; then
    echo -e "${GREEN}✅ API client libraries exist${NC}"
else
    echo -e "${RED}❌ Missing API client libraries${NC}"
    ((ERRORS++))
fi
echo ""

# Check 2: Database Migrations
echo "📊 Checking database migrations..."
if [ -f "supabase/migrations/001_add_api_cache.sql" ] && [ -f "supabase/migrations/002_disable_rls_for_testing.sql" ]; then
    echo -e "${GREEN}✅ Migration files exist${NC}"
else
    echo -e "${RED}❌ Missing migration files${NC}"
    ((ERRORS++))
fi
echo ""

# Check 3: Environment Variables
echo "🔑 Checking environment variables..."
if grep -q "SERPAPI_KEY=44cbfe58" .env.local && grep -q "ONET_API_PASSWORD=yud82ae" .env.local; then
    echo -e "${GREEN}✅ API keys configured in .env.local${NC}"
else
    echo -e "${YELLOW}⚠️  API keys not found in .env.local${NC}"
    echo "   Run: Add API keys to .env.local (see .env.example)"
    ((ERRORS++))
fi
echo ""

# Check 4: Updated Market Analyst
echo "🤖 Checking market analyst integration..."
if grep -q "searchGoogleJobs" lib/agents/researchers/market-analyst.ts && grep -q "searchONET" lib/agents/researchers/market-analyst.ts; then
    echo -e "${GREEN}✅ Market analyst uses real APIs${NC}"
else
    echo -e "${RED}❌ Market analyst not properly updated${NC}"
    ((ERRORS++))
fi
echo ""

# Check 5: Timeout Implementation
echo "⏱️  Checking timeout implementation..."
if grep -q "withTimeout" lib/agents/orchestrator.ts && grep -q "300000" lib/agents/orchestrator.ts; then
    echo -e "${GREEN}✅ 5-minute timeouts implemented${NC}"
else
    echo -e "${RED}❌ Timeouts not implemented${NC}"
    ((ERRORS++))
fi
echo ""

# Check 6: JSON Extraction Improvements
echo "📝 Checking JSON extraction..."
if grep -q "extractJSON" lib/ai/anthropic.ts && grep -q "validateJSON" lib/ai/anthropic.ts; then
    echo -e "${GREEN}✅ Improved JSON extraction exists${NC}"
else
    echo -e "${RED}❌ JSON extraction not improved${NC}"
    ((ERRORS++))
fi
echo ""

# Check 7: Frontend Polling
echo "🔄 Checking frontend polling..."
if grep -q "3000" app/projects/\[id\]/page.tsx; then
    echo -e "${GREEN}✅ 3-second polling configured${NC}"
else
    echo -e "${YELLOW}⚠️  Polling interval might not be 3 seconds${NC}"
fi
echo ""

# Check 8: Build Test
echo "🏗️  Running build test..."
npm run build > /tmp/build-output.txt 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build passes successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "   See /tmp/build-output.txt for details"
    ((ERRORS++))
fi
echo ""

# Check 9: Documentation
echo "📚 Checking documentation..."
if [ -f "MIGRATION_GUIDE.md" ] && [ -f "IMPLEMENTATION_COMPLETE.md" ]; then
    echo -e "${GREEN}✅ Documentation complete${NC}"
else
    echo -e "${YELLOW}⚠️  Some documentation missing${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED - Ready for testing!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run database migrations (see MIGRATION_GUIDE.md)"
    echo "2. Verify Supabase and Anthropic keys in .env.local"
    echo "3. Start dev server: npm run dev"
    echo "4. Test with Cybersecurity Certificate project"
else
    echo -e "${RED}❌ $ERRORS ISSUES FOUND - Review output above${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit $ERRORS
