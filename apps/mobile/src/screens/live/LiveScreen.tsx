import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const LiveScreen: React.FC = () => {
  // Mock data for live streams
  const liveStreams = [
    {
      id: '1',
      title: 'Live Streaming Concert',
      description: 'Watch amazing concert live',
      thumbnail_url: 'https://picsum.photos/400/225',
      is_live: true,
      viewer_count: 1234,
    },
    {
      id: '2',
      title: 'Sports Event',
      description: 'Live sports coverage',
      thumbnail_url: 'https://picsum.photos/400/225',
      is_live: true,
      viewer_count: 5678,
    },
  ];

  const renderLiveStreamItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.streamItem}
      onPress={() => console.log('Navigate to live stream:', item.id)}
    >
      <View style={styles.thumbnailContainer}>
        <Text style={styles.liveBadge}>LIVE</Text>
        <View style={styles.viewerCount}>
          <Icon name="visibility" size={14} color={COLORS.text} />
          <Text style={styles.viewerCountText}>{item.viewer_count}</Text>
        </View>
      </View>
      <Text style={styles.streamTitle}>{item.title}</Text>
      <Text style={styles.streamDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Streaming</Text>
      </View>

      {liveStreams.length > 0 ? (
        <FlatList
          data={liveStreams}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.streamList}
          renderItem={renderLiveStreamItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="live-tv" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Tidak ada live streaming tersedia</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textSecondary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  streamList: {
    padding: 16,
  },
  streamItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    height: 200,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.error,
    color: COLORS.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewerCount: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewerCountText: {
    color: COLORS.text,
    fontSize: 12,
    marginLeft: 4,
  },
  streamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: 12,
    paddingTop: 16,
  },
  streamDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
});

export default LiveScreen;