import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useState, useCallback, memo, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useLabResults } from '../../hooks/use-lab-results';
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
    <Text style={styles.title}>Lab Results 🔬</Text>
    <Text style={styles.subtitle}>Your lab history</Text>
    
    {/* Search Bar */}
    <View style={styles.searchContainer}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by file name or status..."
        placeholderTextColor="#9ca3af"
        value={searchQuery}
        onChangeText={onSearchChange}
        accessible={true}
        accessibilityLabel="Search lab results"
        accessibilityHint="Type to filter lab results by file name or status"
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

// Memoized Lab Card Component for better performance
const LabCard = memo(({ lab, getStatusColor, getStatusIcon, onPress }: any) => (
  <TouchableOpacity 
    style={styles.labCard}
    onPress={onPress}
    accessible={true}
    accessibilityLabel={`Lab result ${lab.fileName}, status ${lab.processingStatus}, uploaded ${formatDate(lab.uploadedAt)}`}
    accessibilityRole="button"
    accessibilityHint="Double tap to view lab result details"
  >
    <View style={styles.labHeader}>
      <Text style={styles.labFileName} accessibilityLabel={`File name: ${lab.fileName}`}>
        {lab.fileName}
      </Text>
      <View 
        style={[styles.statusBadge, { backgroundColor: getStatusColor(lab.processingStatus) }]}
        accessible={true}
        accessibilityLabel={`Status: ${lab.processingStatus}`}
      >
        <Text style={styles.statusText}>
          {getStatusIcon(lab.processingStatus)} {lab.processingStatus}
        </Text>
      </View>
    </View>
    <Text style={styles.labDate} accessibilityLabel={`Uploaded ${formatDate(lab.uploadedAt)}`}>
      Uploaded {formatDate(lab.uploadedAt)}
    </Text>
  </TouchableOpacity>
));

export default function LabResultsScreen() {
  const router = useRouter();
  const { data: labResults, isLoading, refetch } = useLabResults();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Filter lab results based on search query
  const filteredLabResults = useMemo(() => {
    if (!labResults) return [];
    if (!searchQuery.trim()) return labResults;
    
    const query = searchQuery.toLowerCase();
    return labResults.filter(lab => 
      lab.fileName.toLowerCase().includes(query) ||
      lab.processingStatus.toLowerCase().includes(query)
    );
  }, [labResults, searchQuery]);

  // Stable callbacks for search
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'processing': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'processing': return '⟳';
      case 'failed': return '✗';
      default: return '○';
    }
  }, []);

  const handleLabPress = useCallback((labId: string) => {
    router.push(`/lab-detail/${labId}`);
  }, [router]);

  const renderItem = useCallback(({ item, index }: any) => (
    <AnimatedListItem index={index}>
      <LabCard 
        lab={item} 
        getStatusColor={getStatusColor} 
        getStatusIcon={getStatusIcon}
        onPress={() => handleLabPress(item.id)}
      />
    </AnimatedListItem>
  ), [getStatusColor, getStatusIcon, handleLabPress]);

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
        message={`No lab results match "${searchQuery}". Try adjusting your search.`}
        icon="🔍"
      />
    ) : (
      <EmptyState
        title="No Lab Results Yet"
        message="Upload your first lab result to start tracking your health"
        icon="📄"
        actionText="Upload Lab Result"
        onAction={() => {
          // TODO: Implement upload functionality
          console.log('Upload lab result');
        }}
      />
    )
  ), [isLoading, searchQuery]);

  return (
    <FlatList
      style={styles.container}
      data={filteredLabResults}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          resultCount={filteredLabResults.length}
        />
      }
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={filteredLabResults.length > 0 ? styles.list : styles.emptyList}
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
  labCard: {
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
  labHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labFileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
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
  labDate: {
    fontSize: 12,
    color: '#6b7280',
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
  uploadButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
