import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
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

type FilterType = 'ALL' | 'LIVE' | 'SCHEDULED' | 'ENDED';

const LiveEventsScreen: React.FC<Props> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all broadcasts
  const { data: broadcasts, isLoading } = useQuery({
    queryKey: ['broadcasts'],
    queryFn: () => broadcastService.getBroadcasts(),
    refetchInterval: 15000,
    refetchOnMount: true,
  });

  // Filter broadcasts
  const filteredBroadcasts = broadcasts?.filter((b) => {
    const matchesFilter = activeFilter === 'ALL' || b.status === activeFilter;
    const matchesSearch =
      !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  }) || [];

  const liveBroadcasts = broadcasts?.filter((b) => b.status === 'LIVE') || [];
  const scheduledBroadcasts = broadcasts?.filter((b) => b.status === 'SCHEDULED') || [];
  const endedBroadcasts = broadcasts?.filter((b) => b.status === 'ENDED') || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE':
        return (
          <View style={styles.statusBadgeLive}>
            <View style={styles.liveIndicator} />
            <Text style={styles.statusBadgeTextLive}>LIVE</Text>
          </View>
        );
      case 'SCHEDULED':
        return (
          <View style={styles.statusBadgeScheduled}>
            <SafeIcon name="schedule" size={12} color={COLORS.yellow[400]} />
            <Text style={styles.statusBadgeTextScheduled}>SCHEDULED</Text>
          </View>
        );
      case 'ENDED':
        return (
          <View style={styles.statusBadgeEnded}>
            <Text style={styles.statusBadgeTextEnded}>ENDED</Text>
          </View>
        );
      default:
        return null;
    }
  };

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderBroadcastItem = ({ item }: { item: BroadcastEvent }) => (
    <TouchableOpacity
      style={styles.broadcastItem}
      onPress={() => navigation.navigate('LiveStream', { broadcastId: item.id })}
      activeOpacity={0.7}
    >
      {/* Category Color Bar */}
      <View style={[styles.categoryBar, { backgroundColor: getCategoryColor(item.category) }]} />

      {(item.thumbnail_url || item.backdrop_url) && (
        <Image
          source={{ uri: item.thumbnail_url || item.backdrop_url }}
          style={styles.broadcastImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.broadcastContent}>
        <View style={styles.broadcastHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(item.category) }]}>
            <SafeIcon name="live-tv" size={18} color={COLORS.cream[50]} />
          </View>
          <View style={styles.statusContainer}>
            {getStatusBadge(item.status)}
          </View>
        </View>

        <Text style={styles.broadcastTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.broadcastMeta}>
          <View style={styles.metaItem}>
            <SafeIcon name="tag" size={14} color={COLORS.cream[200]} />
            <Text style={styles.metaText}>{item.category}</Text>
          </View>
          {item.status === 'LIVE' && item.viewer_count > 0 && (
            <View style={styles.metaItem}>
              <SafeIcon name="visibility" size={14} color={COLORS.cream[200]} />
              <Text style={styles.metaText}>{item.viewer_count} viewers</Text>
            </View>
          )}
        </View>

        {item.description && (
          <Text style={styles.broadcastDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.scheduleInfo}>
          <View style={styles.scheduleItem}>
            <SafeIcon name="event" size={12} color={COLORS.cream[200]} />
            <Text style={styles.scheduleText}>{formatDate(item.scheduled_time)}</Text>
          </View>
          <View style={styles.scheduleItem}>
            <SafeIcon name="access-time" size={12} color={COLORS.cream[200]} />
            <Text style={styles.scheduleText}>{formatTime(item.scheduled_time)}</Text>
          </View>
        </View>
      </View>

      {item.status === 'LIVE' && (
        <View style={styles.liveArrow}>
          <SafeIcon name="chevron-right" size={20} color={COLORS.accent[400]} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: FilterType, label: string) => (
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <SafeIcon name="arrow-back" size={24} color={COLORS.cream[50]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Live Events</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statDotLive} />
            <Text style={styles.statText}>
              <Text style={styles.statValueLive}>{liveBroadcasts.length}</Text> Live Now
            </Text>
          </View>
          <View style={styles.statItem}>
            <SafeIcon name="event" size={14} color={COLORS.yellow[400]} />
            <Text style={styles.statText}>
              <Text style={styles.statValueScheduled}>{scheduledBroadcasts.length}</Text> Upcoming
            </Text>
          </View>
          <View style={styles.statItem}>
            <SafeIcon name="video-library" size={14} color={COLORS.cream[200]} />
            <Text style={styles.statText}>
              <Text style={styles.statValue}>{endedBroadcasts.length}</Text> Completed
            </Text>
          </View>
        </View>

        {/* Search & Filter */}
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchInputContainer}>
            <SafeIcon name="search" size={20} color={COLORS.cream[200]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari broadcast..."
              placeholderTextColor={COLORS.cream[200]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <SafeIcon name="close" size={20} color={COLORS.cream[200]} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
            contentContainerStyle={styles.filtersContent}
          >
            {renderFilterButton('ALL', 'Semua')}
            {renderFilterButton('LIVE', 'Live')}
            {renderFilterButton('SCHEDULED', 'Akan Datang')}
            {renderFilterButton('ENDED', 'Selesai')}
          </ScrollView>
        </View>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner fullScreen />
        ) : filteredBroadcasts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SafeIcon name="filter-list" size={64} color={COLORS.cream[200]} />
            <Text style={styles.emptyTitle}>Tidak ada broadcast ditemukan</Text>
            <Text style={styles.emptyText}>Coba ubah filter atau kata kunci pencarian</Text>
          </View>
        ) : (
          <FlatList
            data={filteredBroadcasts}
            keyExtractor={(item) => item.id}
            renderItem={renderBroadcastItem}
            contentContainerStyle={styles.listContent}
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warmCharcoal[50],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    flex: 1,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
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
  statValue: {
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  searchFilterContainer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: `${COLORS.cream[200]}20`,
  },
  searchInput: {
    flex: 1,
    marginLeft: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[50],
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filtersContent: {
    gap: THEME.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: COLORS.warmCharcoal[50],
    borderWidth: 1,
    borderColor: `${COLORS.cream[200]}20`,
  },
  filterButtonActive: {
    backgroundColor: COLORS.cream[50],
  },
  filterButtonText: {
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.medium,
    color: COLORS.cream[200],
  },
  filterButtonTextActive: {
    color: COLORS.warmCharcoal[100],
  },
  listContent: {
    padding: THEME.spacing.lg,
  },
  broadcastItem: {
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${COLORS.cream[200]}10`,
  },
  categoryBar: {
    height: 3,
    width: '100%',
  },
  broadcastImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.warmCharcoal[100],
  },
  broadcastContent: {
    padding: THEME.spacing.md,
  },
  broadcastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.red[500]}20`,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: `${COLORS.red[500]}40`,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.red[500],
    marginRight: 4,
  },
  statusBadgeTextLive: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.red[400],
    fontWeight: THEME.typography.fontWeight.bold,
  },
  statusBadgeScheduled: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.yellow[500]}20`,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: `${COLORS.yellow[500]}40`,
  },
  statusBadgeTextScheduled: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.yellow[400],
    fontWeight: THEME.typography.fontWeight.semibold,
    marginLeft: 4,
  },
  statusBadgeEnded: {
    backgroundColor: `${COLORS.gray[500]}20`,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: `${COLORS.gray[500]}40`,
  },
  statusBadgeTextEnded: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.gray[500],
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  broadcastTitle: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.cream[50],
    marginBottom: THEME.spacing.xs,
  },
  broadcastMeta: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.cream[200],
    marginLeft: 4,
  },
  broadcastDescription: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    marginBottom: THEME.spacing.sm,
  },
  scheduleInfo: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.cream[200],
    marginLeft: 4,
  },
  liveArrow: {
    position: 'absolute',
    right: THEME.spacing.md,
    top: '50%',
    marginTop: -10,
  },
  separator: {
    height: THEME.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xxl,
  },
  emptyTitle: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.sm,
  },
  emptyText: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[200],
    textAlign: 'center',
  },
});

export default LiveEventsScreen;
