# Web App API Error - Quick Fix Guide

## 🔴 Current Error
```
[API Response Error] {}
at createApiClient.use (..\src\client.ts:79:9)
```

## 🎯 Root Causes (In Order of Likelihood)

### 1. Backend Not Running
**Most Common Issue**

**Check**: Is your backend server running?

**Fix**:
```bash
cd backend
npm run start:dev
```

You should see:
```
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO Mapped {/profile, GET}
```

---

### 2. Prisma Client Out of Sync
**Current Issue** - TypeScript errors mean this is the problem

**Fix**:
```bash
# Stop backend first (Ctrl+C)
cd backend

# Quick sync
npx prisma db push
npx prisma generate

# Restart
npm run start:dev
```

This regenerates Prisma with the new `status`, `priority`, `targetDate` fields.

---

### 3. Not Logged In
**Profile requires authentication**

**Check**: Look in browser console for:
```
[useProfile] Fetching profile... { hasToken: false }
```

If `hasToken: false`, you need to log in first.

**Fix**: 
1. Go to login page
2. Log in with valid credentials
3. Profile will fetch automatically

---

### 4. Wrong API URL
**Web app can't reach backend**

**Check**: `frontend/apps/web/.env.local`
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
```

**Fix**: Make sure URL matches your backend port (default: 3002)

---

## 🔍 Debug the Error

The error object is empty `{}` because error details aren't being captured. I've added better logging.

### Check Browser Console for:

**Successful Call**:
```
[useProfile] Fetching profile... { hasToken: true }
[API Request] { method: 'GET', url: '/profile', fullUrl: 'http://localhost:3002/profile' }
[API Response] { status: 200, dataLength: 234 }
[useProfile] Success: { id: '...', email: '...', ... }
```

**Error - Backend Not Running**:
```
[useProfile] Fetching profile... { hasToken: true }
[API Request] { method: 'GET', url: '/profile', ... }
[API Response Error] {
  url: '/profile',
  status: undefined,
  message: 'Network Error',
  data: undefined
}
[useProfile] Error: { message: 'Network Error' }
```

**Error - Not Authenticated**:
```
[useProfile] Fetching profile... { hasToken: false }
// Query is disabled, no API call made
```

**Error - Backend Error (404/500)**:
```
[useProfile] Fetching profile... { hasToken: true }
[API Response Error] {
  url: '/profile',
  status: 404,
  message: 'Not Found',
  data: { message: 'Route not found' }
}
```

---

## ✅ STEP-BY-STEP FIX

### Step 1: Stop Backend
In the terminal running backend, press **Ctrl+C**

### Step 2: Fix Prisma
```bash
cd backend
npx prisma db push
npx prisma generate
```

Wait for:
```
✔ Generated Prisma Client
```

### Step 3: Restart Backend
```bash
npm run start:dev
```

Wait for:
```
[Nest] INFO Nest application successfully started
```

### Step 4: Refresh Web App
In your browser:
1. Open DevTools (F12)
2. Go to Console tab
3. Refresh page (F5)
4. Watch for logs

### Step 5: Check Logs

You should now see:
```
[useProfile] Fetching profile... { hasToken: true }
[API Request] { method: 'GET', url: '/profile', ... }
[API Response] { status: 200, ... }
[useProfile] Success: { ... }
```

---

## 🚨 If Still Not Working

### Issue: hasToken is false
**Cause**: Not logged in
**Fix**: 
```
1. Go to /login
2. Log in with credentials
3. Profile will auto-fetch
```

### Issue: Network Error
**Cause**: Backend not reachable
**Fix**:
```
1. Check backend is running (npm run start:dev)
2. Check port (default: 3002)
3. Check .env.local has correct API_BASE_URL
```

### Issue: 401 Unauthorized
**Cause**: Token expired or invalid
**Fix**:
```
1. Log out
2. Log in again
3. Fresh token will be issued
```

### Issue: 404 Not Found
**Cause**: Profile endpoint doesn't exist
**Fix**:
```
1. Check backend has ProfileModule
2. Check route registration
3. Verify backend logs show: Mapped {/profile, GET}
```

---

## 🎯 QUICK TEST

### Test if Backend is Running:
```bash
# In a new terminal
curl http://localhost:3002/
```

Expected:
```json
{"message":"Health Platform API is running!"}
```

### Test if Profile Endpoint Exists:
```bash
# Replace YOUR_TOKEN with actual token from browser localStorage
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3002/profile
```

Expected:
```json
{
  "id": "...",
  "email": "...",
  "username": "...",
  ...
}
```

---

## 💡 RECOMMENDATION

**For now**, to avoid the error while testing:

### Option A: Use Mock Profile (Temporary)
Comment out the profile fetch until backend is ready:

```typescript
// frontend/apps/web/src/hooks/use-profile.ts
export function useProfile() {
  const { token } = useAuthStore();
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      // Temporary mock while fixing backend
      return {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        systemId: 'SYS001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}
```

### Option B: Fix Backend Immediately (Recommended)
```bash
# Just run these 3 commands:
cd backend
npx prisma db push && npx prisma generate
npm run start:dev
```

---

## 📋 CHECKLIST

Before testing web app features:
- [ ] Backend server running at localhost:3002
- [ ] Prisma client regenerated (npx prisma generate)
- [ ] Database synced (npx prisma db push)
- [ ] Web app running at localhost:3001
- [ ] User logged in (check browser console for hasToken: true)
- [ ] .env.local has NEXT_PUBLIC_API_BASE_URL=http://localhost:3002

---

## 🚀 WHAT TO DO NOW

**Immediate Fix**:
1. Stop backend (Ctrl+C)
2. Run: `npx prisma db push && npx prisma generate`
3. Restart: `npm run start:dev`
4. Refresh web app
5. Check console logs

The better logging I added will now show exactly what's failing! 🔍

