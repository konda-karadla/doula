# Mobile App Consultation Logging - Implementation Summary

## Overview
Added comprehensive logging and fixed mobile consultation services to debug "Failed to load doctors" and "Failed to load consultations" errors.

## Problem Identified
The mobile app was missing consultation services in its local services file, causing the hooks to fail when trying to fetch data.

## Solutions Implemented

### 1. ✅ Added Consultation Services to Mobile App
**File**: `frontend/apps/mobile/lib/api/services.ts`

Added complete consultation service:
```typescript
export const consultationService = {
  getDoctors: () => api.get<Doctor[]>(apiEndpoints.consultations.doctors),
  getDoctor: (id) => api.get<Doctor>(apiEndpoints.consultations.doctor(id)),
  getAvailability: (id, date) => api.get<string[]>(apiEndpoints.consultations.availability(id, date)),
  book: (data) => api.post<Consultation>(apiEndpoints.consultations.book, data),
  getMyBookings: () => api.get<Consultation[]>(apiEndpoints.consultations.myBookings),
  get: (id) => api.get<Consultation>(apiEndpoints.consultations.get(id)),
  reschedule: (id, data) => api.put<Consultation>(apiEndpoints.consultations.reschedule(id), data),
  cancel: (id) => api.delete<Consultation>(apiEndpoints.consultations.cancel(id)),
}
```

### 2. ✅ Fixed Hooks to Use Mobile Services
**File**: `frontend/apps/mobile/hooks/use-consultations.ts`

Changed from:
```typescript
import { services } from '@health-platform/api-client';
```

To:
```typescript
import { services } from '../lib/api/services';
```

### 3. ✅ Added Comprehensive Logging

#### A. Mobile API Client Logging
**File**: `frontend/apps/mobile/lib/api/client.ts`

Added logging to:
- **Request interceptor**: Logs method, URL, full URL, token status
- **Response interceptor**: Logs status, URL, data length
- **Error interceptor**: Logs detailed error information
- **HTTP methods**: Individual error logging for GET, POST, PUT, PATCH, DELETE

**Example Log Output**:
```
[Mobile API Request] {
  method: 'GET',
  url: '/consultations/doctors',
  baseURL: 'http://localhost:3002',
  fullUrl: 'http://localhost:3002/consultations/doctors',
  hasToken: true,
  headers: {...}
}

[Mobile API Response] {
  status: 200,
  url: '/consultations/doctors',
  dataLength: 1234
}
```

#### B. Hook-Level Logging
**File**: `frontend/apps/mobile/hooks/use-consultations.ts`

Added logging to:
- `useDoctors`: Logs fetch start, success count, detailed errors
- `useMyConsultations`: Logs fetch start, success count, detailed errors

**Example Log Output**:
```
[useDoctors] Fetching doctors...
[useDoctors] Success: 3 doctors

// OR on error:
[useDoctors] Error: {
  message: 'Request failed with status code 404',
  status: 404,
  data: {...}
}
```

#### C. UI Component Error Display
**Files**: 
- `frontend/apps/mobile/app/consultations/browse.tsx`
- `frontend/apps/mobile/app/consultations/my-bookings.tsx`

Enhanced error UI to show:
- Error message text
- Detailed error information from error object
- Hint to check console logs
- Go Back button

## Files Modified

| File | Changes |
|------|---------|
| `lib/api/services.ts` | Added consultationService with 8 endpoints |
| `hooks/use-consultations.ts` | Fixed import, added logging to 2 hooks |
| `lib/api/client.ts` | Added logging to request/response interceptors and all HTTP methods |
| `app/consultations/browse.tsx` | Enhanced error display with detailed messages |
| `app/consultations/my-bookings.tsx` | Enhanced error display with detailed messages |

## What to Do Next

### Step 1: Restart the App
```bash
cd frontend/apps/mobile
npm run start:clean
```

### Step 2: Open Console
Keep your terminal or React Native debugger open to see logs.

### Step 3: Test the Features
1. Open the mobile app
2. Navigate to "Book Consultations" or "My Consultations"
3. Watch the console for logs

### Step 4: Analyze the Logs

You'll see one of these scenarios:

