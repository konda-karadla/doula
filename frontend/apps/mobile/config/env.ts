import {
  API_BASE_URL,
  API_TIMEOUT,
  NODE_ENV,
  ENABLE_OFFLINE_MODE,
  ENABLE_DEBUG_MODE,
} from '@env';

/**
 * Environment Configuration
 * Uses react-native-dotenv to read from .env.local
 * Values are injected at build time via Babel
 * 
 * To change values:
 * 1. Update .env.local
 * 2. Restart Metro bundler (npm run start:clean)
 */

type Environment = 'development' | 'staging' | 'production';

interface EnvConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  ENVIRONMENT: Environment;
  ENABLE_DEBUG: boolean;
  ENABLE_OFFLINE_MODE: boolean;
}

/**
 * Get environment configuration from .env.local
 * Falls back to safe defaults if not configured
 */
function getEnvConfig(): EnvConfig {
  const apiUrl = API_BASE_URL || 'http://localhost:3002';
  const apiTimeout = parseInt(API_TIMEOUT || '30000', 10);
  const environment = (NODE_ENV || 'development') as Environment;
  const enableDebug = ENABLE_DEBUG_MODE === 'true' || environment === 'development';
  const enableOfflineMode = ENABLE_OFFLINE_MODE === 'true' || true;

  return {
    API_BASE_URL: apiUrl,
    API_TIMEOUT: apiTimeout,
    ENVIRONMENT: environment,
    ENABLE_DEBUG: enableDebug,
    ENABLE_OFFLINE_MODE: enableOfflineMode,
  };
}

// Export the configuration
export const env = getEnvConfig();

// Helper to check environment
export const isDevelopment = env.ENVIRONMENT === 'development';
export const isStaging = env.ENVIRONMENT === 'staging';
export const isProduction = env.ENVIRONMENT === 'production';

// Log configuration in development
if (isDevelopment && env.ENABLE_DEBUG) {
  console.log('🔧 Environment Configuration:');
  console.log('  Environment:', env.ENVIRONMENT);
  console.log('  API URL:', env.API_BASE_URL);
  console.log('  API Timeout:', env.API_TIMEOUT);
  console.log('  Debug Mode:', env.ENABLE_DEBUG);
  console.log('  Offline Mode:', env.ENABLE_OFFLINE_MODE);
}
