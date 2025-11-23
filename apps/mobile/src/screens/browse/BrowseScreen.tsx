import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { contentService } from '../../services';
import { Content, RootStackParamList } from '../../types';
import { COLORS } from '../../constants';
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
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={24} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari film, serial, atau genre..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={24} color={COLORS.textSecondary} />
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
            <Icon name="movie" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Tidak ada hasil pencarian' : 'Tidak ada konten tersedia'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  genreContainer: {
    backgroundColor: COLORS.surface,
    paddingBottom: 16,
  },
  genreList: {
    paddingHorizontal: 16,
  },
  genreChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  genreChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genreText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  genreTextActive: {
    color: COLORS.text,
  },
  contentList: {
    padding: 8,
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
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default BrowseScreen;