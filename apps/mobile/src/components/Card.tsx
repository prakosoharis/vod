import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Button from './Button';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  title?: string;
  subtitle?: string;
  elevation?: number;
  padding?: number;
  margin?: number;
  borderRadius?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  contentStyle,
  title,
  subtitle,
  elevation = 2,
  padding = 16,
  margin = 0,
  borderRadius = 8,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: '#fff',
      borderRadius,
      margin,
      padding,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation,
    };

    return baseStyle;
  };

  const CardComponent = (
    <View style={[getCardStyle(), style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}

      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={style as ViewStyle}
      >
        {CardComponent}
      </TouchableOpacity>
    );
  }

  return CardComponent;
};

// Specialized card components
export const ContentCard: React.FC<{
  content: any;
  onPress?: (content: any) => void;
  style?: ViewStyle;
}> = ({ content, onPress, style }) => {
  return (
    <Card
      onPress={() => onPress?.(content)}
      style={StyleSheet.flatten([styles.contentCard, style])}
      padding={0}
    >
      <View style={styles.thumbnailPlaceholder}>
        <Text style={styles.contentType}>{content.type}</Text>
      </View>
      <View style={styles.contentInfo}>
        <Text style={styles.contentTitle} numberOfLines={2}>
          {content.title}
        </Text>
        {content.duration && (
          <Text style={styles.contentDuration}>{content.duration}</Text>
        )}
        {content.rating && (
          <Text style={styles.contentRating}>⭐ {content.rating}</Text>
        )}
      </View>
    </Card>
  );
};

export const LiveStreamCard: React.FC<{
  stream: any;
  onPress?: (stream: any) => void;
  style?: ViewStyle;
}> = ({ stream, onPress, style }) => {
  return (
    <Card
      onPress={() => onPress?.(stream)}
      style={StyleSheet.flatten([styles.contentCard, style])}
      padding={0}
    >
      <View style={styles.liveThumbnailPlaceholder}>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.viewerCount}>{stream.viewer_count} viewers</Text>
      </View>
      <View style={styles.contentInfo}>
        <Text style={styles.contentTitle} numberOfLines={2}>
          {stream.title}
        </Text>
        <Text style={styles.streamCategory}>{stream.category}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
  },

  // Content Card Styles
  contentCard: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  thumbnailPlaceholder: {
    height: 200,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentType: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentInfo: {
    padding: 12,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  contentDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contentRating: {
    fontSize: 14,
    color: '#666',
  },

  // Live Stream Card Styles
  liveThumbnailPlaceholder: {
    height: 200,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  liveBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  liveText: {
    color: '#dc3545',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewerCount: {
    color: '#fff',
    fontSize: 14,
  },
  streamCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default Card;