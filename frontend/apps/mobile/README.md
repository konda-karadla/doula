# Health Platform Mobile App

**Status:** 🚀 Ready for Development  
**Framework:** React Native + Expo (Expo Router)  
**Architecture:** Turborepo Monorepo  

---

## Overview

Native mobile application for the Health Platform, built with React Native and Expo. This app shares code with the web applications through the monorepo structure, ensuring consistency and reducing duplication.

## Why Monorepo?

The mobile app lives in the **same monorepo** as the web apps for these key benefits:

✅ **Shared TypeScript Types** - Single source of truth for data models  
✅ **Shared API Client** - Reuse API hooks and utilities  
✅ **Atomic Changes** - Update types + mobile + web in one commit  
✅ **No Version Drift** - Always in sync with backend changes  
✅ **Faster Development** - No need to publish/update packages  
✅ **Better DX** - One repo to clone, easier to onboard  

## Project Structure

```
health-platform/
├── backend/                    # NestJS API
├── frontend/                   # Turborepo monorepo
│   ├── apps/
│   │   ├── web/               # Patient portal (Next.js)
│   │   ├── admin/             # Admin dashboard (Next.js)
│   │   └── mobile/            # 📱 THIS APP (React Native + Expo)
│   └── packages/
│       ├── types/             # Shared TypeScript types
│       ├── api-client/        # Shared API client & hooks
│       ├── utils/             # Shared utilities
│       ├── config/            # Shared configuration
│       └── ui/                # Shared web components (not used by mobile)
```

## Features

### Core Functionality
- 🔐 **Authentication** - Login, registration, biometric auth
- 📊 **Dashboard** - Health overview and statistics
- 🧪 **Lab Results** - View, upload, and analyze lab results
- 📝 **Action Plans** - Create and manage health action plans
- 💡 **Health Insights** - AI-powered health recommendations
- 👤 **Profile** - User profile and settings

### Mobile-Specific Features
- 📸 **Camera Scanning** - Scan lab result documents
- 🔔 **Push Notifications** - Real-time health updates
- 📱 **Offline Support** - Work without internet connection
- 🔒 **Biometric Login** - Face ID / Touch ID authentication
- 💾 **Local Caching** - Fast access to your data

## Tech Stack

### Core
- **React Native** 0.76.6
- **Expo** ~52.0.0 (with Expo Router)
- **TypeScript** ~5.3.0

### State Management
- **React Query** - Server state and caching
- **Zustand** - Client state management

### Navigation
- **Expo Router** - File-based routing

### Shared Packages (from monorepo)
- `@health-platform/types` - TypeScript types
- `@health-platform/api-client` - API client + React Query hooks
- `@health-platform/utils` - Utility functions

## Getting Started

### Prerequisites
- Node.js 18+
- npm 10+
- iOS Simulator (Mac) or Android Emulator
- Expo Go app (for testing on physical device)

### Installation

```bash
# From the project root
cd frontend
npm install

# Or from this directory
cd frontend/apps/mobile
npm install
```

### Development

```bash
# Start the development server
npm start

# Run on iOS simulator (Mac only)
npm run ios

# Run on Android emulator
npm run android

# Run on web (for testing)
npm run web
```

### Using Turborepo

```bash
# From frontend root - run all apps
npm run dev

# Run only mobile app
npm run dev --filter=mobile

# Build mobile app
npm run build --filter=mobile
```

## Environment Variables

Create a `.env.local` file in this directory:

```env
# Backend API
API_BASE_URL=http://localhost:3000
API_TIMEOUT=10000

# Features
ENABLE_OFFLINE_MODE=true
ENABLE_BIOMETRIC_AUTH=true

# Analytics (optional)
SENTRY_DSN=your-sentry-dsn
```

## Monorepo Configuration

### Metro Bundler

The `metro.config.js` is configured to work with the monorepo:
- Watches all packages in the workspace
- Resolves packages from monorepo root
- Handles symlinked dependencies

### TypeScript

TypeScript is configured to use shared types:

```typescript
import type { User, LabResult, ActionPlan } from '@health-platform/types';
import { useAuth, useLabResults } from '@health-platform/api-client';
```

