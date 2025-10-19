# 🏥 Health Platform

A comprehensive, production-ready health management system with multi-tenant architecture supporting web, admin, and mobile applications.

## ⚡ Super Quick Start (Backend)

**First time setup:**
```bash
# 1. Run automated setup
./setup_backend.sh

# 2. Edit configuration
nano .env

# 3. Start everything
./start_all.sh
```

**That's it!** API will be at http://localhost:3000/api

📖 **Detailed instructions:** [QUICK_START_BACKEND.md](./QUICK_START_BACKEND.md)

---

## 🚀 Quick Start

### For New Developers
1. **[COMPLETE_MIGRATION_SUMMARY.md](./COMPLETE_MIGRATION_SUMMARY.md)** - **READ THIS FIRST!** FastAPI migration complete
2. **[Backend Setup](./README_FASTAPI.md)** - Get FastAPI backend running
3. **[Frontend Setup](./frontend/README.md)** - Get frontend apps running
4. **[Mobile Setup](./frontend/apps/mobile/README.md)** - Get mobile app running

### For Documentation
📚 **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Complete documentation index

## 📊 Project Status

### ✅ Complete
- **Backend** - **FastAPI** (Python) with 60+ endpoints, async operations, multi-tenant support, production-ready
- **Migration** - 100% NestJS → FastAPI migration complete with full feature parity
- **Frontend Monorepo** - Turborepo setup with shared packages
- **Admin Panel** - Next.js 14 with doctor-optimized navigation, command palette, and comprehensive management tools
- **Web App** - Next.js user-facing application with complete feature set
- **Mobile App** - Expo/React Native with 90% core features complete

### 🚀 Recent Updates
- **FastAPI Migration** - Complete backend rewrite for better performance
- **Consultation System** - Doctor management and appointment booking
- **Admin APIs** - Full user management, analytics, and system configuration

## 🏗️ Architecture

```
health-platform/
├── backend/               # FastAPI Backend (Python, PostgreSQL, SQLAlchemy)
│   ├── api/          # API endpoints
│   ├── core/         # Configuration & security
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic
│   └── tasks/        # Celery background tasks
├── alembic/          # Database migrations
├── frontend/         # Turborepo monorepo
│   ├── apps/
│   │   ├── web/     # Next.js web app
│   │   ├── admin/   # React admin panel
│   │   └── mobile/  # Expo mobile app
│   └── packages/     # Shared code
│       ├── types/   # TypeScript types
│       ├── api-client/
│       ├── utils/
│       ├── config/
│       └── ui/
└── docs-archive/     # Historical documentation

```

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **Database:** PostgreSQL with SQLAlchemy (async)
- **Migrations:** Alembic
- **Auth:** JWT with refresh tokens
- **Storage:** AWS S3
- **OCR:** pytesseract
- **Background Jobs:** Celery with Redis
- **API Docs:** Auto-generated Swagger UI

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
- **Consultation System** - Doctor management and appointment booking
- **Admin Dashboard** - User management, analytics, and configuration
- **Secure Authentication** - JWT with refresh tokens and role-based access
- **Async Operations** - High-performance async I/O
- **Real-time Updates** - Live data synchronization
- **Responsive Design** - Works on all devices

## 📚 Documentation

### Must Read
- **[COMPLETE_MIGRATION_SUMMARY.md](./COMPLETE_MIGRATION_SUMMARY.md)** - **START HERE!** Complete FastAPI migration guide
- **[README_FASTAPI.md](./README_FASTAPI.md)** - FastAPI backend documentation

### Additional Docs
- **[FASTAPI_MIGRATION_COMPLETE.md](./FASTAPI_MIGRATION_COMPLETE.md)** - Original migration documentation
- **[CLIENT_DOCUMENTATION.md](./CLIENT_DOCUMENTATION.md)** - Complete project documentation
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Development roadmap
- **[Mobile Tasks](./frontend/apps/mobile/MOBILE_TASKS.md)** - Mobile development tasks

## 🚦 Getting Started

### Prerequisites
- **Backend:** Python 3.10+, PostgreSQL 14+, Redis
- **Frontend:** Node.js 20+, npm or yarn

### Backend Setup (FastAPI)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Configure environment
cp .env.fastapi.example .env  # Edit with your settings

# Run database migrations
alembic upgrade head

# Start API server
./start_api.sh

# Start Celery worker (separate terminal)
./start_celery.sh

# Start Redis (separate terminal)
redis-server
```

See **[README_FASTAPI.md](./README_FASTAPI.md)** for detailed setup instructions.

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
# Backend tests (FastAPI)
pytest

# Frontend tests
cd frontend
npm test
```

## 📞 Support

- **Migration Guide:** [COMPLETE_MIGRATION_SUMMARY.md](./COMPLETE_MIGRATION_SUMMARY.md)
- **API Docs:** http://localhost:3000/api (Swagger UI - Auto-generated)
- **FastAPI Setup:** [README_FASTAPI.md](./README_FASTAPI.md)

## 📄 License

Private project - All rights reserved

---

**Project Status:** ✅ Production Ready
**Last Updated:** January 19, 2025
**Backend:** FastAPI (Python) - 100% migrated from NestJS
**Current Focus:** FastAPI migration complete, all 60+ endpoints operational

