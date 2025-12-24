import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeIcon } from '.';
import LinearGradient from 'react-native-linear-gradient';
import { Content } from '../../types';
import { COLORS, DIMENSIONS, THEME } from '../../constants';

interface ContentCardProps {
  content: Content;
  onPress?: (content: Content) => void;
  onInfoPress?: (content: Content) => void;
  size?: 'small' | 'medium' | 'large';
  showLock?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onPress,
  onInfoPress,
  size = 'medium',
  showLock = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getSizeDimensions = () => {
    switch (size) {
      case 'small':
        return DIMENSIONS.posterSmall;
      case 'large':
        return {
          width: screenWidth * 0.8,
          height: (screenWidth * 0.8 * 9) / 16, // 16:9 aspect ratio
        };
      default:
        return DIMENSIONS.poster;
    }
  };

  const dimensions = getSizeDimensions();

  const handlePress = () => {
    onPress?.(content);
  };

  const handleInfoPress = (e: any) => {
    e.stopPropagation();
    onInfoPress?.(content);
  };

  const renderOverlay = () => {
    if (!isHovered && size !== 'large') return null;

    return (
      <LinearGradient
        colors={['transparent', COLORS.overlay.heavy]} // Warm charcoal gradient
        style={[
          styles.overlay,
          size === 'large' && styles.overlayLarge,
        ]}
      >
        <View style={styles.contentInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {content.title}
          </Text>
          <View style={styles.metadata}>
            <Text style={styles.metadataText}>
              {content.year || ''} {content.year && content.genre?.[0] ? '•' : ''} {content.genre?.[0] || ''}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.playButton]}
            onPress={handlePress}
          >
            <SafeIcon name="play-arrow" size={20} color={COLORS.cream[50]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.infoButton]}
            onPress={handleInfoPress}
          >
            <SafeIcon name="info-outline" size={20} color={COLORS.cream[50]} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: dimensions.width,
          height: dimensions.height,
        },
      ]}
      onPress={handlePress}
      onPressIn={() => setIsHovered(true)}
      onPressOut={() => setIsHovered(false)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: content.thumbnail_url }}
        style={[
          styles.image,
          {
            width: dimensions.width,
            height: dimensions.height,
          },
        ]}
        resizeMode="cover"
      />

      {/* Lock overlay for unauthenticated users */}
      {showLock && (
        <View style={styles.lockOverlay}>
          <SafeIcon name="lock" size={32} color={COLORS.cream[100]} />
          <Text style={styles.lockText}>Login untuk menonton</Text>
        </View>
      )}

      {renderOverlay()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: COLORS.warmCharcoal[50],
    marginHorizontal: THEME.spacing.xs,
    ...THEME.shadows.small,
  },
  image: {
    borderRadius: THEME.borderRadius.md,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay.medium,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: THEME.borderRadius.md,
  },
  lockText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[100],
    marginTop: THEME.spacing.sm,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md - 4,
    justifyContent: 'flex-end',
  },
  overlayLarge: {
    padding: THEME.spacing.md,
  },
  contentInfo: {
    marginBottom: THEME.spacing.sm,
  },
  title: {
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginBottom: THEME.spacing.xs,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.cream[100],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: THEME.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.cream[50]}20`, // 20 = ~12% opacity
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.cream[50]}30`, // 30 = ~19% opacity
  },
  playButton: {
    backgroundColor: COLORS.accent[500], // Burnt sienna instead of Netflix red
    borderColor: COLORS.accent[500],
  },
  infoButton: {
    backgroundColor: 'transparent',
  },
});

export default ContentCard;