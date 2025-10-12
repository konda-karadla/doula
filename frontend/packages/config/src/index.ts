import type { SystemType, ProfileType, JourneyType } from '@health-platform/types';

// Environment configuration
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Health Platform',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;

// API endpoints configuration
export const apiEndpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  
  // Lab Results
  labs: {
    upload: '/labs/upload',
    list: '/labs',
    get: (id: string) => `/labs/${id}`,
    biomarkers: (id: string) => `/labs/${id}/biomarkers`,
    delete: (id: string) => `/labs/${id}`,
  },
  
  // Action Plans
  actionPlans: {
    list: '/action-plans',
    create: '/action-plans',
    get: (id: string) => `/action-plans/${id}`,
    update: (id: string) => `/action-plans/${id}`,
    delete: (id: string) => `/action-plans/${id}`,
    items: {
      list: (planId: string) => `/action-plans/${planId}/items`,
      create: (planId: string) => `/action-plans/${planId}/items`,
      get: (planId: string, itemId: string) => `/action-plans/${planId}/items/${itemId}`,
      update: (planId: string, itemId: string) => `/action-plans/${planId}/items/${itemId}`,
      complete: (planId: string, itemId: string) => `/action-plans/${planId}/items/${itemId}/complete`,
      uncomplete: (planId: string, itemId: string) => `/action-plans/${planId}/items/${itemId}/uncomplete`,
      delete: (planId: string, itemId: string) => `/action-plans/${planId}/items/${itemId}`,
    },
  },
  
  // Health Insights
  insights: {
    summary: '/insights/summary',
    labResult: (id: string) => `/insights/lab-result/${id}`,
    trends: (testName: string) => `/insights/trends/${testName}`,
    healthScore: '/insights/health-score',
  },
  
  // User Profile
  profile: {
    get: '/profile',
    stats: '/profile/stats',
    update: '/profile',
    export: (type: string, format: string) => `/profile/export?type=${type}&format=${format}`,
  },
  
  // Consultations (User)
  consultations: {
    doctors: '/consultations/doctors',
    doctor: (id: string) => `/consultations/doctors/${id}`,
    availability: (id: string, date: string) => `/consultations/doctors/${id}/availability?date=${date}`,
    book: '/consultations/book',
    myBookings: '/consultations/my-bookings',
    get: (id: string) => `/consultations/${id}`,
    reschedule: (id: string) => `/consultations/${id}/reschedule`,
    cancel: (id: string) => `/consultations/${id}/cancel`,
  },
  
  // Admin endpoints
  admin: {
    users: '/admin/users',
    user: (id: string) => `/admin/users/${id}`,
    createUser: '/admin/users',
    updateUser: (id: string) => `/admin/users/${id}`,
    deleteUser: (id: string) => `/admin/users/${id}`,
    systemConfig: '/admin/system-config',
    updateSystemConfig: '/admin/system-config',
    analytics: {
      users: '/admin/analytics/users',
      labs: '/admin/analytics/labs',
      actionPlans: '/admin/analytics/action-plans',
    },
    actionPlans: {
      list: '/admin/action-plans',
      create: '/admin/action-plans',
      get: (id: string) => `/admin/action-plans/${id}`,
      update: (id: string) => `/admin/action-plans/${id}`,
      delete: (id: string) => `/admin/action-plans/${id}`,
      items: (id: string) => `/admin/action-plans/${id}/items`,
    },
    consultations: {
      doctors: '/admin/consultations/doctors',
      doctor: (id: string) => `/admin/consultations/doctors/${id}`,
      createDoctor: '/admin/consultations/doctors',
      updateDoctor: (id: string) => `/admin/consultations/doctors/${id}`,
      deleteDoctor: (id: string) => `/admin/consultations/doctors/${id}`,
      toggleDoctor: (id: string) => `/admin/consultations/doctors/${id}/toggle`,
      availability: (id: string) => `/admin/consultations/doctors/${id}/availability`,
      consultations: '/admin/consultations',
      consultation: (id: string) => `/admin/consultations/${id}`,
      updateConsultation: (id: string) => `/admin/consultations/${id}`,
    },
  },
} as const;

