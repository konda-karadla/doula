# Prisma Migration Steps - Fix TypeScript Errors

## ⚠️ Current Issue
TypeScript errors because Prisma client doesn't know about the new `status`, `priority`, and `targetDate` fields.

## 🔧 Quick Fix Steps

### Step 1: Stop Backend Server
```bash
# In the terminal where backend is running:
# Press Ctrl+C to stop the server
```

### Step 2: Generate Prisma Client
```bash
cd backend
npx prisma generate
```

This regenerates Prisma types with the new fields.

### Step 3: Create Migration (Optional for now)
```bash
npx prisma migrate dev --name add_action_plan_fields
```

This creates the actual database migration.

**OR** for faster testing, just generate client:
```bash
npx prisma db push
```

This syncs schema to database without creating migration files.

### Step 4: Restart Backend
```bash
npm run start:dev
```

## 🎯 Simplest Approach (Recommended)

```bash
# 1. Stop backend (Ctrl+C)
cd backend

# 2. Quick sync to database
npx prisma db push

# 3. Generate client
npx prisma generate

# 4. Restart
npm run start:dev
```

## ✅ Expected Result

After running `npx prisma generate`, the TypeScript errors will disappear:
- ✅ `status: 'completed'` will be recognized
- ✅ `status: 'pending'` will be recognized
- ✅ `priority` field available
- ✅ `targetDate` field available

## 🧪 Testing After Fix

### With Mock Data (Mobile)
- Works immediately (no database changes needed)
- Just regenerating client is enough

### With Real API (Web)
- Need to run migration or db push
- Then test with backend running

## 📝 What Changed in Schema

```prisma
model ActionPlan {
  // ... existing fields
  priority    String?     // ← NEW
  targetDate  DateTime?   // ← NEW
}

model ActionItem {
  // ... existing fields
  status      String @default("pending")  // ← NEW
}
```

---

## Quick Command Reference

```bash
# Stop backend first, then:

# Option A: Quick (no migration file)
npx prisma db push && npx prisma generate

# Option B: Proper (creates migration)
npx prisma migrate dev --name add_action_plan_fields

# Then restart backend
npm run start:dev
```

Choose Option A for quick testing, Option B for production-ready migration.

