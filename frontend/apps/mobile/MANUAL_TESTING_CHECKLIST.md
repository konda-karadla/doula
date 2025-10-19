# Manual Testing Checklist 📋

**App Version:** 1.0.0  
**Test Date:** October 11, 2025  
**Tester:** _____________  
**Device:** _____________  
**OS Version:** _____________

---

## 🎯 Pre-Testing Setup

### **1. Environment Configuration**
- [ ] Backend is running at `http://localhost:3000`
- [ ] Mobile app dependencies installed (`npm install`)
- [ ] Metro bundler cleared cache (`npm run start:clean`)
- [ ] Device/emulator connected

### **2. Test Mode Selection**
Choose one:
- [ ] **Mock Data Mode** - `USE_MOCK_DATA = true` in `__mocks__/mock-data.ts`
- [ ] **Real API Mode** - `USE_MOCK_DATA = false` + backend running

---

## ✅ Test Cases

### **1. Authentication Flow** 🔐

#### **1.1 App Launch**
- [ ] App launches without crashes
- [ ] Splash/welcome screen displays
- [ ] No console errors

#### **1.2 Onboarding (First Launch)**
- [ ] Onboarding screens show on first launch
- [ ] Can navigate through 3 onboarding screens
- [ ] Can skip onboarding
- [ ] Onboarding doesn't show again after completion

#### **1.3 Registration**
- [ ] Can navigate to registration screen
- [ ] Form validation works (empty fields, invalid email)
- [ ] Error messages display correctly
- [ ] Can successfully register new account
- [ ] Auto-login after registration works
- [ ] Redirects to dashboard after registration

#### **1.4 Login**
- [ ] Can enter email and password
- [ ] Form validation works
- [ ] "Remember me" persists (if implemented)
- [ ] Successful login redirects to dashboard
- [ ] Error shown for wrong credentials
- [ ] Loading state shows during login

#### **1.5 Biometric Authentication**
- [ ] Biometric option shows if device supports it
- [ ] Can enable biometric in settings
- [ ] Face ID/Touch ID prompt appears
- [ ] Successful biometric auth logs in
- [ ] Failed biometric shows error
- [ ] Can fall back to password login

#### **1.6 Logout**
- [ ] Logout button accessible in profile
- [ ] Confirmation dialog appears
- [ ] Logout clears user data
- [ ] Redirects to login screen
- [ ] Biometric data preserved (smart logout)

**Authentication Score:** ___/18 ✅

---

### **2. Navigation** 🧭

#### **2.1 Tab Navigation**
- [ ] 5 tabs visible (Dashboard, Labs, Plans, Insights, Profile)
- [ ] Icons display correctly
- [ ] Active tab highlighted
- [ ] Tap each tab navigates correctly
- [ ] Tab labels readable

#### **2.2 Screen Transitions**
- [ ] Smooth transitions between screens
- [ ] No flashing or glitches
- [ ] Back navigation works
- [ ] Deep linking works (if implemented)

**Navigation Score:** ___/7 ✅

---

### **3. Dashboard Screen** 📊

#### **3.1 Data Display**
- [ ] Health score displays correctly
- [ ] Health score has status (GOOD, FAIR, etc.)
- [ ] Health score has trend icon (↗️, →, ↘️)
- [ ] Stats cards show correct numbers
- [ ] "Lab Results" count accurate
- [ ] "Action Plans" count accurate
- [ ] "Completed" count accurate
- [ ] "Pending" count accurate

#### **3.2 Interactions**
- [ ] Pull-to-refresh works
- [ ] Quick action buttons work
- [ ] Tapping health score navigates to insights (if implemented)
- [ ] All data loads without errors

#### **3.3 Performance**
- [ ] Dashboard loads quickly (< 2s)
- [ ] Smooth scrolling
- [ ] No lag or stuttering

**Dashboard Score:** ___/14 ✅

---

### **4. Lab Results Screen** 🔬

#### **4.1 List View**
- [ ] Lab results list displays
- [ ] Shows correct number of items (20 in mock mode)
- [ ] Each card shows file name
- [ ] Each card shows status badge
- [ ] Each card shows upload date
- [ ] Status colors correct (green=completed, orange=processing, red=failed)
- [ ] Date formatting correct ("today", "yesterday", "X days ago")

#### **4.2 Scrolling & Performance**
- [ ] Smooth scrolling at 60fps
- [ ] No lag with 20+ items
- [ ] FlatList virtualization working (test with 100+ items)
- [ ] Pull-to-refresh works
- [ ] Loading state shows while refreshing

