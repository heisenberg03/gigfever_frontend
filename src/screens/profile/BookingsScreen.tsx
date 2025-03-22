// src/screens/BookingsScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { useQuery } from '@apollo/client';
import { useAuthStore } from '../../stores/authStore';
import { useBookingStore } from '../../stores/bookingStore';
import { GET_BOOKINGS } from '../../graphql/queries';

export const BookingsScreen = () => {
  const { user } = useAuthStore();
  const { bookings, setBookings } = useBookingStore();
  const { data, loading, error } = useQuery(GET_BOOKINGS, {
    variables: { userId: user?.id },
    skip: !user,
  });

  useEffect(() => {
    if (data?.bookings) {
      setBookings(data.bookings);
    }
  }, [data, setBookings]);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed':
        return { backgroundColor: '#4CAF50' };
      case 'pending':
        return { backgroundColor: '#FFEB3B' };
      case 'canceled':
        return { backgroundColor: '#F44336' };
      default:
        return {};
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bookings</Text>
      <FlatList
        data={bookings}
        renderItem={({ item }) => (
          <Card style={[styles.card, getStatusStyle(item.status)]}>
            <Card.Content>
              <Text style={styles.cardTitle}>{item.event.title}</Text>
              <Text style={styles.cardSubtitle}>Date: {item.date}</Text>
              <Text style={styles.cardSubtitle}>Status: {item.status}</Text>
            </Card.Content>
          </Card>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noData}>No bookings available</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F5F5' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  card: { marginBottom: 16, borderRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardSubtitle: { fontSize: 14, color: '#666' },
  noData: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 16 },
});

export default BookingsScreen;