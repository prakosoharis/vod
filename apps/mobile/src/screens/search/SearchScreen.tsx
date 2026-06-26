import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { SafeIcon } from '../../components/ui';
import { contentService } from '../../services';
import { Content, RootStackParamList } from '../../types';
import { COLORS, THEME } from '../../constants';
import ContentCard from '../../components/ui/ContentCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setDebouncedQuery(searchQuery.trim());
      } else {
        setDebouncedQuery('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search query
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => contentService.searchContent(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const handleContentPress = (content: Content) => {
    navigation.navigate('ContentDetail', { content });
  };

  const renderContentItem = ({ item }: { item: Content }) => (
    <View style={styles.contentItem}>
      <ContentCard
        content={item}
        onPress={() => handleContentPress(item)}
        size="medium"
      />
    </View>
  );

  const renderEmptyState = () => {
    if (debouncedQuery.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <SafeIcon name="search" size={64} color={COLORS.cream[200]} />
          <Text style={styles.emptyTitle}>Cari konten</Text>
          <Text style={styles.emptyText}>
            Ketik judul film, acara TV, atau genre yang Anda cari
          </Text>
        </View>
      );
    }

    if (!isLoading && searchResults?.data.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <SafeIcon name="search-off" size={64} color={COLORS.cream[200]} />
          <Text style={styles.emptyTitle}>Tidak ditemukan</Text>
          <Text style={styles.emptyText}>
            Tidak ada hasil untuk "{debouncedQuery}"
          </Text>
          <Text style={styles.suggestionText}>
            Coba kata kunci lain atau periksa ejaan Anda
          </Text>
        </View>
      );
    }

    return null;
  };

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

          <View style={styles.searchContainer}>
            <SafeIcon name="search" size={20} color={COLORS.cream[200]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari film, acara TV..."
              placeholderTextColor={COLORS.cream[200]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <SafeIcon name="close" size={20} color={COLORS.cream[200]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
            <Text style={styles.loadingText}>Mencari "{debouncedQuery}"...</Text>
          </View>
        ) : searchResults && searchResults.data.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              Hasil pencarian untuk "{debouncedQuery}"
            </Text>
            <Text style={styles.resultsCount}>
              {searchResults.data.length} hasil ditemukan
            </Text>

            <FlatList
              data={searchResults.data}
              renderItem={renderContentItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.listContent}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          renderEmptyState()
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
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warmCharcoal[50],
    gap: THEME.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: `${COLORS.cream[200]}20`,
    gap: THEME.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[50],
  },
  resultsContainer: {
    flex: 1,
    paddingTop: THEME.spacing.lg,
  },
  resultsTitle: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.xs,
  },
  resultsCount: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  listContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  contentItem: {
    flex: 1,
    marginHorizontal: THEME.spacing.xs / 2,
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
    marginBottom: THEME.spacing.xs,
  },
  suggestionText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    textAlign: 'center',
    marginTop: THEME.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: THEME.spacing.lg,
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[200],
  },
});

export default SearchScreen;
