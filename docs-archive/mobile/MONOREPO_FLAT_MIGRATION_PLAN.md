# Flat Monorepo Migration Plan (Optional)

**Status:** 🤔 OPTIONAL - Current structure works fine  
**Effort:** Medium (3-4 hours)  
**Benefit:** Cleaner structure, single workspace

---

## Should You Do This?

### ✅ Do it if:
- Backend needs to import frontend packages
- Team wants unified workspace
- You have time for migration
- You want "cleaner" structure

### ❌ Don't do it if:
- Current setup works for you
- Time is limited
- Team is already familiar with current structure
- Backend and frontend are truly independent

---

## Migration Steps

### Step 1: Backup Current State
```bash
git checkout -b backup-before-flat-migration
git add .
git commit -m "Backup before flat monorepo migration"
```

### Step 2: Create New Root Structure
```bash
# At project root
mkdir -p apps packages-shared

# Move backend
mv backend apps/backend

# Move frontend apps
mv frontend/apps/web apps/web
mv frontend/apps/admin apps/admin
mv frontend/apps/mobile apps/mobile

# Move packages up
mv frontend/packages packages-shared

# Or keep as packages/
mv frontend/packages packages
```

### Step 3: Update Root package.json
```json
{
  "name": "health-platform",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "dev:backend": "turbo run dev --filter=backend",
    "dev:web": "turbo run dev --filter=web",
    "dev:admin": "turbo run dev --filter=admin",
    "dev:mobile": "turbo run dev --filter=mobile",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check"
  },
  "devDependencies": {
    "turbo": "^2.5.8",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Step 4: Update turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        "dist/**",
        ".next/**",
        "!.next/cache/**",
        "build/**"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "start": {
      "cache": false,
      "persistent": true
    },
    "android": {
      "cache": false,
      "persistent": true
    },
    "ios": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Step 5: Update Import Paths

All apps now import from same level:
```typescript
// Before (in frontend/apps/web)
import { User } from '@health-platform/types';

// After (in apps/web) - SAME!
import { User } from '@health-platform/types';
```

### Step 6: Update Metro Config (Mobile)
```javascript
// apps/mobile/metro.config.js
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..'); // Go up 2 levels

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
```

### Step 7: Install Dependencies
```bash
# At root
pnpm install
# or
npm install
```

### Step 8: Test Everything
```bash
# Test backend
cd apps/backend
npm run start:dev

# Test web
cd ../web
npm run dev

# Test mobile
cd ../mobile
npm start
```

### Step 9: Update Documentation
Update all docs to reflect new structure.

---

## Final Structure

```
health-platform/
├── apps/
│   ├── backend/
│   ├── web/
│   ├── admin/
│   └── mobile/
├── packages/
│   ├── types/
│   ├── api-client/
│   ├── utils/
│   ├── config/
│   └── ui/
├── package.json
├── turbo.json
└── pnpm-workspace.yaml (if using pnpm)
```

---

## Rollback Plan

If something breaks:
```bash
git checkout backup-before-flat-migration
git branch -D main
git checkout -b main
```

---

## Estimated Time
- **Restructuring:** 1 hour
- **Testing:** 1 hour
- **Documentation updates:** 1 hour
- **Buffer:** 1 hour
- **Total:** 3-4 hours

---