#### **4.3 Empty State**
- [ ] Shows "No Lab Results Yet" when empty
- [ ] Shows upload button
- [ ] Message is clear and helpful

#### **4.4 Accessibility**
- [ ] VoiceOver/TalkBack announces all items
- [ ] All buttons have labels
- [ ] Can navigate with screen reader

**Lab Results Score:** ___/15 ✅

---

### **5. Action Plans Screen** 📋

#### **5.1 List View**
- [ ] Action plans list displays
- [ ] Shows correct number of items (15 in mock mode)
- [ ] Each card shows plan title
- [ ] Each card shows description
- [ ] Each card shows status (active, completed, paused)
- [ ] Each card shows item count
- [ ] Each card shows update date
- [ ] Status colors correct (purple=active, green=completed, orange=paused)

#### **5.2 Scrolling & Performance**
- [ ] Smooth scrolling at 60fps
- [ ] No lag with 15+ items
- [ ] FlatList virtualization working
- [ ] Pull-to-refresh works
- [ ] Loading state shows

#### **5.3 Empty State**
- [ ] Shows "No Action Plans Yet" when empty
- [ ] Shows create button
- [ ] Message is helpful

#### **5.4 Accessibility**
- [ ] VoiceOver/TalkBack works
- [ ] All interactive elements labeled
- [ ] Status announced correctly

**Action Plans Score:** ___/16 ✅

---

### **6. Health Insights Screen** 💡

#### **6.1 Data Display**
- [ ] Insights screen loads
- [ ] Shows health insights (if available)
- [ ] Categories displayed
- [ ] Recommendations shown
- [ ] AI insights readable

#### **6.2 Interactions**
- [ ] Pull-to-refresh works
- [ ] Can scroll through insights
- [ ] Loading states work

**Insights Score:** ___/7 ✅

---

### **7. Profile Screen** 👤

#### **7.1 Profile Information**
- [ ] User email displays
- [ ] User name displays (if set)
- [ ] Statistics cards show:
  - [ ] Total lab results
  - [ ] Active action plans
  - [ ] Completed plans
  - [ ] Health score

#### **7.2 Settings**
- [ ] Theme toggle works (light/dark/auto)
- [ ] Language selector works (if multiple languages)
- [ ] Biometric toggle works
- [ ] Settings persist after app restart

#### **7.3 Logout**
- [ ] Logout button visible
- [ ] Confirmation dialog shows
- [ ] Can cancel logout
- [ ] Logout works and returns to login

**Profile Score:** ___/13 ✅

---

### **8. Mobile-Specific Features** 📱

#### **8.1 Offline Detection**
- [ ] Turn on airplane mode
- [ ] Offline indicator appears (📵 Offline Mode)
- [ ] Turn off airplane mode
- [ ] Offline indicator disappears
- [ ] Smooth transition

#### **8.2 Haptic Feedback** (Physical Device Only)
- [ ] Haptics on login button
- [ ] Haptics on logout confirmation
- [ ] Haptics on errors
- [ ] Different intensity for different actions

#### **8.3 Settings Persistence**
- [ ] Change theme to dark
- [ ] Close app completely
- [ ] Reopen app
- [ ] Theme still dark ✅
- [ ] Same for language, biometric settings

#### **8.4 Biometric Settings**
- [ ] Toggle biometric ON
- [ ] Logout and login
- [ ] Biometric prompt appears
- [ ] Toggle biometric OFF
- [ ] Biometric prompt doesn't appear

**Mobile Features Score:** ___/13 ✅

---

### **9. Performance Testing** ⚡

#### **9.1 Load Times**
- [ ] App launch < 3 seconds
- [ ] Dashboard load < 2 seconds
- [ ] Labs screen load < 2 seconds
- [ ] Plans screen load < 2 seconds
- [ ] Navigation instant (< 100ms)

#### **9.2 Scrolling Performance**
- [ ] Labs list scrolls at 60fps
- [ ] Plans list scrolls at 60fps
- [ ] No dropped frames
- [ ] No stuttering

#### **9.3 Memory Usage**
- [ ] Check memory in profiler
- [ ] No memory leaks during navigation
- [ ] Memory stable during scrolling
- [ ] App doesn't crash with long lists

**Performance Score:** ___/12 ✅

---

### **10. Error Handling** 🛡️

#### **10.1 Network Errors**
- [ ] Turn off internet
- [ ] App shows offline indicator
- [ ] App doesn't crash
- [ ] Can still navigate
- [ ] Turn on internet
- [ ] Data refreshes

