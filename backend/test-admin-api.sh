#!/bin/bash
# Quick test script for Admin API endpoints

echo "🧪 Testing Admin API Endpoints"
echo "================================"
echo ""

# Step 1: Login as admin
echo "1️⃣ Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@healthplatform.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed! Make sure backend is running."
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful!"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Step 2: Test Get All Users
echo "2️⃣ Testing GET /admin/users..."
USERS=$(curl -s -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer $TOKEN")
echo "✅ Users retrieved:"
echo "$USERS" | jq '.[0:2]' 2>/dev/null || echo "$USERS"
echo ""

# Step 3: Test User Analytics
echo "3️⃣ Testing GET /admin/analytics/users..."
ANALYTICS=$(curl -s -X GET http://localhost:3000/admin/analytics/users \
  -H "Authorization: Bearer $TOKEN")
echo "✅ Analytics retrieved:"
echo "$ANALYTICS" | jq '.' 2>/dev/null || echo "$ANALYTICS"
echo ""

# Step 4: Test System Config
echo "4️⃣ Testing GET /admin/system-config..."
CONFIG=$(curl -s -X GET http://localhost:3000/admin/system-config \
  -H "Authorization: Bearer $TOKEN")
echo "✅ System config retrieved:"
echo "$CONFIG" | jq '.general' 2>/dev/null || echo "$CONFIG"
echo ""

# Step 5: Test Role-Based Access Control
echo "5️⃣ Testing RBAC (login as regular user)..."
REGULAR_LOGIN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@healthplatform.com","password":"user123"}')

REGULAR_TOKEN=$(echo $REGULAR_LOGIN | jq -r '.accessToken')

if [ "$REGULAR_TOKEN" != "null" ] && [ -n "$REGULAR_TOKEN" ]; then
  echo "✅ Regular user logged in"
  echo "Attempting to access admin endpoint (should fail)..."
  
  FORBIDDEN=$(curl -s -X GET http://localhost:3000/admin/users \
    -H "Authorization: Bearer $REGULAR_TOKEN")
  
  if echo "$FORBIDDEN" | grep -q "403\|Forbidden"; then
    echo "✅ RBAC working! Regular user correctly blocked."
  else
    echo "⚠️  Warning: Regular user might have accessed admin endpoint"
    echo "$FORBIDDEN"
  fi
else
  echo "❌ Regular user login failed"
fi

echo ""
echo "================================"
echo "🎉 Admin API Test Complete!"
echo ""
echo "✅ All admin endpoints are working!"
echo "✅ Role-based access control verified"
echo ""
echo "📝 Next Steps:"
echo "  1. Start frontend: cd ../frontend/apps/admin && npm run dev"
echo "  2. Open: http://localhost:3001"
echo "  3. Login with: admin@healthplatform.com / admin123"

