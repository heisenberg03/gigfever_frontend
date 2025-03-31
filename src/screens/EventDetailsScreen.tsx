import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  Share,
  Animated,
} from 'react-native';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Button, IconButton, Card, Chip, Avatar, Menu, Portal, Modal, Badge } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE, Provider } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { theme } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import ApplicationCard from '../components/ApplicationCard';
import ReviewsModal from '../components/ReviewsModal';
import { useAuthStore } from '../stores/authStore';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { openInMaps } from '../utils/openInMaps';


const GET_EVENT_DETAILS = gql`
  query GetEventDetails($id: ID!) {
    event(id: $id) {
      id
      title
      banner
      date
      time
      location {
        lat
        lng
        address
      }
      type
      categories
      subcategories
      description
      budget { min max }
      host { 
        id 
        fullName 
        rating 
        reviewsCount
        pastEventsCount 
        profilePicture
      }
      applications { 
        id 
        fullName 
        status
        artistType
        location
        artistRating
        artistReviewCount
        budget
        categoryIDs
        subCategoryIDs
        profilePicture
        username
      }
      confirmedArtist { 
        id 
        fullName
        artistType
        location
        artistRating
        artistReviewCount
        budget
        categoryIDs
        subCategoryIDs
        profilePicture
        username
      }
      status
      userApplicationStatus
      isFavorite
    }
  }
`;

const APPLY_AS_ARTIST = gql`
  mutation ApplyAsArtist($eventId: ID!) { 
    applyAsArtist(eventId: $eventId)
  }
`;

const WITHDRAW_APPLICATION = gql`
  mutation WithdrawApplication($eventId: ID!) { 
    withdrawApplication(eventId: $eventId) 
  }
`;

const ACCEPT_ARTIST = gql`
  mutation AcceptArtist($eventId: ID!, $artistId: ID!) {
    acceptArtist(eventId: $eventId, artistId: $artistId) {
      id
      status
      confirmedArtist {
        id
        fullName
      }
    }
  }
`;

const REJECT_ARTIST = gql`
  mutation RejectArtist($eventId: ID!, $artistId: ID!) {
    rejectArtist(eventId: $eventId, artistId: $artistId) {
      id
      status
    }
  }
`;

const TOGGLE_FAVORITE = gql`
  mutation ToggleFavoriteEvent($eventId: ID!) {
    toggleFavoriteEvent(eventId: $eventId)
  }
`;

const CANCEL_EVENT = gql`
  mutation CancelEvent($eventId: ID!) {
    cancelEvent(eventId: $eventId) {
      id
      status
    }
  }
`;

const DELETE_EVENT = gql`
  mutation DeleteEvent($eventId: ID!) {
    deleteEvent(eventId: $eventId)
  }
`;


type EventDetailsScreenRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;
type EventDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Helper function for map provider type
const getMapProvider = (provider: Provider | undefined): any => provider;

