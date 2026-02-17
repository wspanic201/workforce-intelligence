#!/bin/bash
# Test Pharmacy Tech Validation with Fixed SOC Code Mapping
# Expected: SOC 29-2052, BLS median $38,350, employment 450,000+

set -e

echo "=========================================="
echo "Testing Pharmacy Tech Validation"
echo "Expected SOC: 29-2052 (Pharmacy Technicians)"
echo "Expected BLS Median: ~$38,350"
echo "Expected BLS Employment: ~450,000"
echo "=========================================="
echo ""

# Create test project via API
echo "Creating test project..."
PROJECT_ID=$(curl -s -X POST http://localhost:3000/api/projects/create \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Test College",
    "client_email": "test@example.com",
    "program_name": "Pharmacy Technician Certificate",
    "program_type": "Certificate",
    "target_audience": "Adults seeking healthcare careers",
    "constraints": "Must complete within 6 months"
  }' | jq -r '.projectId')

echo "✓ Project created: $PROJECT_ID"
echo ""
echo "Validation is running in background..."
echo "Monitor logs: tail -f .next/server.log"
echo ""
echo "Check results:"
echo "1. Database: psql -> SELECT * FROM validation_projects WHERE id='$PROJECT_ID';"
echo "2. Research components: SELECT component_type, status FROM research_components WHERE project_id='$PROJECT_ID';"
echo "3. Wait ~25 minutes for completion"
echo ""
echo "Verify:"
echo "  - target_occupation = 'Pharmacy Technician'"
echo "  - soc_codes = '29-2052'"
echo "  - geographic_area is populated"
echo "  - labor_market component has live_jobs.count > 0"
echo "  - employer_demand shows real employer names"
echo ""
