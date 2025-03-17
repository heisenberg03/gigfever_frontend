import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Avatar, Button, Chip } from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { GET_ARTISTS, GET_ARTIST_PORTFOLIO, GET_ARTIST_REVIEWS, INVITE_ARTIST, START_CHAT, REPORT_ARTIST } from '../graphql/queries';
import ReviewModal from '../components/ReviewModal';

const ArtistProfileScreen = ({ route, navigation }) => {
  const { artistId } = route.params;
  const { user } = useAuthStore();
  const { incrementChat } = useNotificationStore();

  const { data: cachedData } = useQuery(GET_ARTISTS, { fetchPolicy: 'cache-only' });
  const artist = cachedData?.artists.find((a) => a.id === artistId);

  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const { data: portfolioData, loading: portfolioLoading } = useQuery(GET_ARTIST_PORTFOLIO, {
    variables: { id: artistId },
    skip: !showPortfolio,
  });
  const { data: reviewsData, loading: reviewsLoading } = useQuery(GET_ARTIST_REVIEWS, {
    variables: { id: artistId },
    skip: !showReviews,
  });

  const [inviteArtist] = useMutation(INVITE_ARTIST);
  const [startChat] = useMutation(START_CHAT, {
    onCompleted: () => {
      incrementChat();
      navigation.navigate('Chat', { receiverId: artistId });
    },
  });
  const [reportArtist] = useMutation(REPORT_ARTIST);

  if (!artist) return <Text>Loading...</Text>;

  return (
    <ScrollView>
      <View style={{ alignItems: 'center', padding: 16 }}>
        <Avatar.Image size={120} source={{ uri: artist.profilePicture }} />
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{artist.displayName}</Text>
        <TouchableOpacity onPress={() => setShowReviews(true)}>
          <Text>Rating: {artist.rating} ★ ({artist.reviewCount} reviews)</Text>
        </TouchableOpacity>
        <Text>Past Bookings: {artist.pastBookings}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 16 }}>
        {user?.isHost && (
          <Button mode="contained" onPress={() => inviteArtist({ variables: { artistId, eventId: 'mock' } })}>
            Invite
          </Button>
        )}
        <Button mode="contained" onPress={() => startChat({ variables: { receiverId: artistId } })}>
          Chat
        </Button>
        <Button icon="flag" onPress={() => reportArtist({ variables: { artistId, reason: 'Inappropriate' } })}>
          Report
        </Button>
      </View>
      <ScrollView horizontal style={{ padding: 8 }}>
        {artist.categories.map((cat) => <Chip key={cat} style={{ margin: 4 }}>{cat}</Chip>)}
        {artist.subCategories.map((sub) => <Chip key={sub} style={{ margin: 4 }}>{sub}</Chip>)}
      </ScrollView>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>About</Text>
        <Text>{artist.bio}</Text>
      </View>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Portfolio</Text>
        <Button onPress={() => setShowPortfolio(true)}>View Portfolio</Button>
      </View>
      {showPortfolio && (
        <Modal visible={showPortfolio} onDismiss={() => setShowPortfolio(false)}>
          <ScrollView horizontal>
            {portfolioLoading ? (
              <Text>Loading...</Text>
            ) : (
              portfolioData?.artist.portfolio.map((item) => (
                <View key={item.url}>
                  {item.type === 'video' ? (
                    <Text>Video: {item.url}</Text> // Placeholder for Video component
                  ) : (
                    <Text>Image: {item.url}</Text> // Placeholder for Image component
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </Modal>
      )}
      <ReviewModal visible={showReviews} onDismiss={() => setShowReviews(false)} reviews={reviewsData?.artist.reviews} loading={reviewsLoading} />
    </ScrollView>
  );
};

export default ArtistProfileScreen;