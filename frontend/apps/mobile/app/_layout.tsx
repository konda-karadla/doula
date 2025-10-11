import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryProvider } from '../lib/providers/query-provider';
import { useAuthInit } from '../hooks/use-auth-init';

export default function RootLayout() {
  // Initialize auth from secure storage
  useAuthInit();

  return (
    <QueryProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </QueryProvider>
  );
}

