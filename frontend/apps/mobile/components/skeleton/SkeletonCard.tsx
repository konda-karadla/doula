import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';

/**
 * Skeleton card component for loading states
 */
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonLoader width={120} height={16} style={styles.title} />
      <SkeletonLoader width="100%" height={48} style={styles.value} />
      <SkeletonLoader width={200} height={14} style={styles.meta} />
    </View>
  );
}

/**
 * Skeleton list item component
 */
export function SkeletonListItem() {
  return (
    <View style={styles.listItem}>
      <View style={styles.listHeader}>
        <SkeletonLoader width="60%" height={16} />
        <SkeletonLoader width={80} height={24} borderRadius={4} />
      </View>
      <SkeletonLoader width="40%" height={12} style={styles.date} />
    </View>
  );
}

/**
 * Skeleton grid item component
 */
export function SkeletonGridItem() {
  return (
    <View style={styles.gridItem}>
      <SkeletonLoader width={80} height={12} style={styles.label} />
      <SkeletonLoader width={60} height={32} />
    </View>
  );
}

const styles = StyleSheet.create({
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
  title: {
    marginBottom: 8,
  },
  value: {
    marginBottom: 8,
  },
  meta: {
    marginTop: 4,
  },
  listItem: {
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
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    marginTop: 4,
  },
  gridItem: {
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
  label: {
    marginBottom: 8,
  },
});

