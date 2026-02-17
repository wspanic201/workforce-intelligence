#!/bin/bash
# Test validation using OpenClaw's OAuth credentials (cheap) instead of Matt's API key

# Override with my OpenClaw OAuth token (free for me to test)
export ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"

# If that's not set, use the default from .env.local as fallback
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "No OpenClaw OAuth token found, using .env.local API key"
  source .env.local
fi

# Run the validation
echo "Starting test validation with test credentials..."
echo "API Key prefix: ${ANTHROPIC_API_KEY:0:10}..."

TEST_MODE=true npm run dev &
SERVER_PID=$!

sleep 5

# Submit test validation
curl -X POST http://localhost:3000/api/projects/create \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "TEST - Kirkwood Community College",
    "client_email": "test@kirkwood.edu",
    "program_name": "Pharmacy Technician Certificate",
    "program_type": "certificate",
    "target_audience": "Career changers, retail pharmacy workers",
    "constraints": "Budget $125k, 6-12 months",
    "geographic_area": "Cedar Rapids and Iowa City, Iowa",
    "soc_codes": "29-2052.00",
    "target_occupation": "Pharmacy Technician"
  }' | jq -r '.projectId' > /tmp/test-project-id.txt

PROJECT_ID=$(cat /tmp/test-project-id.txt)
echo "Test validation started: $PROJECT_ID"
echo "Monitoring progress (10 min timeout)..."

# Monitor progress
for i in {1..60}; do
  sleep 10
  STATUS=$(curl -s "http://localhost:3000/api/projects/$PROJECT_ID" | jq -r '.status')
  echo "[$((i*10))s] Status: $STATUS"
  
  if [ "$STATUS" = "review" ] || [ "$STATUS" = "completed" ]; then
    echo "✅ Validation complete!"
    kill $SERVER_PID
    exit 0
  fi
  
  if [ "$STATUS" = "error" ]; then
    echo "❌ Validation failed"
    kill $SERVER_PID
    exit 1
  fi
done

echo "⏱️  Timeout after 10 minutes"
kill $SERVER_PID
exit 1
