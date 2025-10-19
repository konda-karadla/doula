# Debugging: Features Not Working

## Issue 1: Action Item Toggle Not Working (Mobile)

### Added Enhanced Logging

Now when you tap an action item, check console for:

```
[handleToggleItem] Called: { itemId: '...', currentStatus: 'pending', planId: '...' }
[handleToggleItem] Completing item...
[useCompleteActionItem] Mutation starting...
[handleToggleItem] Complete success!
```

### Possible Issues:

#### A) Handler Not Called
**Symptom**: No `[handleToggleItem] Called:` log

**Cause**: TouchableOpacity not wired correctly

**Check**: Is the item wrapped in `<TouchableOpacity onPress={...}>`?

#### B) Mutation Not Triggering
**Symptom**: See "Called" but no "Completing" log

**Cause**: Mutation hook not initialized

**Check**: Console for hook initialization errors

#### C) Mock Data Issue
**Symptom**: Success log but UI doesn't update

**Cause**: React Query cache not invalidating

**Fix**: Check `onSuccess` in mutation is invalidating queries

### Quick Test:

1. **Open Mobile App**
2. **Open DevTools/Console** (in Metro terminal or React Native Debugger)
3. **Go to Plans** → Open any plan
4. **Tap an action item**
5. **Watch console logs**

Share the logs you see!

---

## Issue 2: Settings Not Persistent (Web)

### Added Enhanced Logging

Now when you save settings, check browser console for:

```
[handleSaveSettings] Saving settings... { theme: 'dark', language: 'en', ... }
[API Request] { method: 'PATCH', url: '/profile', ... }
[API Response] { status: 200, ... }
[handleSaveSettings] Save success: { ... }
```

### Possible Issues:

#### A) Backend Not Running
**Symptom**: 
```
[API Response Error] { message: 'Network Error' }
```

**Fix**: 
```bash
cd backend
npm run start:dev
```

#### B) Not Logged In
**Symptom**:
```
[API Response Error] { status: 401, message: 'Unauthorized' }
```

**Fix**: Log in first at `/login`

#### C) Profile Endpoint Error
**Symptom**:
```
[API Response Error] { status: 404, message: 'Not Found' }
```

**Fix**: Backend doesn't have `/profile` endpoint registered

#### D) Saves But Doesn't Persist
**Symptom**:
```
✅ [handleSaveSettings] Save success
❌ After reload: Settings back to defaults
```

**Cause**: Settings not being loaded on page load

**Fix**: Need to fetch preferences from profile and apply them

---

## 🔍 DEBUGGING CHECKLIST

### For Mobile - Action Item Toggle

Run this test:
```
1. Open mobile app
2. Open Metro console (terminal where npm start is running)
3. Navigate: Plans → Any Plan
4. Tap an action item
5. Copy ALL console logs and share them
```

Look for these specific logs:
- [ ] `[handleToggleItem] Called:`
- [ ] `[handleToggleItem] Completing item...`
- [ ] Success or Error message

### For Web - Settings Persistence

Run this test:
```
1. Open web app in browser
2. Open DevTools Console (F12)
3. Go to Profile → Settings
4. Change a setting
5. Click "Save Changes"
6. Copy ALL console logs and share them
```

Look for these specific logs:
- [ ] `[handleSaveSettings] Saving settings...`
- [ ] `[API Request]` to `/profile`
- [ ] `[API Response]` or `[API Response Error]`
- [ ] `[handleSaveSettings] Save success` or Error

---

## 🧪 SPECIFIC TESTS

### Mobile Test: Basic Action Item

**Step 1**: Check if plan has items
```typescript
// In plan-detail screen, you should see:
console.log('Plan loaded:', plan);
console.log('Action items:', plan.actionItems);
```

**Step 2**: Tap an item
- Should log: `[handleToggleItem] Called: ...`
- If no log → Handler not connected

**Step 3**: Watch for mutation
- Should log: `[handleToggleItem] Completing item...`
- If no log → Mutation not called

**Step 4**: Watch for success
- Should log: `[handleToggleItem] Complete success!`
- If error → Check error message

### Web Test: Settings Save

**Step 1**: Check if logged in
```
// Browser console should show:
[useProfile] Fetching profile... { hasToken: true }
```

**Step 2**: Change settings
```
// Just change theme or toggle any switch
```

**Step 3**: Click Save
- Should log: `[handleSaveSettings] Saving settings...`
- Should log: `[API Request]` with preferences
- Should log: `[API Response]` or Error

**Step 4**: Reload page
```
// Settings should persist IF:
1. Save was successful
2. Settings are loaded from profile.preferences
```

---

## 🐛 LIKELY ISSUES & FIXES

### Mobile: Toggle Not Working

**Issue**: Mutation hook not exported

**Check**: `frontend/apps/mobile/hooks/use-action-plans.ts`
```typescript
// Should have:
export function useCompleteActionItem() { ... }
export function useUncompleteActionItem() { ... }
```

**Issue**: Mock data doesn't have status field

**Check**: `frontend/apps/mobile/__mocks__/mock-data.ts`
```typescript
// Mock action items should have:
status: 'pending' | 'in_progress' | 'completed'
```

### Web: Settings Not Persistent

**Issue**: Settings not loaded on mount

**Cause**: We're not reading `profile.preferences` on component mount

**Fix Needed**: Add useEffect to load preferences from profile:
```typescript
useEffect(() => {
  if (profile?.preferences) {
    setTheme(profile.preferences.theme || 'system');
    setLanguage(profile.preferences.language || 'en');
    // ... etc
  }
}, [profile]);
```

---

## 🚀 NEXT STEPS

### 1. Start Backend
```bash
cd backend
npm run start:dev
```

### 2. Start Web App
```bash
cd frontend/apps/web
npm run dev
```

### 3. Start Mobile App
```bash
cd frontend/apps/mobile
npm start
```

### 4. Test with Console Open

**Mobile**: Metro terminal shows logs
**Web**: Browser DevTools Console (F12)

### 5. Share Logs

Copy the console output when you:
- **Mobile**: Tap an action item
- **Web**: Click "Save Changes" on settings

The detailed logs will show exactly what's failing!

---

## 💡 QUICK WINS

While we debug, test mobile app with mock data - that should work immediately since it doesn't need backend!

Check if:
1. You can see action plans in mobile app
2. You can open a plan detail
3. You can see action items listed
4. When you tap, do you see haptic feedback?
5. What do the console logs say?

Share the logs and we'll fix it quickly! 🔍

