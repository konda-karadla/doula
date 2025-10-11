import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '../../stores/auth';
import { useHealthScore } from '../../hooks/use-health-score';
import { useProfileStats } from '../../hooks/use-profile-stats';
import { AnimatedCard } from '../../components/animated';
import { SkeletonCard, SkeletonGridItem } from '../../components/skeleton';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { data: healthScore, isLoading: scoreLoading, refetch: refetchScore } = useHealthScore();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useProfileStats();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchScore(), refetchStats()]);
    setRefreshing(false);
  };

  const isLoading = scoreLoading || statsLoading;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard 📊</Text>
        <Text style={styles.subtitle}>Welcome back, {user?.username || 'User'}!</Text>
      </View>

      {/* Health Score Card */}
      {isLoading ? (
        <SkeletonCard />
      ) : healthScore ? (
        <AnimatedCard delay={0} style={styles.card}>
          <Text style={styles.cardTitle}>Health Score</Text>
          <Text style={styles.cardValue}>{healthScore.overall}</Text>
          <Text style={[styles.cardStatus, getStatusColor(healthScore.overallStatus)]}>
            {healthScore.overallStatus.toUpperCase()} {getTrendIcon(healthScore.trend)}
          </Text>
          <Text style={styles.cardMeta}>
            {healthScore.totalBiomarkers} biomarkers analyzed • Updated {formatDate(healthScore.lastUpdated)}
          </Text>
        </AnimatedCard>
      ) : (
        <AnimatedCard delay={0} style={styles.card}>
          <Text style={styles.emptyText}>No health score data available</Text>
          <Text style={styles.emptySubtext}>Upload lab results to get your health score</Text>
        </AnimatedCard>
      )}

      {/* Stats Grid */}
      {isLoading ? (
        <>
          <View style={styles.grid}>
            <SkeletonGridItem />
            <SkeletonGridItem />
          </View>
          <View style={styles.grid}>
            <SkeletonGridItem />
            <SkeletonGridItem />
          </View>
        </>
      ) : (
        <>
          <View style={styles.grid}>
            <AnimatedCard delay={100} style={styles.gridCard}>
              <Text style={styles.cardLabel}>Lab Results</Text>
              <Text style={styles.cardNumber}>{stats?.totalLabResults || 0}</Text>
            </AnimatedCard>
            <AnimatedCard delay={150} style={styles.gridCard}>
              <Text style={styles.cardLabel}>Action Plans</Text>
              <Text style={styles.cardNumber}>{stats?.totalActionPlans || 0}</Text>
            </AnimatedCard>
          </View>

          <View style={styles.grid}>
            <AnimatedCard delay={200} style={styles.gridCard}>
              <Text style={styles.cardLabel}>Completed</Text>
              <Text style={styles.cardNumber}>{stats?.completedActionItems || 0}</Text>
            </AnimatedCard>
            <AnimatedCard delay={250} style={styles.gridCard}>
              <Text style={styles.cardLabel}>Pending</Text>
              <Text style={styles.cardNumber}>{stats?.pendingActionItems || 0}</Text>
            </AnimatedCard>
          </View>
        </>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Link href="/(tabs)/labs" style={styles.actionButton}>
          <Text style={styles.actionText}>View Lab Results →</Text>
        </Link>
        <Link href="/(tabs)/plans" style={[styles.actionButton, styles.actionButtonSecondary]}>
          <Text style={styles.actionTextSecondary}>Manage Action Plans →</Text>
        </Link>
      </View>
    </ScrollView>
  );
}

// Helper functions
function getStatusColor(status: string) {
  switch (status) {
    case 'excellent': return styles.statusExcellent;
    case 'good': return styles.statusGood;
    case 'fair': return styles.statusFair;
    case 'poor': return styles.statusPoor;
    default: return styles.statusGood;
  }
}

function getTrendIcon(trend?: string) {
  switch (trend) {
    case 'improving': return '↗️';
    case 'stable': return '→';
    case 'declining': return '↘️';
    default: return '';
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    marginBottom: 12,
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
    marginBottom: 4,
  },
  cardStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusExcellent: { color: '#10b981' },
  statusGood: { color: '#10b981' },
  statusFair: { color: '#f59e0b' },
  statusPoor: { color: '#ef4444' },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    margin: 0,
  },
  gridCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  section: {
    padding: 20,
    paddingTop: 8,
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
    marginBottom: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  actionTextSecondary: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