const EventDetailsScreen = () => {
  const route = useRoute<EventDetailsScreenRouteProp>();
  const { eventId, eventData } = route.params;
  const navigation = useNavigation<EventDetailsScreenNavigationProp>();
  const { currentUser } = useAuthStore();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [fadeAnim] = useState(new Animated.Value(0)); // For sticky button animation
  const [scrollY] = useState(new Animated.Value(0)); // For header animation
  const [mapProvider, setMapProvider] = useState<Provider | undefined>(Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE);

  // State
  const [showReviews, setShowReviews] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportHostModalVisible, setReportHostModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [applicationsCollapsed, setApplicationsCollapsed] = useState(false);
  const [cachedEventData, setCachedEventData] = useState(eventData);

  const needsDetailedFetch = !cachedEventData || !cachedEventData.applications || !cachedEventData.host || !cachedEventData.location || !cachedEventData.budget;

  const { data, loading, error, refetch } = useQuery(GET_EVENT_DETAILS, {
    variables: { id: eventId },
    fetchPolicy: needsDetailedFetch ? 'cache-and-network' : 'cache-first',
    skip: !needsDetailedFetch,
    onCompleted: (data) => setCachedEventData(data?.event),
  });

  useEffect(() => {
    if (data?.event) setCachedEventData(data.event);
  }, [data]);

  const [applyAsArtist, { loading: applyLoading }] = useMutation(APPLY_AS_ARTIST, { onCompleted: () => refetch() });
  const [withdrawApplication, { loading: withdrawLoading }] = useMutation(WITHDRAW_APPLICATION, { onCompleted: () => refetch() });
  const [acceptArtist] = useMutation(ACCEPT_ARTIST, { onCompleted: () => refetch() });
  const [rejectArtist] = useMutation(REJECT_ARTIST, { onCompleted: () => refetch() });
  const [toggleFavorite] = useMutation(TOGGLE_FAVORITE, { onCompleted: () => refetch() });
  const [cancelEvent] = useMutation(CANCEL_EVENT, { onCompleted: () => { refetch(); setConfirmCancel(false); } });
  const [deleteEvent] = useMutation(DELETE_EVENT, { onCompleted: () => navigation.goBack() });

  // Sticky button animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Header opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (loading && !cachedEventData) return <LoadingView />;
  if (error && !cachedEventData) return <ErrorView error={error.message} onRetry={refetch} />;
  if (!cachedEventData) return null;

  const event = cachedEventData;
  const isHost = event.host.id === currentUser?.id;
  const isPendingArtist = event.userApplicationStatus === 'Applied';
  const isConfirmedArtist = event.userApplicationStatus === 'Confirmed';
  const isEventOpen = event.status === 'Open';
  const isEventConfirmed = event.status === 'Confirmed';
  const isEventCancelled = event.status === 'Cancelled';

  const dateTimeString = `${format(parseISO(event.date), 'EEE, MMM d, yyyy')} • ${format(new Date(`1970-01-01T${event.time}`), 'h:mm a')}`;

  // Handlers
  const handleApplyOrWithdraw = () => {
    if (isPendingArtist) {
      Alert.alert("Withdraw Application", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Withdraw", style: "destructive", onPress: () => withdrawApplication({ variables: { eventId } }) },
      ]);
    } else {
      applyAsArtist({ variables: { eventId } });
    }
  };

  const handleShare = () => {
    Share.share({
      message: `Check out this event: ${event.title}`,
      url: `https://gigfever.com/events/${eventId}`,
    });
  };

  const scrollToApplications = () => {
    if (event.applications?.length) {
      scrollViewRef.current?.scrollTo({ y: 400, animated: true }); // Adjusted based on new layout
    }
  };

  const toggleMapProvider = () => {
    if (Platform.OS === 'ios') {
      setMapProvider(mapProvider === PROVIDER_GOOGLE ? undefined : PROVIDER_GOOGLE);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      <View style={[styles.container, {paddingTop: 0}]}>
        {/* Animated Header */}
        <Animated.View style={[
          styles.header, 
          {
            paddingTop: insets.top,
            paddingBottom: 8,
            borderBottomWidth: 0
          },
          {
            backgroundColor: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)'],
              extrapolate: 'clamp',
            })
          },
          {
            borderBottomWidth: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            })
          },
          {
            elevation: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, 4],
              extrapolate: 'clamp',
            }),
          },
          { borderBottomColor: '#eaeaea' }
        ]}>
          <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} style={styles.backButton} />
          <Animated.Text style={[styles.headerTitle, { opacity: headerOpacity }]} numberOfLines={1}>{event.title}</Animated.Text>
          <View style={styles.headerActions}>
            <IconButton
              icon={event.isFavorite ? "heart" : "heart-outline"}
              size={24}
              iconColor={event.isFavorite ? "#FF4081" : "#333"}
              style={{backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              onPress={() => toggleFavorite({ variables: { eventId } })}
            />
            <IconButton icon="share-variant" size={24} style={{backgroundColor: 'rgba(255, 255, 255, 0.8)' }} onPress={handleShare} />
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={<IconButton icon="dots-vertical" size={24} style={{backgroundColor: 'rgba(255, 255, 255, 0.8)' }} onPress={() => setMenuVisible(true)} />}
              contentStyle={{ marginTop: Platform.OS === 'android' ? 40 : 0 }}
            >
              {isHost && <Menu.Item onPress={() => navigation.navigate('EditEvent', { eventId })} title="Edit" disabled={isEventCancelled} />}
              {isHost && !isEventConfirmed && !isEventCancelled && <Menu.Item onPress={() => setConfirmDelete(true)} title="Delete" />}
              {isHost && isEventConfirmed && !isEventCancelled && <Menu.Item onPress={() => setConfirmCancel(true)} title="Cancel" />}
              <Menu.Item onPress={() => setReportModalVisible(true)} title="Report Event" />
            </Menu>
          </View>
        </Animated.View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={{paddingTop: 0}}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          {/* Banner */}
          <View style={styles.bannerContainer}>
            <Image source={{ uri: event.banner }} style={styles.banner} resizeMode="cover" />
            <Badge style={[styles.statusBadge, getStatusStyle(event.status)]}>{event.status}</Badge>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{event.title}</Text>
            <InfoRow icon="event" text={dateTimeString} numberOfLines={2} />
            <Section title="Venue">
              <InfoRow icon="location-on" text={event.location.address} numberOfLines={2} />
            </Section>
            <Section title="Tags">
              <View style={styles.tagsContainer}>
                <Chip style={styles.eventTypeChip} textStyle={styles.eventTypeText}>{event.type}</Chip>
                {event.categories.map((cat: string) => (
                  <Chip key={cat} style={styles.categoryChip} textStyle={styles.categoryText}>{cat}</Chip>
                ))}
                {event.subcategories.map((sub: string) => (
                  <Chip key={sub} style={styles.subCategoryChip} textStyle={styles.subCategoryText}>{sub}</Chip>
                ))}
              </View>
            </Section>
            <Section title="Budget">
              <Text style={styles.budgetText}>₹{event.budget.min} - ₹{event.budget.max}</Text>
            </Section>
            <Section title="About this Event">
              <Text style={styles.description}>{event.description}</Text>
            </Section>

            {/* Applications Section */}
            {isHost && isEventOpen && (
              <Section title="Artist Applications" badge={event.applications?.length || 0}>
                <TouchableOpacity onPress={() => setApplicationsCollapsed(!applicationsCollapsed)} style={styles.collapseHeader}>
                  <Text style={styles.sectionTitle}>{applicationsCollapsed ? "Show" : "Hide"} Applications</Text>
                  <MaterialIcons name={applicationsCollapsed ? "expand-more" : "expand-less"} size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                {!applicationsCollapsed && (
                  event.applications?.length ? (
                    <View style={styles.applicationsContainer}>
                      {event.applications.map((artist: any, index: number) => (
                        <View
                          key={artist.id}
                          style={[
                            styles.applicationItemContainer,
                            index < event.applications.length - 1 && styles.applicationDivider
                          ]}
                        >
                          <ApplicationCard
                            artist={{ ...artist, hourlyRate: artist.budget, subCategories: artist.subCategoryIDs }}
                            onPress={(id) => navigation.navigate('ArtistProfile', { artistId: id })}
                          >
                            <View style={styles.applicationActions}>
                              <Button 
                                mode="contained" 
                                onPress={() => acceptArtist({ variables: { eventId, artistId: artist.id } })} 
                                style={styles.acceptButton} 
                                compact 
                                icon="check"
                                labelStyle={{ textAlign: 'center' }}
                              >
                                Accept
                              </Button>
                              <Button 
                                mode="outlined" 
                                onPress={() => rejectArtist({ variables: { eventId, artistId: artist.id } })} 
                                style={styles.rejectButton} 
                                compact 
                                icon="close"
                                labelStyle={{ textAlign: 'center' }}
                              >
                                Reject
                              </Button>
                              <Button 
                                mode="outlined" 
                                onPress={() => navigation.navigate('ChatConversation', { userId: artist.id })} 
                                style={styles.chatActionButton} 
                                compact 
                                icon="message-outline"
                                labelStyle={{ textAlign: 'center' }}
                              >
                                Chat
                              </Button>
                            </View>
                          </ApplicationCard>
                        </View>
                      ))}
                      <Button mode="contained" onPress={() => navigation.navigate('Artists')} style={styles.inviteButton} icon="account-plus">Invite More Artists</Button>
                    </View>
                  ) : (
                    <EmptyState icon="people-outline" title="No applications yet" subtitle="Invite artists to apply" onPress={() => navigation.navigate('Artists')} buttonText="Find Artists" />
                  )
                )}
              </Section>
            )}

            {/* Confirmed Artist */}
            {isEventConfirmed && event.confirmedArtist && (
              <Section title="Confirmed Artist">
                <Card style={styles.confirmedArtistCard}>
                  <ApplicationCard
                    artist={{ ...event.confirmedArtist, hourlyRate: event.confirmedArtist.budget, subCategories: event.confirmedArtist.subCategoryIDs }}
                    onPress={() => { }}
                  >
                    <Button mode="contained" onPress={() => navigation.navigate('Chat', { userId: event.confirmedArtist.id })} style={styles.chatActionButton} icon="message">Chat</Button>
                  </ApplicationCard>
                </Card>
              </Section>
            )}

            {/* Host Information */}
            <Section title="Hosted by">
              <Card style={styles.hostCard}>
                <View style={styles.hostCardContent}>
                  <Avatar.Image size={60} source={{ uri: event.host.profilePicture }} />
                  <View style={styles.hostDetails}>
                    <Text style={styles.hostName}>{event.host.fullName}</Text>
                    <View style={styles.hostStats}>
                      <Chip icon="star" style={styles.statPill}>{event.host.rating.toFixed(1)} ({event.host.reviewsCount})</Chip>
                      <Chip icon="trophy" style={styles.achievementPill}>{event.host.pastEventsCount} events</Chip>
                    </View>
                  </View>
                </View>
                <View style={styles.hostActionRow}>
                  <Button mode="outlined" onPress={() => setShowReviews(true)} style={styles.reviewsButton}>See all reviews</Button>
                  {!isHost && <Button mode="outlined" onPress={() => setReportHostModalVisible(true)} style={styles.reportHostButton} icon="flag">Report</Button>}
                </View>
              </Card>
            </Section>

            {/* Application Status */}
            {!isHost && isPendingArtist && (
              <Section>
                <Card style={styles.applicationStatusCard}>
                  <Text style={styles.applicationStatusTitle}>Your application is pending</Text>
                  <Text style={styles.applicationStatusText}>The host will review your application soon.</Text>
                </Card>
              </Section>
            )}

            {/* Map */}
            <Section title="Location Map">
              <Card style={styles.mapCard}>
                <MapView
                  style={styles.map}
                  provider={getMapProvider(mapProvider)}
                  initialRegion={{ latitude: event.location.lat, longitude: event.location.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                >
                  <Marker coordinate={{ latitude: event.location.lat, longitude: event.location.lng }} />
                </MapView>
                <View style={styles.mapActionRow}>
                  {Platform.OS === 'ios' && (
                    <Button 
                      mode="outlined" 
                      onPress={toggleMapProvider} 
                      style={styles.mapProviderButton}
                      icon={mapProvider === PROVIDER_GOOGLE ? "apple-ios" : "google"}
                    >
                      {mapProvider === PROVIDER_GOOGLE ? "Apple Maps" : "Google Maps"}
                    </Button>
                  )}

                  <Button
                    mode="contained"
                    icon="map-marker"
                    onPress={() => openInMaps(event.location.lat, event.location.lng)}
                  >
                    Open in Maps
                  </Button>
                </View>
              </Card>
            </Section>
          </View>
        </ScrollView>

        {/* Sticky Buttons */}
        {(!isHost && (isEventOpen || isConfirmedArtist)) && (
          <Animated.View style={[styles.stickyButtonContainer, { opacity: fadeAnim }]}>
            {isEventOpen && (
              <Button
                mode={isPendingArtist ? "outlined" : "contained"}
                onPress={handleApplyOrWithdraw}
                loading={applyLoading || withdrawLoading}
                style={[styles.stickyActionButton, isPendingArtist ? styles.withdrawButtonSticky : {}]}
                icon={isPendingArtist ? "close" : "check"}
              >
                {isPendingArtist ? "Withdraw" : "Apply"}
              </Button>
            )}
            {isConfirmedArtist && (
              <Button
                mode="outlined"
                onPress={() => Alert.alert("Cancel Booking", "Are you sure?", [{ text: "No" }, { text: "Yes", style: "destructive", onPress: () => withdrawApplication({ variables: { eventId } }) }])}
                style={[styles.stickyActionButton, styles.cancelButtonSticky]}
                icon="calendar-remove"
              >
                Cancel Booking
              </Button>
            )}
            <Button mode="contained" onPress={() => navigation.navigate('Chat', { userId: event.host.id })} style={styles.stickyChatButton} icon="message-text">Message Host</Button>
          </Animated.View>
        )}

        {/* Modals */}
        <ReviewsModal visible={showReviews} onClose={() => setShowReviews(false)} userId={event.host.id} initialTab="HOST" showTabs={false} availableTypes={['HOST']} />
        <ConfirmationModal
          visible={confirmDelete}
          onDismiss={() => setConfirmDelete(false)}
          title="Delete Event"
          message="Are you sure you want to delete this event? This action cannot be undone."
          onConfirm={() => deleteEvent({ variables: { eventId } })}
          confirmText="Delete"
          confirmStyle={styles.deleteButton}
        />
        <ConfirmationModal
          visible={confirmCancel}
          onDismiss={() => setConfirmCancel(false)}
          title="Cancel Event"
          message="Are you sure you want to cancel this event? Artists will be notified."
          onConfirm={() => cancelEvent({ variables: { eventId } })}
          confirmText="Cancel Event"
          confirmStyle={styles.cancelButton}
        />
        <ReportModal visible={reportModalVisible} onDismiss={() => setReportModalVisible(false)} title="Report Event" />
        <ReportModal visible={reportHostModalVisible} onDismiss={() => setReportHostModalVisible(false)} title="Report Host" />
      </View>
    </SafeAreaView>
  );
};

// Helper Components
const LoadingView = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Loading event details...</Text>
  </View>
);

const ErrorView = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>Error: {error}</Text>
    <Button mode="contained" onPress={onRetry}>Try Again</Button>
  </View>
);

