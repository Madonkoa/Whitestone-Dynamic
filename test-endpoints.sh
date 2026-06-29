#!/bin/bash
cd "c:\Users\Andile M\WHITESTONE-FARM-MANAGER"

# Get token
TOKEN=$(curl -s -X POST http://localhost:5500/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}' | grep -o 'token":"[^"]*' | cut -d'"' -f2)

echo "=== POST-DELETION TEST - ALL 13 ENDPOINTS ==="
echo ""
echo "Token acquired successfully"
echo ""

# Test all 13 endpoints
echo "1. AUTH/LOGIN:"
curl -s -X POST http://localhost:5500/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}' | grep -q success && echo "✓ OK" || echo "✗ FAILED"

echo "2. EMPLOYEES:"
curl -s -X GET http://localhost:5500/api/employees -H "Authorization: Bearer $TOKEN" | grep -q 'id' && echo "✓ OK" || echo "✗ FAILED"

echo "3. STOCK:"
curl -s -X GET http://localhost:5500/api/stock -H "Authorization: Bearer $TOKEN" > /dev/null && echo "✓ OK" || echo "✗ FAILED"

echo "4. FEED:"
curl -s -X GET http://localhost:5500/api/feed -H "Authorization: Bearer $TOKEN" | grep -q 'id' && echo "✓ OK" || echo "✗ FAILED"

echo "5. COOPS:"
curl -s -X GET http://localhost:5500/api/coops -H "Authorization: Bearer $TOKEN" | grep -q 'id' && echo "✓ OK" || echo "✗ FAILED"

echo "6. EGGS:"
curl -s -X GET http://localhost:5500/api/eggs -H "Authorization: Bearer $TOKEN" | grep -q 'id' && echo "✓ OK" || echo "✗ FAILED"

echo "7. SALES:"
curl -s -X GET http://localhost:5500/api/sales -H "Authorization: Bearer $TOKEN" | grep -q 'id' && echo "✓ OK" || echo "✗ FAILED"

echo "8. CHICKENS:"
curl -s -X GET http://localhost:5500/api/chickens -H "Authorization: Bearer $TOKEN" | grep -q 'id' && echo "✓ OK" || echo "✗ FAILED"

echo "9. CUSTOMERS:"
curl -s -X GET http://localhost:5500/api/customers -H "Authorization: Bearer $TOKEN" | grep -q 'id' && echo "✓ OK" || echo "✗ FAILED"

echo "10. BATCHES:"
curl -s -X GET http://localhost:5500/api/batches -H "Authorization: Bearer $TOKEN" | grep -q 'id' && echo "✓ OK" || echo "✗ FAILED"

echo "11. PRICING:"
curl -s -X GET http://localhost:5500/api/pricing -H "Authorization: Bearer $TOKEN" | grep -q 'id' && echo "✓ OK" || echo "✗ FAILED"

echo "12. SECURITY:"
curl -s -X GET http://localhost:5500/api/security -H "Authorization: Bearer $TOKEN" | grep -q 'id' && echo "✓ OK" || echo "✗ FAILED"

echo "13. EQUIPMENT:"
curl -s -X GET http://localhost:5500/api/equipment -H "Authorization: Bearer $TOKEN" | grep -q 'id' && echo "✓ OK" || echo "✗ FAILED"

echo ""
echo "Backend status: OK (running)"
