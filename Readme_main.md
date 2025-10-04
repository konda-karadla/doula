## 🎯 Project Overview
You're building a multi-tenant health platform with three potential applications (Doula, Functional Health, Elderly Care) sharing a common backend infrastructure. The platform enables users to upload lab results, receive AI-generated insights, and get personalized action plans from health specialists.

### **Current Status: ✅ Backend Complete**
- **Backend:** NestJS + Prisma + PostgreSQL (Production Ready)
- **API:** 26 endpoints with full documentation
- **Database:** 9 tables with multi-tenant architecture
- **Testing:** 29 tests passing (100%)
- **Documentation:** Complete API reference and deployment guide

### **Core Features:**
- **User Profiles:** Individual/couple profiles with journey selection (Optimizer/Preconception/Fertility Care)
- **Lab Results:** PDF upload, biomarker categorization, and trend analysis
- **Action Plans:** AI-generated and expert-curated personalized recommendations
- **Concierge:** AI chat and unlimited consultation booking
- **Multi-language:** Default English with user-configurable language preferences
- **Multi-tenant:** Shared backend with system-specific data isolation

### **Development Strategy:**
- **✅ Phase 1 Complete:** Backend infrastructure with NestJS + Prisma
- **🔄 Phase 2 Next:** Admin Portal with Next.js 14 + shadcn/ui
- **🔄 Phase 3 Next:** Mobile App with React Native + Expo
- **Code Reusability:** 80%+ code sharing across all three applications
- **System-Specific Customization:** Use configuration files and feature flags for app-specific requirements

## 📋 Phase 1: Core Foundation Tasks

### **Task 1: Database Architecture Setup**
**Goal:** Create a scalable, multi-tenant database structure

**Subtasks:**
1. **Design Core Tables**
   - Ask AI: "Create a PostgreSQL database schema for a multi-tenant health app with these tables: users, user_profiles, lab_results, action_plans, systems, biomarker_categories, consultations, system_configs, feature_flags. Include proper foreign keys and a system_id field for multi-tenancy. Design for maximum reusability across Doula, Functional Health, and Elderly Care apps"

2. **Create System Table**
   - Ask AI: "Design a system table that manages different apps (doula, functional_health, elderly_care) with tenant isolation and system-specific configurations"

3. **Set up User Management**
   - Ask AI: "Create database tables for user authentication with email/username, password hashing, profile data, language preferences (default English), profile type (individual/couple), and journey type (Optimizer/Preconception/Fertility Care)"

4. **Lab Results & Biomarkers**
   - Ask AI: "Create tables for lab results with PDF file storage, biomarker categorization, and trend tracking capabilities"

5. **Configuration & Feature Flags**
   - Ask AI: "Create system_configs and feature_flags tables to enable app-specific customization without code changes"

### **Task 2: Backend API Development**
**Goal:** Build RESTful APIs for core functionality

**Subtasks:**
1. **Authentication System**
   - Ask AI: "Create a Node.js Express API with JWT authentication for user registration and login with username availability check"

2. **User Profile CRUD**
   - Ask AI: "Build REST endpoints for creating and managing user profiles including individual/couple options and journey selection"

3. **Lab Results Management**
   - Ask AI: "Create API endpoints for uploading PDF lab results, storing file metadata, and linking to user profiles with multi-tenant support"

4. **Action Plans API**
   - Ask AI: "Build endpoints for creating, retrieving, and updating personalized action plans linked to users with AI-generated and expert-curated insights"

5. **File Upload System**
   - Ask AI: "Create API endpoints for uploading PDF lab results with file validation, storage, and metadata management"

6. **Biomarker & Insights API**
   - Ask AI: "Build endpoints for biomarker categorization, trend analysis, and AI-generated health insights"

7. **System Configuration API**
   - Ask AI: "Create endpoints for managing system-specific configurations and feature flags to enable app customization"

### **Task 3: Admin Portal (Web Form)**
**Goal:** Simple interface for specialists to manage data

**Subtasks:**
1. **Basic Admin UI**
   - Ask AI: "Create a React admin dashboard with user search functionality and forms for uploading lab results and typing action plans"

2. **User Lookup Feature**
   - Ask AI: "Build a search interface to find users by username/ID and display their profile, lab results, and action plans"

3. **Action Plan Editor**
   - Ask AI: "Create a form component for entering and editing personalized health recommendations with rich text support and AI insight curation"

4. **Lab Results Management**
   - Ask AI: "Build admin interface for uploading and managing lab results with PDF preview and biomarker categorization"

