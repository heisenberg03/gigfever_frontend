// src/screens/EventsScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Card, FAB, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation } from '@apollo/client';
import { useAuthStore } from '../stores/authStore';
import { useEventStore } from '../stores/eventStore';
import { useBookingStore } from '../stores/bookingStore';
import { GET_EVENTS, CANCEL_EVENT, GET_BOOKINGS } from '../graphql/queries';

const EventsScreen = () => {
  const { currentUser: user } = useAuthStore();
  const { events, setEvents, updateEvent } = useEventStore();
  const { bookings, setBookings } = useBookingStore();
  const navigation = useNavigation();
  const { data, loading, error } = useQuery(GET_EVENTS, {
    variables: { userId: user?.id },
    skip: !user,
  });

  useEffect(() => {
    if (data?.events) {
      setEvents(data.events);
    }
  }, [data, setEvents]);

  const [cancelEvent] = useMutation(CANCEL_EVENT, {
    update: (cache, { data: { cancelEvent } }) => {
      cache.modify({
        fields: {
          events(existingEvents = []) {
            return existingEvents.map((event) =>
              event.id === cancelEvent.id ? { ...event, status: cancelEvent.status } : event
            );
          },
          bookings(existingBookings = []) {
            return existingBookings.map((booking) =>
              booking.event.id === cancelEvent.id ? { ...booking, status: 'canceled' } : booking
            );
          },
        },
      });
    },
    onError: (error) => {
      updateEvent(cancelEvent.id, { status: 'open' }); // Rollback on failure
      setBookings(bookings.map((b) => (b.event.id === cancelEvent.id ? { ...b, status: 'confirmed' } : b)));
    },
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const getStatusStyle = (status, isDraft) => {
    if (isDraft) return { backgroundColor: '#B0BEC5' };
    switch (status) {
      case 'open':
        return { backgroundColor: '#2196F3' };
      case 'confirmed':
        return { backgroundColor: '#4CAF50' };
      case 'canceled':
        return { backgroundColor: '#F44336' };
      default:
        return {};
    }
  };

  const handleCancelEvent = (eventId) => {
    updateEvent(eventId, { status: 'canceled' }); // Optimistic update
    setBookings(bookings.map((b) => (b.event.id === eventId ? { ...b, status: 'canceled' } : b)));
    cancelEvent({ variables: { eventId } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <Card style={[styles.card, getStatusStyle(item.status, item.isDraft)]}>
            <Card.Content>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>Date: {item.date}</Text>
              <Text style={styles.cardSubtitle}>Location: {item.location}</Text>
              <Text style={styles.cardSubtitle}>Status: {item.isDraft ? 'Draft' : item.status}</Text>
            </Card.Content>
            {item.status !== 'canceled' && !item.isDraft && (
              <Card.Actions>
                <Button onPress={() => handleCancelEvent(item.id)}>Cancel</Button>
              </Card.Actions>
            )}
          </Card>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noData}>No events available</Text>}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        color="#fff"
        onPress={() => navigation.navigate('CreateEvent')}
        label="Create Event"
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
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#6B48FF' },
});

export default EventsScreen;