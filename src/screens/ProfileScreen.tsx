import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Appbar, Card, Avatar, Tabs, TabScreen, Button } from 'react-native-paper';
import { useQuery } from '@apollo/client';
import { useAuthStore } from '../stores/authStore';
import { GET_PORTFOLIO, GET_INVITES, GET_APPLICATIONS, GET_BOOKINGS, GET_EVENTS } from '../graphql/queries';
import ReviewModal from '../components/ReviewModal';

const ProfileScreen = ({navigation}: any) => {
  const { user } = useAuthStore();
  const isArtist = user?.isArtist;
  const [showReviews, setShowReviews] = useState(false);

  const { data: portfolioData } = useQuery(GET_PORTFOLIO, { skip: !isArtist });
  const { data: invitesData } = useQuery(GET_INVITES, { skip: !isArtist });
  const { data: applicationsData } = useQuery(GET_APPLICATIONS, { skip: !isArtist });
  const { data: bookingsData } = useQuery(GET_BOOKINGS, { skip: !isArtist });
  const { data: eventsData } = useQuery(GET_EVENTS, { skip: isArtist });

  const getCardStyle = (status: 'confirmed' | 'cancelled' | 'past' | 'open' | 'draft') => ({
    confirmed: { borderColor: 'green' },
    cancelled: { borderColor: 'red' },
    past: { borderColor: 'gray' },
    open: { borderColor: 'blue' },
    draft: { borderColor: 'purple' },
  }[status] || {});

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={user?.displayName} />
        <Appbar.Action icon="pencil" onPress={() => user && navigation.navigate('EditProfile', {user})} />
      </Appbar.Header>
      <ScrollView>
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Avatar.Image size={100} source={{ uri: user?.profilePicture || 'default.jpg' }} />
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{user?.displayName}</Text>
          <TouchableOpacity onPress={() => setShowReviews(true)}>
            <Text>Rating: 4.8 ★ (12 reviews)</Text>
          </TouchableOpacity>
        </View>
        <Tabs>
          <TabScreen label="Details">
            <View style={{ padding: 16 }}>
              <Text>Categories: {user?.categories?.join(', ') || 'None'}</Text>
              <Text>Sub-Categories: {user?.subCategories?.join(', ') || 'None'}</Text>
              <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Social Links</Text>
              <Button
                icon={user?.socialLinks?.instagram ? 'instagram' : 'instagram-outline'}
                onPress={() => console.log('Instagram OAuth TBD')}
              >
                Instagram
              </Button>
              <Button
                icon={user?.socialLinks?.twitter ? 'twitter' : 'twitter-outline'}
                onPress={() => console.log('Twitter OAuth TBD')}
              >
                Twitter
              </Button>
            </View>
          </TabScreen>
          {isArtist && (
            <>
              <TabScreen label="Portfolio">
                <View style={{ padding: 16 }}>
                  {portfolioData?.portfolio.map((item) => (
                    <Card key={item.id}>
                      <Card.Content>
                        <Text>{item.type}: {item.url}</Text>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              </TabScreen>
              <TabScreen label="Invites">
                <View style={{ padding: 16 }}>
                  {invitesData?.invites.map((invite) => (
                    <Card key={invite.id}>
                      <Card.Content>
                        <Text>{invite.event.title}</Text>
                        <Text>Status: {invite.status}</Text>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              </TabScreen>
              <TabScreen label="Applications">
                <View style={{ padding: 16 }}>
                  {applicationsData?.applications.map((app) => (
                    <Card key={app.id}>
                      <Card.Content>
                        <Text>{app.event.title}</Text>
                        <Text>Status: {app.status}</Text>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              </TabScreen>
              <TabScreen label="Bookings">
                <View style={{ padding: 16 }}>
                  {bookingsData?.bookings.map((booking) => (
                    <TouchableOpacity
                      key={booking.id}
                      onPress={() => navigation.navigate('EventDetails', { eventId: booking.event.id })}
                    >
                      <Card style={getCardStyle(booking.status)}>
                        <Card.Content>
                          <Text>{booking.event.title}</Text>
                          <Text>Status: {booking.status}</Text>
                        </Card.Content>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </View>
              </TabScreen>
            </>
          )}
          {!isArtist && (
            <TabScreen label="Events">
              <View style={{ padding: 16 }}>
                {eventsData?.events.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
                  >
                    <Card style={getCardStyle(event.status)}>
                      <Card.Content>
                        <Text>{event.title}</Text>
                        <Text>Status: {event.status}</Text>
                      </Card.Content>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            </TabScreen>
          )}
        </Tabs>
      </ScrollView>
      <ReviewModal visible={showReviews} onDismiss={() => setShowReviews(false)} reviews={mockData.reviews} loading={false} />
    </View>
  );
};

export default ProfileScreen;