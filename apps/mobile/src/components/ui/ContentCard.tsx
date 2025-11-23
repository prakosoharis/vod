import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Content } from '../../types';
import { COLORS, DIMENSIONS } from '../../constants';

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
        colors={['transparent', 'rgba(0,0,0,0.8)']}
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
            <Icon name="play-arrow" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.infoButton]}
            onPress={handleInfoPress}
          >
            <Icon name="info-outline" size={20} color={COLORS.text} />
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

      {/* Lock overlay */}
      {showLock && (
        <View style={styles.lockOverlay}>
          <Icon name="lock" size={24} color={COLORS.textSecondary} />
        </View>
      )}

      {renderOverlay()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    marginHorizontal: 4,
  },
  image: {
    borderRadius: 8,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'flex-end',
  },
  overlayLarge: {
    padding: 16,
  },
  contentInfo: {
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  infoButton: {
    backgroundColor: 'transparent',
  },
});

export default ContentCard;