import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../../types';
import { COLORS, DIMENSIONS } from '../../constants';
import ContentCard from '../../components/ui/ContentCard';

type Props = NativeStackScreenProps<RootStackParamList, 'ContentDetail'>;

const ContentDetailScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { content } = route.params;
  const { width } = Dimensions.get('window');

  const handlePlayPress = () => {
    navigation.navigate('VideoPlayer', { contentId: content.id });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Backdrop/Poster */}
      <View style={styles.backdropContainer}>
        <ContentCard
          content={content}
          onPress={handlePlayPress}
          size="large"
        />
      </View>

      {/* Content Info */}
      <View style={styles.contentInfo}>
        <Text style={styles.title}>{content.title}</Text>

        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            {content.year} • {content.genre.join(' • ')} • {content.duration}
          </Text>
          {content.rating && (
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color={COLORS.primary} />
              <Text style={styles.rating}>{content.rating}/10</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPress}>
            <Icon name="play-arrow" size={24} color={COLORS.text} />
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoButton}>
            <Icon name="info-outline" size={24} color={COLORS.text} />
            <Text style={styles.infoButtonText}>More Info</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.description}>{content.description || 'No description available'}</Text>
        </View>

        {/* Cast */}
        {content.cast && content.cast.length > 0 && (
          <View style={styles.castSection}>
            <Text style={styles.sectionTitle}>Cast</Text>
            {content.cast.map((actor, index) => (
              <Text key={index} style={styles.castText}>
                {actor.name} as {actor.role}
              </Text>
            ))}
          </View>
        )}

        {/* Video Info */}
        <View style={styles.videoInfoSection}>
          <Text style={styles.sectionTitle}>Video Information</Text>
          {content.video_url ? (
            <Text style={styles.videoAvailableText}>✓ Video available</Text>
          ) : (
            <Text style={styles.videoNotAvailableText}>✗ Video not available</Text>
          )}
          {content.trailer_url && (
            <Text style={styles.trailerText}>✓ Trailer available</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backdropContainer: {
    marginBottom: 24,
  },
  contentInfo: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  metadata: {
    marginBottom: 24,
  },
  metadataText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  playButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  infoButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  descriptionSection: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  castSection: {
    marginBottom: 32,
  },
  castText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  videoInfoSection: {
    marginBottom: 32,
  },
  videoAvailableText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 4,
  },
  videoNotAvailableText: {
    fontSize: 16,
    color: '#FF4444',
    marginBottom: 4,
  },
  trailerText: {
    fontSize: 16,
    color: COLORS.primary,
  },
});

export default ContentDetailScreen;