import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import { Button, IconButton, Card, Chip, Avatar } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import RNModal from 'react-native-modal';
import tw from 'tailwind-react-native-classnames';

const GET_EVENT_DETAILS = gql`
  query GetEventDetails($id: ID!) {
    event(id: $id) {
      id
      title
      banner
      date
      time
      location { lat lng address }
      type
      categories
      subcategories
      description
      budget { min max }
      host { id fullName rating pastEventsCount profilePic reviews { id reviewer rating comment } }
      applicants { id fullName status }
      confirmedArtist { id fullName }
      status
      userApplicationStatus
    }
  }
`;

const APPLY_AS_ARTIST = gql`mutation ApplyAsArtist($eventId: ID!) { applyAsArtist(eventId: $eventId) { id fullName status } }`;
const WITHDRAW_APPLICATION = gql`mutation WithdrawApplication($eventId: ID!) { withdrawApplication(eventId: $eventId) }`;

const EventDetailsScreen = ({ route }) => {
  const { eventId } = route.params;
  const navigation = useNavigation();
  const { data, loading, error, refetch } = useQuery(GET_EVENT_DETAILS, { variables: { id: eventId } });
  const [applyAsArtist] = useMutation(APPLY_AS_ARTIST, { onCompleted: () => refetch() });
  const [withdrawApplication] = useMutation(WITHDRAW_APPLICATION, { onCompleted: () => refetch() });
  const [showReviews, setShowReviews] = useState(false);

  if (loading) return <Text style={tw`text-center mt-10`}>Loading...</Text>;
  if (error) return <Text style={tw`text-center mt-10 text-red-500`}>Error: {error.message}</Text>;

  const event = data.event;
  const isHost = event.host.id === 'h1'; // Mock host check
  const hasApplied = event.userApplicationStatus === 'Applied';

  return (
    <ScrollView style={tw`flex-1 bg-gray-100`}>
      <View style={tw`flex-row justify-between p-4 bg-white shadow-md`}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <View style={tw`flex-row`}>
          <IconButton icon="bookmark-outline" onPress={() => {}} />
          <IconButton icon="flag-outline" onPress={() => {}} />
        </View>
      </View>

      <View style={tw`p-4`}>
        <Image source={{ uri: event.banner }} style={tw`w-full h-56 rounded-lg`} />
        <Text style={tw`text-2xl font-bold mt-4`}>{event.title}</Text>
        <Text style={tw`text-lg text-gray-600 mt-2`}>{event.date} at {event.time}</Text>

        <Card style={tw`mt-4`}>
          <MapView
            style={tw`w-full h-48`}
            initialRegion={{ latitude: event.location.lat, longitude: event.location.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          >
            <Marker coordinate={{ latitude: event.location.lat, longitude: event.location.lng }} />
          </MapView>
          <Text style={tw`p-2 text-gray-700`}>{event.location.address}</Text>
        </Card>

        <View style={tw`mt-4 flex-row flex-wrap`}>
          <Chip style={tw`mr-2 mb-2 bg-purple-200`}>{event.type}</Chip>
          {event.categories.map((cat) => <Chip key={cat} style={tw`mr-2 mb-2 bg-teal-200`}>{cat}</Chip>)}
          {event.subcategories.map((sub) => <Chip key={sub} style={tw`mr-2 mb-2 bg-gray-200`}>{sub}</Chip>)}
        </View>

        <Text style={tw`text-base text-gray-800 mt-2`}>{event.description}</Text>
        <Text style={tw`text-lg mt-4`}>Budget: ${event.budget.min} - ${event.budget.max}</Text>

        <Card style={tw`mt-4 p-4`}>
          <View style={tw`flex-row items-center`}>
            <Avatar.Image size={50} source={{ uri: event.host.profilePic }} />
            <View style={tw`ml-4`}>
              <Text style={tw`text-lg font-semibold`}>{event.host.fullName}</Text>
              <Text>Rating: {event.host.rating} / 5</Text>
              <Text>Past Events: {event.host.pastEventsCount}</Text>
              <Button onPress={() => setShowReviews(true)} style={tw`mt-2`}>See Reviews</Button>
            </View>
          </View>
          <Button mode="outlined" onPress={() => navigation.navigate('Chat', { userId: event.host.id })} style={tw`mt-4`}>Message Host</Button>
        </Card>

        {!isHost && event.status === 'Open' && (
          <View style={tw`mt-4`}>
            <Button
              mode={hasApplied ? 'outlined' : 'contained'}
              onPress={() => hasApplied ? withdrawApplication({ variables: { eventId } }) : applyAsArtist({ variables: { eventId } })}
            >
              {hasApplied ? 'Withdraw Application' : 'Apply as Artist'}
            </Button>
          </View>
        )}

        <Text style={tw`text-lg mt-4 text-gray-600`}>Status: {event.status}</Text>
      </View>

      <RNModal isVisible={showReviews} onBackdropPress={() => setShowReviews(false)}>
        <View style={tw`bg-white p-4 rounded-lg`}>
          <Text style={tw`text-xl font-bold mb-4`}>Host Reviews</Text>
          {event.host.reviews.map((review) => (
            <View key={review.id} style={tw`mb-4`}>
              <Text style={tw`font-semibold`}>{review.reviewer}</Text>
              <Text>Rating: {review.rating}/5</Text>
              <Text>{review.comment}</Text>
            </View>
          ))}
          <Button onPress={() => setShowReviews(false)}>Close</Button>
        </View>
      </RNModal>
    </ScrollView>
  );
};

export default EventDetailsScreen;