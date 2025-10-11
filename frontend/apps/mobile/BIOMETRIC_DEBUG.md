# Biometric Debug Guide 🔍

## How to Test & Debug

### **Step 1: Clear Everything & Start Fresh**

In Metro terminal, press `r` to reload the app.

### **Step 2: Login with Password**

1. Enter your email and password
2. Click "Sign In"

### **Step 3: Watch Metro Console Logs**

You should see these logs in your Metro terminal:

```
✅ Login successful, saving credentials...
✅ Credentials saved to SecureStore
🔐 Biometric capability: { isAvailable: true/false, ... }
✅ Biometric enabled  (if device supports it)
```

### **Step 4: Go to Profile**

1. Navigate to Profile tab
2. Check if you see "Security Settings" card
3. Check if biometric toggle is ON

### **Step 5: Logout**

1. Click Logout button
2. Confirm
3. Returns to login screen

### **Step 6: Check Login Screen**

You should see these logs:

```
🔐 Login Screen - Biometric Check:
  Device capability: true/false
  Has saved credentials: true/false  ← Should be TRUE
  Biometric enabled in settings: true/false  ← Should be TRUE
  Token found: YES/NO  ← Should be YES
  Will show biometric button: true/false  ← Should be TRUE
  Biometric type: Face ID/Touch ID/Fingerprint
```

### **Step 7: Check for Biometric Button**

Look for button that says:
```
"Or use Face ID"  (or Touch ID, or Fingerprint)
```

---

## 🐛 Troubleshooting

### Issue: "Credentials saved" log appears but Token found: NO

**Possible causes:**
1. SecureStore failed silently
2. Token key mismatch
3. Async timing issue

**Fix:** Check `tokenStorage.ts` logs

### Issue: "Biometric capability: isAvailable: false"

**Possible causes:**
1. Testing on simulator without biometric setup
2. No biometric enrolled on device
3. Permissions not granted

**iOS Simulator:**
- Features → Face ID → Enrolled
- Hardware → Touch ID → Toggle Enrolled

**Android Emulator:**
- Settings → Security → Fingerprint → Add fingerprint

### Issue: "Biometric enabled in settings: false"

**Fix:** 
- The auto-enable might not be working
- Manually check settings store

### Issue: Button not visible

**Check all three conditions:**
- Device capability: TRUE
- Saved credentials: TRUE
- Settings enabled: TRUE

All must be TRUE for button to show.

---

## 📊 What to Report

**Copy these logs and send them to me:**

1. From login success:
```
✅ Login successful, saving credentials...
✅ Credentials saved to SecureStore
🔐 Biometric capability: ...
```

2. From login screen (after logout):
```
🔐 Login Screen - Biometric Check:
  Device capability: ...
  Has saved credentials: ...
  Biometric enabled in settings: ...
  Token found: ...
  Will show biometric button: ...
```

This will help me identify exactly where the issue is!

---

**Test now and share the console logs!** 🔍

