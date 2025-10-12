# Mobile Consultations Debugging Guide

## Issue
The mobile app's consultation features are showing:
- **Browse Doctors** (`/consultations/browse`): "Failed to load doctors"
- **My Consultations** (`/consultations/my-bookings`): "Failed to load consultations"

## What Was Fixed

### 1. Added Consultation Services to Mobile App
**Problem**: The mobile app's services file (`lib/api/services.ts`) was missing consultation services.

**Fixed**: Added complete consultation service with all endpoints:
- `getDoctors()` - Browse available doctors
- `getDoctor(id)` - Get specific doctor details
- `getAvailability(id, date)` - Get doctor's available slots
- `book(data)` - Book a consultation
- `getMyBookings()` - Get user's consultations
- `get(id)` - Get specific consultation
- `reschedule(id, data)` - Reschedule consultation
- `cancel(id)` - Cancel consultation

### 2. Fixed Hooks Import
**Problem**: Hooks were importing from `@health-platform/api-client` (web client) instead of mobile services.

**Fixed**: Updated `hooks/use-consultations.ts` to import from `../lib/api/services`.

### 3. Added Comprehensive Logging

Added logging at multiple levels to diagnose issues:

#### Mobile API Client (`lib/api/client.ts`)
- **Request logging**: Method, URL, token status, headers
- **Response logging**: Status, data length
- **Error logging**: Status, error message, response data
- **HTTP method logging**: Individual errors for GET, POST, PUT, PATCH, DELETE

#### Hooks (`hooks/use-consultations.ts`)
- **useDoctors**: Logs fetch start, success count, detailed errors
- **useMyConsultations**: Logs fetch start, success count, detailed errors

#### UI Components
- **browse.tsx**: Shows detailed error messages and console logs
- **my-bookings.tsx**: Shows detailed error messages and console logs

## How to Debug

### Step 1: Check Console Logs

When you open the app, look for these log patterns in your console:

#### Successful Request Pattern:
```
[Mobile API Request] {
  method: 'GET',
  url: '/consultations/doctors',
  baseURL: 'http://localhost:3002',
  fullUrl: 'http://localhost:3002/consultations/doctors',
  hasToken: true
}

[useDoctors] Fetching doctors...

[Mobile API Response] {
  status: 200,
  url: '/consultations/doctors',
  dataLength: 1234
}

[useDoctors] Success: 3 doctors
```

#### Failed Request Pattern:
```
[Mobile API Request] {
  method: 'GET',
  url: '/consultations/doctors',
  baseURL: 'http://localhost:3002',
  fullUrl: 'http://localhost:3002/consultations/doctors',
  hasToken: true
}

[useDoctors] Fetching doctors...

[Mobile API Response Error] {
  url: '/consultations/doctors',
  status: 404,
  statusText: 'Not Found',
  message: 'Request failed with status code 404',
  data: { message: 'Route not found', error: 'Not Found' }
}

[useDoctors] Error: {
  message: 'Request failed with status code 404',
  status: 404,
  data: { message: 'Route not found' }
}
```

### Step 2: Common Issues and Solutions

#### Issue: 404 Not Found
**Symptoms**:
```
status: 404
statusText: 'Not Found'
```

**Possible Causes**:
1. Backend server not running
2. Wrong API URL in `.env.local`
3. Consultation routes not registered in backend

**Solutions**:
1. Verify backend is running: `cd backend && npm run start:dev`
2. Check `.env.local` in mobile app:
   ```bash
   API_BASE_URL=http://YOUR_IP:3002  # Not localhost for mobile!
   ```
3. Verify backend has consultation endpoints by checking `backend/src/consultations/`

#### Issue: 401 Unauthorized
**Symptoms**:
```
status: 401
statusText: 'Unauthorized'
hasToken: false
```

**Possible Causes**:
1. User not logged in
2. Token expired
3. Token refresh failed

**Solutions**:
1. Log in again
2. Check token storage: Look for `[Mobile API Request] { hasToken: true }`
3. If hasToken is false, authentication is the issue

#### Issue: Network Error / Timeout
**Symptoms**:
```
message: 'Network error'
error: 'NetworkError'
```

**Possible Causes**:
1. Backend not reachable from mobile device
2. Wrong IP address in API_BASE_URL
3. Firewall blocking connection

**Solutions**:
1. For Android Emulator: Use `10.0.2.2` instead of `localhost`
2. For iOS Simulator: Use `localhost` or your machine's IP
3. For Physical Device: Use your machine's local IP (e.g., `192.168.1.100`)
4. Check firewall settings

#### Issue: Empty Response
**Symptoms**:
```
[useDoctors] Success: 0 doctors
```

