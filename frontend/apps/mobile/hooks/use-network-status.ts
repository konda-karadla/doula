import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useOfflineStore } from '../stores/offline';

/**
 * Hook to monitor network connectivity
 * Updates offline store when connection changes
 */
export function useNetworkStatus() {
  const { isOnline, setOnline } = useOfflineStore();

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      
      if (online !== isOnline) {
        setOnline(online);
        console.log(`📶 Network status: ${online ? 'ONLINE' : 'OFFLINE'}`);
      }
    });

    // Get initial state
    NetInfo.fetch().then((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setOnline(online);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline };
}

