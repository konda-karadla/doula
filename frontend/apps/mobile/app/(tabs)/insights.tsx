import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { insightsService } from '../../lib/api/services';

export default function HealthInsightsScreen() {
  const { data: summary, isLoading, refetch } = useQuery({
    queryKey: ['insights', 'summary'],
    queryFn: () => insightsService.getSummary(),
    staleTime: 5 * 60 * 1000,
  });
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📌';
      case 'low': return 'ℹ️';
      default: return '•';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'normal': return '🟢';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Health Insights 💡</Text>
        <Text style={styles.subtitle}>AI-powered health analysis</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Analyzing your health data...</Text>
        </View>
      ) : summary ? (
        <>
          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{summary.totalInsights}</Text>
              <Text style={styles.summaryLabel}>Total Insights</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#fef2f2' }]}>
              <Text style={[styles.summaryNumber, { color: '#ef4444' }]}>{summary.criticalCount}</Text>
              <Text style={styles.summaryLabel}>Critical</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#fffbeb' }]}>
              <Text style={[styles.summaryNumber, { color: '#f59e0b' }]}>{summary.highPriorityCount}</Text>
              <Text style={styles.summaryLabel}>High Priority</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#f0fdf4' }]}>
              <Text style={[styles.summaryNumber, { color: '#10b981' }]}>{summary.normalCount}</Text>
              <Text style={styles.summaryLabel}>Normal</Text>
            </View>
          </View>

          {/* Insights List */}
          {summary.insights && summary.insights.length > 0 ? (
            <View style={styles.insightsList}>
              <Text style={styles.sectionTitle}>Recent Insights</Text>
              {summary.insights.map((insight) => (
                <View key={insight.id} style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <Text style={styles.typeIcon}>{getTypeIcon(insight.type)}</Text>
                    <View style={styles.insightInfo}>
                      <Text style={styles.insightBiomarker}>{insight.testName}</Text>
                      <Text style={styles.insightValue}>Current: {insight.currentValue}</Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(insight.priority) }]}>
                      <Text style={styles.priorityText}>
                        {getPriorityIcon(insight.priority)} {insight.priority}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.insightMessage}>{insight.message}</Text>
                  <View style={styles.recommendationBox}>
                    <Text style={styles.recommendationLabel}>💊 Recommendation:</Text>
                    <Text style={styles.recommendationText}>{insight.recommendation}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No insights available yet</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💡</Text>
          <Text style={styles.emptyTitle}>No Health Insights Yet</Text>
          <Text style={styles.emptySubtext}>
            Upload lab results to get AI-powered insights about your health
          </Text>
        </View>
      )}
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
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  insightsList: {
    padding: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  insightCard: {
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
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightInfo: {
    flex: 1,
  },
  insightBiomarker: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  insightMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  recommendationBox: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  recommendationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptySection: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

