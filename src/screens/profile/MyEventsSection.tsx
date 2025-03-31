// src/screens/profile/MyEventsSection.tsx
import React from 'react';
import { View, Dimensions } from 'react-native';
import { Text, Button, Divider, useTheme } from 'react-native-paper';
import { useQuery, gql } from '@apollo/client';
import { FlashList } from '@shopify/flash-list';
import EventCard from '../../components/EventCard';

const SCREEN_WIDTH = Dimensions.get('window').width;

const MY_EVENTS = gql`
  query MyEvents {
    myEvents {
      id
      title
      location
      category
      subCategories
      dateTime
      bannerUrl
      mapLink
      status
      description
      budget {
        min
        max
      }
      eventType
      applicantsCount
      createdAt
      isDraft
    }
  }
`;

interface Event {
  id: string;
  title: string;
  description?: string;
  banner?: string;
  dateTime: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: string;
  eventType: string;
  budget?: {
    min: number;
    max: number;
  };
  category?: string;
  subcategories?: string[];
  host: {
    id: string;
    displayName: string;
    profilePic?: string;
    rating?: number;
    reviewsCount?: number;
    pastEventsCount?: number;
  };
  applicantsCount?: number;
  isFavorite?: boolean;
  userApplicationStatus?: string;
}

export const MyEventsSection = () => {
  const theme = useTheme();
  const { data, loading, error, refetch } = useQuery(MY_EVENTS);

  const handleCreate = () => {
    // Navigate to CreateEvent screen
  };

  if (loading) return null;
  if (error || !data?.myEvents) return null;

  const activeEvents = data.myEvents.filter(event => 
    event.status.toLowerCase() === 'open' && !event.isDraft
  );
  
  const draftEvents = data.myEvents.filter(event => 
    event.isDraft === true
  );
  
  const closedEvents = data.myEvents.filter(event => 
    ['closed', 'canceled', 'confirmed'].includes(event.status.toLowerCase()) && !event.isDraft
  );

  return (
    <View style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <View>
          <Text variant="titleMedium">My Events</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
            {data.myEvents.length} Total · {activeEvents.length} Active · {draftEvents.length} Draft
          </Text>
        </View>
        <Button mode="contained" onPress={handleCreate}>
          Create Event
        </Button>
      </View>
      <Divider style={{ marginBottom: 16 }} />

      {data.myEvents.length === 0 ? (
        <Text style={{ color: 'gray' }}>You haven't created any events yet.</Text>
      ) : (
        <FlashList
          data={data.myEvents}
          estimatedItemSize={220}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 16 }}>
              <EventCard 
                event={item} 
                width={SCREEN_WIDTH - 32}
                isHost={true}
              />
            </View>
          )}
        />
      )}
    </View>
  );
};