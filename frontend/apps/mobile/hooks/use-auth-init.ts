import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth';
import { tokenStorage } from '../lib/storage/token-storage';

/**
 * Auth Initialization Hook
 * Restores authentication state from secure storage on app launch
 * Should be called once in the root layout or main app component
 */
export function useAuthInit() {
  const { setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        setLoading(true);

        // Try to load tokens and user from secure storage
        const [accessToken, refreshToken, user] = await Promise.all([
          tokenStorage.getAccessToken(),
          tokenStorage.getRefreshToken(),
          tokenStorage.getUser(),
        ]);

        if (isMounted && accessToken && refreshToken && user) {
          // Restore authentication state
          setAuth(user, accessToken, refreshToken);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupted data
        await tokenStorage.clearAll();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);
}

