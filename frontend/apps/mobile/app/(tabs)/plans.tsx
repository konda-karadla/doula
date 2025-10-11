import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState, useCallback, memo } from 'react';
import { useRouter } from 'expo-router';
import { useActionPlans } from '../../hooks/use-action-plans';

// Memoized Action Plan Card Component for better performance
const ActionPlanCard = memo(({ plan, getStatusColor, getStatusIcon, onPress }: any) => (
  <TouchableOpacity 
    style={styles.planCard}
    onPress={onPress}
    accessible={true}
    accessibilityLabel={`Action plan ${plan.title}, status ${plan.status}, ${plan.actionItems?.length || 0} items, updated ${formatDate(plan.updatedAt)}`}
    accessibilityRole="button"
    accessibilityHint="Double tap to view action plan details"
  >
    <View style={styles.planHeader}>
      <Text style={styles.planIcon} accessibilityLabel={`Status icon: ${plan.status}`}>
        {getStatusIcon(plan.status)}
      </Text>
      <View style={styles.planInfo}>
        <Text style={styles.planTitle} accessibilityLabel={`Title: ${plan.title}`}>
          {plan.title}
        </Text>
        <Text style={styles.planDescription} numberOfLines={2} accessibilityLabel={`Description: ${plan.description}`}>
          {plan.description}
        </Text>
      </View>
    </View>
    <View style={styles.planFooter}>
      <View 
        style={[styles.statusBadge, { backgroundColor: getStatusColor(plan.status) }]}
        accessible={true}
        accessibilityLabel={`Status: ${plan.status}`}
      >
        <Text style={styles.statusText}>{plan.status}</Text>
      </View>
      <Text style={styles.planDate} accessibilityLabel={`${plan.actionItems?.length || 0} items, updated ${formatDate(plan.updatedAt)}`}>
        {plan.actionItems?.length || 0} items • Updated {formatDate(plan.updatedAt)}
      </Text>
    </View>
  </TouchableOpacity>
));

export default function ActionPlansScreen() {
  const router = useRouter();
  const { data: actionPlans, isLoading, refetch } = useActionPlans();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return '#667eea';
      case 'completed': return '#10b981';
      case 'paused': return '#f59e0b';
      default: return '#6b7280';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'active': return '🎯';
      case 'completed': return '✅';
      case 'paused': return '⏸️';
      default: return '📋';
    }
  }, []);

  const handlePlanPress = useCallback((planId: string) => {
    router.push(`/plan-detail/${planId}`);
  }, [router]);

  const renderItem = useCallback(({ item }: any) => (
    <ActionPlanCard 
      plan={item} 
      getStatusColor={getStatusColor} 
      getStatusIcon={getStatusIcon}
      onPress={() => handlePlanPress(item.id)}
    />
  ), [getStatusColor, getStatusIcon, handlePlanPress]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const ListHeaderComponent = useCallback(() => (
    <View style={styles.header}>
      <Text style={styles.title}>Action Plans 📋</Text>
      <Text style={styles.subtitle}>Track your health goals</Text>
    </View>
  ), []);

  const ListEmptyComponent = useCallback(() => (
    isLoading ? (
      <View style={styles.loadingContainer} accessible={true} accessibilityLabel="Loading action plans">
        <ActivityIndicator size="large" color="#667eea" accessibilityLabel="Loading" />
        <Text style={styles.loadingText}>Loading action plans...</Text>
      </View>
    ) : (
      <View style={styles.emptyContainer} accessible={true} accessibilityLabel="No action plans yet">
        <Text style={styles.emptyIcon} accessibilityLabel="Clipboard icon">📋</Text>
        <Text style={styles.emptyText}>No Action Plans Yet</Text>
        <Text style={styles.emptySubtext}>
          Create your first action plan to start achieving your health goals
        </Text>
        <TouchableOpacity 
          style={styles.createButton}
          accessible={true}
          accessibilityLabel="Create action plan"
          accessibilityRole="button"
          accessibilityHint="Double tap to create a new action plan"
        >
          <Text style={styles.createText}>Create Action Plan</Text>
        </TouchableOpacity>
      </View>
    )
  ), [isLoading]);

  return (
    <FlatList
      style={styles.container}
      data={actionPlans || []}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={actionPlans && actionPlans.length > 0 ? styles.list : styles.emptyList}
      refreshing={refreshing}
      onRefresh={onRefresh}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  list: {
    padding: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  planCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  planIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  planDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
