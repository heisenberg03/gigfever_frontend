import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_BOOKINGS } from '../../graphql/queries';
import { useAuthStore } from '../../stores/authStore';
import { Card } from 'react-native-paper';

export const BookingsScreen = () => {
  const { currentUser: user } = useAuthStore();
  const { data, loading, error } = useQuery(GET_BOOKINGS, {
    variables: { userId: user?.id },
    skip: !user,
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const bookings = data?.bookings || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>{item.event.title}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.noData}>No bookings</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { marginVertical: 5 },
  title: { fontSize: 16, fontWeight: 'bold' },
  noData: { textAlign: 'center', marginTop: 20 },
});

export default BookingsScreen;