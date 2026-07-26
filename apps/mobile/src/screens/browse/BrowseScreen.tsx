import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { SafeIcon } from '../../components/ui';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { contentService } from '../../services';
import { Content, RootStackParamList } from '../../types';
import { COLORS, THEME } from '../../constants';
import ContentCard from '../../components/ui/ContentCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const BrowseScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'MOVIE' | 'SERIES'>('ALL');
  const gridGap = THEME.spacing.sm;
  const gridPadding = 18;
  const columnCount = width >= 900 ? 5 : width >= 700 ? 4 : width >= 520 ? 3 : 2;
  const availableGridWidth = width - (gridPadding * 2) - (gridGap * (columnCount - 1));
  const cardWidth = Math.max(108, Math.floor(availableGridWidth / columnCount));
  const cardDimensions = {
    width: cardWidth,
    height: Math.round(cardWidth * 1.48),
  };

  const genres = [
    'Semua',
    'Action',
    'Drama',
    'Comedy',
    'Horror',
    'Thriller',
    'Romance',
    'Sci-Fi',
    'Indonesian',
    'Animation',
  ];

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => searchQuery
      ? contentService.searchContent(searchQuery)
      : Promise.resolve({ data: [], total: 0, page: 1, totalPages: 0 }),
    enabled: searchQuery.length > 2,
  });

  const { data: genreContent, isLoading: genreLoading } = useQuery({
    queryKey: ['genre-content', selectedGenre],
    queryFn: () => selectedGenre && selectedGenre !== 'Semua'
      ? contentService.getContentByGenre(selectedGenre)
      : Promise.resolve([]),
    enabled: selectedGenre !== '' && selectedGenre !== 'Semua',
  });

  const { data: allContent, isLoading: allLoading } = useQuery({
    queryKey: ['all-content', selectedType],
    queryFn: () => contentService.getAllContent({
      limit: 50,
      type: selectedType === 'ALL' ? undefined : selectedType,
    }),
    enabled: !searchQuery && (!selectedGenre || selectedGenre === 'Semua'),
  });

  const displayContent = searchQuery && searchQuery.length > 2
    ? searchResults?.data || []
    : selectedGenre && selectedGenre !== 'Semua'
    ? genreContent || []
    : allContent?.data || [];

  const isLoading = searchQuery && searchQuery.length > 2
    ? searchLoading
    : selectedGenre && selectedGenre !== 'Semua'
    ? genreLoading
    : allLoading;

  const renderGenreFilter = () => (
    <View style={styles.genreContainer}>
      <FlatList
        data={genres}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.genreList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.genreChip,
              selectedGenre === item && styles.genreChipActive,
            ]}
            onPress={() => setSelectedGenre(item === selectedGenre ? '' : item)}
          >
            <Text
              style={[
                styles.genreText,
                selectedGenre === item && styles.genreTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderContentItem = ({ item }: { item: Content }) => (
    <ContentCard
      content={item}
      onPress={() => navigation.navigate('ContentDetail', { content: item })}
      onInfoPress={() => navigation.navigate('ContentDetail', { content: item })}
      size="small"
      dimensions={cardDimensions}
    />
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.warmCharcoal[100]} />
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Jelajah</Text>
            <Text style={styles.pageSubtitle}>Temukan film dan serial pilihan untuk Anda.</Text>
          </View>
          <Text style={styles.resultCount}>{displayContent.length} tayangan</Text>
        </View>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <SafeIcon name="search" size={24} color={COLORS.cream[200]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari film, serial, atau genre..."
              placeholderTextColor={COLORS.cream[200]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <SafeIcon name="close" size={24} color={COLORS.cream[200]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.typeTabs}>
          {([
            ['ALL', 'Semua'],
            ['MOVIE', 'Film'],
            ['SERIES', 'Serial'],
          ] as const).map(([value, label]) => (
            <TouchableOpacity
              key={value}
              style={[styles.typeTab, selectedType === value && styles.typeTabActive]}
              onPress={() => setSelectedType(value)}
            >
              <Text style={[styles.typeTabText, selectedType === value && styles.typeTabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      {/* Genre Filter */}
      {!searchQuery && renderGenreFilter()}

      {/* Content Grid */}
      <FlatList
        data={displayContent}
        key={`browse-grid-${columnCount}`}
        numColumns={columnCount}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentList}
        columnWrapperStyle={styles.contentRow}
        renderItem={renderContentItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <SafeIcon name="movie" size={64} color={COLORS.cream[200]} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Tidak ada hasil pencarian' : 'Tidak ada konten tersedia'}
            </Text>
          </View>
        )}
        ListHeaderComponent={
          displayContent.length > 0 ? (
            <View style={styles.collectionHeader}>
              <Text style={styles.collectionTitle}>
                {searchQuery.length > 2
                  ? 'Hasil pencarian'
                  : selectedType === 'MOVIE'
                  ? 'Koleksi film'
                  : selectedType === 'SERIES'
                  ? 'Koleksi serial'
                  : 'Semua tayangan'}
              </Text>
              <Text style={styles.collectionCount}>{displayContent.length}</Text>
            </View>
          ) : null
        }
      />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCharcoal[100],
  },
  pageHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  pageTitle: { color: COLORS.cream[50], fontSize: 31, fontWeight: '800', marginTop: 3 },
  pageSubtitle: { color: COLORS.cream[200], fontSize: 11, marginTop: 3 },
  resultCount: { color: COLORS.cream[200], fontSize: 11, marginBottom: 5 },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: 12,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm + 2,
    borderWidth: 1,
    borderColor: `${COLORS.cream[200]}20`,
  },
  searchInput: {
    flex: 1,
    marginLeft: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[50],
  },
  genreContainer: {
    paddingTop: 12,
    paddingBottom: 14,
  },
  typeTabs: {
    flexDirection: 'row',
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    padding: 4,
    borderRadius: 10,
    backgroundColor: COLORS.warmCharcoal[50],
  },
  typeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
    borderRadius: 7,
  },
  typeTabActive: {
    backgroundColor: COLORS.accent[500],
  },
  typeTabText: {
    color: COLORS.cream[200],
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  typeTabTextActive: {
    color: COLORS.cream[50],
  },
  genreList: {
    paddingHorizontal: THEME.spacing.lg,
  },
  genreChip: {
    backgroundColor: COLORS.warmCharcoal[50],
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    borderRadius: 9,
    marginRight: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: `${COLORS.cream[200]}40`,
  },
  genreChipActive: {
    backgroundColor: COLORS.accent[500],
    borderColor: COLORS.accent[500],
  },
  genreText: {
    color: COLORS.cream[200],
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  genreTextActive: {
    color: COLORS.cream[50],
    fontWeight: THEME.typography.fontWeight.bold,
  },
  contentList: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 100,
  },
  contentRow: {
    gap: THEME.spacing.sm,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  collectionHeader: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  collectionTitle: {
    color: COLORS.cream[50],
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  collectionCount: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    overflow: 'hidden',
    textAlign: 'center',
    color: COLORS.accent[300],
    backgroundColor: `${COLORS.accent[500]}20`,
    fontSize: THEME.typography.fontSize.xs,
    fontWeight: THEME.typography.fontWeight.bold,
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
    textAlign: 'center',
  },
});

export default BrowseScreen;
