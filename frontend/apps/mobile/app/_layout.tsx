import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryProvider } from '../lib/providers/query-provider';
import { useAuthInit } from '../hooks/use-auth-init';
import { useSettingsInit } from '../hooks/use-settings-init';
import { useNetworkStatus } from '../hooks/use-network-status';
import { OfflineIndicator } from '../components/offline-indicator';
import { ErrorBoundary } from '../components/error-boundary';

export default function RootLayout() {
  // Initialize auth from secure storage
  useAuthInit();
  
  // Initialize settings from AsyncStorage
  useSettingsInit();
  
  // Monitor network status
  useNetworkStatus();

  return (
    <ErrorBoundary>
      <QueryProvider>
        <OfflineIndicator />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </QueryProvider>
    </ErrorBoundary>
  );
}

