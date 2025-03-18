import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Modal } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { GET_EVENTS, GET_EVENT_ARTISTS, GET_EVENT_REVIEWS, INVITE_ARTIST, START_CHAT, APPLY_TO_EVENT } from '../graphql/queries';
import ReviewModal from '../components/ReviewModal';
import MapView from 'react-native-maps';

const EventDetailsScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useAuthStore();
  const { incrementChat } = useNotificationStore();

  const { data: cachedData } = useQuery(GET_EVENTS, { fetchPolicy: 'cache-only' });
  const event = cachedData?.events.find((e) => e.id === eventId);

  const [showArtists, setShowArtists] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const { data: artistsData, loading: artistsLoading } = useQuery(GET_EVENT_ARTISTS, {
    variables: { id: eventId },
    skip: !showArtists,
  });
  const { data: reviewsData, loading: reviewsLoading } = useQuery(GET_EVENT_REVIEWS, {
    variables: { id: eventId },
    skip: !showReviews,
  });

  const [inviteArtist] = useMutation(INVITE_ARTIST);
  const [startChat] = useMutation(START_CHAT, {
    onCompleted: () => {
      incrementChat();
      navigation.navigate('Chat', { receiverId: event?.host.id });
    },
  });
  const [applyToEvent] = useMutation(APPLY_TO_EVENT);

  if (!event) return <Text>Loading...</Text>;

  return (
    <ScrollView>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{event.title}</Text>
        <Text>Category: {event.category}</Text>
        <Text>Date: {new Date(event.date).toLocaleDateString()}</Text>
        <Text>Location: {event.location}</Text>
        <MapView
          style={{ height: 200, marginVertical: 8 }}
          initialRegion={{
            latitude: 37.78825, // Mock coordinates
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      </View>
      <Card style={{ margin: 16 }}>
        <Card.Content>
          <Text>{event.host.displayName}</Text>
          <TouchableOpacity onPress={() => setShowReviews(true)}>
            <Text>Rating: {event.host.rating} ★ ({event.host.reviewCount} reviews)</Text>
          </TouchableOpacity>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => startChat({ variables: { receiverId: event.host.id } })}>Chat Host</Button>
        </Card.Actions>
      </Card>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Artists</Text>
        <Button onPress={() => setShowArtists(true)}>View Artists</Button>
      </View>
      {user?.isArtist && event.status === 'open' && (
        <Button mode="contained" onPress={() => applyToEvent({ variables: { eventId } })}>
          Apply
        </Button>
      )}
      {user?.isHost && (
        <Button mode="contained" onPress={() => inviteArtist({ variables: { artistId: 'mock', eventId } })}>
          Invite Artist
        </Button>
      )}
      {showArtists && (
        <Modal visible={showArtists} onDismiss={() => setShowArtists(false)}>
          <ScrollView>
            {artistsLoading ? (
              <Text>Loading...</Text>
            ) : (
              artistsData?.event.artists.map((artist) => (
                <Card
                  key={artist.id}
                  style={{ margin: 8 }}
                  onPress={() => navigation.navigate('ArtistProfile', { artistId: artist.id })}
                >
                  <Card.Content>
                    <Text>{artist.displayName}</Text>
                    <Text>Rating: {artist.rating} ★</Text>
                  </Card.Content>
                </Card>
              ))
            )}
            <Button onPress={() => setShowArtists(false)}>Close</Button>
          </ScrollView>
        </Modal>
      )}
      <ReviewModal
        visible={showReviews}
        onDismiss={() => setShowReviews(false)}
        reviews={reviewsData?.event.reviews}
        loading={reviewsLoading}
      />
    </ScrollView>
  );
};

export default EventDetailsScreen;