### Package Dependencies

Shared packages are referenced using `*` version:

```json
{
  "dependencies": {
    "@health-platform/types": "*",
    "@health-platform/api-client": "*"
  }
}
```

## Development Tasks

See [MOBILE_TASKS.md](./MOBILE_TASKS.md) for the complete development plan with:
- 7 development phases
- Detailed task breakdown
- Timeline estimates
- Success criteria for each phase

## Project Setup (First Time)

To initialize the Expo project:

```bash
cd frontend/apps/mobile

# Initialize Expo with TypeScript
npx create-expo-app@latest . --template expo-template-blank-typescript

# The package.json, metro.config.js are already configured
# Just install dependencies
npm install
```

## API Integration

### Backend API
- **Base URL:** `http://localhost:3000` (development)
- **Available Endpoints:** 36 endpoints
- **Documentation:** See `../../../backend/API_REFERENCE.md`

### Using Shared API Client

```typescript
// Reuse hooks from shared package
import { useLabResults, useActionPlans } from '@health-platform/api-client';

function LabResultsScreen() {
  const { data: labResults, isLoading } = useLabResults();
  
  if (isLoading) return <LoadingSpinner />;
  
  return <LabResultsList results={labResults} />;
}
```

## Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Building for Production

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

### Local Builds

```bash
# iOS (requires Mac + Xcode)
eas build --platform ios --local

# Android
eas build --platform android --local
```

## Troubleshooting

### Metro Bundler Issues

If you encounter module resolution issues:

```bash
# Clear Metro cache
npx expo start -c

# Or manually clear caches
rm -rf node_modules/.cache
rm -rf .expo
```

### Shared Package Issues

If shared packages aren't resolving:

```bash
# Reinstall from frontend root
cd ../..
npm install

# Clear all caches
npm run clean
```

### iOS Specific

```bash
# Clear iOS build cache
cd ios && rm -rf build Pods && pod install
```

### Android Specific

```bash
# Clear Android build cache
cd android && ./gradlew clean
```

## Common Issues

### 1. "Cannot find module '@health-platform/types'"
- **Solution:** Run `npm install` from `frontend/` root
- Make sure `metro.config.js` is properly configured

### 2. Metro bundler can't resolve packages
- **Solution:** Start with cache clearing: `npx expo start -c`
- Check that `watchFolders` includes workspace root

### 3. TypeScript errors in shared packages
- **Solution:** Run `npm run type-check` in the shared package
- Rebuild: `npm run build --filter=@health-platform/types`

## Best Practices

### Using Shared Types

```typescript
// ✅ DO: Import from shared package
import type { User, LabResult } from '@health-platform/types';

// ❌ DON'T: Redefine types
interface User {
  id: string;
  // ...
}
```

### API Calls

```typescript
// ✅ DO: Use shared API client
import { useAuth } from '@health-platform/api-client';

// ❌ DON'T: Create duplicate API calls
const login = async (email, password) => {
  return axios.post('/auth/login', { email, password });
};
```

### State Management

```typescript
// ✅ DO: Use React Query for server state
const { data } = useLabResults();

// ✅ DO: Use Zustand for client state
const [user, setUser] = useAuthStore();
```

## Resources

### Documentation
- [Development Tasks](./MOBILE_TASKS.md) - Detailed task breakdown
- [Backend API Reference](../../../backend/API_REFERENCE.md)
- [Project Status](../../../PROJECT_STATUS.md)

### External Docs
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)

## Contributing

### Development Workflow
1. Create feature branch from `main`
2. Make changes in mobile app
3. Update shared types if needed
4. Test on both iOS and Android
5. Run linting and type checking
6. Create pull request

### Commit Messages

Follow conventional commits:
```
feat(mobile): add biometric authentication
fix(mobile): resolve offline sync issue
chore(mobile): update dependencies
```

## License

Private - Health Platform Project

---

**Status:** 🚀 Ready for Development  
**Next Step:** Review [MOBILE_TASKS.md](./MOBILE_TASKS.md) and start with Phase 1

**For questions or support, refer to the main project documentation or create an issue.**
