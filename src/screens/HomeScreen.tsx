// src/screens/HomeScreen.tsx
import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Appbar, Card } from 'react-native-paper';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { GET_INVITES, GET_BOOKINGS, GET_APPLICATIONS, GET_EVENTS, GET_ARTISTS } from '../graphql/queries';
import ActionButton from '../components/ActionButton';
import ArtistCard from '../components/ArtistCard';

const HomeScreen = () => {
  const { user } = useAuthStore();
  const { generalUnreadCount } = useNotificationStore();
  const navigation = useNavigation();
  const isArtist = user?.isArtist;
  const scrollY = useSharedValue(0);
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
    content: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    card: { marginVertical: 8, borderRadius: 8, elevation: 2 },
    cardContent: { padding: 12 },
    noData: { color: '#666', textAlign: 'center', marginTop: 8 },
  });
  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(scrollY.value > 50 ? -100 : 0) }],
  }));
  
    const { data: invitesData, loading: invitesLoading, error: invitesError } = useQuery(GET_INVITES, { skip: !isArtist });
    const { data: bookingsData, loading: bookingsLoading, error: bookingsError } = useQuery(GET_BOOKINGS, { skip: !isArtist });
    const { data: applicationsData, loading: applicationsLoading, error: applicationsError } = useQuery(GET_APPLICATIONS, { skip: isArtist });
    const { data: eventsData, loading: eventsLoading, error: eventsError } = useQuery(GET_EVENTS);
    const { data: artistsData, loading: artistsLoading, error: artistsError } = useQuery(GET_ARTISTS);
    
    console.log('Invites:', invitesData?.invites || 'No invites data');
    console.log('Bookings:', bookingsData?.bookings || 'No bookings data');
    console.log('Applications:', applicationsData?.applications || 'No applications data');
    console.log('Events:', eventsData?.events || 'No events data');
    console.log('Artists:', artistsData?.artists || 'No artists data');
    if (invitesError || bookingsError || applicationsError || eventsError || artistsError) {
      console.log('Errors:', { invitesError, bookingsError, applicationsError, eventsError, artistsError });
    }
      
    if (invitesLoading || bookingsLoading || applicationsLoading || eventsLoading || artistsLoading) return <Text>Loading...</Text>;
    if (invitesError) console.log('Invites Error:', invitesError);
    if (bookingsError) console.log('Bookings Error:', bookingsError);
    if (applicationsError) console.log('Applications Error:', applicationsError);
    if (eventsError) console.log('Events Error:', eventsError);
    if (artistsError) console.log('Artists Error:', artistsError);
  
    const events = eventsData?.events || [
      { id: '1', title: 'Rock Night', category: 'Music', date: '2025-04-01', location: 'Mumbai', status: 'open', host: { id: 'h1', displayName: 'Priya' } },
    ];
    const artists = artistsData?.artists || [
      { id: 'a1', displayName: 'Amit Singer', categories: ['Music'], rating: 4.7 },
    ];
  
    const roleSections = isArtist
      ? [
          { title: 'Invites', data: invitesData?.invites || [], actions: ['Accept', 'Decline', 'Chat'] },
          { title: 'Upcoming Bookings', data: bookingsData?.bookings || [], actions: [] },
        ]
      : [
          { title: 'Pending Applications', data: applicationsData?.applications || [], actions: ['Accept', 'Decline', 'Chat'] },
          { title: 'Upcoming Events', data: events.filter((e) => e.status === 'confirmed' || e.status === 'created'), actions: [] },
        ];
  

  return (
    
    // In return:
    <View style={styles.container}>
      <Animated.View style={[headerStyle, styles.header]}>
        <Appbar.Header style={{ backgroundColor: '#6B48FF' }}>
          <Appbar.Content title="Dashboard" titleStyle={{ color: '#fff' }} />
          <Appbar.Action icon="magnify" color="#fff" onPress={() => navigation.navigate('Events')} />
          <Appbar.Action icon="map-marker" color="#fff" onPress={() => console.log('Location TBD')} />
          <Appbar.Action
            icon="bell"
            color="#fff"
            onPress={() => navigation.navigate('Notifications')}
            badge={generalUnreadCount > 0 ? generalUnreadCount : undefined}
          />
        </Appbar.Header>
      </Animated.View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        onScroll={(e) => (scrollY.value = e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        {roleSections.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.length > 0 ? (
              section.data.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => navigation.navigate('EventDetails', { eventId: item.event.id })}
                >
                  <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                      <Text style={{ fontSize: 16, color: '#333' }}>{item.event.title}</Text>
                      <Text style={{ fontSize: 14, color: '#666' }}>Status: {item.status}</Text>
                    </Card.Content>
                    {section.actions.length > 0 && (
                      <Card.Actions>
                        {section.actions.map((action) => (
                          <ActionButton key={action} label={action} onPress={() => console.log(`${action} ${item.id}`)} />
                        ))}
                      </Card.Actions>
                    )}
                  </Card>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noData}>No data available</Text>
            )}
          </View>
        ))}
        <View>
          <Text style={styles.sectionTitle}>Trending Artists</Text>
          <ScrollView horizontal>
            {artists.slice(0, 5).map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;