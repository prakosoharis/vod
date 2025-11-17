import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { Content, LiveStream, RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface ContentRowProps {
  title: string;
  contents: Content[];
  onContentPress?: (content: Content) => void;
  loading?: boolean;
  horizontal?: boolean;
  numColumns?: number;
}

interface LiveStreamRowProps {
  title: string;
  streams: LiveStream[];
  onStreamPress?: (stream: LiveStream) => void;
  loading?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = 120;
const CARD_HEIGHT = 180;
const HORIZONTAL_SPACING = 12;

const ContentCard: React.FC<{
  content: Content;
  onPress: (content: Content) => void;
  index: number;
}> = ({ content, onPress, index }) => {
  return (
    <TouchableOpacity
      style={[styles.contentCard, { marginLeft: index === 0 ? 16 : 0 }]}
      onPress={() => onPress(content)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: content.thumbnail_url }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.contentOverlay}>
        <Text style={styles.contentType}>{content.type}</Text>
      </View>
      <Text style={styles.contentTitle} numberOfLines={2}>
        {content.title}
      </Text>
      {content.rating && (
        <Text style={styles.contentRating}>⭐ {content.rating}</Text>
      )}
    </TouchableOpacity>
  );
};

const LiveStreamCard: React.FC<{
  stream: LiveStream;
  onPress: (stream: LiveStream) => void;
  index: number;
}> = ({ stream, onPress, index }) => {
  return (
    <TouchableOpacity
      style={[styles.liveStreamCard, { marginLeft: index === 0 ? 16 : 0 }]}
      onPress={() => onPress(stream)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: stream.thumbnail_url }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.liveBadge}>
        <Text style={styles.liveText}>LIVE</Text>
      </View>
      <View style={styles.viewerCount}>
        <Text style={styles.viewerText}>{stream.viewer_count} 👁</Text>
      </View>
      <Text style={styles.contentTitle} numberOfLines={2}>
        {stream.title}
      </Text>
      <Text style={styles.streamCategory}>{stream.category}</Text>
    </TouchableOpacity>
  );
};

const LoadingCard: React.FC<{ index: number }> = ({ index }) => (
  <View style={[styles.loadingCard, { marginLeft: index === 0 ? 16 : 0 }]}>
    <View style={[styles.thumbnail, styles.skeleton]} />
    <View style={[styles.titleSkeleton, styles.skeleton]} />
    <View style={[styles.ratingSkeleton, styles.skeleton]} />
  </View>
);

const ContentRow: React.FC<ContentRowProps> = ({
  title,
  contents,
  onContentPress,
  loading = false,
  horizontal = true,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleContentPress = (content: Content) => {
    if (onContentPress) {
      onContentPress(content);
    } else {
      navigation.navigate('VideoPlayer', {
        videoId: content.id,
        title: content.title,
      });
    }
  };

  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 6 }, (_, index) => (
        <LoadingCard key={`loading-${index}`} index={index} />
      ));
    }

    if (!contents || contents.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No content available</Text>
        </View>
      );
    }

    return contents.map((content, idx) => (
      <ContentCard
        key={content.id}
        content={content}
        onPress={handleContentPress}
        index={idx}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {horizontal ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalContent}
          overScrollMode="never"
        >
          {renderContent()}
        </ScrollView>
      ) : (
        <View style={styles.gridContent}>{renderContent()}</View>
      )}
    </View>
  );
};

export const LiveStreamRow: React.FC<LiveStreamRowProps> = ({
  title,
  streams,
  onStreamPress,
  loading = false,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleStreamPress = (stream: LiveStream) => {
    if (onStreamPress) {
      onStreamPress(stream);
    } else {
      navigation.navigate('LivePlayer', {
        streamId: stream.id,
        title: stream.title,
      });
    }
  };

  const renderStreams = () => {
    if (loading) {
      return Array.from({ length: 6 }, (_, index) => (
        <LoadingCard key={`loading-${index}`} index={index} />
      ));
    }

    if (!streams || streams.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No live streams available</Text>
        </View>
      );
    }

    return streams.map((stream, idx) => (
      <LiveStreamCard
        key={stream.id}
        stream={stream}
        onPress={handleStreamPress}
        index={idx}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalContent}
        overScrollMode="never"
      >
        {renderStreams()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  horizontalContent: {
    paddingLeft: 0,
    paddingRight: 16,
  },
  gridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },

  // Content Card Styles
  contentCard: {
    width: CARD_WIDTH,
    marginRight: HORIZONTAL_SPACING,
  },
  liveStreamCard: {
    width: CARD_WIDTH,
    marginRight: HORIZONTAL_SPACING,
  },
  thumbnail: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  contentOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  contentType: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginTop: 8,
    lineHeight: 18,
  },
  contentRating: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },

  // Live Stream Specific Styles
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewerCount: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  viewerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  streamCategory: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },

  // Loading States
  loadingCard: {
    width: CARD_WIDTH,
    marginRight: HORIZONTAL_SPACING,
  },
  skeleton: {
    backgroundColor: '#333',
  },
  titleSkeleton: {
    height: 16,
    marginTop: 8,
    borderRadius: 4,
  },
  ratingSkeleton: {
    height: 12,
    marginTop: 4,
    borderRadius: 4,
    width: 60,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
});

export default ContentRow;