import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Platform, StatusBar } from 'react-native';
import { Card, Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useCategoryStore } from '../stores/categoryStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

interface Artist {
  id: string;
  fullName: string;
  artistType?: string;
  location?: string;
  artistRating?: number;
  artistReviewCount?: number;
  budget?: number;
  categoryIDs?: string[];
  subCategoryIDs?: string[];
  profilePicture?: string;
  username?: string;
}

const ArtistCard = ({ artist, width }: { artist: Artist; width?: number }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { categories } = useCategoryStore();

  const artistCategory = categories.find(cat => 
    cat.id === artist.categoryIDs?.[0]
  );

  const artistSubCategories = categories
    .flatMap(cat => cat.subCategories)
    .filter(sub => artist.subCategoryIDs?.includes(sub.id))
    .slice(0, 3); // Allow up to 3 subcategories

  const defaultImage = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4';
  const cardWidth = width || (Dimensions.get('window').width / 2) - 16;


  return (
    <Card
      style={[styles.card, { width: cardWidth }]}
      onPress={() => navigation.navigate('ArtistProfile', { artistId: artist.id })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: artist.profilePicture || defaultImage }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>₹{artist.budget}/hr</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {artist.fullName}
          </Text>
          <View style={styles.ratingPill}>
            <Icon source="star" size={10} color="#000000" />
            <Text style={styles.ratingText}>
              {artist.artistRating?.toFixed(1) || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.chipsContainer}>
          {/* Artist Type Chip */}
          <View style={[styles.chip, styles.artistTypeChip]}>
            <Text style={[styles.chipText, styles.artistTypeText]} numberOfLines={1}>
              {artist.artistType || 'N/A'}
            </Text>
          </View>

          {/* Category Chip if available */}
          {artistCategory && (
            <View style={[styles.chip, styles.categoryChip]}>
              <Text style={[styles.chipText, styles.categoryText]} numberOfLines={1}>
                {artistCategory.name}
              </Text>
            </View>
          )}

          {/* Subcategory Chips */}
          {artistSubCategories.map((subCat) => (
            <View key={subCat.id} style={[styles.chip, styles.subCategoryChip]}>
              <Text style={[styles.chipText, styles.subCategoryText]} numberOfLines={1}>
                {subCat.name}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 18,
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#e1e1e1',
  },
  contentContainer: {
    padding: 8,
    backgroundColor: 'white',
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  chip: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 10,
    textAlign: 'center',
  },
  artistTypeChip: {
    backgroundColor: '#FFB448',
  },
  artistTypeText: {
    color: '#FFFFFF',
  },
  categoryChip: {
    backgroundColor: '#4C68FF',
  },
  categoryText: {
    color: '#FFFFFF',
  },
  subCategoryChip: {
    backgroundColor: theme.colors.primary + '15',
  },
  subCategoryText: {
    color: theme.colors.primary,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  priceBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: theme.colors.secondary,
  },
  priceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
});

export default ArtistCard;