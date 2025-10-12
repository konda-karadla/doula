# Testing Guide - New Features

## 🎯 What We Added

### Mobile App
1. ✅ **Action Item Toggle** - Tap items to mark complete/incomplete

### Web App
2. ✅ **Settings Save** - Settings persist to database
3. ✅ **Profile Update** - Profile changes save to database

---

## 📱 MOBILE APP TESTING

### Feature: Action Item Toggle

**Mock Data**: ✅ **YES - Works with mock data!**

The mobile app has `USE_MOCK_DATA` flag in `__mocks__/mock-data.ts` that controls this.

#### Testing Steps:

**1. Navigate to Action Plans**
```
1. Open mobile app
2. Go to "Plans" tab (bottom navigation)
3. Tap any action plan card
```

**2. Toggle Action Items**
```
1. On plan detail screen, you'll see action items
2. Tap any action item
3. You should:
   ✅ Feel haptic feedback (vibration)
   ✅ See item change:
      - Unchecked (⭕) → Checked (✅)
      - Title gets strikethrough when completed
   ✅ See progress bar update at top
   ✅ Console log: "Toggle item: <itemId> <status>"
```

**3. Verify It Works**
```
✅ Item UI updates immediately
✅ Haptic feedback triggers
✅ Progress bar recalculates
✅ Can toggle back and forth
```

#### With Mock Data (Current Default)
- **Where**: `frontend/apps/mobile/__mocks__/mock-data.ts`
- **Flag**: `USE_MOCK_DATA = true`
- **Behavior**: 
  - Simulates 300ms API delay
  - Updates work but don't persist (mock data)
  - Perfect for UI/UX testing without backend!

#### With Real API
1. Set `USE_MOCK_DATA = false` in `__mocks__/mock-data.ts`
2. Make sure backend is running
3. Make sure database has action plans with items
4. Changes will persist to database

#### Expected Console Logs (Mock Mode):
```
[Mobile API Request] { method: 'PATCH', url: '/action-plans/1/items/item-1/complete', ... }
Toggle item: item-1 completed
[useCompleteActionItem] Mutation success
[Mobile API Response] { status: 200 }
```

---

## 🌐 WEB APP TESTING

### Feature 1: Settings Save

**Mock Data**: ❌ **NO - Uses real API**

You need backend running for this to work.

#### Testing Steps:

**1. Navigate to Settings**
```
1. Open web app (http://localhost:3001)
2. Log in
3. Go to Profile → Settings & Preferences tab
```

**2. Change Settings**
```
1. Change theme (Light/Dark/System)
2. Toggle some notification settings
3. Change language or time format
4. Click "Save Changes" button
```

**3. Verify It Works**
```
✅ Button shows "Saving..." during save
✅ Success alert appears: "Settings saved successfully!"
✅ Reload page → Settings should persist
✅ Check Network tab → POST to /profile with preferences object
```

#### Expected Behavior:
- **With Backend Running**: Settings save to database, persist on reload
- **Without Backend**: Error alert shows, settings don't save

#### Console Logs to Watch:
```
[API Request] { method: 'PATCH', url: '/profile', ... }
[API Response] { status: 200 }
```

---

### Feature 2: Profile Update

**Mock Data**: ❌ **NO - Uses real API**

You need backend running for this to work.

#### Testing Steps:

**1. Navigate to Profile**
```
1. Open web app
2. Log in
3. Go to Profile → User Profile tab
```

**2. Edit Profile**
```
1. Click "Edit Profile" button
2. Change email address
3. Modify other fields (optional)
4. Click "Save Changes"
```

**3. Verify It Works**
```
✅ Button shows "Saving..." during save
✅ Success alert appears
✅ Edit mode closes automatically
✅ Changes appear in profile display
✅ Reload page → Changes persist
```

#### Expected Behavior:
- **With Backend Running**: Profile saves, data persists
- **Without Backend**: Error alert, no changes saved

---

## 🧪 TESTING SCENARIOS

### Scenario A: Full Mock Mode (Easiest - No Backend Needed!)

**Best for**: UI/UX testing, frontend development

**Setup**:
```typescript
// frontend/apps/mobile/__mocks__/mock-data.ts
export const USE_MOCK_DATA = true; // Already default!
```