// Multi-tenant system configuration
export const systems = {
  doula: {
    id: 'doula-system-id',
    name: 'Doula Care System',
    type: 'doula' as SystemType,
    description: 'Prenatal and postnatal care support',
    features: ['lab_results', 'action_plans', 'health_insights', 'profile'],
    journeyTypes: ['prenatal', 'postnatal'] as JourneyType[],
    profileTypes: ['patient', 'provider'] as ProfileType[],
  },
  functional_health: {
    id: 'functional-health-system-id',
    name: 'Functional Health System',
    type: 'functional_health' as SystemType,
    description: 'Functional medicine and wellness tracking',
    features: ['lab_results', 'action_plans', 'health_insights', 'profile'],
    journeyTypes: ['general'] as JourneyType[],
    profileTypes: ['patient', 'provider'] as ProfileType[],
  },
  elderly_care: {
    id: 'elderly-care-system-id',
    name: 'Elderly Care System',
    type: 'elderly_care' as SystemType,
    description: 'Senior health monitoring and care management',
    features: ['lab_results', 'action_plans', 'health_insights', 'profile'],
    journeyTypes: ['general'] as JourneyType[],
    profileTypes: ['patient', 'provider', 'admin'] as ProfileType[],
  },
} as const;

// Feature flags
export const featureFlags = {
  // Development features
  enableDebugMode: env.IS_DEVELOPMENT,
  enableMockData: env.IS_DEVELOPMENT,
  enableApiLogging: env.IS_DEVELOPMENT,
  
  // Feature toggles
  enablePushNotifications: true,
  enableOfflineMode: false,
  enableBiometricAuth: true,
  enableDarkMode: true,
  enableAnalytics: env.IS_PRODUCTION,
  enableErrorReporting: env.IS_PRODUCTION,
  
  // UI features
  enableAdvancedFilters: true,
  enableBulkActions: true,
  enableExportData: true,
  enableImportData: true,
  
  // Health features
  enableHealthInsights: true,
  enableTrendAnalysis: true,
  enableRecommendations: true,
  enableGoalTracking: true,
} as const;

// Application configuration
export const appConfig = {
  name: env.APP_NAME,
  version: env.APP_VERSION,
  description: 'Comprehensive health platform for managing lab results, action plans, and health insights',
  
  // API configuration
  api: {
    baseUrl: env.API_BASE_URL,
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  
  // Authentication configuration
  auth: {
    tokenStorageKey: 'health_platform_token',
    refreshTokenStorageKey: 'health_platform_refresh_token',
    userStorageKey: 'health_platform_user',
    tokenExpiryBuffer: 5 * 60 * 1000, // 5 minutes
  },
  
  // UI configuration
  ui: {
    theme: {
      default: 'light',
      options: ['light', 'dark', 'system'],
    },
    language: {
      default: 'en',
      options: ['en', 'es', 'fr'],
    },
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    timezone: 'America/New_York',
  },
  
  // File upload configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxFiles: 5,
  },
  
  // Pagination configuration
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    maxPageSize: 100,
  },
  
  // Cache configuration
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 100, // Maximum number of cached items
  },
  
  // Notification configuration
  notifications: {
    position: 'top-right',
    duration: 5000, // 5 seconds
    maxVisible: 5,
  },
  
  // Validation configuration
  validation: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    },
    email: {
      allowMultiple: false,
    },
  },
} as const;

// Route configuration
export const routes = {
  // Public routes
  public: {
    home: '/',
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },
  
  // Protected routes
  protected: {
    dashboard: '/dashboard',
    profile: '/profile',
    settings: '/settings',
    
    // Lab results
    labs: '/labs',
    labDetail: (id: string) => `/labs/${id}`,
    labUpload: '/labs/upload',
    
    // Action plans
    actionPlans: '/action-plans',
    actionPlanDetail: (id: string) => `/action-plans/${id}`,
    actionPlanCreate: '/action-plans/create',
    
    // Health insights
    insights: '/insights',
    insightDetail: (id: string) => `/insights/${id}`,
    
    // Admin routes
    admin: {
      dashboard: '/admin',
      users: '/admin/users',
      systems: '/admin/systems',
      analytics: '/admin/analytics',
      settings: '/admin/settings',
    },
  },
  
  // Mobile routes
  mobile: {
    home: '/',
    dashboard: '/dashboard',
    profile: '/profile',
    labs: '/labs',
    actionPlans: '/action-plans',
    insights: '/insights',
    settings: '/settings',
  },
} as const;

