import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
// Test importing from shared packages
import type { User } from '@health-platform/types';

export default function App() {
  // Test that TypeScript recognizes the shared type
  const testUser: User = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    role: 'user',
    systemId: 'sys_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Health Platform Mobile</Text>
      <Text style={styles.subtitle}>✅ Expo initialized</Text>
      <Text style={styles.subtitle}>✅ Monorepo setup complete</Text>
      <Text style={styles.subtitle}>✅ Shared types working</Text>
      <Text style={styles.info}>User: {testUser.username}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#2e7d32',
  },
  info: {
    fontSize: 14,
    marginTop: 20,
    color: '#666',
  },
});
