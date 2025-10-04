# 🚀 Bolt Frontend Implementation Plan

## 📋 Project Overview

### **Current Status:**
- ✅ **Backend Complete:** NestJS + Prisma + PostgreSQL (Production Ready)
- ✅ **API Ready:** 26 endpoints with full documentation
- ✅ **Database:** Multi-tenant with 3 systems (doula, functional_health, elderly_care)
- 🔄 **Frontend:** Ready to build with Bolt

### **Target Architecture:**
```
health-platform/
├── apps/
│   ├── mobile/           # React Native (Expo) - iOS & Android
│   ├── web/              # Next.js 14 - Patient Portal
│   └── admin/            # Next.js 14 - Admin Dashboard
├── packages/
│   ├── ui/               # Shared React components
│   ├── api-client/       # API client & hooks
│   ├── types/            # TypeScript types
│   ├── utils/            # Helper functions
│   └── config/           # Shared configs
├── turbo.json
└── package.json
```

## 🎯 Bolt Implementation Strategy

### **Phase 1: Monorepo Setup (Start Here)**

#### **Bolt Prompt 1:**
```
"Create a Turborepo monorepo structure for a health platform with the following:

1. Root package.json with workspaces configuration
2. Turbo.json with build pipeline
3. Apps directory with placeholder for:
   - mobile/ (React Native + Expo)
   - web/ (Next.js 14 - Patient Portal)
   - admin/ (Next.js 14 - Admin Dashboard)
4. Packages directory with:
   - ui/ (Shared React components)
   - api-client/ (API client & hooks)
   - types/ (TypeScript types)
   - utils/ (Helper functions)
   - config/ (Shared configs)
5. Each package should have proper package.json with dependencies
6. Include .gitignore, README.md, and basic configuration files
7. Set up TypeScript configuration for the monorepo
8. Include ESLint and Prettier configuration

The backend API is already complete with 26 endpoints at http://localhost:3000
Include setup instructions and development scripts."
```

### **Phase 2: Shared Packages (Build Foundation)**

#### **Bolt Prompt 2:**
```
"Create shared packages for the health platform monorepo:

1. **types package:**
   - User, LabResult, ActionPlan, ActionItem interfaces
   - API response types
   - Multi-tenant system types
   - Authentication types

2. **api-client package:**
   - Axios-based API client
   - Authentication handling (JWT tokens)
   - Multi-tenant system filtering
   - React Query hooks for all 26 API endpoints
   - Error handling and retry logic

3. **utils package:**
   - Date formatting utilities
   - File upload helpers
   - Validation utilities
   - Common helper functions

4. **config package:**
   - Environment configuration
   - API endpoints configuration
   - Feature flags
   - System-specific configurations

Each package should:
- Have proper TypeScript configuration
- Include build scripts
- Export all necessary types and functions
- Include basic tests
- Have proper documentation

The backend API is at http://localhost:3000 with Swagger docs at http://localhost:3000/api"
```

### **Phase 3: Web App - Patient Portal (Primary Focus)**

#### **Bolt Prompt 3:**
```
"Create a Next.js 14 patient portal for the health platform with:

1. **Project Setup:**
   - Next.js 14 with App Router
   - TypeScript configuration
   - Tailwind CSS + shadcn/ui
   - Zustand for state management
   - React Query for server state
   - React Hook Form + Zod for forms

2. **Authentication:**
   - Login/Register pages
   - JWT token management
   - Protected routes
   - Multi-tenant system selection

3. **Core Features:**
   - Dashboard with health overview
   - Lab results viewing (PDF viewer)
   - Action plans and items
   - Health insights and recommendations
   - Profile management
   - Settings and preferences

4. **UI Components:**
   - Responsive design
   - Dark/light mode
   - Loading states
   - Error handling
   - Toast notifications

5. **Integration:**
   - Use shared packages (types, api-client, utils)
   - Connect to backend API at http://localhost:3000
   - Multi-tenant support (doula, functional_health, elderly_care)

Include proper folder structure, routing, and component organization."
```

