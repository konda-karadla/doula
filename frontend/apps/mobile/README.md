# Mobile App (React Native + Expo)

## Overview
Patient mobile application for the health platform built with React Native and Expo.

## Planned Features
- User authentication and onboarding
- Dashboard with health overview
- Lab results viewing with PDF support
- Action plans and health insights
- Profile management
- Push notifications
- Camera integration for document scanning
- Offline support
- Biometric authentication

## Technology Stack
- React Native + Expo
- TypeScript
- React Navigation v6
- Zustand for state management
- React Query for server state
- React Hook Form + Zod for forms
- React Native Paper for UI components

## Status
🚧 **Planned** - To be implemented in Phase 5

## Dependencies
- Shared packages: `@health-platform/types`, `@health-platform/api-client`, `@health-platform/utils`
- Backend API: http://localhost:3000

## Required APIs (26 available + 3 missing)
### ✅ Available APIs:
- **Authentication:** register, login, refresh, logout
- **Lab Results:** upload, list, view, biomarkers, delete
- **Action Plans:** create, read, update, delete
- **Action Items:** create, read, update, complete/uncomplete, delete
- **Health Insights:** summary, lab-specific, trends
- **User Profile:** profile info, stats

### ❌ Missing APIs (Mobile App needs):
- **Push Notifications:** get notifications, mark read
- **Offline Sync:** sync data when online

### 📚 API Documentation:
- **Swagger UI:** http://localhost:3000/api
- **Complete Reference:** `../../backend/API_REFERENCE.md`
