// src/screens/InvitesScreen.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card, Button, Badge, Chip, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuthStore } from '../../stores/authStore';
import { useBookingStore } from '../../stores/bookingStore';
import { GET_BOOKINGS, GET_INVITES } from '../../graphql/queries';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { theme } from '../../theme';
import { UPDATE_INVITE } from '../../graphql/mutations';

// Define GraphQL queries and mutations



// Define TypeScript interfaces
interface Location {
  address: string;
  lat: number;
  lng: number;
}

interface Budget {
  min: number;
  max: number;
}

interface Host {
  id: string;
  fullName: string;
  profilePicture?: string;
}

interface Event {
  id: string;
  title: string;
  banner?: string;
  dateTime?: string;
  location?: Location;
  host?: Host;
  type?: string;
  budget?: Budget;
  status?: string;
}

interface Invite {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  event: Event;
}

interface GetInvitesQuery {
  invites: Invite[];
}

interface UpdateInviteMutation {
  updateInviteStatus: {
    id: string;
    status: string;
    updatedAt: string;
    event: {
      id: string;
      title: string;
    };
  };
}

type RootStackParamList = {
  EventDetails: { eventId: string };
  Chat: { receiverId: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const InvitesScreen = () => {
  const { currentUser } = useAuthStore();
  const { addBooking } = useBookingStore();
  const navigation = useNavigation<NavigationProp>();

  const { data, loading, error, refetch } = useQuery<GetInvitesQuery>(GET_INVITES, {
    variables: { userId: currentUser?.id },
    skip: !currentUser,
  });

  const [updateInvite, { loading: updateLoading }] = useMutation<UpdateInviteMutation>(UPDATE_INVITE, {
    update: (cache, { data }) => {
      if (data?.updateInviteStatus?.status === 'accepted') {
        // Read the invites from cache
        const existingData = cache.readQuery<GetInvitesQuery>({
          query: GET_INVITES,
          variables: { userId: currentUser?.id },
        });

        // Find the accepted invite from cache
        const invite = existingData?.invites.find(inv => inv.id === data.updateInviteStatus.id);

        if (invite) {
          // Generate a temporary ID that will be updated after server sends real ID
          const tempBookingId = `temp-booking-${Date.now()}`;
          
          // Ensure location has required fields
          const eventWithValidLocation = {
            ...invite.event,
            location: invite.event.location ? {
              address: invite.event.location.address || '',
              lat: invite.event.location.lat || 0,
              lng: invite.event.location.lng || 0
            } : undefined,
            status: invite.event.status || 'Open'
          };
          
          const newBooking = {
            id: tempBookingId, // Temporary ID until server sync
            userId: currentUser?.id || '',
            event: eventWithValidLocation,
            status: 'confirmed',
            date: invite.event.dateTime || new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Add to booking store for optimistic UI update
          addBooking(newBooking);

          // Update cache for bookings query
          try {
            const bookingsData = cache.readQuery<{ bookings: any[] }>({
              query: GET_BOOKINGS,
              variables: { userId: currentUser?.id },
            });

            if (bookingsData && bookingsData.bookings) {
              cache.writeQuery({
                query: GET_BOOKINGS,
                variables: { userId: currentUser?.id },
                data: {
                  bookings: [...bookingsData.bookings, newBooking],
                },
              });
            }
          } catch (e) {
            // Cache may not exist yet, which is fine
            console.log('Bookings cache not found for update');
          }
        }
      }
    },
    optimisticResponse: ({ inviteId, status }) => {
      return {
        updateInviteStatus: {
          __typename: 'Invite',
          id: inviteId,
          status: status,
          updatedAt: new Date().toISOString(),
          event: {
            __typename: 'Event',
            id: '', // Will be filled by server
            title: '' // Will be filled by server
          }
        }
      };
    },
    refetchQueries: [
      { query: GET_INVITES, variables: { userId: currentUser?.id } },
      { query: GET_BOOKINGS, variables: { userId: currentUser?.id } }
    ],
    onCompleted: (data) => {
      if (data?.updateInviteStatus?.status === 'accepted') {
        // Show success toast or message here
        console.log('Invite accepted and converted to booking successfully');
      }
    },
    onError: (error) => {
      // Handle error and possibly revert optimistic update
      console.error('Error updating invite status:', error);
      // Could show an error toast here
    }
  });

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date not available';

    try {
      const date = parseISO(dateString);
      return format(date, 'EEE, MMM d, yyyy • h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  const handleAcceptInvite = (invite: Invite) => {
    // First update the UI optimistically for a smoother user experience
    const tempBookingId = `temp-booking-${Date.now()}`;
    
    // Make sure location has required fields
    const eventWithValidLocation = {
      ...invite.event,
      location: invite.event.location ? {
        address: invite.event.location.address || '',
        lat: invite.event.location.lat || 0,
        lng: invite.event.location.lng || 0
      } : undefined,
      status: invite.event.status || 'Open'
    };
    
    // Create the temporary booking record for optimistic UI update
    const optimisticBooking = {
      id: tempBookingId,
      userId: currentUser?.id || '',
      event: eventWithValidLocation,
      status: 'confirmed',
      date: invite.event.dateTime || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add the booking to store for immediate UI update
    addBooking(optimisticBooking);
    
    // Then make the server call to update the actual data
    updateInvite({
      variables: { inviteId: invite.id, status: 'accepted' }
    });
  };

  const renderInviteCard = ({ item }: { item: Invite }) => {
    const defaultImage = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4';

    return (
      <TouchableOpacity
        onPress={() => {
          if (item.event.id) {
            navigation.navigate('EventDetails', { eventId: item.event.id });
          }
        }}
        activeOpacity={0.7}
      >
        <Card style={styles.inviteCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.eventTitle} numberOfLines={1}>{item.event.title}</Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.event.banner || defaultImage }}
                style={styles.eventImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.infoRow}>
                <MaterialIcons name="event" size={16} color={theme.colors.primary} />
                <Text style={styles.infoText}>{formatDate(item.event.dateTime)}</Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons name="location-on" size={16} color={theme.colors.primary} />
                <Text style={styles.infoText} numberOfLines={1}>{item.event.location?.address || 'Location not specified'}</Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons name="person" size={16} color={theme.colors.primary} />
                <Text style={styles.infoText} numberOfLines={1}>
                  Host: {item.event.host?.fullName || 'Unknown host'}
                </Text>
              </View>

              <View style={styles.chipContainer}>
                {item.event.type && (
                  <Chip
                    style={styles.eventTypeChip}
                    textStyle={styles.eventTypeText}
                  >
                    {item.event.type}
                  </Chip>
                )}

                {item.event.budget && (
                  <Chip
                    style={styles.budgetChip}
                    textStyle={styles.budgetText}
                    icon="currency-inr"
                  >
                    {item.event.budget.min} - {item.event.budget.max}
                  </Chip>
                )}
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => handleAcceptInvite(item)}
              style={[styles.actionButton, styles.acceptButton]}
              loading={updateLoading}
              disabled={item.status !== 'pending'}
            >
              Accept
            </Button>
            <Button
              mode="outlined"
              onPress={() => updateInvite({
                variables: { inviteId: item.id, status: 'declined' }
              })}
              style={[styles.actionButton, styles.rejectButton]}
              loading={updateLoading}
              disabled={item.status !== 'pending'}
            >
              Reject
            </Button>
          </View>

          {item.event.host?.id && (
            <Button
              mode="outlined"
              onPress={() => {
                if (item.event.host?.id) {
                  navigation.navigate('Chat', { receiverId: item.event.host.id });
                }
              }}
              style={styles.messageButton}
              icon="message"
            >
              Message Host
            </Button>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading invites...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#F44336" />
        <Text style={styles.errorText}>Error loading invites</Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  const invites = data?.invites || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={invites}
        renderItem={renderInviteCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="envelope-open" size={48} color="#BDBDBD" />
            <Text style={styles.emptyText}>No invites available</Text>
            <Text style={styles.emptySubText}>New event invites will appear here</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding for better scrolling
  },
  inviteCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#FFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    fontSize: 12,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  eventTypeChip: {
    backgroundColor: '#F3E5F5',
    marginRight: 8,
    marginBottom: 4,
  },
  eventTypeText: {
    color: '#7B1FA2',
    fontSize: 12,
  },
  budgetChip: {
    backgroundColor: '#E8F5E9',
    marginBottom: 4,
  },
  budgetText: {
    color: '#2E7D32',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: theme.colors.primary,
  },
  rejectButton: {
    borderColor: theme.colors.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  messageButton: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderColor: theme.colors.primary,
  },
});

export default InvitesScreen;