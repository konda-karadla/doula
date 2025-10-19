# Mobile App - API Connection Fix

**Issue:** Can't load doctors/consultations in mobile app  
**Your IP:** 192.168.1.165 ✅ (Already configured correctly!)  
**Backend Port:** 3002 ✅ (Correct!)

---

## ✅ **Quick Fix Steps**

### **Step 1: Make Sure Backend is Running**

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# WAIT until you see:
# [Nest] LOG [NestApplication] Nest application successfully started
# [Nest] LOG Application is running on: http://[::1]:3002
```

**Critical:** Backend MUST be running before mobile app can connect!

---

### **Step 2: Restart Mobile App (Pick Up .env Changes)**

```bash
# Terminal 2 - Mobile App
cd frontend/apps/mobile

# Clean restart to pick up environment variables
npm run start:clean

# OR if that doesn't work:
npx expo start --clear
```

**Why:** Mobile app caches .env values, needs restart to reload

---

### **Step 3: Open Mobile App**

Choose one:

**Option A: Web (Quickest for testing)**
```
Press 'w' in the Metro terminal
Opens: http://localhost:8081
```

**Option B: Physical Device (Expo Go)**
```
1. Install "Expo Go" app on your phone
2. Scan QR code from terminal
3. App loads on phone
```

**Option C: Android Emulator**
```
Press 'a' in the Metro terminal
```

---

### **Step 4: Login on Mobile**

**Critical:** You MUST login first!

1. App opens to welcome screen
2. Tap "Go to Login"
3. Enter:
   - Email: `user@healthplatform.com`
   - Password: `user123`
4. Tap "Sign In"
5. Should see Dashboard ✅

---

### **Step 5: Navigate to Consultations**

From Dashboard:
1. Scroll down to "Quick Actions"
2. Tap **"📅 Book Consultation"**
3. Should see Consultations Hub ✅
4. Tap **"Browse Doctors"** card
5. **Should see 4 doctors!** ✅

---

## 🔍 **If Still Not Working**

### **Debug Method 1: Check Console Logs**

When mobile app loads, you should see in Metro terminal:
```
🔧 Environment Configuration:
  Environment: development
  API URL: http://192.168.1.165:3002  ← Should show your IP
  API Timeout: 30000
  Debug Mode: true
  Offline Mode: true
```

**If API URL shows `localhost:3002`:** .env not loaded, restart Metro

---

### **Debug Method 2: Test Backend from Mobile Network**

From your phone's browser (if using physical device):
```
http://192.168.1.165:3002/api
```

**Should see:** Swagger docs page  
**If not:** Firewall blocking, or phone on different network

---

### **Debug Method 3: Check if Backend Accessible**

From another terminal:
```powershell
# Test if backend responds
Invoke-WebRequest -Uri "http://192.168.1.165:3002/api"

# Should return HTML (Swagger page)
```

---

## 🚨 **Common Issues**

### **Issue 1: "Network Error" in Mobile**

**Cause:** Phone can't reach computer

**Solutions:**
- ✅ Both devices on same WiFi network
- ✅ Windows Firewall allows port 3002
- ✅ Backend is running

**Quick test:**
```
Open phone browser → http://192.168.1.165:3002/api
Should show Swagger docs
```

---

### **Issue 2: "401 Unauthorized"**

**Cause:** Not logged in

**Solution:**
1. Tap "Go to Login" on mobile
2. Login with user@healthplatform.com / user123
3. THEN navigate to consultations

---

### **Issue 3: Shows "localhost:3002" in logs**

**Cause:** .env.local not loaded

**Solution:**
```bash
cd frontend/apps/mobile
npm run start:clean
# OR
npx expo start --clear
```

---

## ✅ **Correct Startup Sequence for Mobile**

### **Terminal 1: Backend**
```bash
cd backend
npm run start:dev
```
**Wait for:** "Application successfully started"

### **Terminal 2: Mobile**
```bash
cd frontend/apps/mobile
npx expo start
# OR
npm run start:clean  (if .env not loading)
```

### **Mobile App:**
1. Open app (web/device/emulator)
2. **Login first!** (user@healthplatform.com / user123)
3. Go to Dashboard
4. Tap "📅 Book Consultation"
5. Tap "Browse Doctors"
6. Should see 4 doctors!

---

## 🎯 **Your Configuration (Should Be Correct)**

**Backend Port:** 3002 ✅  
**Your IP:** 192.168.1.165 ✅  
**Mobile .env:** Already has correct IP ✅  
**API_BASE_URL:** http://192.168.1.165:3002 ✅

---

## 💡 **Most Likely Solution**

**Try this exact sequence:**

```bash
# 1. Start backend (if not already running)
cd backend
npm run start:dev

# 2. In new terminal, restart mobile with clean cache
cd frontend/apps/mobile
npx expo start --clear

# 3. Press 'w' for web or scan QR for device

# 4. In mobile app:
#    - Tap "Go to Login"
#    - Login: user@healthplatform.com / user123
#    - Tap "📅 Book Consultation" on dashboard
#    - Should work now!
```

---

## 🔍 **Quick Diagnostic**

**In mobile app, after login, if you tap consultations and get error:**

Open Metro bundler terminal and look for errors:
```
ERROR  [Error: Network request failed]
→ Backend not reachable

ERROR  [Error: Request failed with status code 401]
→ Not logged in properly

ERROR  [Error: timeout of 30000ms exceeded]
→ Backend slow or not responding
```

**Share the error message and I'll help!**

---

**Most likely you just need to:**
1. ✅ Start backend (`npm run start:dev`)
2. ✅ Login on mobile first
3. ✅ Then navigate to consultations

Try it and let me know! 🚀