5. **Consultation Management**
   - Ask AI: "Create booking and scheduling interface for unlimited consultations with specialists"

### **Task 4: Mobile App Frontend**
**Goal:** React Native app for end users

**Subtasks:**
1. **Project Setup**
   - Ask AI: "Set up a React Native project with Expo, navigation (React Navigation), and state management (Redux Toolkit or Context API)"

2. **Onboarding Flow**
   - Ask AI: "Create React Native screens for user onboarding: welcome, profile type selection (individual/couple), journey selection (Optimizer/Preconception/Fertility Care), baseline data collection (demographics, history, goals), and language preference setup"

3. **Authentication Screens**
   - Ask AI: "Build React Native login and registration screens with form validation and API integration"

4. **Home Dashboard**
   - Ask AI: "Design a React Native home screen showing biomarker summaries and health score cards with mock data"

5. **Lab Results View**
   - Ask AI: "Create screens to display uploaded lab results, view PDFs, and show biomarker trends"

6. **Action Plan Display**
   - Ask AI: "Build a screen to show personalized recommendations retrieved from the API with AI-generated and expert-curated insights"

7. **Concierge & Consultations**
   - Ask AI: "Create chat interface for AI concierge and consultation booking screens with unlimited access"

8. **Data & Trends View**
   - Ask AI: "Build screens for lab results display, biomarker trends, and health insights with PDF viewing capabilities"

## 🚀 Step-by-Step Execution Order

### **Week 1: Foundation**
1. **Day 1-2:** Database setup
   - Start with: "Help me create a PostgreSQL database with Docker for local development"
   - Then: "Create the initial migration files for user and profile tables"

2. **Day 3-4:** Basic Backend
   - Ask: "Create a Node.js project structure with Express, database connection, and basic authentication"
   - Follow with: "Add CORS, error handling, and logging middleware"

3. **Day 5:** Admin Portal Basics
   - Ask: "Create a simple React app with a login page and dashboard layout"

### **Week 2: Core Features**
1. **Day 1-2:** Complete User Management
   - Ask: "Add password reset, profile update, and language preference features to the API"

2. **Day 3-4:** File Upload System
   - Ask: "Implement file upload for PDFs using Multer and cloud storage (AWS S3 or local storage)"

3. **Day 5:** Admin Functions
   - Ask: "Complete the admin portal with user search and action plan creation"

### **Week 3: Mobile App**
1. **Day 1-2:** App Foundation
   - Ask: "Set up React Native with proper folder structure for screens, components, and services"

2. **Day 3-4:** Core Screens
   - Ask: "Build the essential screens with API integration"

3. **Day 5:** Testing & Polish
   - Ask: "Add loading states, error handling, and basic animations to the React Native app"

## 💡 Pro Tips for AI Prompts

1. **Be Specific:** Instead of "create a database", say "create a PostgreSQL schema with these exact tables and relationships"

2. **Request Best Practices:** Add "following industry best practices for security and scalability"

3. **Ask for Documentation:** End prompts with "include inline comments and a README with setup instructions"

4. **Iterative Refinement:** Start simple, then ask "enhance this with error handling and validation"

5. **Testing Included:** Request "include basic unit tests" or "add sample test data"

## 🎓 Example First Prompt to Get Started

```
"Create a NestJS project structure for a multi-tenant health platform with:
1. PostgreSQL + Prisma setup with tenant isolation
2. JWT authentication with refresh tokens
3. Module structure: auth, users, labs, action-plans
4. Docker-compose for PostgreSQL and Redis
5. Environment configuration for development
6. Swagger documentation setup
7. User model with email, username, password (hashed), language preference (default English), profile type (individual/couple), journey type (Optimizer/Preconception/Fertility Care)
8. System model for multi-tenant support (doula, functional_health, elderly_care)
9. SystemConfig and FeatureFlag models for app-specific customization
10. File upload to AWS S3 for PDF lab results
11. Bull queue for async PDF processing
Include folder structure and initial schemas"
```

## 🔄 Code Reusability Strategy

### **Phase 1: Build for Doula (Technology Partner)**
- Start with Doula as the primary application
- Build all core functionality with Doula-specific requirements
- Design every component to be system-agnostic
- Use configuration files for Doula-specific branding and features

### **Phase 2: Extract Reusable Components**
- Create shared component library for common functionality
- Extract system-agnostic business logic
- Build configuration-driven UI components
- Implement feature flags for app-specific functionality

### **Phase 3: Expand to Other Apps**
- **Functional Health:** Reuse 80%+ of code with different configurations
- **Elderly Care:** Reuse 70%+ of code with specialized features
- Use system_id to filter data and customize behavior
- Leverage feature flags for app-specific requirements

