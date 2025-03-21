// src/screens/profile/MyEventsSection.tsx
import React from 'react';
import { View } from 'react-native';
import { Text, Button, Divider, useTheme } from 'react-native-paper';
import { useQuery, gql } from '@apollo/client';
import { FlashList } from '@shopify/flash-list';
import EventCard from '../../components/EventCard';

const MY_EVENTS = gql`
  query MyEvents {
    myEvents {
      id
      title
      location
      category
      dateTime
      bannerUrl
      mapLink
      status
      description
    }
  }
`;

export const MyEventsSection = () => {
  const theme = useTheme();
  const { data, loading, error, refetch } = useQuery<{ myEvents: { id: string; title: string; category: string; dateTime: string; location: string }[] }>(MY_EVENTS);

  const handleCreate = () => {
    // Navigate to CreateEvent screen
  };

  if (loading) return null;
  if (error || !data?.myEvents) return null;

  return (
    <View style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text variant="titleMedium">My Events</Text>
        <Button mode="contained" onPress={handleCreate}>
          Create Event
        </Button>
      </View>
      <Divider style={{ marginBottom: 8 }} />

      {data.myEvents.length === 0 ? (
        <Text style={{ color: 'gray' }}>You haven’t created any events yet.</Text>
      ) : (
        <FlashList
          data={data.myEvents}
          estimatedItemSize={160}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 16 }}>
              <EventCard event={item} />
            </View>
          )}
        />
      )}
    </View>
  );
};