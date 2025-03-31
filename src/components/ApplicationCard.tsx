import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useCategoryStore } from '../stores/categoryStore';

interface ApplicationCardProps {
  artist: {
    id: string;
    fullName: string;
    artistType?: string;
    location?: string;
    artistRating?: number;
    artistReviewCount?: number;
    profilePicture?: string;
    message?: string;
    subCategories?: string[];
    hourlyRate?: number | null;
  };
  onPress: (id: string) => void;
  children?: React.ReactNode;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ artist, onPress, children }) => {
  const { categories } = useCategoryStore();

  // Map subcategory IDs to names
  const getSubcategoryName = (id: string) => {
    // Flatten all subcategories from all categories
    const allSubcategories = categories.flatMap(cat => cat.subCategories || []);
    const subcategory = allSubcategories.find(sub => sub.id === id);
    return subcategory?.name || id;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => onPress(artist.id)}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Avatar.Image
            size={70}
            source={{ uri: artist.profilePicture || 'https://via.placeholder.com/70' }}
            style={styles.avatar}
          />

          <View style={styles.artistInfo}>
            {/* Artist Name */}
            <Text style={styles.name} numberOfLines={1}>{artist.fullName}</Text>

            {/* Artist Type and Hourly Rate */}
            <View style={styles.detailsRow}>
              {artist.hourlyRate && (
                <View style={styles.rateContainer}>
                  <Text style={styles.rateText}>₹{artist.hourlyRate}/hr</Text>
                </View>
              )}
            </View>

            {/* Rating with Reviews count */}
            {(artist.artistRating !== undefined && artist.artistReviewCount !== undefined) && (
              <View style={styles.ratingRow}>
                <View style={styles.ratingContainer}>
                  <MaterialIcons name="star" size={16} color="#000000" />
                  <Text style={styles.ratingText}>{artist.artistRating.toFixed(1)}</Text>
                </View>
                <Text style={styles.reviewsText}>({artist.artistReviewCount} reviews)</Text>
              </View>
            )}
          </View>
        </View>

        {/* Subcategory Chips with proper spacing and truncation */}
        {artist.subCategories && artist.subCategories.length > 0 && (
          <View style={styles.subcategoriesContainer}>
            {artist.artistType && (
                <Chip style={styles.typeContainer}>
                  <Text style={styles.typeText}>{artist.artistType}</Text>
                </Chip>
              )}
            {artist.subCategories.slice(0, 5).map((subcategoryId, index) => (
              <Chip
                key={index}
                style={styles.subcategoryChip}
                textStyle={styles.subcategoryChipText}
                mode="outlined"
              >
                {getSubcategoryName(subcategoryId)}
              </Chip>
            ))}
            {artist.subCategories.length > 5 && (
              <Chip
                style={styles.moreChip}
                textStyle={styles.moreChipText}
              >
                +{artist.subCategories.length - 5} more
              </Chip>
            )}
          </View>
        )}

        {/* Artist's Message */}
        {artist.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageTitle}>Artist's note:</Text>
            <Text style={styles.messageText}>
              {artist.message}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Render children (buttons) outside of the TouchableOpacity */}
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden'
  },
  cardContent: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  artistInfo: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  typeContainer: {
    backgroundColor: '#F3E5F5',
    marginRight: 2,
    marginLeft: -2,
  },
  typeText: {
    fontSize: 12,
    color: '#7B1FA2',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tagContainer: {
    backgroundColor: '#FFB448',
    margin: 2,
  },
  tagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  rateContainer: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#64B5F6',
  },
  rateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    marginRight: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#000000',
    marginLeft: 2,
    fontWeight: 'bold',
  },
  reviewsText: {
    fontSize: 12,
    color: '#777777',
  },
  subcategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    marginLeft: -2,
    marginRight: -2,
  },
  subcategoryChip: {
    margin: 2,
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  subcategoryChipText: {
    fontSize: 10,
    color: theme.colors.primary,
  },
  moreChip: {
    margin: 2,
    backgroundColor: '#F5F5F5',
    height: 24,
  },
  moreChipText: {
    fontSize: 10,
    color: '#757575',
  },
  messageContainer: {
    marginTop: 4,
    padding: 12,
    backgroundColor: '#f8f8fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  childrenContainer: {
    paddingTop: 0,
  }
});

export default ApplicationCard; 