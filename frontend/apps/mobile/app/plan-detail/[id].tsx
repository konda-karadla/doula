import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useActionPlan } from '../../hooks/use-action-plans';
import { haptic } from '../../lib/haptics/haptic-feedback';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: plan, isLoading } = useActionPlan(id);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Action Plan</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading action plan...</Text>
        </View>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Action Plan</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Action plan not found</Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#667eea';
      case 'completed': return '#10b981';
      case 'paused': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🎯';
      case 'completed': return '✅';
      case 'paused': return '⏸️';
      default: return '📋';
    }
  };

  const getItemStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'pending': return '⭕';
      default: return '○';
    }
  };

  const completedItems = plan.actionItems?.filter(item => item.status === 'completed').length || 0;
  const totalItems = plan.actionItems?.length || 0;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleToggleItem = (itemId: string, currentStatus: string) => {
    haptic.light();
    // TODO: Implement toggle item completion
    console.log('Toggle item:', itemId, currentStatus);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Action Plan</Text>
      </View>

      {/* Plan Info Card */}
      <View style={styles.card}>
        <View style={styles.planHeader}>
          <Text style={styles.planIcon}>{getStatusIcon(plan.status)}</Text>
          <View style={styles.planTitleContainer}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(plan.status) }]}>
              <Text style={styles.statusText}>{plan.status}</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.description}>{plan.description}</Text>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedItems} of {totalItems} items completed
          </Text>
        </View>

        {/* Metadata */}
        <View style={styles.metaSection}>
          {plan.priority && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Priority:</Text>
              <Text style={[styles.metaValue, { color: getPriorityColor(plan.priority) }]}>
                {plan.priority.toUpperCase()}
              </Text>
            </View>
          )}
          {plan.targetDate && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Target Date:</Text>
              <Text style={styles.metaValue}>{formatDate(plan.targetDate)}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Last Updated:</Text>
            <Text style={styles.metaValue}>{formatDate(plan.updatedAt)}</Text>
          </View>
        </View>
      </View>

      {/* Action Items */}
      <Text style={styles.sectionTitle}>Action Items ({totalItems})</Text>
      {plan.actionItems && plan.actionItems.length > 0 ? (
        plan.actionItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemCard}
            onPress={() => handleToggleItem(item.id, item.status)}
            accessible={true}
            accessibilityLabel={`Action item ${index + 1}, ${item.title}, status ${item.status}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to toggle completion"
          >
            <View style={styles.itemHeader}>
              <Text style={styles.itemIcon}>{getItemStatusIcon(item.status)}</Text>
              <View style={styles.itemContent}>
                <Text style={[
                  styles.itemTitle,
                  item.status === 'completed' && styles.itemTitleCompleted
                ]}>
                  {item.title}
                </Text>
                {item.description && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.noItemsText}>No action items yet</Text>
        </View>
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.shareButton} onPress={() => haptic.light()}>
          <Text style={styles.shareButtonText}>📤 Share Action Plan</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#6b7280';
  }
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  backText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
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
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  planTitleContainer: {
    flex: 1,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 20,
  },
  progressSection: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#6b7280',
  },
  metaSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  itemCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  noItemsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  bottomActions: {
    padding: 20,
  },
  shareButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

