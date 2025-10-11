import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { haptic } from '../../lib/haptics/haptic-feedback';

interface ErrorStateProps {
  readonly title?: string;
  readonly message?: string;
  readonly icon?: string;
  readonly onRetry?: () => void;
  readonly retryText?: string;
}

/**
 * Error state component with retry button
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading your data. Please try again.',
  icon = '⚠️',
  onRetry,
  retryText = 'Try Again',
}: ErrorStateProps) {
  const handleRetry = () => {
    haptic.medium();
    onRetry?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          accessible={true}
          accessibilityLabel={retryText}
          accessibilityRole="button"
        >
          <Text style={styles.retryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Empty state component
 */
interface EmptyStateProps {
  readonly title: string;
  readonly message: string;
  readonly icon?: string;
  readonly actionText?: string;
  readonly onAction?: () => void;
}

export function EmptyState({
  title,
  message,
  icon = '📭',
  actionText,
  onAction,
}: EmptyStateProps) {
  const handleAction = () => {
    haptic.light();
    onAction?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionText && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAction}
          accessible={true}
          accessibilityLabel={actionText}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Offline state component
 */
interface OfflineStateProps {
  readonly onRetry?: () => void;
}

export function OfflineState({ onRetry }: OfflineStateProps) {
  return (
    <ErrorState
      title="You're Offline"
      message="Check your internet connection and try again."
      icon="📡"
      onRetry={onRetry}
      retryText="Retry"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

