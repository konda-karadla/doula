# Health Platform Admin Portal

## Overview
Doctor-optimized administrative dashboard for managing the health platform built with Next.js 14. Features a revolutionary navigation redesign with horizontal tabs, compact sidebar, and command palette for maximum efficiency. Designed specifically for doctors and healthcare professionals who need quick access to patient data and management tools.

## Features

### 🔐 Admin Authentication
- Secure login with role-based access control
- JWT token management with automatic refresh
- Protected routes and session management
- Demo credentials: `admin@healthplatform.com` / `admin123`

### 👥 User Management
- Search and filter users by name, email, system, and status
- View user profiles and activity
- Create, edit, and delete user accounts
- System-based user organization (Doula, Functional Health, Elderly Care)

### 📊 Lab Results Management
- Upload and process lab result PDFs
- View processing status and biomarker extraction
- Filter by status, system, and user
- Download and manage lab result files
- Bulk operations for multiple results

### 🎯 Action Plan Management
- Create and edit personalized action plans
- Track progress and completion status
- Rich text editor for plan content
- Template system for common plans
- Analytics and reporting

### ⚙️ System Configuration
- Feature flag management
- System-specific branding and theming
- General platform settings
- Multi-tenant system configuration
- Real-time system status monitoring

### 🎨 Doctor-Optimized Navigation
- **Horizontal Navigation Tabs** - Quick access to all sections
- **Compact User Sidebar** - Minimal space usage with user info and controls
- **Command Palette (⌘K)** - Instant search for patients, actions, and navigation
- **Role-Based Access** - Different navigation for doctors, nurses, and admins
- **Keyboard Shortcuts** - Full keyboard navigation support
- **Dark Mode** - Theme switching with persistence

### 🚀 Enhanced User Experience
- **Inline Hover Actions** - Actions appear on table row hover
- **Bulk Operations** - Select and operate on multiple items
- **Smart Filters** - Advanced filtering and search capabilities
- **Status Badges** - Visual status indicators throughout the interface
- **Loading States** - Smooth loading indicators and optimistic updates
- **Empty States** - Helpful illustrations when data is empty
- **Copy to Clipboard** - Easy copying of IDs, emails, and other data

## Technology Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** Zustand
- **Server State:** React Query (TanStack Query)
- **Forms:** React Hook Form + Zod validation
- **Tables:** TanStack Table
- **Icons:** Lucide React
- **Charts:** Recharts

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard
│   ├── users/            # User management
│   ├── lab-results/      # Lab results management
│   ├── action-plans/     # Action plan management
│   ├── settings/         # System configuration
│   ├── login/           # Admin authentication
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page (redirects)
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   └── layout/          # Layout components
├── lib/                 # Utilities and configuration
│   ├── providers/       # React providers
│   ├── stores/          # Zustand stores
│   └── utils.ts         # Utility functions
└── hooks/               # Custom React hooks
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3001](http://localhost:3001) in your browser

### Demo Login
- **Email:** admin@healthplatform.com
- **Password:** admin123

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features in Detail

### Dashboard
- **Doctor Dashboard** - Specialized landing page for doctors
- Today's schedule and pending labs
- Quick stats and metrics
- Recent activity feed
- System health monitoring

### User Management
- Advanced search and filtering
- Bulk operations
- User activity tracking
- System-based organization

### Lab Results
- PDF upload and processing
- Biomarker extraction status
- File management
- Processing analytics

### Action Plans
- Rich text editor
- Progress tracking
- Template system
- Completion analytics

### System Settings
- Feature flag toggles
- Multi-tenant configuration
- Branding customization
- System health monitoring

## API Integration

The admin portal integrates with the health platform backend API:

- **Authentication:** JWT-based auth with refresh tokens
- **User Management:** CRUD operations for users
- **Lab Results:** Upload, process, and manage lab files
- **Action Plans:** Create and manage personalized plans
- **System Config:** Feature flags and settings

## Multi-Tenant Support

The admin portal supports three distinct health systems:

1. **Doula Care System** - Fertility and pregnancy care
2. **Functional Health System** - Functional medicine and wellness
3. **Elderly Care System** - Senior health and care management

Each system can be configured independently with:
- Custom branding and colors
- System-specific features
- User management
- Content customization

## Security

- Role-based access control (Admin/Super Admin)
- JWT token authentication
- Protected routes and API endpoints
- Input validation and sanitization
- XSS and CSRF protection

## Performance

- Server-side rendering with Next.js
- Optimized bundle splitting
- Lazy loading for large datasets
- Efficient state management
- Responsive design for all devices

## Development

### Adding New Features

1. Create new page in `src/app/`
2. Add navigation item in `AdminLayout`
3. Implement components in `src/components/`
4. Add state management in `src/lib/stores/`
5. Update types and API integration

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow shadcn/ui component patterns
- Maintain consistent spacing and typography
- Ensure responsive design
- Follow accessibility guidelines

## Deployment

The admin portal can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Docker containers**

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Health Platform Admin
```

## Navigation Redesign

The admin portal features a revolutionary navigation redesign optimized for doctors:

### Key Features:
- **Horizontal Navigation Tabs** - All main sections accessible via top tabs
- **Compact User Sidebar** - Minimal sidebar with user info, theme toggle, and logout
- **Command Palette** - Press `⌘K` for instant search and navigation
- **Role-Based Navigation** - Different tabs based on user role (doctor, nurse, admin)
- **Keyboard Shortcuts** - Press `?` for shortcuts help modal

### Benefits:
- **Maximum Screen Space** - More room for data tables and content
- **Fewer Clicks** - Direct access to all sections
- **Doctor-Friendly** - Designed specifically for healthcare workflows
- **Modern UX** - Clean, professional interface

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Write meaningful commit messages
4. Test all new features
5. Update documentation as needed

## Support

For issues and questions:
- Check the backend API documentation
- Review the shared packages documentation
- Contact the development team

## License

This project is part of the Health Platform and follows the same licensing terms.