const InfoRow = ({ icon, text, numberOfLines }: { icon: "event" | "location-on" | "star" | string; text: string; numberOfLines?: number }) => (
  <View style={styles.dateTimeRow}>
    <MaterialIcons name={icon as any} size={20} color={theme.colors.primary} />
    <Text style={styles.dateTimeText} numberOfLines={numberOfLines}>{text}</Text>
  </View>
);

const Section = ({ title, badge, children }: { title?: string; badge?: number; children: React.ReactNode }) => (
  <View style={styles.section}>
    {title && (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {badge !== undefined && <Badge style={styles.applicationsBadge}>{badge}</Badge>}
      </View>
    )}
    {children}
  </View>
);

const EmptyState = ({ icon, title, subtitle, onPress, buttonText }: { icon: "people-outline" | string; title: string; subtitle: string; onPress: () => void; buttonText: string }) => (
  <View style={styles.noApplicationsContainer}>
    <MaterialIcons name={icon as any} size={48} color="#aaa" style={{ marginBottom: 12 }} />
    <Text style={styles.noApplicationsText}>{title}</Text>
    <Text style={styles.noApplicationsSubtext}>{subtitle}</Text>
    <Button mode="contained" onPress={onPress} style={[styles.inviteButton, styles.noApplicationsButton]} icon="account-plus">{buttonText}</Button>
  </View>
);

