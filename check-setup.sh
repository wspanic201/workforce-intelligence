#!/bin/bash

# Workforce Intelligence - Setup Verification Script
# Run this to check if environment is properly configured

echo "🔍 Checking Workforce Intelligence Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check if in correct directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: Not in workforce-intelligence directory${NC}"
  echo "   Run: cd ~/projects/workforce-intelligence"
  exit 1
fi

echo -e "${GREEN}✓${NC} In correct directory"

# Check Node.js version
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
  echo -e "${RED}❌ Node.js not found${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} Dependencies installed"
else
  echo -e "${YELLOW}⚠${NC}  Dependencies not installed"
  echo "   Run: npm install"
  ERRORS=$((ERRORS + 1))
fi

# Check .env.local exists
if [ -f ".env.local" ]; then
  echo -e "${GREEN}✓${NC} .env.local exists"
  
  # Check for required environment variables
  source .env.local 2>/dev/null
  
  if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}  ❌ NEXT_PUBLIC_SUPABASE_URL not set${NC}"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}  ✓${NC} NEXT_PUBLIC_SUPABASE_URL set"
  fi
  
  if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}  ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set${NC}"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}  ✓${NC} NEXT_PUBLIC_SUPABASE_ANON_KEY set"
  fi
  
  if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}  ❌ SUPABASE_SERVICE_ROLE_KEY not set${NC}"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}  ✓${NC} SUPABASE_SERVICE_ROLE_KEY set"
  fi
  
  if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${RED}  ❌ ANTHROPIC_API_KEY not set${NC}"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}  ✓${NC} ANTHROPIC_API_KEY set"
  fi
  
  if [ -z "$CONFLUENCE_LABS_PATH" ]; then
    echo -e "${YELLOW}  ⚠${NC}  CONFLUENCE_LABS_PATH not set (using default)"
  else
    echo -e "${GREEN}  ✓${NC} CONFLUENCE_LABS_PATH set"
  fi
  
else
  echo -e "${RED}❌ .env.local not found${NC}"
  echo "   Run: cp .env.example .env.local"
  echo "   Then edit .env.local with your API keys"
  ERRORS=$((ERRORS + 1))
fi

# Check Confluence Labs path
CONFLUENCE_PATH="${CONFLUENCE_LABS_PATH:-/Users/matt/projects/Confluence Labs}"
if [ -d "$CONFLUENCE_PATH" ]; then
  echo -e "${GREEN}✓${NC} Confluence Labs directory exists"
  
  # Check for a sample persona file
  if [ -f "$CONFLUENCE_PATH/Foundation/marcus-reinholt-cfo.md" ]; then
    echo -e "${GREEN}  ✓${NC} Sample persona file found (CFO)"
  else
    echo -e "${YELLOW}  ⚠${NC}  Sample persona not found (might be OK)"
  fi
else
  echo -e "${RED}❌ Confluence Labs directory not found: $CONFLUENCE_PATH${NC}"
  echo "   Set CONFLUENCE_LABS_PATH in .env.local"
  ERRORS=$((ERRORS + 1))
fi

# Check if build works
echo ""
echo "🔨 Testing build..."
if npm run build &> /tmp/build-check.log; then
  echo -e "${GREEN}✓${NC} Build successful"
else
  echo -e "${RED}❌ Build failed${NC}"
  echo "   Check /tmp/build-check.log for details"
  ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ Setup complete! Ready to test.${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Start dev server: npm run dev"
  echo "  2. Visit: http://localhost:3000"
  echo "  3. Follow MONDAY_TEST_PLAN.md"
else
  echo -e "${RED}⚠️  Found $ERRORS issue(s)${NC}"
  echo ""
  echo "Fix the issues above, then run this script again."
  echo "See SETUP.md for detailed instructions."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
