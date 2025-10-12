# Start Backend - Quick Steps

## ⚡ Run These Commands in Order

### In a NEW Terminal Window:

```bash
cd backend
npm run start:dev
```

**Wait for this message:**
```
[Nest] INFO [NestApplication] Nest application successfully started
```

---

## ✅ What This Does

1. Compiles TypeScript with updated Prisma client
2. Starts NestJS server on port 3002
3. Registers all API endpoints including:
   - `/profile` (GET) - Get user profile with preferences
   - `/profile` (PATCH) - Update profile with preferences
   - `/action-plans/:planId/items/:itemId/complete` (PATCH)
   - `/action-plans/:planId/items/:itemId/uncomplete` (PATCH)

---

## 🔍 Check for Errors

If you see errors like:
- **TypeScript errors** → Prisma client issue (already fixed)
- **Database connection error** → Check .env file
- **Port in use** → Another process using 3002

All Prisma issues should be fixed now with the `preferences` field added!

---

## 🎯 After Backend Starts

**Refresh web app** and you'll see:
```
✅ [useProfile] Success: { ..., preferences: { theme: 'light', ... } }
✅ [SettingsPreferences] Loading saved preferences: { theme: 'light', ... }
```

**Settings will now persist!** 🎉

