import * as SecureStore from 'expo-secure-store';

// Storage keys
const KEYS = {
  ACCESS_TOKEN: 'health_platform_access_token',
  REFRESH_TOKEN: 'health_platform_refresh_token',
  USER: 'health_platform_user',
} as const;

/**
 * Token Storage Service using Expo Secure Store
 * Provides secure storage for authentication tokens on mobile devices
 */
export const tokenStorage = {
  // Access Token
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  async setAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('Error setting access token:', error);
    }
  },

  async deleteAccessToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error deleting access token:', error);
    }
  },

  // Refresh Token
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  },

  async deleteRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error deleting refresh token:', error);
    }
  },

  // User Data
  async getUser(): Promise<any | null> {
    try {
      const userStr = await SecureStore.getItemAsync(KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async setUser(user: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  async deleteUser(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(KEYS.USER);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  },

  // Clear all tokens
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        this.deleteAccessToken(),
        this.deleteRefreshToken(),
        this.deleteUser(),
      ]);
    } catch (error) {
      console.error('Error clearing all tokens:', error);
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  },
};

