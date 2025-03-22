// src/screens/InvitesScreen.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation } from '@apollo/client';
import { useAuthStore } from '../../stores/authStore';
import { useBookingStore } from '../../stores/bookingStore';
import { GET_INVITES, UPDATE_INVITE, GET_BOOKINGS } from '../../graphql/queries';

export const InvitesScreen = () => {
  const { currentUser: user } = useAuthStore();
  const { addBooking } = useBookingStore();
  const navigation = useNavigation();
  const { data, loading, error } = useQuery(GET_INVITES, {
    variables: { userId: user?.id },
    skip: !user,
  });

  const [updateInvite] = useMutation(UPDATE_INVITE, {
    update: (cache, { data: { updateInvite } }) => {
      if (updateInvite.status === 'accepted') {
        const newBooking = {
          id: `b${Date.now()}`, // Temporary ID, will be updated by server
          userId: user?.id,
          event: updateInvite.event,
          status: 'confirmed',
          date: updateInvite.event.date,
        };
        addBooking(newBooking); // Optimistic update
        cache.modify({
          fields: {
            bookings(existingBookings = []) {
              return [...existingBookings, newBooking];
            },
          },
        });
      }
    },
    refetchQueries: [{ query: GET_INVITES, variables: { userId: user?.id } }],
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const invites = data?.invites || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invites</Text>
      <FlatList
        data={invites}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>{item.event.title}</Text>
              <Text style={styles.cardSubtitle}>Status: {item.status}</Text>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => updateInvite({ variables: { inviteId: item.id, status: 'accepted' } })}>
                Accept
              </Button>
              <Button onPress={() => updateInvite({ variables: { inviteId: item.id, status: 'declined' } })}>
                Decline
              </Button>
              <Button onPress={() => navigation.navigate('Chat', { receiverId: item.event.host.id })}>
                Chat
              </Button>
            </Card.Actions>
          </Card>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noData}>No invites available</Text>}
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

export default InvitesScreen;