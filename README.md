# 🏥 Health Platform

A comprehensive, production-ready health management system with multi-tenant architecture supporting web, admin, and mobile applications.

## 🚀 Quick Start

### For New Developers
1. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - See current project status
2. **[Backend Setup](./backend/README.md)** - Get backend running
3. **[Frontend Setup](./frontend/README.md)** - Get frontend apps running
4. **[Mobile Setup](./frontend/apps/mobile/README.md)** - Get mobile app running

### For Documentation
📚 **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Complete documentation index

## 📊 Project Status

### ✅ Complete
- **Backend** - NestJS API with 36 endpoints, multi-tenant support, production-ready
- **Frontend Monorepo** - Turborepo setup with shared packages
- **Admin Panel** - Next.js 14 with doctor-optimized navigation, command palette, and comprehensive management tools
- **Web App** - Next.js user-facing application with complete feature set
- **Mobile App** - Expo/React Native with 90% core features complete

### 🚀 In Progress
- Mobile app feature development

## 🏗️ Architecture

```
health-platform/
├── backend/           # NestJS API (Node.js, PostgreSQL, Prisma)
├── frontend/          # Turborepo monorepo
│   ├── apps/
│   │   ├── web/      # Next.js web app
│   │   ├── admin/    # React admin panel
│   │   └── mobile/   # Expo mobile app
│   └── packages/      # Shared code
│       ├── types/    # TypeScript types
│       ├── api-client/
│       ├── utils/
│       ├── config/
│       └── ui/
└── docs-archive/      # Historical documentation

```

## 🛠️ Tech Stack

### Backend
- **Framework:** NestJS
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT with refresh tokens
- **Storage:** AWS S3
- **OCR:** Tesseract.js
- **Testing:** Jest (29/29 tests passing)

### Frontend
- **Web:** Next.js 15 with React 19
- **Admin:** React 19 with Vite
- **Mobile:** Expo with React Native
- **Monorepo:** Turborepo
- **State:** TanStack Query, Zustand
- **Styling:** Tailwind CSS

## 📱 Applications

### 1. Web App (User-Facing)
- User authentication
- Lab result viewing
- Health insights
- Action plan tracking

### 2. Admin Panel
- **Doctor-optimized navigation** with horizontal tabs and compact sidebar
- **Command Palette (⌘K)** for quick actions and patient search
- **Role-based access control** for doctors, nurses, and administrators
- **Enhanced data tables** with hover actions and bulk operations
- **User management** with advanced filtering and CRUD operations
- **Lab results oversight** with processing status tracking
- **Action plans administration** with progress monitoring
- **System configuration** with feature flags and multi-tenant support
- **Dark mode support** with theme persistence
- **Keyboard shortcuts** and accessibility features

### 3. Mobile App
- Same features as web
- Native mobile experience
- Offline capabilities
- Push notifications (planned)

## 🔑 Key Features

- **Multi-Tenant Architecture** - Support multiple healthcare organizations
- **Lab Result Processing** - OCR-powered PDF analysis
- **Health Insights Engine** - Automated biomarker analysis
- **Action Plan Management** - Personalized health goals
- **Secure Authentication** - JWT with refresh tokens
- **Real-time Updates** - Live data synchronization
- **Responsive Design** - Works on all devices

## 📚 Documentation

- **[CLIENT_DOCUMENTATION.md](./CLIENT_DOCUMENTATION.md)** - Complete project documentation
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Development roadmap
- **[Backend API Reference](./backend/API_REFERENCE.md)** - All 26 endpoints documented
- **[Backend Deployment](./backend/DEPLOYMENT.md)** - Production deployment guide
- **[Mobile Tasks](./frontend/apps/mobile/MOBILE_TASKS.md)** - Mobile development tasks

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment
npx prisma migrate dev
npm run start:dev
```

### Frontend Setup
```bash
cd frontend
npm install
# Start web app
npm run dev --filter=web
# Start admin
npm run dev --filter=admin
# Start mobile
npm run dev --filter=mobile
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📞 Support

- **Backend Status:** [backend/STATUS.md](./backend/STATUS.md)
- **API Docs:** http://localhost:3000/api (Swagger UI)
- **Project Status:** [PROJECT_STATUS.md](./PROJECT_STATUS.md)

## 📄 License

Private project - All rights reserved

---

**Project Status:** ✅ Active Development  
**Last Updated:** October 12, 2025  
**Current Focus:** Navigation redesign complete, mobile app final testing phase

