import { View, Text, StyleSheet } from 'react-native';
import { useOfflineStore } from '../stores/offline';

/**
 * Offline Indicator Banner
 * Shows at top of screen when device is offline
 */
export function OfflineIndicator() {
  const { isOnline } = useOfflineStore();

  if (isOnline) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>📵 Offline Mode</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f59e0b',
    padding: 8,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

