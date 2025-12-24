import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');

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
    queryFn: () => searchQuery ? contentService.searchContent(searchQuery) : { data: [], total: 0 },
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
    queryKey: ['all-content'],
    queryFn: () => contentService.getAllContent({ limit: 50 }),
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
      onPress={() => navigation.navigate('VideoPlayer', { contentId: item.id })}
      onInfoPress={() => navigation.navigate('ContentDetail', { content: item })}
      size="small"
    />
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.warmCharcoal[100]} />
      <View style={styles.container}>
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

      {/* Genre Filter */}
      {!searchQuery && renderGenreFilter()}

      {/* Content Grid */}
      <FlatList
        data={displayContent}
        numColumns={3}
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
  searchContainer: {
    padding: THEME.spacing.lg,
    backgroundColor: COLORS.warmCharcoal[50],
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.warmCharcoal[50]}80`,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmCharcoal[100],
    borderRadius: THEME.borderRadius.full,
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
    backgroundColor: COLORS.warmCharcoal[50],
    paddingBottom: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.warmCharcoal[50]}80`,
  },
  genreList: {
    paddingHorizontal: THEME.spacing.lg,
  },
  genreChip: {
    backgroundColor: COLORS.warmCharcoal[100],
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.full,
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
    padding: THEME.spacing.sm,
  },
  contentRow: {
    justifyContent: 'space-between',
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