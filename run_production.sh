#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Production Validation - Pharmacy Technician${NC}"
echo "================================================"
echo "Model: Claude 3.5 Sonnet"
echo "Max Tokens: 16,000 per agent"
echo "Expected Cost: ~\$15"
echo "Expected Time: 30-40 minutes"
echo "================================================"
echo ""

# Start dev server WITHOUT TEST_MODE
PORT=3001 npm run dev > /tmp/workforce-production.log 2>&1 &
DEV_PID=$!

echo "Starting production server..."
sleep 12

# Check if server is up
if ! curl -s http://localhost:3001 > /dev/null; then
  echo -e "${RED}❌ Server failed to start${NC}"
  kill $DEV_PID 2>/dev/null || true
  tail -50 /tmp/workforce-production.log
  exit 1
fi

echo -e "${GREEN}✓ Server running on port 3001${NC}"
echo ""

# Create project (production mode) - use snake_case!
echo "Creating validation project..."
PROJECT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/projects/create \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Kirkwood Community College",
    "client_email": "mttmrphy@icloud.com",
    "program_name": "Pharmacy Technician Certificate",
    "program_type": "certificate",
    "target_audience": "Career changers, retail pharmacy workers",
    "constraints": "Budget $125k, 6-12 months"
  }')

PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.projectId // empty')

if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}❌ Failed to create project${NC}"
  echo "$PROJECT_RESPONSE" | jq '.'
  kill $DEV_PID 2>/dev/null || true
  exit 1
fi

echo -e "${GREEN}✓ Project created: $PROJECT_ID${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔬 Production Validation Running"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Project ID: $PROJECT_ID"
echo "Monitoring (40 min timeout)..."
echo ""

START_TIME=$(date +%s)
TIMEOUT=2400

while true; do
  ELAPSED=$(($(date +%s) - START_TIME))
  
  if [ $ELAPSED -gt $TIMEOUT ]; then
    echo -e "${RED}❌ TIMEOUT after 40 minutes${NC}"
    kill $DEV_PID 2>/dev/null || true
    exit 1
  fi
  
  STATUS=$(curl -s "http://localhost:3001/api/projects/$PROJECT_ID" | jq -r '.status // "unknown"')
  
  echo "[${ELAPSED} s] Status: $STATUS"
  
  if [ "$STATUS" = "completed" ] || [ "$STATUS" = "review" ]; then
    echo ""
    echo -e "${GREEN}✅ VALIDATION COMPLETE!${NC}"
    echo ""
    echo "Total time: ${ELAPSED} seconds (~$((ELAPSED / 60)) minutes)"
    
    kill $DEV_PID 2>/dev/null || true
    
    echo ""
    echo "Project ID: $PROJECT_ID"
    echo ""
    echo "Report generation complete!"
    
    exit 0
  fi
  
  if [ "$STATUS" = "error" ] || [ "$STATUS" = "failed" ]; then
    echo ""
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    kill $DEV_PID 2>/dev/null || true
    exit 1
  fi
  
  sleep 30
done