// Navigation configuration
export const navigation = {
  main: [
    {
      label: 'Dashboard',
      href: routes.protected.dashboard,
      icon: 'Home',
      description: 'Overview of your health data',
    },
    {
      label: 'Lab Results',
      href: routes.protected.labs,
      icon: 'FileText',
      description: 'View and manage lab results',
    },
    {
      label: 'Action Plans',
      href: routes.protected.actionPlans,
      icon: 'CheckSquare',
      description: 'Track your health goals',
    },
    {
      label: 'Insights',
      href: routes.protected.insights,
      icon: 'TrendingUp',
      description: 'Health insights and recommendations',
    },
    {
      label: 'Profile',
      href: routes.protected.profile,
      icon: 'User',
      description: 'Manage your profile',
    },
  ],
  
  admin: [
    {
      label: 'Admin Dashboard',
      href: routes.protected.admin.dashboard,
      icon: 'Shield',
      description: 'System administration',
    },
    {
      label: 'Users',
      href: routes.protected.admin.users,
      icon: 'Users',
      description: 'Manage users',
    },
    {
      label: 'Systems',
      href: routes.protected.admin.systems,
      icon: 'Settings',
      description: 'System configuration',
    },
    {
      label: 'Analytics',
      href: routes.protected.admin.analytics,
      icon: 'BarChart',
      description: 'System analytics',
    },
  ],
} as const;

// Biomarker configuration
export const biomarkers = {
  glucose: {
    name: 'Glucose',
    unit: 'mg/dL',
    normalRange: { low: 70, high: 100 },
    criticalRange: { low: 40, high: 200 },
  },
  hba1c: {
    name: 'Hemoglobin A1c',
    unit: '%',
    normalRange: { low: 4.0, high: 5.6 },
    criticalRange: { low: 3.0, high: 8.0 },
  },
  totalCholesterol: {
    name: 'Total Cholesterol',
    unit: 'mg/dL',
    normalRange: { low: 0, high: 200 },
    criticalRange: { low: 0, high: 300 },
  },
  ldlCholesterol: {
    name: 'LDL Cholesterol',
    unit: 'mg/dL',
    normalRange: { low: 0, high: 100 },
    criticalRange: { low: 0, high: 190 },
  },
  hdlCholesterol: {
    name: 'HDL Cholesterol',
    unit: 'mg/dL',
    normalRange: { low: 40, high: 1000 },
    criticalRange: { low: 20, high: 1000 },
  },
  triglycerides: {
    name: 'Triglycerides',
    unit: 'mg/dL',
    normalRange: { low: 0, high: 150 },
    criticalRange: { low: 0, high: 500 },
  },
  tsh: {
    name: 'TSH',
    unit: 'mIU/L',
    normalRange: { low: 0.4, high: 4.0 },
    criticalRange: { low: 0.1, high: 10.0 },
  },
  vitaminD: {
    name: 'Vitamin D',
    unit: 'ng/mL',
    normalRange: { low: 30, high: 100 },
    criticalRange: { low: 10, high: 150 },
  },
  hemoglobin: {
    name: 'Hemoglobin',
    unit: 'g/dL',
    normalRange: { low: 12, high: 16 },
    criticalRange: { low: 8, high: 20 },
  },
} as const;

// Priority configuration
export const priorities = {
  urgent: {
    label: 'Urgent',
    value: 'urgent',
    color: 'red',
    order: 1,
  },
  high: {
    label: 'High',
    value: 'high',
    color: 'orange',
    order: 2,
  },
  medium: {
    label: 'Medium',
    value: 'medium',
    color: 'yellow',
    order: 3,
  },
  low: {
    label: 'Low',
    value: 'low',
    color: 'green',
    order: 4,
  },
} as const;

// Status configuration
export const statuses = {
  active: {
    label: 'Active',
    value: 'active',
    color: 'blue',
  },
  completed: {
    label: 'Completed',
    value: 'completed',
    color: 'green',
  },
  paused: {
    label: 'Paused',
    value: 'paused',
    color: 'yellow',
  },
  pending: {
    label: 'Pending',
    value: 'pending',
    color: 'gray',
  },
  processing: {
    label: 'Processing',
    value: 'processing',
    color: 'purple',
  },
  failed: {
    label: 'Failed',
    value: 'failed',
    color: 'red',
  },
} as const;

// Export all configuration
export const config = {
  env,
  apiEndpoints,
  systems,
  featureFlags,
  appConfig,
  routes,
  navigation,
  biomarkers,
  priorities,
  statuses,
} as const;

export default config;