**Possible Causes**:
1. No doctors in database
2. All doctors marked as inactive

**Solutions**:
1. Check backend database: Are there doctors?
2. Run backend seed script: `cd backend && npm run seed`
3. Check doctor `isActive` status in database

### Step 3: Test API Directly

Test if the backend endpoints work:

#### Test Doctors Endpoint
```bash
# Replace YOUR_TOKEN with actual JWT token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3002/consultations/doctors
```

Expected Response:
```json
[
  {
    "id": "uuid",
    "name": "Dr. Sarah Johnson",
    "specialization": "Cardiologist",
    "isActive": true,
    ...
  }
]
```

#### Test My Bookings Endpoint
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3002/consultations/my-bookings
```

### Step 4: Verify Environment Setup

Check your mobile app's `.env.local` file:

```bash
# For Android Emulator
API_BASE_URL=http://10.0.2.2:3002

# For iOS Simulator  
API_BASE_URL=http://localhost:3002

# For Physical Device (replace with your machine's IP)
API_BASE_URL=http://192.168.1.100:3002

API_TIMEOUT=30000
NODE_ENV=development
ENABLE_DEBUG_MODE=true
ENABLE_OFFLINE_MODE=true
```

**Important**: After changing `.env.local`, restart Metro bundler:
```bash
cd frontend/apps/mobile
npm run start:clean
```

### Step 5: Backend Verification

Ensure backend has consultation endpoints:

```bash
cd backend
npm run start:dev
```

Check logs for:
```
[Nest] 12345 - ConsultationsModule initialized
[Nest] 12345 - Mapped {/consultations/doctors, GET}
[Nest] 12345 - Mapped {/consultations/my-bookings, GET}
```

## Log Location Guide

### Mobile App Logs
- **React Native Debugger**: If using RN Debugger
- **Metro Terminal**: Console logs appear here
- **Expo Dev Tools**: Check the console tab
- **Physical Device**: Use `adb logcat` (Android) or Xcode Console (iOS)

### Backend Logs
- Terminal where `npm run start:dev` is running
- Look for request logs from NestJS

## Quick Checklist

- [ ] Backend server is running (`http://localhost:3002`)
- [ ] Backend has consultation endpoints
- [ ] Database has active doctors (run seed script)
- [ ] Mobile `.env.local` has correct API_BASE_URL
- [ ] User is logged in (check hasToken in logs)
- [ ] Token is valid (not expired)
- [ ] Network connectivity between device and backend
- [ ] Metro bundler restarted after `.env.local` changes

## Testing Flow

1. **Start Backend**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Start Mobile App**:
   ```bash
   cd frontend/apps/mobile
   npm run start:clean
   ```

3. **Open Console**: Keep terminal visible to see logs

4. **Navigate to Consultations**:
   - Open app
   - Go to "Book Consultations" tab
   - Watch console for logs

5. **Check Logs**:
   - Look for `[Mobile API Request]`
   - Check for successful response or error
   - Note the error details

6. **Fix Issues**: Based on error type from Step 2 above

## Need More Help?

If logs show successful API calls but UI still shows errors:
- Check React Query cache
- Clear app data
- Reinstall app
- Check for JavaScript errors in render

If logs show no API calls at all:
- Component may not be mounted
- Hook may not be executing
- Check navigation flow
- Verify QueryClientProvider is set up

## Summary of Changes Made

### Files Modified:
1. **frontend/apps/mobile/lib/api/services.ts**
   - Added consultationService with all endpoints
   - Exported as part of services object

2. **frontend/apps/mobile/hooks/use-consultations.ts**
   - Changed import from `@health-platform/api-client` to `../lib/api/services`
   - Added logging to useDoctors hook
   - Added logging to useMyConsultations hook

3. **frontend/apps/mobile/lib/api/client.ts**
   - Added request interceptor logging
   - Added response interceptor logging
   - Added error logging to all HTTP methods

4. **frontend/apps/mobile/app/consultations/browse.tsx**
   - Enhanced error display with detailed messages
   - Added console logging
   - Added troubleshooting hints in UI

5. **frontend/apps/mobile/app/consultations/my-bookings.tsx**
   - Enhanced error display with detailed messages
   - Added console logging
   - Added troubleshooting hints in UI

### Files to Check Next:
- `frontend/apps/mobile/.env.local` - API configuration
- `backend/src/consultations/` - Backend endpoints
- Backend database - Doctor and consultation data

## Next Steps

1. **Run the mobile app** and navigate to consultations
2. **Watch the console** for the detailed logs we added
3. **Share the logs** with me so we can diagnose the exact issue
4. **Follow the checklist** to verify setup

The logging is now comprehensive enough that we'll be able to pinpoint exactly where the failure is occurring!

