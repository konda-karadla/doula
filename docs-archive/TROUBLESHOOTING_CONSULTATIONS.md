# Troubleshooting: "Failed to Load Doctors/Consultations"

**Issue:** Frontend can't fetch doctors or consultations  
**Status:** Diagnosing...

---

## ✅ **Quick Fix Steps**

### **Step 1: Start the Backend**

The backend MUST be running for the frontend to work!

```bash
# Terminal 1 - Start Backend
cd backend
npm run start:dev

# You should see:
# [Nest] Application listening on port 3002
# Swagger docs: http://localhost:3002/api
```

**Wait for:** "Application successfully started" message

---

### **Step 2: Verify Backend is Running**

Open browser and go to:
```
http://localhost:3002/api
```

**You should see:** Swagger API documentation page

**If you see it:** Backend is running! ✅  
**If you don't:** Backend didn't start properly ❌

---

### **Step 3: Check if Doctors Exist in Database**

The seed data should have created 4 doctors. Let's verify:

#### **Option A: Use Swagger UI**

1. Go to http://localhost:3002/api
2. Find **"Consultations"** section
3. Click `GET /consultations/doctors`
4. Click "Try it out"
5. Click "Execute"

**Expected:** You should see 4 doctors in the response

#### **Option B: Direct API Call**

Open this URL in browser:
```
http://localhost:3002/consultations/doctors
```

**Expected:** JSON with 4 doctors (but you'll get 401 Unauthorized without token - that's OK, means endpoint exists)

---

### **Step 4: Login First!**

The consultation endpoints require authentication!

#### **Web Portal:**
1. Go to http://localhost:3001/login
2. Login: `user@healthplatform.com` / `user123`
3. **After login**, then navigate to consultations
4. Should work now!

#### **Why this matters:**
- All consultation endpoints require JWT token
- Token is stored after login
- Without login, you get "Failed to load"

---

## 🔍 **Diagnosis Checklist**

### **Check 1: Is Backend Running?**
```bash
# Check if backend process is running
# You should have a terminal with:
npm run start:dev
# And see: "Application listening on port 3002"
```

- [ ] Backend terminal is open and running
- [ ] No errors in backend terminal
- [ ] Can access http://localhost:3002/api

---

### **Check 2: Are You Logged In?**
- [ ] Went to /login page first
- [ ] Entered credentials
- [ ] Successfully logged in
- [ ] See user email in top right
- [ ] **Then** navigate to consultations

---

### **Check 3: Does Seed Data Exist?**

Run the seed command:
```bash
cd backend
npx ts-node prisma/seed.ts
```

**You should see:**
```
✅ Created doctor: Dr. Sarah Johnson (OBGYN)
✅ Created doctor: Dr. Michael Chen (Functional Medicine)
✅ Created doctor: Dr. Priya Sharma (Reproductive Endocrinology)
✅ Created doctor: Dr. James Wilson (Nutritional Medicine)
✅ Sample consultation: 10/19/2025, 10:00:00 AM
```

- [ ] Seed ran successfully
- [ ] 4 doctors created
- [ ] 1 consultation created

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Failed to load doctors"**

**Cause:** Backend not running or not reachable

**Solution:**
```bash
cd backend
npm run start:dev
# Wait for "Application listening on port 3002"
```

---

### **Issue 2: "401 Unauthorized"**

**Cause:** Not logged in

**Solution:**
1. Go to /login first
2. Enter: user@healthplatform.com / user123
3. Click "Sign In"
4. **THEN** navigate to consultations

---

### **Issue 3: "No doctors found" (but no error)**

**Cause:** Seed data not created

**Solution:**
```bash
cd backend
npx ts-node prisma/seed.ts
```

---

### **Issue 4: Database connection error**

**Cause:** Database not configured

**Solution:**
Check `backend/.env` file has:
```
DATABASE_URL="your-postgres-connection-string"
```

---

## ✅ **Correct Startup Sequence**

### **Terminal Setup:**

```bash
# Terminal 1 - Backend (MUST START FIRST!)
cd backend
npm run start:dev
# Wait for: "Application listening on port 3002"

# Terminal 2 - Web Portal
cd frontend/apps/web
npm run dev
# Runs on: http://localhost:3001

# Terminal 3 - Admin Portal (optional)
cd frontend/apps/admin
npm run dev
# Runs on: http://localhost:3003 or 3004
```

### **Testing Sequence:**

1. ✅ Start backend first (wait for it to fully start)
2. ✅ Start web portal
3. ✅ Go to http://localhost:3001/login
4. ✅ Login with credentials
5. ✅ Click "Consultations" in nav
6. ✅ Should see hub page with stats
7. ✅ Click "Browse Doctors"
8. ✅ Should see 4 doctors!

---

## 🔧 **Debug Commands**

### **Check if Backend is Running:**
```bash
# Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

### **Check Backend Logs:**
Look at the terminal where you ran `npm run start:dev`

**Good log:**
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [InstanceLoader] ConsultationsModule dependencies initialized ✅
[Nest] LOG [RoutesResolver] ConsultationsController {/consultations}: ✅
[Nest] LOG [NestApplication] Nest application successfully started
```

**Bad log:**
```
ERROR [ExceptionsHandler] Cannot find module...
ERROR [ExceptionsHandler] Connection refused...
```

---

### **Test Backend Directly (No Frontend):**

**Method 1: Browser**
```
http://localhost:3002/api
```
Should show Swagger docs

**Method 2: PowerShell**
```powershell
Invoke-WebRequest -Uri "http://localhost:3002/consultations/doctors"
# Will get 401 (no auth) but proves endpoint exists
```

---

## 🎯 **Most Likely Fix**

**90% chance the issue is:**
1. **Backend not started** - Run `npm run start:dev` in backend folder
2. **Not logged in** - Go to /login first before navigating to consultations

**Try this:**
```bash
# Terminal 1
cd backend
npm run start:dev
# WAIT for "Application successfully started"

# Then in browser
http://localhost:3001/login
# Login: user@healthplatform.com / user123
# Click "Consultations"
# Should work now!
```

---

## 📸 **What You Should See (If Working)**

### **Backend Terminal:**
```
[Nest] LOG [NestApplication] Nest application successfully started
[Nest] LOG Application is running on: http://localhost:3002
```

### **Web Portal (After Login):**
```
Top Navigation:
Dashboard | Consultations | Lab Results | Action Plans...

Click "Consultations":
- See stats (3 total, 1 upcoming, 2 completed)
- See two big cards
- Click "Browse Doctors"
- See 4 doctor cards with photos
```

---

## 🆘 **Still Not Working?**

**Send me:**
1. Backend terminal output (what you see when running npm run start:dev)
2. Browser console errors (F12 → Console tab)
3. Network tab errors (F12 → Network tab → Failed requests)

**I'll help debug!**

---

**Most likely:** Just need to start backend and login first! 🚀

