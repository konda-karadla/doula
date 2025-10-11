import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useState, useCallback, memo, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useActionPlans } from '../../hooks/use-action-plans';
import { AnimatedListItem } from '../../components/animated';
import { SkeletonListItem } from '../../components/skeleton';
import { EmptyState } from '../../components/error';

// Separate memoized header component to prevent TextInput remounting
const SearchHeader = memo(({ 
  searchQuery, 
  onSearchChange, 
  onClearSearch, 
  resultCount 
}: { 
  searchQuery: string; 
  onSearchChange: (text: string) => void; 
  onClearSearch: () => void;
  resultCount: number;
}) => (
  <View style={styles.header}>
    <Text style={styles.title}>Action Plans 📋</Text>
    <Text style={styles.subtitle}>Track your health goals</Text>
    
    {/* Search Bar */}
    <View style={styles.searchContainer}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by title, status, or description..."
        placeholderTextColor="#9ca3af"
        value={searchQuery}
        onChangeText={onSearchChange}
        accessible={true}
        accessibilityLabel="Search action plans"
        accessibilityHint="Type to filter action plans by title, status, or description"
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity 
          onPress={onClearSearch}
          style={styles.clearButton}
          accessible={true}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
    
    {/* Results count */}
    {searchQuery.trim().length > 0 && (
      <Text style={styles.resultsCount}>
        {resultCount} result{resultCount !== 1 ? 's' : ''} found
      </Text>
    )}
  </View>
));

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
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Filter action plans based on search query
  const filteredActionPlans = useMemo(() => {
    if (!actionPlans) return [];
    if (!searchQuery.trim()) return actionPlans;
    
    const query = searchQuery.toLowerCase();
    return actionPlans.filter(plan => 
      plan.title.toLowerCase().includes(query) ||
      plan.status.toLowerCase().includes(query) ||
      plan.description?.toLowerCase().includes(query)
    );
  }, [actionPlans, searchQuery]);

  // Stable callbacks for search
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

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

  const renderItem = useCallback(({ item, index }: any) => (
    <AnimatedListItem index={index}>
      <ActionPlanCard 
        plan={item} 
        getStatusColor={getStatusColor} 
        getStatusIcon={getStatusIcon}
        onPress={() => handlePlanPress(item.id)}
      />
    </AnimatedListItem>
  ), [getStatusColor, getStatusIcon, handlePlanPress]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const ListEmptyComponent = useCallback(() => (
    isLoading ? (
      <View style={styles.list}>
        <SkeletonListItem />
        <SkeletonListItem />
        <SkeletonListItem />
        <SkeletonListItem />
        <SkeletonListItem />
      </View>
    ) : searchQuery.trim().length > 0 ? (
      <EmptyState
        title="No Results Found"
        message={`No action plans match "${searchQuery}". Try adjusting your search.`}
        icon="🔍"
      />
    ) : (
      <EmptyState
        title="No Action Plans Yet"
        message="Create your first action plan to start achieving your health goals"
        icon="📋"
        actionText="Create Action Plan"
        onAction={() => {
          // TODO: Implement create functionality
          console.log('Create action plan');
        }}
      />
    )
  ), [isLoading, searchQuery]);

  return (
    <FlatList
      style={styles.container}
      data={filteredActionPlans}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          resultCount={filteredActionPlans.length}
        />
      }
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={filteredActionPlans.length > 0 ? styles.list : styles.emptyList}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearIcon: {
    fontSize: 16,
    color: '#6b7280',
  },
  resultsCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
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
