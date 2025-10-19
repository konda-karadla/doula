# Health Platform

A comprehensive health management platform with NestJS backend and Turborepo frontend monorepo.

## 🏗️ Project Structure

```
health-platform/
├── backend/                  # NestJS API - COMPLETED ✅
│   ├── src/                  # 26 API endpoints
│   ├── package.json
│   ├── README.md
│   └── ...
└── frontend/                 # Turborepo monorepo - IN PROGRESS 🔄
    ├── apps/                 # Web & mobile applications
    ├── packages/             # Shared packages
    ├── package.json
    ├── turbo.json
    └── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ LTS
- npm 10+ (or yarn/pnpm)
- PostgreSQL 12+ (or Supabase account)
- Redis 6+

### Backend (NestJS API)
```bash
cd backend/
npm install
npm run start:dev
# API available at http://localhost:3000
# Swagger docs at http://localhost:3000/api
```

### Frontend (Turborepo Monorepo)
```bash
cd frontend/
npm install
npm run dev
# Start all apps in development mode
```

### Working with Both
```bash
# Open health-platform/ folder in your IDE
# Backend: backend/
# Frontend: frontend/
```

## 🎯 Features

### Backend (NestJS API)
- **Multi-Tenant Architecture** - Secure data isolation for multiple health systems
- **JWT Authentication** - Token-based auth with refresh token rotation
- **Lab Result Processing** - PDF upload with OCR and biomarker extraction
- **Health Insights** - AI-powered analysis of lab results with personalized recommendations
- **Action Plans** - Task management for health goals and interventions
- **User Profiles** - Comprehensive health statistics and activity tracking

### Frontend (Turborepo Monorepo)
- **Web Applications** - Next.js 14 Patient Portal & Admin Dashboard
- **Mobile Application** - React Native + Expo mobile app
- **Shared Packages** - Types, utils, config, api-client, UI components
- **Modern Stack** - TypeScript, Tailwind CSS, shadcn/ui, React Query

## 🔌 API Integration

The frontend connects to the NestJS backend API:

- **Base URL**: `http://localhost:3000`
- **API Documentation**: `http://localhost:3000/api`
- **Authentication**: JWT with refresh tokens
- **Multi-tenant**: Supports doula, functional_health, elderly_care systems

## 📊 Target Systems

- **Doula Care** - Prenatal and postnatal care support
- **Functional Health** - Functional medicine and wellness tracking
- **Elderly Care** - Senior health monitoring and care management

## 🧪 Testing

### Backend
```bash
cd backend/
npm test
npm run test:cov
npm run test:e2e
```

### Frontend
```bash
cd frontend/
npm run test
npm run type-check
npm run lint
```

## 🚀 Deployment

### Backend
- Docker deployment
- PM2 process manager
- Heroku platform
- AWS ECS/Fargate

### Frontend
- **Web Apps**: Deploy to Vercel/Netlify
- **Mobile App**: Deploy to App Store/Google Play via Expo

## 📚 Documentation

- [Backend API Reference](./API_REFERENCE.md)
- [Backend Deployment Guide](./DEPLOYMENT.md)
- [Frontend Documentation](./frontend/README.md)
- [Development Tasks](../TASKS.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run tests: `npm test`
5. Build: `npm run build`
6. Create pull request

## 📄 License

This project is [MIT licensed](LICENSE).

## 🙏 Acknowledgments

Built with:
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Turborepo](https://turbo.build/) - Monorepo build system
- [Next.js](https://nextjs.org/) - React framework
- [React Native](https://reactnative.dev/) - Mobile framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Supabase](https://supabase.com/) - Open source Firebase alternative

## ✨ Project Status

**Current Version:** 1.0.0
**Status:** 🔄 In Development

### Backend Status: ✅ Production Ready
- ✅ 26 API endpoints
- ✅ 9 database tables
- ✅ 8 modules
- ✅ 29 tests
- ✅ Multi-tenant support
- ✅ JWT authentication
- ✅ Lab result processing
- ✅ Health insights
- ✅ Action plans

### Frontend Status: 🔄 In Progress
- ✅ Turborepo monorepo setup
- ✅ Shared packages (types, utils, config, api-client)
- 🔄 UI component library
- ⏳ Web applications
- ⏳ Mobile application
- ⏳ Integration testing

## 📞 Support

- Documentation: See `/docs` folder
- API Reference: [backend/API_REFERENCE.md](./API_REFERENCE.md)
- Deployment: [backend/DEPLOYMENT.md](./DEPLOYMENT.md)
- Swagger UI: http://localhost:3000/api