#### **10.2 Error Boundary**
- [ ] App doesn't crash completely (error boundary works)
- [ ] Shows error screen if component fails
- [ ] "Try Again" button visible
- [ ] Can recover from errors

#### **10.3 Form Validation**
- [ ] Empty email shows error
- [ ] Invalid email shows error
- [ ] Empty password shows error
- [ ] Error messages clear and helpful

**Error Handling Score:** ___/11 ✅

---

### **11. Accessibility Testing** ♿

#### **11.1 Screen Reader** (Enable VoiceOver iOS or TalkBack Android)
- [ ] All screens announced correctly
- [ ] All buttons have labels
- [ ] All images have descriptions
- [ ] Can navigate entire app with screen reader
- [ ] Proper reading order

#### **11.2 Visual Accessibility**
- [ ] Text readable at all sizes
- [ ] Sufficient color contrast
- [ ] Touch targets large enough (44x44pt minimum)
- [ ] No color-only indicators

**Accessibility Score:** ___/9 ✅

---

### **12. Loading States** ⏱️

#### **12.1 Skeleton Loaders**
- [ ] Skeleton loaders show while loading
- [ ] Smooth animation (shimmer effect)
- [ ] Transition smoothly to data
- [ ] Correct skeleton for each screen type

#### **12.2 Loading Indicators**
- [ ] Spinner shows during API calls
- [ ] Pull-to-refresh indicator works
- [ ] Loading text helpful
- [ ] No endless loading states

**Loading States Score:** ___/8 ✅

---

## 📊 Overall Test Results

### **Scoring:**

| Category | Score | Percentage |
|----------|-------|------------|
| Authentication | ___/18 | ___% |
| Navigation | ___/7 | ___% |
| Dashboard | ___/14 | ___% |
| Lab Results | ___/15 | ___% |
| Action Plans | ___/16 | ___% |
| Insights | ___/7 | ___% |
| Profile | ___/13 | ___% |
| Mobile Features | ___/13 | ___% |
| Performance | ___/12 | ___% |
| Error Handling | ___/11 | ___% |
| Accessibility | ___/9 | ___% |
| Loading States | ___/8 | ___% |
| **TOTAL** | **___/143** | **___%** |

### **Quality Gates:**
- ✅ **Pass:** 90%+ (129/143)
- ⚠️ **Acceptable:** 80-90% (114-128/143)
- ❌ **Fail:** <80% (<114/143)

---

## 🐛 Bugs Found

| # | Screen | Issue | Severity | Status |
|---|--------|-------|----------|--------|
| 1 | | | Low/Med/High/Critical | Open/Fixed |
| 2 | | | | |
| 3 | | | | |

---

## 💡 Improvements Suggested

| # | Screen | Suggestion | Priority |
|---|--------|------------|----------|
| 1 | | | Low/Med/High |
| 2 | | | |
| 3 | | | |

---

## ✅ Sign-Off

**Tester:** _____________  
**Date:** _____________  
**Overall Result:** PASS / FAIL  
**Ready for Production:** YES / NO  

**Comments:**
_____________________________________________
_____________________________________________
_____________________________________________

---

## 📱 Device Testing Matrix

Test on multiple devices for comprehensive coverage:

| Device | OS Version | Screen Size | Result | Notes |
|--------|------------|-------------|--------|-------|
| iPhone 15 Pro | iOS 17 | 6.1" | | |
| iPhone SE | iOS 17 | 4.7" | | |
| Pixel 8 | Android 14 | 6.2" | | |
| Samsung S21 | Android 13 | 6.2" | | |
| Old Device | Android 11 | Varies | | Low-end testing |

---

## 🎯 Critical Path Testing

**Must work perfectly:**
1. ✅ Login → Dashboard → See data
2. ✅ Register → Auto-login → Dashboard
3. ✅ Navigate all 5 tabs
4. ✅ Scroll through labs/plans smoothly
5. ✅ Toggle offline mode → Works
6. ✅ Pull-to-refresh → Updates data
7. ✅ Settings persist → Restart app
8. ✅ Logout → Return to login

**If any of these fail, don't ship!**

---

## 📊 Performance Benchmarks

### **Load Time Targets:**
- App Launch: < 3 seconds
- Screen Load: < 2 seconds
- Navigation: < 100ms
- API Response: < 1 second

### **Scrolling Targets:**
- FPS: 58-60 (consistent)
- No dropped frames
- Smooth on low-end devices

### **Memory Targets:**
- Initial: < 100MB
- After navigation: < 150MB
- No memory leaks

---

**Use this checklist to thoroughly test the mobile app before deployment!** 📱✅


