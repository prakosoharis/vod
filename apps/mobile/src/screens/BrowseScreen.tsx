import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';

const BrowseScreen = () => {
  const categories = ['Live Streams', 'Videos', 'Sports', 'Entertainment', 'News'];
  const browseContent = [
    { id: '1', title: 'Content 1', category: 'Live Streams' },
    { id: '2', title: 'Content 2', category: 'Videos' },
    { id: '3', title: 'Content 3', category: 'Sports' },
    { id: '4', title: 'Content 4', category: 'Entertainment' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search content..."
          placeholderTextColor="#666"
        />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.categories}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <View key={category} style={styles.categoryChip}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>All Content</Text>
          {browseContent.map((item) => (
            <View key={item.id} style={styles.contentCard}>
              <View style={styles.contentPlaceholder} />
              <View style={styles.contentInfo}>
                <Text style={styles.contentTitle}>{item.title}</Text>
                <Text style={styles.contentCategory}>{item.category}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  categories: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  contentSection: {
    padding: 20,
  },
  contentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentPlaceholder: {
    width: 80,
    height: 60,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  contentCategory: {
    fontSize: 14,
    color: '#666',
  },
});

export default BrowseScreen;