### **Key Reusability Principles:**
1. **System-Agnostic Design:** All database queries include system_id filtering
2. **Configuration-Driven:** Use system_configs table for app-specific settings
3. **Feature Flags:** Enable/disable features per application
4. **Shared Components:** Build React Native components that work across all apps
5. **API Abstraction:** Backend APIs automatically filter by system context

### **Example Implementation:**
```javascript
// All API calls include system context
const getUserLabResults = async (userId, systemId) => {
  return await LabResult.findAll({
    where: { userId, systemId },
    include: [BiomarkerCategory]
  });
};

// UI components are configurable
<LabResultsView 
  systemId="doula" 
  config={systemConfigs.doula}
  features={featureFlags.doula}
/>
```

## 🛠️ Recommended Technology Stack

### **Backend Stack**
- **Runtime:** Node.js (v20 LTS)
- **Framework:** NestJS (enterprise-grade, modular)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Passport.js + JWT
- **File Storage:** AWS S3 (or MinIO for self-hosted)
- **API Documentation:** Swagger/OpenAPI
- **Queue:** Bull/Redis (for PDF processing)
- **Real-time:** Socket.io

### **Frontend Stack**
- **Admin Portal:** Next.js 14 + shadcn/ui + Tailwind CSS
- **Mobile App:** React Native + Expo + Zustand + React Query
- **Navigation:** React Navigation v6
- **UI Components:** React Native Paper or Tamagui
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts or Tremor

### **Infrastructure**
- **Development:** Docker & Docker Compose
- **Database:** PostgreSQL + Redis in containers
- **File Storage:** AWS S3 or MinIO
- **Monitoring:** Sentry + CloudWatch
- **CDN:** CloudFront or Cloudflare

### **Stack Benefits**
- **NestJS:** Enterprise-ready with built-in patterns (DI, modules, guards)
- **Prisma:** Type-safe database client with migrations
- **Zustand:** Simpler state management than Redux
- **React Query:** Server state management and caching
- **Next.js 14:** SSR/SSG with App Router
- **Multi-tenancy:** Built-in patterns for tenant isolation

## 🚀 Next Steps for New Chat

### **Phase 2: Admin Portal Development**
**Priority:** High | **Estimated Time:** 4-5 days

#### **What to Build:**
1. **Next.js 14 Admin Portal**
   - User management interface
   - Lab results upload and management
   - Action plan creation and editing
   - System configuration management

2. **Key Features:**
   - User search and profile management
   - PDF lab results upload
   - Action plan editor with rich text
   - System-specific branding and configuration
   - Real-time notifications

#### **Tech Stack:**
- **Framework:** Next.js 14 with App Router
- **UI Library:** shadcn/ui + Tailwind CSS
- **State Management:** Zustand + React Query
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table
- **Charts:** Recharts or Tremor

### **Phase 3: Mobile App Development**
**Priority:** Medium | **Estimated Time:** 6-7 days

#### **What to Build:**
1. **React Native Mobile App**
   - User onboarding flow
   - Lab results viewing
   - Action plan tracking
   - Health insights dashboard

2. **Key Features:**
   - Individual/couple profile setup
   - Journey selection (Optimizer/Preconception/Fertility Care)
   - PDF viewer for lab results
   - Action plan progress tracking
   - Health insights and recommendations

#### **Tech Stack:**
- **Framework:** React Native + Expo
- **Navigation:** React Navigation v6
- **State Management:** Zustand + React Query
- **UI Components:** React Native Paper or Tamagui
- **Forms:** React Hook Form + Zod

### **Backend API Ready**
The backend is complete with 26 endpoints:
- Authentication (4 endpoints)
- Lab Results (5 endpoints)
- Action Plans (5 endpoints)
- Action Items (7 endpoints)
- Health Insights (3 endpoints)
- User Profile (2 endpoints)

**API Documentation:** Available at `http://localhost:3000/api` (Swagger UI)

### **Database Schema Complete**
- 9 tables with proper relationships
- Multi-tenant architecture with system_id filtering
- 3 systems seeded (doula, functional_health, elderly_care)
- Feature flags and system configurations

### **Development Environment**
```bash
# Backend is ready to run
cd doula
npm install
cp .env.example .env
# Configure environment variables
npm run start:dev
# API available at http://localhost:3000
# Swagger docs at http://localhost:3000/api
```

This approach ensures you build incrementally while maintaining code reusability across your three applications. The backend foundation is complete and ready for frontend development.