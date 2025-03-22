import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Avatar, Button, Card, useTheme } from 'react-native-paper';
import { useAuthStore } from '../../stores/authStore';
import EditProfileModal from './EditProfileScreen';
import ReviewsModal from './ReviewsModal';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

const ProfileScreen = () => {
  const { currentUser, toggleArtistMode } = useAuthStore();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation();

  if (!currentUser) return null;

  const handleNavigate = (screen: string) => {
    navigation.navigate(screen as never);
  };

  const cardData = [
    { title: 'My Portfolio', subtitle: 'Manage your portfolio', screen: 'PortfolioScreen', icon: 'images' }, // FontAwesome5
    { title: 'My Bookings', subtitle: 'View your bookings', screen: 'BookingsScreen', icon: 'calendar-check' }, // FontAwesome5
    { title: 'Invites', subtitle: 'Check your invites', screen: 'InvitesScreen', icon: 'envelope-open-text' }, // FontAwesome5
    { title: 'My Events', subtitle: 'Manage your events', screen: 'MyEventsScreen', icon: 'calendar-alt' }, // FontAwesome5
  ];

  const renderCard = ({ item }: { item: { title: string; subtitle: string; screen: string; icon: string } }) => (
    <TouchableOpacity onPress={() => handleNavigate(item.screen)} style={styles.cardWrapper}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <FontAwesome5 name={item.icon} size={32} color={theme.colors.primary} style={styles.cardIcon} />
          <View>
            <Text variant="titleMedium" style={styles.cardTitle}>{item.title}</Text>
            <Text variant="bodySmall" style={styles.cardSubtitle}>{item.subtitle}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar.Image size={100} source={{ uri: currentUser.profilePicture }} />
        <Text variant="headlineMedium" style={styles.name}>
          {currentUser.fullName}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {currentUser.location || 'Location not set'}
        </Text>
        <Button
          mode="contained"
          onPress={() => setShowEditProfile(true)}
          style={styles.editButton}
        >
          Edit Profile
        </Button>
      </View>

      {/* Card Grid */}
      <View style={styles.cardContainer}>
        {cardData.map((item) => renderCard({ item }))}
      </View>

      {/* Modals */}
      <EditProfileModal visible={showEditProfile} onClose={() => setShowEditProfile(false)} />
      <ReviewsModal visible={showReviews} onClose={() => setShowReviews(false)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  name: {
    marginTop: 8,
  },
  editButton: {
    marginTop: 16,
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
    flex: 1,
    height: 150,
    justifyContent: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    textAlign: 'center',
    color: '#666',
  },
});

export default ProfileScreen;