### **Phase 4: Admin Portal (Secondary Focus)**

#### **Bolt Prompt 4:**
```
"Create a Next.js 14 admin portal for the health platform with:

1. **Project Setup:**
   - Next.js 14 with App Router
   - TypeScript configuration
   - Tailwind CSS + shadcn/ui
   - Zustand for state management
   - React Query for server state
   - React Hook Form + Zod for forms
   - TanStack Table for data tables

2. **Admin Features:**
   - User management (search, create, edit, delete)
   - Lab results upload and management
   - Action plan creation and editing
   - System configuration management
   - Feature flag management
   - Analytics dashboard

3. **UI Components:**
   - Admin dashboard layout
   - Data tables with sorting/filtering
   - File upload interface
   - Rich text editor for action plans
   - System configuration forms
   - User management interface

4. **Integration:**
   - Use shared packages (types, api-client, utils)
   - Connect to backend API at http://localhost:3000
   - Multi-tenant support
   - Admin-specific features

Include proper admin authentication and role-based access control."
```

### **Phase 5: Mobile App (Final Phase)**

#### **Bolt Prompt 5:**
```
"Create a React Native mobile app for the health platform with:

1. **Project Setup:**
   - React Native + Expo
   - TypeScript configuration
   - React Navigation v6
   - Zustand for state management
   - React Query for server state
   - React Hook Form + Zod for forms
   - React Native Paper for UI components

2. **Core Features:**
   - User onboarding flow
   - Authentication (login/register)
   - Dashboard with health overview
   - Lab results viewing
   - Action plans and items
   - Health insights
   - Profile management
   - Push notifications

3. **Mobile-Specific Features:**
   - PDF viewer for lab results
   - Camera integration for document scanning
   - Offline support
   - Biometric authentication
   - Push notifications

4. **Integration:**
   - Use shared packages (types, api-client, utils)
   - Connect to backend API at http://localhost:3000
   - Multi-tenant support
   - Mobile-optimized UI

Include proper navigation structure and mobile UX patterns."
```

## 🛠️ Backend API Reference

### **Available Endpoints (26 total):**

#### **Authentication (4 endpoints):**
- `POST /auth/register` - Create account
- `POST /auth/login` - Get tokens
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Revoke tokens

#### **Lab Results (5 endpoints):**
- `POST /labs/upload` - Upload PDF lab result
- `GET /labs` - Get all user's lab results
- `GET /labs/:id` - Get specific lab result
- `GET /labs/:id/biomarkers` - Get parsed biomarkers
- `DELETE /labs/:id` - Delete lab result

#### **Action Plans (5 endpoints):**
- `POST /action-plans` - Create action plan
- `GET /action-plans` - Get all plans with items
- `GET /action-plans/:id` - Get specific plan
- `PUT /action-plans/:id` - Update plan
- `DELETE /action-plans/:id` - Delete plan

#### **Action Items (7 endpoints):**
- `POST /action-plans/:planId/items` - Create item
- `GET /action-plans/:planId/items` - Get all items
- `GET /action-plans/:planId/items/:itemId` - Get item
- `PUT /action-plans/:planId/items/:itemId` - Update item
- `PATCH /action-plans/:planId/items/:itemId/complete` - Mark complete
- `PATCH /action-plans/:planId/items/:itemId/uncomplete` - Mark incomplete
- `DELETE /action-plans/:planId/items/:itemId` - Delete item

#### **Health Insights (3 endpoints):**
- `GET /insights/summary` - Get insights from latest labs
- `GET /insights/lab-result/:id` - Get insights for specific lab
- `GET /insights/trends/:testName` - Get biomarker trends

#### **User Profile (2 endpoints):**
- `GET /profile` - Get user profile information
- `GET /profile/stats` - Get health statistics

### **API Documentation:**
- **Swagger UI:** `http://localhost:3000/api`
- **API Reference:** `doula/API_REFERENCE.md`

## 🗄️ Database Schema

