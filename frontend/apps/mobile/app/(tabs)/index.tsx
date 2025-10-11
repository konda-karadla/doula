import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard 📊</Text>
        <Text style={styles.subtitle}>Your Health Overview</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Health Score</Text>
        <Text style={styles.cardValue}>82</Text>
        <Text style={styles.cardStatus}>GOOD ↗️</Text>
      </View>

      <View style={styles.grid}>
        <View style={[styles.card, styles.gridItem]}>
          <Text style={styles.cardLabel}>Lab Results</Text>
          <Text style={styles.cardNumber}>12</Text>
        </View>
        <View style={[styles.card, styles.gridItem]}>
          <Text style={styles.cardLabel}>Action Plans</Text>
          <Text style={styles.cardNumber}>5</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Link href="/(tabs)/labs" style={styles.actionButton}>
          <Text style={styles.actionText}>Upload Lab Result →</Text>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#667eea',
  },
  cardStatus: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  gridItem: {
    flex: 1,
    margin: 0,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

