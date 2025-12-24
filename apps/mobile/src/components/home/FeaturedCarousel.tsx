import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeIcon } from '../ui';
import { Content } from '../../types';
import { COLORS, THEME, CAROUSEL_AUTO_PLAY_INTERVAL } from '../../constants';

interface FeaturedCarouselProps {
  contents: Content[];
  onPlayPress?: (content: Content) => void;
  onInfoPress?: (content: Content) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAROUSEL_HEIGHT = SCREEN_HEIGHT * 0.70; // 70% of screen height

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  contents,
  onPlayPress,
  onInfoPress,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (!contents || contents.length <= 1) return;

    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change image
        setCurrentIndex((prev) => (prev === contents.length - 1 ? 0 : prev + 1));
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, CAROUSEL_AUTO_PLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [contents, fadeAnim]);

  if (!contents || contents.length === 0) return null;

  const currentContent = contents[currentIndex];

  return (
    <View style={styles.container}>
      {/* Background Image - Use backdrop_url for landscape */}
      <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
        <Image
          source={{ uri: currentContent.backdrop_url || currentContent.thumbnail_url }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Gradient Overlays */}
      <LinearGradient
        colors={[
          'transparent',
          COLORS.overlay.light,
          COLORS.overlay.medium,
          COLORS.warmCharcoal[100],
        ]}
        style={styles.gradientOverlay}
      />

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Pilihan Untuk Anda</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {currentContent.title}
        </Text>

        {/* Metadata */}
        <View style={styles.metadata}>
          {currentContent.year && (
            <Text style={styles.metadataText}>{currentContent.year}</Text>
          )}
          {currentContent.year && currentContent.duration && (
            <Text style={styles.metadataDot}>•</Text>
          )}
          {currentContent.duration && (
            <Text style={styles.metadataText}>{currentContent.duration}</Text>
          )}
          {currentContent.genre && currentContent.genre.length > 0 && (
            <>
              <Text style={styles.metadataDot}>•</Text>
              <Text style={styles.metadataText}>{currentContent.genre[0]}</Text>
            </>
          )}
        </View>

        {/* Description */}
        {currentContent.description && (
          <Text style={styles.description} numberOfLines={3}>
            {currentContent.description}
          </Text>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => onPlayPress?.(currentContent)}
          >
            <LinearGradient
              colors={[COLORS.accent[500], COLORS.accent[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.playButtonGradient}
            >
              <SafeIcon name="play-arrow" size={24} color={COLORS.cream[50]} />
              <Text style={styles.playButtonText}>Tonton Sekarang</Text>
            </LinearGradient>
          </TouchableOpacity>

          {onInfoPress && (
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => onInfoPress(currentContent)}
            >
              <SafeIcon name="info-outline" size={24} color={COLORS.cream[50]} />
              <Text style={styles.infoButtonText}>Info Lebih Lanjut</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Dots */}
        {contents.length > 1 && (
          <View style={styles.dotsContainer}>
            {contents.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    position: 'relative',
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.accent[500]}50`, // 50% opacity
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 2,
    borderColor: `${COLORS.accent[400]}99`, // 60% opacity
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.medium,
  },
  badgeText: {
    fontSize: THEME.typography.fontSize.xs,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.accent[300],
    letterSpacing: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginBottom: THEME.spacing.sm,
    textShadowColor: COLORS.warmCharcoal[500],
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    gap: THEME.spacing.xs,
  },
  metadataText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[100],
    fontWeight: THEME.typography.fontWeight.medium,
  },
  metadataDot: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
  },
  description: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[100],
    lineHeight: THEME.typography.lineHeight.relaxed * THEME.typography.fontSize.sm,
    marginBottom: THEME.spacing.lg,
    opacity: 0.95,
  },
  actions: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  playButton: {
    flex: 1,
    borderRadius: THEME.borderRadius.full,
    overflow: 'hidden',
    ...THEME.shadows.large,
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    gap: THEME.spacing.sm,
  },
  playButtonText: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.cream[50],
  },
  infoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    backgroundColor: `${COLORS.warmCharcoal[50]}CC`, // 80% opacity
    borderRadius: THEME.borderRadius.full,
    borderWidth: 2,
    borderColor: `${COLORS.cream[100]}30`, // 30% opacity
    gap: THEME.spacing.sm,
    ...THEME.shadows.medium,
  },
  infoButtonText: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.cream[50],
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: THEME.spacing.xs,
    marginTop: THEME.spacing.md,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.accent[500],
  },
  dotInactive: {
    width: 6,
    backgroundColor: `${COLORS.cream[100]}30`, // 30% opacity
  },
});

export default FeaturedCarousel;