const ConfirmationModal = ({ visible, onDismiss, title, message, onConfirm, confirmText, confirmStyle }: { visible: boolean; onDismiss: () => void; title: string; message: string; onConfirm: () => void; confirmText: string; confirmStyle: any }) => (
  <Portal>
    <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContent}>
      <Text style={styles.modalTitle}>{title}</Text>
      <Text style={styles.modalText}>{message}</Text>
      <View style={styles.modalActions}>
        <Button mode="outlined" onPress={onDismiss} style={styles.modalButton}>Cancel</Button>
        <Button mode="contained" onPress={onConfirm} style={[styles.modalButton, confirmStyle]}>{confirmText}</Button>
      </View>
    </Modal>
  </Portal>
);

const ReportModal = ({ visible, onDismiss, title }: { visible: boolean; onDismiss: () => void; title: string }) => (
  <Portal>
    <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContent}>
      <Text style={styles.modalTitle}>{title}</Text>
      {["Inappropriate Content", "Scam or Fraud", "Violates Terms", "Harassment", "False Information"].map((option) => (
        <TouchableOpacity key={option} style={styles.reportOption} onPress={() => { Alert.alert("Reported", "Thank you for your report. We'll review it shortly."); onDismiss(); }}>
          <Text style={styles.reportOptionText}>{option}</Text>
        </TouchableOpacity>
      ))}
      <Button mode="outlined" onPress={onDismiss} style={styles.cancelReportButton}>Cancel</Button>
    </Modal>
  </Portal>
);

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  backButton: { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333', marginHorizontal: 8 },
  headerActions: { flexDirection: 'row' },
  scrollView: { flex: 1 },
  bannerContainer: { position: 'relative' },
  banner: { width: '100%', height: 240 },
  statusBadge: { position: 'absolute', bottom: 16, right: 16, fontSize: 12, paddingHorizontal: 12 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dateTimeText: { fontSize: 16, color: '#666', marginLeft: 8 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  applicationsBadge: { backgroundColor: theme.colors.primary },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  eventTypeChip: { backgroundColor: '#F3E5F5', marginRight: 8, marginBottom: 8 },
  eventTypeText: { color: '#7B1FA2', fontSize: 12, fontWeight: '500' },
  categoryChip: { backgroundColor: '#E3F2FD', marginRight: 8, marginBottom: 8 },
  categoryText: { color: '#1565C0', fontSize: 12, fontWeight: '500' },
  subCategoryChip: { backgroundColor: '#FFF3E0', marginRight: 8, marginBottom: 8 },
  subCategoryText: { color: '#E65100', fontSize: 12, fontWeight: '500' },
  budgetText: { fontSize: 18, color: theme.colors.primary, fontWeight: '600' },
  description: { fontSize: 16, color: '#666', lineHeight: 24, fontWeight: '400' },
  collapseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // Application containers & dividers
  applicationsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  applicationItemContainer: {
    padding: 12,
  },
  applicationDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  applicationActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8 
  },
  acceptButton: { 
    backgroundColor: '#4CAF50', 
    borderRadius: 8, 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: { 
    borderColor: '#F44336', 
    borderRadius: 8, 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatActionButton: { 
    borderColor: theme.colors.primary, 
    borderRadius: 8, 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  hostCard: { borderRadius: 12, padding: 16, elevation: 2, backgroundColor: '#fff' },
  hostCardContent: { flexDirection: 'row', alignItems: 'center' },
  hostDetails: { flex: 1, marginLeft: 16 },
  hostName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  hostStats: { flexDirection: 'row', alignItems: 'center' },
  statPill: { marginRight: 8, backgroundColor: '#EEEEEE' },
  achievementPill: { backgroundColor: '#EEEEEE' },
  hostActionRow: { flexDirection: 'row',gap:8, justifyContent: 'space-between', marginTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 16 },
  reportHostButton: { borderColor: '#FF5252', flex: 1 },
  inviteButton: { marginTop: 16, backgroundColor: theme.colors.primary, borderRadius: 8, alignSelf: 'center', marginVertical: 16 },
  noApplicationsContainer: { padding: 24, backgroundColor: '#f8f8fa', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#eaeaea', borderStyle: 'dashed' },
  noApplicationsText: { fontSize: 18, color: '#666', fontWeight: '600', textAlign: 'center' },
  noApplicationsSubtext: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  noApplicationsButton: { minWidth: 200 },
  applicationStatusCard: { padding: 16, borderRadius: 12, backgroundColor: '#fff', elevation: 2 },
  applicationStatusTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
  applicationStatusText: { fontSize: 16, color: '#666', fontWeight: '400' },
  confirmedArtistCard: { borderRadius: 12, padding: 12, elevation: 2, backgroundColor: '#fff', borderWidth: 1, borderColor: '#c8e6c9' },
  mapCard: { borderRadius: 12, overflow: 'hidden', elevation: 2 },
  map: { width: '100%', height: 150 },
  mapActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    alignItems: 'center'
  },
  mapProviderButton: { 
    flex: 1,  
    marginRight: 8,
    borderColor: theme.colors.primary
  },
  mapButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 8
  },
  stickyButtonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderTopWidth: 1, borderTopColor: '#eaeaea', elevation: 4, flexDirection: 'row', gap: 12 },
  stickyActionButton: { flex: 1, borderRadius: 8, paddingVertical: 8 },
  withdrawButtonSticky: { borderColor: '#F44336', borderWidth: 1, backgroundColor: 'transparent' },
  cancelButtonSticky: { borderColor: '#F44336', borderWidth: 1, backgroundColor: 'transparent' },
  stickyChatButton: { flex: 1, backgroundColor: theme.colors.primary, borderRadius: 8, paddingVertical: 8 },
  modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#333' },
  modalText: { fontSize: 16, color: '#666', marginBottom: 20, fontWeight: '400' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: { marginLeft: 8 },
  deleteButton: { backgroundColor: '#F44336' },
  cancelButton: { backgroundColor: '#FF8A65' },
  reportOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  reportOptionText: { fontSize: 16, color: '#333' },
  cancelReportButton: { marginTop: 12 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#F44336', marginBottom: 16, textAlign: 'center' },
  openBadge: { backgroundColor: theme.colors.primary },
  confirmedBadge: { backgroundColor: '#4CAF50' },
  cancelledBadge: { backgroundColor: '#F44336' },
});

const getStatusStyle = (status: string) => ({
  open: styles.openBadge,
  Confirmed: styles.confirmedBadge,
  Cancelled: styles.cancelledBadge,
}[status] || styles.openBadge);

export default EventDetailsScreen;