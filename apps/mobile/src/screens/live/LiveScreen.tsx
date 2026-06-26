import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeIcon } from '../../components/ui';
import { broadcastService, BroadcastEvent } from '../../services';
import { COLORS, THEME } from '../../constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const LiveScreen: React.FC<Props> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LIVE' | 'SCHEDULED'>('ALL');

  // Fetch all broadcasts
  const { data: broadcasts, isLoading } = useQuery({
    queryKey: ['broadcasts'],
    queryFn: () => broadcastService.getBroadcasts(),
  });

  // Filter broadcasts
  const filteredBroadcasts = broadcasts?.filter((b) => {
    return activeFilter === 'ALL' || b.status === activeFilter;
  }) || [];

  const liveBroadcasts = broadcasts?.filter((b) => b.status === 'LIVE') || [];
  const scheduledBroadcasts = broadcasts?.filter((b) => b.status === 'SCHEDULED') || [];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Sports: COLORS.blue[500],
      Music: COLORS.purple[500],
      Education: COLORS.green[500],
      Gaming: COLORS.orange[500],
      Entertainment: COLORS.pink[500],
      Talk: COLORS.teal[500],
    };
    return colors[category] || COLORS.gray[500];
  };

  const formatViewerCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const renderBroadcastItem = ({ item }: { item: BroadcastEvent }) => (
    <TouchableOpacity
      style={styles.streamItem}
      onPress={() => {
        if (item.status === 'LIVE') {
          navigation.navigate('LiveStream', { broadcastId: item.id });
        } else {
          navigation.navigate('LiveEvents');
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.thumbnail_url || 'https://picsum.photos/400/225' }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {item.status === 'LIVE' && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        )}
        {item.status === 'SCHEDULED' && (
          <View style={styles.scheduledBadge}>
            <SafeIcon name="schedule" size={12} color={COLORS.yellow[400]} />
            <Text style={styles.scheduledBadgeText}>SCHEDULED</Text>
          </View>
        )}
        {item.status === 'LIVE' && item.viewer_count > 0 && (
          <View style={styles.viewerCount}>
            <SafeIcon name="visibility" size={12} color={COLORS.cream[50]} />
            <Text style={styles.viewerCountText}>{formatViewerCount(item.viewer_count)}</Text>
          </View>
        )}
        <View style={[styles.categoryBar, { backgroundColor: getCategoryColor(item.category) }]} />
      </View>
      <View style={styles.streamInfo}>
        <Text style={styles.streamTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.streamDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.metadata}>
          <View style={[styles.categoryTag, { backgroundColor: `${getCategoryColor(item.category)}30` }]}>
            <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
              {item.category}
            </Text>
          </View>
          {item.status === 'LIVE' && (
            <View style={styles.liveNowIndicator}>
              <SafeIcon name="fiber-manual-record" size={8} color={COLORS.red[500]} />
              <Text style={styles.liveNowText}>Sedang berlangsung</Text>
            </View>
          )}
        </View>
      </View>
      <SafeIcon name="chevron-right" size={24} color={COLORS.cream[200]} style={{ marginLeft: THEME.spacing.sm }} />
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: 'ALL' | 'LIVE' | 'SCHEDULED', label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.warmCharcoal[100]} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Live Streaming</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('LiveEvents')}
          >
            <Text style={styles.seeAllText}>Lihat Semua</Text>
            <SafeIcon name="chevron-right" size={18} color={COLORS.accent[500]} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {(liveBroadcasts.length > 0 || scheduledBroadcasts.length > 0) && (
          <View style={styles.statsContainer}>
            {liveBroadcasts.length > 0 && (
              <View style={styles.statItem}>
                <View style={styles.statDotLive} />
                <Text style={styles.statText}>
                  <Text style={styles.statValueLive}>{liveBroadcasts.length}</Text> Live Now
                </Text>
              </View>
            )}
            {scheduledBroadcasts.length > 0 && (
              <View style={styles.statItem}>
                <SafeIcon name="event" size={14} color={COLORS.yellow[400]} />
                <Text style={styles.statText}>
                  <Text style={styles.statValueScheduled}>{scheduledBroadcasts.length}</Text> Upcoming
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {renderFilterButton('ALL', 'Semua')}
          {renderFilterButton('LIVE', 'Live')}
          {renderFilterButton('SCHEDULED', 'Jadwal')}
        </View>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner fullScreen />
        ) : filteredBroadcasts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SafeIcon name="live-tv" size={64} color={COLORS.cream[200]} />
            <Text style={styles.emptyText}>Tidak ada live streaming tersedia</Text>
          </View>
        ) : (
          <FlatList
            data={filteredBroadcasts}
            keyExtractor={(item) => item.id}
            renderItem={renderBroadcastItem}
            contentContainerStyle={styles.streamList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCharcoal[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.accent[500],
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    gap: THEME.spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDotLive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red[500],
    marginRight: THEME.spacing.xs,
  },
  statText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
  },
  statValueLive: {
    color: COLORS.red[400],
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  statValueScheduled: {
    color: COLORS.yellow[400],
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    gap: THEME.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: COLORS.warmCharcoal[50],
    borderWidth: 1,
    borderColor: `${COLORS.cream[200]}20`,
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent[500],
    borderColor: COLORS.accent[500],
  },
  filterButtonText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    fontWeight: THEME.typography.fontWeight.medium,
  },
  filterButtonTextActive: {
    color: COLORS.cream[50],
  },
  streamList: {
    padding: THEME.spacing.lg,
  },
  streamItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${COLORS.cream[200]}10`,
  },
  thumbnailContainer: {
    width: 140,
    height: 100,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: THEME.spacing.sm,
    left: THEME.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.red[500]}90`,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.cream[50],
    marginRight: 4,
  },
  liveBadgeText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.cream[50],
    fontWeight: THEME.typography.fontWeight.bold,
  },
  scheduledBadge: {
    position: 'absolute',
    top: THEME.spacing.sm,
    left: THEME.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.yellow[500]}20`,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: `${COLORS.yellow[500]}40`,
  },
  scheduledBadgeText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.yellow[400],
    fontWeight: THEME.typography.fontWeight.semibold,
    marginLeft: 4,
  },
  viewerCount: {
    position: 'absolute',
    bottom: THEME.spacing.sm,
    right: THEME.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: THEME.spacing.xs,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
  },
  viewerCountText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.cream[50],
    marginLeft: 4,
  },
  categoryBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  streamInfo: {
    flex: 1,
    padding: THEME.spacing.md,
    justifyContent: 'center',
  },
  streamTitle: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.cream[50],
    marginBottom: THEME.spacing.xs,
  },
  streamDescription: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    marginBottom: THEME.spacing.sm,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  categoryTag: {
    paddingHorizontal: THEME.spacing.xs,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
  },
  categoryText: {
    fontSize: THEME.typography.fontSize.xs,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  liveNowIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveNowText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.red[400],
    marginLeft: 4,
  },
  separator: {
    height: THEME.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: COLORS.cream[200],
    fontSize: THEME.typography.fontSize.md,
    marginTop: THEME.spacing.lg,
  },
});

export default LiveScreen;