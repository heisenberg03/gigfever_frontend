// src/screens/ArtistListingScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import { GET_ARTISTS } from '../graphql/queries';
import { useCategoryStore } from '../stores/categoryStore';
import { useSubCategoryStore } from '../stores/subCategoryStore';

const ArtistListingScreen = () => {
  const navigation = useNavigation();
  const { categories } = useCategoryStore();
  const { subCategories } = useSubCategoryStore();
  const { data, loading, error } = useQuery(GET_ARTISTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  if (loading) return <Text>Loading artists...</Text>;
  if (error) console.log('Artists Error:', error);

  const artists = data?.artists || [];

  const filteredArtists = artists.filter((artist) => {
    const matchesSearch = artist.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? artist.categories.includes(selectedCategory) : true;
    const matchesSubCategory = selectedSubCategory ? artist.subCategories.includes(selectedSubCategory) : true;
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search artists"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <ScrollView horizontal style={styles.filterScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            onPress={() => setSelectedCategory(cat.name === selectedCategory ? null : cat.name)}
            style={[styles.filterButton, selectedCategory === cat.name && styles.filterButtonActive]}
          >
            <Text style={styles.filterText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView horizontal style={styles.filterScroll}>
        {subCategories.map((sub) => (
          <TouchableOpacity
            key={sub.name}
            onPress={() => setSelectedSubCategory(sub.name === selectedSubCategory ? null : sub.name)}
            style={[styles.filterButton, selectedSubCategory === sub.name && styles.filterButtonActive]}
          >
            <Text style={styles.filterText}>{sub.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.content}>
        {filteredArtists.length > 0 ? (
          filteredArtists.map((artist) => (
            <TouchableOpacity
              key={artist.id}
              onPress={() => navigation.navigate('Profile', { artistId: artist.id })} // Navigate to Profile with artist ID
            >
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.title}>{artist.displayName}</Text>
                  <Text style={styles.subtitle}>{artist.categories.join(', ')}</Text>
                  <Text style={styles.rating}>Rating: {artist.rating} ({artist.reviewCount} reviews)</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noData}>No artists found</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  searchbar: { margin: 16, borderRadius: 8 },
  filterScroll: { paddingHorizontal: 16, marginBottom: 8 },
  filterButton: { padding: 8, marginRight: 8, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc' },
  filterButtonActive: { backgroundColor: '#6B48FF', borderColor: '#6B48FF' },
  filterText: { color: '#333', fontSize: 14 },
  content: { padding: 16 },
  card: { marginBottom: 16, borderRadius: 8 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666' },
  rating: { fontSize: 12, color: '#888', marginTop: 4 },
  noData: { fontSize: 16, color: '#666', textAlign: 'center' },
});

export default ArtistListingScreen;