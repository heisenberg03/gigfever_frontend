// src/screens/profile/BookingsSection.tsx
import React from 'react';
import { View } from 'react-native';
import { Text, Divider, useTheme, Card, Button } from 'react-native-paper';
import { gql, useQuery } from '@apollo/client';

const MY_BOOKINGS = gql`
  query MyBookings {
    bookings {
      id
      event {
        title
        dateTime
        location
      }
      status
    }
  }
`;

export const BookingsSection = () => {
  const { data, loading, error } = useQuery(MY_BOOKINGS);
  const theme = useTheme();
console.log(data, loading, error)
  if (loading || !data?.bookings) return null;

  return (
    <View className="p-4">
      <Text variant="titleMedium" className="mb-2">My Bookings</Text>
      <Divider className="mb-3" />

      {data.bookings.length === 0 ? (
        <Text className="text-gray-500">You have no bookings yet.</Text>
      ) : (
        data.bookings.map((booking: any) => (
          <Card key={booking.id} className="mb-4">
            <Card.Title title={booking.event.title} subtitle={booking.event.dateTime + ' • ' + booking.event.location} />
            <Card.Content>
              <Text>Status: {booking.status}</Text>
            </Card.Content>
            <Card.Actions>
              <Button>View Event</Button>
            </Card.Actions>
          </Card>
        ))
      )}
    </View>
  );
};
