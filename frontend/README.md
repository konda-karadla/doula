# Health Platform Frontend

A Turborepo monorepo for the Health Platform frontend applications.

**Part of the Health Platform project structure:**
```
health-platform/
├── backend/     # NestJS API (26 endpoints)
└── frontend/    # This Turborepo monorepo
```

## 🏗️ Project Structure

```
health-platform-frontend/
├── apps/
│   ├── web/                        # Next.js Patient Portal
│   ├── admin/                      # Next.js Admin Dashboard
│   └── mobile/                     # React Native + Expo Mobile App
├── packages/
│   ├── ui/                         # Shared React components
│   ├── api-client/                 # API client & hooks
│   ├── types/                      # TypeScript types
│   ├── utils/                      # Helper functions
│   └── config/                     # Shared configs
├── turbo.json                      # Turborepo configuration
└── package.json                    # Root workspace config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ LTS
- npm 10+ (or yarn/pnpm)
- Backend API running at `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Start all apps in development mode
npm run dev

# Build all apps and packages
npm run build

# Lint all packages
npm run lint

# Type check all packages
npm run type-check
```

## 📦 Packages

### Shared Packages

- **`@health-platform/types`** - TypeScript interfaces and types
- **`@health-platform/utils`** - Helper functions and utilities
- **`@health-platform/config`** - Environment and configuration management
- **`@health-platform/api-client`** - Axios-based API client with React Query hooks
- **`@health-platform/ui`** - React component library with shadcn/ui

### Applications

- **`apps/web`** - Patient Portal (Next.js 14)
- **`apps/admin`** - Admin Dashboard (Next.js 14)
- **`apps/mobile`** - Mobile App (React Native + Expo)

## 🔧 Development

### Adding a New Package

```bash
# Create new package directory
mkdir packages/new-package
cd packages/new-package

# Initialize package
npm init -y

# Add to workspace
# Update root package.json workspaces array
```

### Adding a New App

```bash
# Create new app directory
mkdir apps/new-app
cd apps/new-app

# Initialize with your preferred framework
# Add to workspace
# Update root package.json workspaces array
```

## 🔌 Backend Integration

The frontend connects to the NestJS backend API:

- **Base URL**: `http://localhost:3000`
- **API Documentation**: `http://localhost:3000/api`
- **Authentication**: JWT with refresh tokens
- **Multi-tenant**: Supports doula, functional_health, elderly_care systems

## 🎨 Design System

- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Theme**: Default design tokens (customizable)

## 📱 Mobile Development

The mobile app is built with:
- **Framework**: React Native + Expo
- **Navigation**: React Navigation
- **State Management**: React Query + Context
- **Styling**: NativeWind (Tailwind for React Native)

## 🧪 Testing

```bash
# Run tests for all packages
npm run test

# Run tests for specific package
npm run test --workspace=@health-platform/ui

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Web Applications
- **Patient Portal**: Deploy to Vercel/Netlify
- **Admin Dashboard**: Deploy to Vercel/Netlify

### Mobile Application
- **iOS**: Deploy to App Store via Expo
- **Android**: Deploy to Google Play via Expo

## 📚 Documentation

- [API Reference](../backend/API_REFERENCE.md)
- [Backend Documentation](../backend/README.md)
- [Deployment Guide](../backend/DEPLOYMENT.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test`
4. Build: `npm run build`
5. Create pull request

## 📄 License

This project is [MIT licensed](LICENSE).

## 🙏 Acknowledgments

Built with:
- [Turborepo](https://turbo.build/) - Monorepo build system
- [Next.js](https://nextjs.org/) - React framework
- [React Native](https://reactnative.dev/) - Mobile framework
- [Expo](https://expo.dev/) - React Native platform
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
