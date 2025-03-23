import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Avatar, Button, Chip, Switch, useTheme } from 'react-native-paper';
import { useAuthStore } from '../../stores/authStore';
import ReviewsModal from './ReviewsModal';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }: any) => {
  const { currentUser, toggleArtistMode } = useAuthStore();
  const [showReviews, setShowReviews] = useState(false);
  const theme = useTheme();

  if (!currentUser) return null;

  const handleNavigate = (screen: string) => {
    navigation.navigate(screen as never);
  };

  const cardData = [
    { title: 'My Portfolio', subtitle: 'Manage your portfolio', screen: 'PortfolioScreen', icon: 'images' },
    { title: 'My Bookings', subtitle: 'View your bookings', screen: 'BookingsScreen', icon: 'calendar-check' },
    { title: 'Invites', subtitle: 'Check your invites', screen: 'InvitesScreen', icon: 'envelope-open-text' },
    { title: 'My Events', subtitle: 'Manage your events', screen: 'MyEventsScreen', icon: 'calendar-alt' },
  ];

  const renderCard = ({ item }: { item: { title: string; subtitle: string; screen: string; icon: string } }) => (
    <TouchableOpacity onPress={() => handleNavigate(item.screen)} style={styles.cardWrapper}>
      <View style={styles.card}>
        <FontAwesome5 name={item.icon} size={32} color={theme.colors.primary} style={styles.cardIcon} />
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar.Image size={100} source={{ uri: currentUser.profilePicture }} />
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleNavigate('EditProfileScreen')}
        >
          <MaterialIcons name="edit" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.name}>{currentUser.fullName}</Text>
        <Text style={styles.username}>@{currentUser.username}</Text>
        <Text style={styles.location}>{currentUser.location || 'Location not set'}</Text>
      </View>

      {/* Artist Mode Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Artist Mode</Text>
        <Switch value={currentUser.isArtist} onValueChange={toggleArtistMode} />
      </View>

      {/* Ratings */}
      <View style={styles.ratingContainer}>
        <TouchableOpacity onPress={() => setShowReviews(true)} style={styles.ratingBox}>
          <Text style={styles.ratingText}>
            Artist Rating: {currentUser.artistRating || 'N/A'} ({currentUser.artistReviewCount || 0} reviews)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowReviews(true)} style={styles.ratingBox}>
          <Text style={styles.ratingText}>
            Host Rating: {currentUser.hostRating || 'N/A'} ({currentUser.hostReviewCount || 0} reviews)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Bio</Text>
        <Text style={styles.sectionValue}>{currentUser.bio || 'Not provided'}</Text>
      </View>

      {/* Budget */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Budget</Text>
        <Text style={styles.sectionValue}>
          {currentUser.budget ? `Rs. ${currentUser.budget}/hr` : 'Not provided'}
        </Text>
      </View>

      {/* Email */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Email</Text>
        <Text style={styles.sectionValue}>{currentUser.email || 'Not provided'}</Text>
      </View>

      {/* Category */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Category</Text>
        <Chip style={styles.chip}>{currentUser.category || 'Not selected'}</Chip>
      </View>

      {/* Subcategories */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Subcategories</Text>
        <ScrollView horizontal style={styles.chipContainer}>
          {currentUser.subcategories.length > 0 ? (
            currentUser.subcategories.map((sub) => (
              <Chip key={sub} style={styles.chip}>
                {sub}
              </Chip>
            ))
          ) : (
            <Text style={styles.sectionValue}>Not selected</Text>
          )}
        </ScrollView>
      </View>

      {/* Card Grid */}
      <View style={styles.cardContainer}>
        {cardData.map((item) => renderCard({ item }))}
      </View>

      {/* Reviews Modal */}
      <ReviewsModal visible={showReviews} onClose={() => setShowReviews(false)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  username: {
    fontSize: 16,
    color: '#666',
  },
  location: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  ratingBox: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
  },
  section: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 14,
    color: '#666',
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#e0e0e0',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProfileScreen;