**What Works**:
- ✅ Mobile: Action item toggle (UI updates, doesn't persist)
- ❌ Web: Settings save (needs backend)
- ❌ Web: Profile update (needs backend)

**Test Mobile App**:
```bash
cd frontend/apps/mobile
npm start
# Press 'i' for iOS or 'a' for Android
```

Then:
1. Navigate to Plans tab
2. Open any plan
3. Toggle action items
4. See immediate UI feedback!

---

### Scenario B: Backend + Real Data (Full Integration)

**Best for**: Full end-to-end testing

**Setup**:
```bash
# Terminal 1: Start Backend
cd backend
npm run start:dev

# Terminal 2: Start Web App
cd frontend/apps/web
npm run dev

# Terminal 3: Start Mobile App
cd frontend/apps/mobile
npm start
```

**What to Test**:

#### Mobile App
1. Set `USE_MOCK_DATA = false`
2. Test action item toggle
3. Check database to verify `status` field updated

#### Web App
1. Test Settings Save → Check `/profile` API call
2. Test Profile Update → Check email persists
3. Reload pages to verify persistence

---

### Scenario C: Hybrid (Mobile Mock + Web Real)

**Best for**: Testing web features while mobile backend isn't ready

**Setup**:
```typescript
// Mobile stays in mock mode
USE_MOCK_DATA = true

// Web uses real API
Just run backend: cd backend && npm run start:dev
```

**What Works**:
- ✅ Mobile: Toggle items (mock mode - UI only)
- ✅ Web: Settings save (real API)
- ✅ Web: Profile update (real API)

---

## 🔍 SPECIFIC TEST CASES

### Mobile: Action Item Toggle

#### Test Case 1: Complete an Item
```
1. Find item with status "pending" (⭕)
2. Tap the item
3. Expected:
   - Icon changes to ✅
   - Title gets strikethrough
   - Progress bar increases
   - Console: "Toggle item: <id> pending"
```

#### Test Case 2: Uncomplete an Item
```
1. Find item with status "completed" (✅)
2. Tap the item
3. Expected:
   - Icon changes to ⭕
   - Strikethrough removed
   - Progress bar decreases
   - Console: "Toggle item: <id> completed"
```

#### Test Case 3: Progress Calculation
```
1. Start with 0/3 items complete (0%)
2. Complete 1 item → 1/3 (33%)
3. Complete 2 items → 2/3 (67%)
4. Complete 3 items → 3/3 (100%)
```

### Web: Settings Save

#### Test Case 1: Save Settings
```
1. Change theme to "Dark"
2. Enable "Marketing Emails"
3. Click "Save Changes"
4. Expected:
   - Button shows "Saving..."
   - Green success alert appears
   - Settings visible in summary section
```

#### Test Case 2: Persistence
```
1. Save settings
2. Open browser DevTools → Application → LocalStorage
3. Refresh page (F5)
4. Expected:
   - Settings maintained after reload
   - Fetched from /profile endpoint
```

#### Test Case 3: Reset Settings
```
1. Change multiple settings
2. Click "Reset" button
3. Expected:
   - All settings back to defaults
   - No API call (local only)
   - Need to click "Save" to persist reset
```

### Web: Profile Update

#### Test Case 1: Update Email
```
1. Click "Edit Profile"
2. Change email from "old@test.com" to "new@test.com"
3. Click "Save Changes"
4. Expected:
   - Button shows "Saving..."
   - Success alert appears
   - Edit mode closes
   - New email displayed
```

#### Test Case 2: Validation
```
1. Edit Profile
2. Enter invalid email "notanemail"
3. Try to save
4. Expected:
   - Red error text under field
   - Save button disabled
   - Cannot save until valid
```

---

## ⚡ QUICK START TESTING

### Option 1: Mobile Only (Fastest - Mock Mode)
```bash
cd frontend/apps/mobile
npm start
```
Test: Action item toggle ✅

### Option 2: Web Only (Need Backend)
```bash
# Terminal 1
cd backend
npm run start:dev

# Terminal 2
cd frontend/apps/web
npm run dev
```
Test: Settings + Profile ✅

### Option 3: Everything (Full Testing)
```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Web
cd frontend/apps/web
npm run dev

# Terminal 3: Mobile (with USE_MOCK_DATA = false)
cd frontend/apps/mobile
npm start
```
Test: All features ✅

---

## 🐛 TROUBLESHOOTING

### Mobile: Toggle Not Working

**Problem**: Tapping items does nothing

**Check**:
1. Console shows "Toggle item: ..." → Feature is working (mock mode)
2. No console log → Check if plan has items
3. Error in console → Check USE_MOCK_DATA setting

**With Mock Data**:
- UI updates immediately but doesn't persist
- This is expected behavior!

**With Real API**:
- Need backend running
- Need action plans in database
- Check network tab for API calls

### Web: Settings Not Saving

**Problem**: Settings don't persist on reload

**Check**:
1. Network tab → POST/PATCH to /profile?
2. Response 200 OK?
3. Logged in (has auth token)?

**Common Issues**:
- Backend not running → Start it!
- Not logged in → Log in first
- Network error → Check API_BASE_URL

### Web: Profile Update Fails

**Problem**: Email change doesn't save

**Check**:
1. Valid email format?
2. Backend running?
3. Network tab shows request?
4. Check response for error message

---

## ✅ TESTING CHECKLIST

### Before Testing
- [ ] Backend running (for web features)
- [ ] Web app running at localhost:3001
- [ ] Mobile app running on emulator/device
- [ ] User logged in (all apps)

### Mobile App Tests
- [ ] Can see action plans in Plans tab
- [ ] Can open plan detail
- [ ] Can tap action items
- [ ] Item UI updates (icon + strikethrough)
- [ ] Progress bar updates
- [ ] Haptic feedback works

### Web App Tests - Settings
- [ ] Can change theme
- [ ] Can toggle notifications
- [ ] Save button works
- [ ] Success message appears
- [ ] Settings persist on reload

### Web App Tests - Profile
- [ ] Edit button enables editing
- [ ] Can change email
- [ ] Validation works
- [ ] Save button works
- [ ] Success message appears
- [ ] Changes persist on reload

---

## 📝 ANSWER TO YOUR QUESTIONS

### Q: What should I test in mobile?
**A**: 
- ✅ **Action Item Toggle** - Works in MOCK mode (default)
- Just open a plan and tap items
- No backend needed!

### Q: What should I test in web?
**A**:
- ✅ **Settings Save** - Needs backend
- ✅ **Profile Update** - Needs backend
- Start backend first: `cd backend && npm run start:dev`

### Q: Will these work with mock data?
**A**:
- **Mobile**: ✅ YES! `USE_MOCK_DATA = true` (default)
  - Toggle works, UI updates
  - Doesn't persist (expected in mock mode)
- **Web**: ❌ NO - Uses real API
  - Must have backend running
  - Settings/Profile save to database via `/profile` endpoint

### Q: Easiest test right now?
**A**: 
**Mobile Action Toggle** - Just run mobile app, no backend needed!
```bash
cd frontend/apps/mobile
npm start
# Then: Plans tab → Open plan → Tap items
```

---

## 🎯 RECOMMENDED TESTING ORDER

### 1. Mobile (5 minutes - No Backend)
```bash
cd frontend/apps/mobile
npm start
```
- Open Plans tab
- Open any plan
- Toggle items
- Watch UI update

### 2. Web with Backend (10 minutes)
```bash
# Terminal 1
cd backend
npm run start:dev

# Terminal 2  
cd frontend/apps/web
npm run dev
```
- Test Settings save
- Test Profile update
- Reload and verify persistence

### 3. Full Integration (Optional)
- Set `USE_MOCK_DATA = false` in mobile
- Run migration: `cd backend && npx prisma migrate dev`
- Test mobile with real API
- Verify database changes

---

## 💡 TIPS

### For Quick Testing (Mobile)
- Mobile is **ready to test NOW** with mock data
- No setup needed beyond `npm start`
- Perfect for testing UI/UX

### For Full Testing (Web)
- Need backend running
- Need to be logged in
- Changes actually persist

### Console Logs to Watch

**Mobile (Mock Mode)**:
```
Toggle item: 1 pending
[useCompleteActionItem] Mutation success
```

**Web (Real API)**:
```
[API Request] { method: 'PATCH', url: '/profile' }
[API Response] { status: 200 }
```

---

## 🚀 START TESTING NOW

**Quickest Test** (30 seconds):
```bash
cd frontend/apps/mobile && npm start
# Then navigate: Plans → Any Plan → Tap items
```

You should immediately see:
- ⭕ → ✅ icon change
- Strikethrough on completed items
- Progress bar update
- Haptic feedback (vibration)

**All working in mock mode without any backend!** 🎉

