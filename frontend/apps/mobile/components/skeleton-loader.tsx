import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useEffect, useRef } from 'react';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width="70%" height={20} />
        <SkeletonLoader width={60} height={24} borderRadius={12} />
      </View>
      <SkeletonLoader width="40%" height={14} style={{ marginTop: 8 }} />
    </View>
  );
}

export function LabResultSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width="60%" height={18} />
        <SkeletonLoader width={80} height={20} borderRadius={4} />
      </View>
      <SkeletonLoader width="35%" height={12} style={{ marginTop: 8 }} />
    </View>
  );
}

export function ActionPlanSkeleton() {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <SkeletonLoader width={32} height={32} borderRadius={16} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="80%" height={18} style={{ marginBottom: 6 }} />
          <SkeletonLoader width="100%" height={14} />
        </View>
      </View>
      <View style={styles.cardHeader}>
        <SkeletonLoader width={60} height={20} borderRadius={4} />
        <SkeletonLoader width="45%" height={12} />
      </View>
    </View>
  );
}

export function DashboardCardSkeleton() {
  return (
    <View style={styles.dashboardCard}>
      <SkeletonLoader width="60%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="40%" height={28} style={{ marginBottom: 4 }} />
      <SkeletonLoader width="50%" height={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e5e7eb',
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashboardCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