### **Tables (9 total):**
- **systems** - Multi-tenant system configuration
- **users** - User accounts with tenant association
- **refresh_tokens** - JWT refresh token management
- **system_configs** - System-specific configuration
- **feature_flags** - Feature toggles per system
- **lab_results** - Uploaded lab PDFs and OCR status
- **biomarkers** - Parsed test results from labs
- **action_plans** - Health goal action plans
- **action_items** - Individual tasks in action plans

### **Multi-Tenant Systems:**
- **doula** - Technology partner application
- **functional_health** - Your internal application
- **elderly_care** - Future application

## 🎯 Implementation Order

### **Recommended Sequence:**
1. **Monorepo Setup** (Bolt Prompt 1)
2. **Shared Packages** (Bolt Prompt 2)
3. **Web App - Patient Portal** (Bolt Prompt 3)
4. **Admin Portal** (Bolt Prompt 4)
5. **Mobile App** (Bolt Prompt 5)

### **Why This Order:**
- **Monorepo first:** Establishes the foundation
- **Shared packages:** Provides reusable components
- **Web app:** Primary user interface
- **Admin portal:** Management interface
- **Mobile app:** Mobile experience

## 🔧 Development Environment

### **Backend Setup:**
```bash
# Backend is already running
cd doula
npm run start:dev
# API available at http://localhost:3000
# Swagger docs at http://localhost:3000/api
```

### **Database:**
- **PostgreSQL:** AWS RDS instance
- **Connection:** `postgresql://postgres:9P8UBPs1x^D7kzr@playwright-database-engine.cnsiog466xv6.us-east-2.rds.amazonaws.com:5432/postgres`
- **Prisma Studio:** `npx prisma studio` (opens at http://localhost:5555)

### **Redis:**
```bash
# Start Redis with Docker
cd doula
docker-compose up -d
```

## 📚 Key Requirements

### **Multi-Tenant Support:**
- All API calls include system_id filtering
- Users belong to only one system
- UI adapts based on system configuration
- Feature flags control app-specific functionality

### **Authentication:**
- JWT tokens with refresh token rotation
- Automatic token refresh
- Protected routes
- Role-based access control

### **File Upload:**
- AWS S3 integration for lab results
- PDF file validation
- Progress indicators
- File processing status

### **Real-time Features:**
- WebSocket integration for notifications
- Real-time updates for action plans
- Live status updates for lab processing

## 🎯 Success Criteria

### **Phase 1 Complete When:**
- [ ] Monorepo structure created
- [ ] Turborepo configuration working
- [ ] All packages properly configured
- [ ] Development environment ready

### **Phase 2 Complete When:**
- [ ] Shared packages created
- [ ] API client working
- [ ] Types properly defined
- [ ] Utilities available

### **Phase 3 Complete When:**
- [ ] Web app functional
- [ ] Authentication working
- [ ] All core features implemented
- [ ] Responsive design
- [ ] API integration complete

### **Phase 4 Complete When:**
- [ ] Admin portal functional
- [ ] User management working
- [ ] File upload working
- [ ] System configuration working
- [ ] Admin features complete

### **Phase 5 Complete When:**
- [ ] Mobile app functional
- [ ] iOS and Android support
- [ ] All mobile features working
- [ ] Push notifications working
- [ ] Mobile UX optimized

## 📞 Support Resources

### **Backend API:**
- **Swagger UI:** http://localhost:3000/api
- **API Reference:** `doula/API_REFERENCE.md`
- **Test Endpoints:** `doula/test-auth.http`

### **Documentation:**
- **Backend Docs:** `doula/README.md`
- **Deployment Guide:** `doula/DEPLOYMENT.md`
- **Project Status:** `doula/STATUS.md`

### **Development:**
- **Task Breakdown:** `tasks.md`
- **Project Overview:** `Readme_main.md`
- **Next Steps:** `NEXT_STEPS.md`
- **Local Setup:** `LOCAL_SETUP_GUIDE.md`

---

**Status:** ✅ Backend Complete | 🔄 Ready for Frontend Development with Bolt
**Next Phase:** Monorepo Setup with Turborepo
**Estimated Completion:** 2-3 weeks for all frontend apps
