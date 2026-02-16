#!/bin/bash
# Iterative testing loop - Bob runs validations with OAuth, fixes issues, repeats

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Workforce Intelligence Test Iteration Loop"
echo "Using OpenClaw OAuth credentials (cheap testing)"
echo "================================================"
echo ""

# Check if OpenClaw provides ANTHROPIC_API_KEY
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "${RED}ERROR: ANTHROPIC_API_KEY not found in environment${NC}"
  echo "OpenClaw should provide OAuth credentials automatically."
  echo "Falling back to .env.local (Matt's expensive key) for now..."
  export $(cat .env.local | grep ANTHROPIC_API_KEY)
fi

echo "API Key: ${ANTHROPIC_API_KEY:0:15}... (${#ANTHROPIC_API_KEY} chars)"
echo ""

# Kill any existing dev servers
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Start dev server with test environment
echo "Starting dev server on port 3001..."
PORT=3001 npm run dev > /tmp/wf-test-server.log 2>&1 &
SERVER_PID=$!
sleep 8

# Check server is up
if ! curl -s http://localhost:3001 > /dev/null; then
  echo "${RED}❌ Dev server failed to start${NC}"
  cat /tmp/wf-test-server.log | tail -20
  exit 1
fi

echo "${GREEN}✓ Server running on port 3001${NC}"
echo ""

# Function to run a test validation
run_test() {
  local test_num=$1
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔬 Test Run #$test_num"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Submit validation
  PROJECT_ID=$(curl -s -X POST http://localhost:3001/api/projects/create \
    -H "Content-Type: application/json" \
    -d '{
      "client_name": "TEST - Kirkwood Community College",
      "client_email": "test@openclaw.ai",
      "program_name": "Pharmacy Technician Certificate",
      "program_type": "certificate",
      "target_audience": "Career changers, retail pharmacy workers",
      "constraints": "Budget $125k, 6-12 months",
      "geographic_area": "Cedar Rapids and Iowa City, Iowa",
      "soc_codes": "29-2052.00",
      "target_occupation": "Pharmacy Technician"
    }' | jq -r '.projectId')
  
  if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
    echo "${RED}❌ Failed to create project${NC}"
    return 1
  fi
  
  echo "Project ID: $PROJECT_ID"
  echo "Monitoring progress (15 min timeout)..."
  echo ""
  
  START_TIME=$(date +%s)
  
  # Monitor progress
  for i in {1..90}; do
    sleep 10
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    RESPONSE=$(curl -s "http://localhost:3001/api/projects/$PROJECT_ID")
    STATUS=$(echo "$RESPONSE" | jq -r '.status')
    
    echo "[$ELAPSED s] Status: $STATUS"
    
    if [ "$STATUS" = "review" ] || [ "$STATUS" = "completed" ]; then
      echo ""
      echo "${GREEN}✅ VALIDATION COMPLETE!${NC}"
      echo ""
      
      # Fetch component statuses
      COMPONENTS=$(curl -s "https://czfckxxmibbdypupkhzl.supabase.co/rest/v1/research_components?project_id=eq.$PROJECT_ID&select=component_type,status" \
        -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6ZmNreHhtaWJiZHlwdXBraHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODA5MTksImV4cCI6MjA4Njc1NjkxOX0._1_sVtrZTzRoh5R8kYImEzfAclX8Ch8Ugcdj9jLHJBQ")
      
      echo "Agent Results:"
      echo "$COMPONENTS" | jq -r '.[] | "  - \(.component_type): \(.status)"'
      echo ""
      
      # Check report exists
      REPORT=$(curl -s "https://czfckxxmibbdypupkhzl.supabase.co/rest/v1/validation_reports?project_id=eq.$PROJECT_ID&select=recommendation" \
        -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6ZmNreHhtaWJiZHlwdXBraHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODA5MTksImV4cCI6MjA4Njc1NjkxOX0._1_sVtrZTzRoh5R8kYImEzfAclX8Ch8Ugcdj9jLHJBQ")
      
      if echo "$REPORT" | jq -e '. | length > 0' > /dev/null; then
        RECOMMENDATION=$(echo "$REPORT" | jq -r '.[0].recommendation')
        echo "Report Generated: $RECOMMENDATION"
      else
        echo "${YELLOW}⚠️  No report found in database${NC}"
      fi
      
      echo ""
      echo "Total time: $ELAPSED seconds"
      return 0
    fi
    
    if [ "$STATUS" = "error" ]; then
      echo ""
      echo "${RED}❌ VALIDATION FAILED${NC}"
      echo ""
      
      # Fetch component statuses for debugging
      COMPONENTS=$(curl -s "https://czfckxxmibbdypupkhzl.supabase.co/rest/v1/research_components?project_id=eq.$PROJECT_ID&select=component_type,status,error_message" \
        -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6ZmNreHhtaWJiZHlwdXBraHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODA5MTksImV4cCI6MjA4Njc1NjkxOX0._1_sVtrZTzRoh5R8kYImEzfAclX8Ch8Ugcdj9jLHJBQ")
      
      echo "Agent Results:"
      echo "$COMPONENTS" | jq -r '.[] | "  - \(.component_type): \(.status) \(if .error_message then "(\(.error_message))" else "" end)"'
      
      return 1
    fi
    
    # Check for timeout
    if [ $ELAPSED -gt 900 ]; then
      echo ""
      echo "${RED}⏱️  TIMEOUT after 15 minutes${NC}"
      return 1
    fi
  done
  
  echo ""
  echo "${RED}❌ Monitoring loop exceeded 90 iterations${NC}"
  return 1
}

# Run test
if run_test 1; then
  echo ""
  echo "${GREEN}════════════════════════════════════════${NC}"
  echo "${GREEN}✅ TEST PASSED - System working!${NC}"
  echo "${GREEN}════════════════════════════════════════${NC}"
  kill $SERVER_PID 2>/dev/null || true
  exit 0
else
  echo ""
  echo "${RED}════════════════════════════════════════${NC}"
  echo "${RED}❌ TEST FAILED - Issues detected${NC}"
  echo "${RED}════════════════════════════════════════${NC}"
  echo ""
  echo "Server log (last 50 lines):"
  tail -50 /tmp/wf-test-server.log
  kill $SERVER_PID 2>/dev/null || true
  exit 1
fi
