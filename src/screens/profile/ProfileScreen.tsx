import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Switch, Button, Avatar, Chip, Divider, useTheme } from 'react-native-paper';
import { useAuthStore } from '../../stores/authStore';
import EditProfileModal from './EditProfileScreen';
import ReviewsModal from './ReviewsModal';
import { MyEventsSection } from './MyEventsSection';
import { PortfolioSection } from './PortfolioSection';
import { BookingsSection } from './MyBookingsSection';
import { InvitesSection } from './InvitesSection';

const ProfileScreen = () => {
  const { currentUser, toggleArtistMode } = useAuthStore();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const theme = useTheme();

  if (!currentUser) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Avatar.Image size={100} source={{ uri: currentUser.profilePicture }} />
        <Text variant="headlineMedium" style={{ marginTop: 8 }}>
          {currentUser.fullName}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {currentUser.location}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
          <Text variant="bodyMedium">Show as Artist</Text>
          <Switch
            value={currentUser.isArtist}
            onValueChange={toggleArtistMode}
            style={{ marginLeft: 8 }}
          />
        </View>
        {currentUser.isArtist && (
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <Text variant="titleMedium">Category</Text>
            <Chip style={{ marginTop: 4 }}>{currentUser.category || 'Not set'}</Chip>
            <Text variant="titleMedium" style={{ marginTop: 16 }}>
              Subcategories
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
              {currentUser.subcategories.map((sub, index) => (
                <Chip key={index} style={{ margin: 4 }}>
                  {sub}
                </Chip>
              ))}
            </View>
          </View>
        )}
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          {currentUser.isArtist && (
            <Button onPress={() => setShowReviews(true)}>
              Artist Rating: {currentUser.artistRating?.toFixed(1) || '-'} (
              {currentUser.artistReviewCount || 0})
            </Button>
          )}
          <Button onPress={() => setShowReviews(true)}>
            Host Rating: {currentUser.hostRating?.toFixed(1) || '-'} (
            {currentUser.hostReviewCount || 0})
          </Button>
        </View>
        <Button
          mode="contained"
          onPress={() => setShowEditProfile(true)}
          style={{ marginTop: 16 }}
        >
          Edit Profile
        </Button>
      </View>
      <Divider />
      <MyEventsSection />
      {currentUser.isArtist && (
        <>
          <Divider />
          <PortfolioSection />
          <Divider />
          <BookingsSection />
          <Divider />
          <InvitesSection />
        </>
      )}
      <EditProfileModal visible={showEditProfile} onClose={() => setShowEditProfile(false)} />
      <ReviewsModal visible={showReviews} onClose={() => setShowReviews(false)} />
    </ScrollView>
  );
};

export default ProfileScreen;
