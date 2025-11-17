import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Button from './Button';

export interface LoadingProps {
  visible?: boolean;
  loading?: boolean;
  text?: string;
  size?: 'small' | 'large';
  color?: string;
  backgroundColor?: string;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  overlay?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  visible = false,
  loading = false,
  text = 'Loading...',
  size = 'large',
  color = '#007AFF',
  backgroundColor = 'rgba(0, 0, 0, 0.7)',
  textStyle,
  containerStyle,
  overlay = false,
}) => {
  const LoadingContent = () => (
    <View style={[styles.loadingContainer, containerStyle]}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={[styles.loadingText, textStyle]}>{text}</Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <Modal
        transparent={true}
        visible={visible || loading}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={[styles.overlay, { backgroundColor }]}>
          <LoadingContent />
        </View>
      </Modal>
    );
  }

  if (visible || loading) {
    return <LoadingContent />;
  }

  return null;
};

export const LoadingSpinner: React.FC<{
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}> = ({ size = 'small', color = '#007AFF', style }) => {
  return (
    <ActivityIndicator
      size={size}
      color={color}
      style={[styles.spinner, style]}
    />
  );
};

export const LoadingMore: React.FC<{
  loading?: boolean;
  text?: string;
}> = ({ loading = false, text = 'Loading more...' }) => {
  if (!loading) return null;

  return (
    <View style={styles.loadingMore}>
      <LoadingSpinner size="small" />
      <Text style={styles.loadingMoreText}>{text}</Text>
    </View>
  );
};

export const EmptyState: React.FC<{
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
}> = ({
  title = 'No Data',
  subtitle = 'There is no data to display',
  icon,
  action,
}) => {
  return (
    <View style={styles.emptyState}>
      {icon || <Text style={styles.emptyIcon}>📭</Text>}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      {action && (
        <View style={styles.emptyAction}>
          <Button
            title={action.label}
            onPress={action.onPress}
            variant="outline"
          />
        </View>
      )}
    </View>
  );
};

export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({
  title = 'Something went wrong',
  message = 'Please try again later',
  onRetry,
}) => {
  return (
    <View style={styles.errorState}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <View style={styles.errorAction}>
          <Button
            title="Try Again"
            onPress={onRetry}
            variant="outline"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  spinner: {
    padding: 8,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#666',
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyAction: {
    minWidth: 150,
  },

  // Error State
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc3545',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorAction: {
    minWidth: 150,
  },
});

export default Loading;