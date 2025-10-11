import Constants from 'expo-constants';

/**
 * Environment Configuration
 * Uses expo-constants to read from app.json extra field
 * Supports different environments (development, staging, production)
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
 * Get environment configuration from expo-constants
 * Falls back to defaults if not configured
 */
function getEnvConfig(): EnvConfig {
  const extra = Constants.expoConfig?.extra || {};
  
  // Determine environment
  const environment: Environment = extra.environment || 'development';
  
  // Get your computer's IP for development
  // In production, this would be your actual API domain
  const defaultApiUrl = 'http://192.168.1.165:3002';
  
  return {
    API_BASE_URL: extra.apiUrl || defaultApiUrl,
    API_TIMEOUT: extra.apiTimeout || 30000,
    ENVIRONMENT: environment,
    ENABLE_DEBUG: extra.enableDebug ?? (environment === 'development'),
    ENABLE_OFFLINE_MODE: extra.enableOfflineMode ?? true,
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

