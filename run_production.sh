#!/bin/bash
# Production validation - Sonnet 4.5, full depth, sequential execution

echo "Starting PRODUCTION validation..."
echo "Model: Claude Sonnet 4.5"
echo "Tokens: 12k-16k per agent"
echo "Execution: Sequential (one at a time)"
echo ""

npm run dev &
SERVER_PID=$!

sleep 5

# Submit production validation
curl -X POST http://localhost:3000/api/projects/create \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Kirkwood Community College",
    "client_email": "workforce@kirkwood.edu",
    "program_name": "Pharmacy Technician Certificate",
    "program_type": "certificate",
    "target_audience": "Career changers, retail pharmacy workers seeking credentialing",
    "constraints": "Budget $125k, timeline 6-12 months to launch",
    "geographic_area": "Cedar Rapids and Iowa City, Iowa",
    "soc_codes": "29-2052.00",
    "target_occupation": "Pharmacy Technician"
  }' | jq -r '.projectId' > /tmp/prod-project-id.txt

PROJECT_ID=$(cat /tmp/prod-project-id.txt)
echo "Production validation started: $PROJECT_ID"
echo "Monitoring progress (40 min timeout)..."
echo ""

# Monitor progress
for i in {1..120}; do
  sleep 20
  STATUS=$(curl -s "http://localhost:3000/api/projects/$PROJECT_ID" | jq -r '.status')
  echo "[$((i*20))s / $((i*20/60))m] Status: $STATUS"
  
  if [ "$STATUS" = "review" ] || [ "$STATUS" = "completed" ]; then
    echo ""
    echo "✅ Production validation complete!"
    echo "Project ID: $PROJECT_ID"
    kill $SERVER_PID
    exit 0
  fi
  
  if [ "$STATUS" = "error" ]; then
    echo ""
    echo "❌ Validation failed"
    kill $SERVER_PID
    exit 1
  fi
done

echo ""
echo "⏱️  Timeout after 40 minutes"
kill $SERVER_PID
exit 1
