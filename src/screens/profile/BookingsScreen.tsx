import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Card,
  Badge,
  Chip,
  Button,
  IconButton,
  ActivityIndicator,
  Portal,
  Modal,
  useTheme,
  Dialog,
} from 'react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { useBookingStore, Booking } from '../../stores/bookingStore';
import { useQuery, useMutation, gql } from '@apollo/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { websocketService } from '../../services/websocketService';
import InvitesScreen from './InvitesScreen';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { Event } from '../../stores/bookingStore';
import { openInMaps } from '../../utils/openInMaps';

const GET_BOOKINGS = gql`
  query GetBookings($userId: ID!) {
    bookings(userId: $userId) {
      id
      userId
      event {
        id
        title
        banner
        dateTime
        location {
          address
          lat
          lng
        }
        host {
          id
          fullName
          profilePicture
        }
        type
        budget {
          min
          max
        }
        status
      }
      status
      date
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_BOOKING = gql`
  mutation UpdateBookingStatus($bookingId: ID!, $status: String!) {
    updateBookingStatus(bookingId: $bookingId, status: $status) {
      id
      status
      updatedAt
      event {
        id
        title
      }
    }
  }
`;

const Tab = createMaterialTopTabNavigator();

type RootStackParamList = {
  Map: { location: Event['location']; title: string };
  Chat: { receiverId: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const BookingsScreen: React.FC<{ navigation: NavigationProp }> = ({ navigation }) => {
  const theme = useTheme();
  const { currentUser } = useAuthStore();
  const { bookings, setBookings, updateBooking } = useBookingStore();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

  const { loading, error, refetch } = useQuery(GET_BOOKINGS, {
    fetchPolicy: 'cache-and-network',
    variables: { userId: currentUser?.id },
    skip: !currentUser?.id,
    onCompleted: (data) => {
      setBookings(data.bookings);
    },
  });

  const [updateBookingStatus, { loading: updateLoading }] = useMutation(UPDATE_BOOKING, {
    onCompleted: (data) => {
      setModalVisible(false);
      updateBooking(data.updateBookingStatus.id, {
        status: data.updateBookingStatus.status,
        updatedAt: data.updateBookingStatus.updatedAt,
      });
      refetch();
    },
  });

  // WebSocket integration for real-time updates
  React.useEffect(() => {
    websocketService.on('newBooking', (data: Booking) => {
      setBookings([...bookings, data]);
    });
    websocketService.on('bookingUpdate', (data: Partial<Booking> & { id: string }) => {
      updateBooking(data.id, data);
    });
    return () => {
      websocketService.off('newBooking', () => { });
      websocketService.off('bookingUpdate', () => { });
    };
  }, [bookings, setBookings, updateBooking]);

  const handleCancel = useCallback((bookingId: string) => {
    setShowCancelDialog(true);
  }, []);

  const confirmCancel = () => {
    updateBookingStatus({ variables: { bookingId: selectedBooking?.id, status: 'cancelled' } });
    setShowCancelDialog(false);
  };

  const renderStatusBadge = useCallback((status: string) => {
    const colorMap: { [key: string]: string } = {
      confirmed: '#4CAF50',
      cancelled: '#F44336',
      pending: '#FF9800',
    };
    const color = colorMap[status.toLowerCase()] || '#2196F3';
    return (
      <Badge style={[styles.statusBadge, { backgroundColor: color }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }, []);

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return 'Date not available';
    try {
      return format(parseISO(dateString), 'EEE, MMM d, yyyy • h:mm a');
    } catch {
      return dateString;
    }
  }, []);

  const BookingCard = memo(({ item }: { item: Booking }) => {
    const defaultImage = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4';
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedBooking(item);
          setModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <Card style={styles.bookingCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {item.event.title}
            </Text>
            {renderStatusBadge(item.status)}
          </View>
          <View style={styles.cardContent}>
            <Image
              source={{ uri: item.event.banner || defaultImage }}
              style={styles.eventImage}
              resizeMode="cover"
            />
            <View style={styles.detailsContainer}>
              <Text style={styles.infoText}>
                <MaterialIcons name="event" size={16} color={theme.colors.primary} />{' '}
                {formatDate(item.event.dateTime || item.date)}
              </Text>
              <Text style={styles.infoText} numberOfLines={1}>
                <MaterialIcons name="location-on" size={16} color={theme.colors.primary} />{' '}
                {item.event.location?.address || 'N/A'}
              </Text>
              <Text style={styles.infoText} numberOfLines={1}>
                <MaterialIcons name="person" size={16} color={theme.colors.primary} />{' '}
                Host: {item.event.host?.fullName || 'Unknown'}
              </Text>
              {/* <View style={styles.chipContainer}>
                {item.event.budget && (
                  <Chip style={styles.budgetChip} icon="currency-inr">
                    {item.event.budget.min} - {item.event.budget.max}
                  </Chip>
                )}
              </View> */}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  });

  const BookingModal = memo(() => {
    if (!selectedBooking) return null;
    const defaultImage = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4';
    const canCancel = selectedBooking.status.toLowerCase() === 'confirmed';
    const modalTheme = useTheme();

    return (
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedBooking.event.title}
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              />
            </View>

            <View style={styles.scrollContent}>
              <View style={styles.statusContainer}>
                <Text style={styles.sectionLabel}>Status:</Text>
                {renderStatusBadge(selectedBooking.status)}
              </View>

              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <MaterialIcons name="event" size={18} color={modalTheme.colors.primary} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {formatDate(selectedBooking.event.dateTime || selectedBooking.date)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialIcons name="location-on" size={18} color={modalTheme.colors.primary} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {selectedBooking.event.location?.address || 'Location not available'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialIcons name="person" size={18} color={modalTheme.colors.primary} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    Host: {selectedBooking.event.host?.fullName || 'Unknown host'}
                  </Text>
                </View>

                {selectedBooking.event.budget && (
                  <View style={styles.detailRow}>
                    <MaterialIcons name="attach-money" size={18} color={modalTheme.colors.primary} />
                    <Text style={styles.detailText}>
                      ₹{selectedBooking.event.budget.min} - ₹{selectedBooking.event.budget.max}
                    </Text>
                  </View>
                )}
              </View>

              {selectedBooking.event.type && (
                <View style={styles.chipSection}>
                  <Chip style={styles.eventTypeChip}>
                    {selectedBooking.event.type}
                  </Chip>
                </View>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                icon="map"
                onPress={() => {
                  if (selectedBooking.event.location) {
                    openInMaps(
                      selectedBooking.event.location.lat,
                      selectedBooking.event.location.lng
                    );
                  }
                }}
                style={[styles.buttonRow, { backgroundColor: modalTheme.colors.primary }]}
                disabled={!selectedBooking.event.location?.lat}
              >
                View on Map
              </Button>

              <Button
                mode="contained"
                icon="message"
                onPress={() => {
                  if (selectedBooking.event.host?.id) {
                    navigation.navigate('Chat', {
                      receiverId: selectedBooking.event.host.id
                    });
                  }
                }}
                style={[styles.buttonRow, { backgroundColor: modalTheme.colors.primary }]}
                disabled={!selectedBooking.event.host?.id}
              >
                Message Host
              </Button>

              {canCancel && (
                <Button
                  mode="outlined"
                  icon="cancel"
                  onPress={() => handleCancel(selectedBooking.id)}
                  style={[styles.cancelButton, styles.buttonRow]}
                  loading={updateLoading}
                >
                  Cancel Booking
                </Button>
              )}
            </View>
          </View>
        </Modal>

        <Dialog visible={showCancelDialog} onDismiss={() => setShowCancelDialog(false)}>
          <Dialog.Title>Confirm Cancellation</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to cancel this booking?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCancelDialog(false)}>No</Button>
            <Button onPress={confirmCancel} disabled={updateLoading}>
              Yes
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  });

  const BookingsTab = () => {
    if (loading && !bookings.length) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>Failed to load bookings</Text>
          <Button mode="contained" onPress={() => refetch()}>
            Retry
          </Button>
        </View>
      );
    }

    return (
      <FlatList
        data={bookings}
        renderItem={({ item }) => <BookingCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="calendar-check" size={48} color="#BDBDBD" />
            <Text style={styles.emptyText}>No Bookings</Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: '#FFF' }]}>
          {Platform.OS== 'ios' &&  <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            style={{ position: 'absolute', left: 16 }}
          />}
          <Text style={styles.screenTitle}> My Bookings & Invites</Text>
        </View>

        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: '#757575',
            tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
            tabBarStyle: { 
              backgroundColor: '#FFF',
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            },
          }}
        >
          <Tab.Screen
            name="Bookings"
            component={BookingsTab}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialIcons name="calendar-today" size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Invites"
            component={InvitesScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialIcons name="mail" size={20} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
        <BookingModal />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: { padding: 16 },
  bookingCard: { marginBottom: 16, borderRadius: 12, elevation: 3, backgroundColor: '#FFF' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  statusBadge: { paddingHorizontal: 8, fontSize: 12 },
  cardContent: { flexDirection: 'row', padding: 12 },
  eventImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  detailsContainer: { flex: 1 },
  infoText: { fontSize: 14, color: '#555', marginBottom: 6 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 },
  eventTypeChip: { backgroundColor: '#F3E5F5', marginRight: 8 },
  budgetChip: { backgroundColor: '#E8F5E9' },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    height: '100%',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '100%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },
  closeButton: { padding: 8 },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  statusContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginRight: 8 },
  detailSection: {
    paddingBottom: 12,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { fontSize: 14, color: '#555' },
  chipSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 8,
    paddingTop: 16,
  },
  buttonRow: {
    width: '100%',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666', marginTop: 12 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#F44336', marginVertical: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '500', color: '#666' },
  cancelButton: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
});

export default BookingsScreen;