#### ✅ Scenario A: Everything Works
```
[Mobile API Request] { method: 'GET', url: '/consultations/doctors', ... }
[useDoctors] Fetching doctors...
[Mobile API Response] { status: 200, ... }
[useDoctors] Success: 3 doctors
```
**Action**: Nothing needed! Feature is working.

#### ❌ Scenario B: Backend Not Reachable
```
[Mobile API Request] { method: 'GET', url: '/consultations/doctors', ... }
[useDoctors] Fetching doctors...
[Mobile API Response Error] { message: 'Network error', ... }
```
**Action**: 
- Check backend is running
- Verify API_BASE_URL in `.env.local`
- For emulator: Use `10.0.2.2:3002` (Android) or `localhost:3002` (iOS)
- For physical device: Use your machine's IP (e.g., `192.168.1.100:3002`)

#### ❌ Scenario C: Endpoint Not Found (404)
```
[Mobile API Request] { method: 'GET', url: '/consultations/doctors', ... }
[useDoctors] Fetching doctors...
[Mobile API Response Error] { status: 404, message: 'Not Found', ... }
```
**Action**: 
- Check backend has consultation routes
- Verify `backend/src/consultations/` module exists
- Check backend logs for route registration

#### ❌ Scenario D: Unauthorized (401)
```
[Mobile API Request] { method: 'GET', hasToken: false, ... }
[useDoctors] Fetching doctors...
[Mobile API Response Error] { status: 401, message: 'Unauthorized', ... }
```
**Action**: 
- User needs to log in
- Check token storage
- Try logging out and logging back in

#### ❌ Scenario E: No Data (Empty)
```
[Mobile API Request] { method: 'GET', url: '/consultations/doctors', ... }
[useDoctors] Fetching doctors...
[Mobile API Response] { status: 200, ... }
[useDoctors] Success: 0 doctors
```
**Action**: 
- Check backend database for doctors
- Run seed script: `cd backend && npm run seed`
- Verify doctors have `isActive: true`

## Environment Setup

Make sure your `.env.local` is configured:

```bash
# For Android Emulator
API_BASE_URL=http://10.0.2.2:3002

# For iOS Simulator
API_BASE_URL=http://localhost:3002

# For Physical Device
API_BASE_URL=http://YOUR_MACHINE_IP:3002

API_TIMEOUT=30000
NODE_ENV=development
ENABLE_DEBUG_MODE=true
```

**Remember**: Restart Metro after changing `.env.local`!

## Debugging Tools

### Console Logs
All logs are prefixed for easy filtering:
- `[Mobile API Request]` - Outgoing requests
- `[Mobile API Response]` - Successful responses
- `[Mobile API Response Error]` - Failed responses
- `[useDoctors]` - Doctor fetching
- `[useMyConsultations]` - Consultation fetching

### Test Backend Directly
```bash
# Get your JWT token from app
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3002/consultations/doctors
```

### Backend Logs
```bash
cd backend
npm run start:dev
# Watch for: [Nest] Mapped {/consultations/doctors, GET}
```

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| "Network error" | Check API_BASE_URL, backend running |
| "404 Not Found" | Verify backend has consultation routes |
| "401 Unauthorized" | Log in again |
| "0 doctors" | Run backend seed script |
| No logs at all | Check component is mounted, QueryClientProvider set up |

## Documentation

For detailed debugging guide, see:
- **MOBILE_CONSULTATIONS_DEBUG.md** - Comprehensive debugging guide
- **MOBILE_API_FIX.md** - Previous mobile API fixes
- **TROUBLESHOOTING_CONSULTATIONS.md** - Consultation-specific troubleshooting

## Success Criteria

✅ Console shows successful API requests  
✅ Console shows response with doctor count  
✅ UI displays list of doctors  
✅ No error messages in UI  
✅ Backend logs show requests coming in  

## Next Steps

1. **Run the app** with console open
2. **Navigate to consultations** tab
3. **Copy the console logs** that appear
4. **Share the logs** so we can diagnose the exact issue

The logging is now comprehensive - we'll be able to see exactly where the failure occurs!

---

**Note**: The linter warnings in `client.ts` are cosmetic and don't affect functionality. They can be addressed later if needed.

