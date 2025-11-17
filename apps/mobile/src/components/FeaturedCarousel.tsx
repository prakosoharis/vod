import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { Content, RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from './';

export interface FeaturedCarouselProps {
  contents: Content[];
  onInfoClick?: (content: Content) => void;
  autoPlayInterval?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const ITEM_WIDTH = screenWidth;

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  contents,
  onInfoClick,
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollRef = React.useRef<ScrollView>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || contents.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === contents.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, contents.length, autoPlayInterval]);

  // Auto scroll to current index
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        x: currentIndex * ITEM_WIDTH,
        animated: true,
      });
    }
  }, [currentIndex]);

  const handleInfoPress = (content: Content) => {
    if (onInfoClick) {
      onInfoClick(content);
    } else {
      // Navigate to video player
      navigation.navigate('VideoPlayer', {
        videoId: content.id,
        title: content.title,
      });
    }
  };

  const handlePlayPress = (content: Content) => {
    navigation.navigate('VideoPlayer', {
      videoId: content.id,
      title: content.title,
    });
  };

  const onMomentumScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / ITEM_WIDTH);
    setCurrentIndex(index);
    setIsAutoPlaying(false); // Stop auto-play when user scrolls
  };

  const renderIndicator = (index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.indicator,
        index === currentIndex ? styles.activeIndicator : styles.inactiveIndicator,
      ]}
      onPress={() => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
      }}
    />
  );

  if (!contents || contents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No featured content available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={styles.carousel}
      >
        {contents.map((content) => (
          <View key={content.id} style={[styles.slide, { width: ITEM_WIDTH }]}>
            <Image
              source={{ uri: content.backdrop_url || content.thumbnail_url }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
            <View style={styles.overlay} />

            {/* Content Info */}
            <View style={styles.contentInfo}>
              <Text style={styles.title} numberOfLines={2}>
                {content.title}
              </Text>

              {content.description && (
                <Text style={styles.description} numberOfLines={3}>
                  {content.description}
                </Text>
              )}

              <View style={styles.metadata}>
                {content.year && <Text style={styles.metadataText}>{content.year}</Text>}
                {content.rating && (
                  <>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.metadataText}>⭐ {content.rating}</Text>
                  </>
                )}
                {content.duration && (
                  <>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.metadataText}>{content.duration}</Text>
                  </>
                )}
                <Text style={styles.separator}>•</Text>
                <Text style={styles.metadataText}>{content.type}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <Button
                  title="▶ Play"
                  onPress={() => handlePlayPress(content)}
                  variant="primary"
                  size="large"
                  style={styles.playButton}
                />
                <Button
                  title="ℹ More Info"
                  onPress={() => handleInfoPress(content)}
                  variant="secondary"
                  size="large"
                  style={styles.infoButton}
                />
              </View>

              {/* Genre Tags */}
              {content.genre && content.genre.length > 0 && (
                <View style={styles.genres}>
                  {content.genre.slice(0, 3).map((genre, index) => (
                    <View key={index} style={styles.genreTag}>
                      <Text style={styles.genreText}>{genre}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dots Indicator */}
      <View style={styles.indicatorContainer}>
        {contents.map((_, index) => renderIndicator(index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 500,
    marginBottom: 20,
  },
  carousel: {
    flex: 1,
  },
  slide: {
    height: '100%',
    justifyContent: 'flex-end',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  contentInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#e5e5e5',
    marginBottom: 12,
    lineHeight: 20,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  metadataText: {
    fontSize: 14,
    color: '#ccc',
  },
  separator: {
    fontSize: 14,
    color: '#ccc',
    marginHorizontal: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  playButton: {
    flex: 2,
  },
  infoButton: {
    flex: 1,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  genreText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeIndicator: {
    backgroundColor: '#dc2626',
    width: 24,
  },
  inactiveIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});

export default FeaturedCarousel;