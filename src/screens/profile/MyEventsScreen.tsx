import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, useTheme, FAB, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, gql } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';
import { format, parseISO, isPast } from 'date-fns';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import MyEventCard from '../../components/MyEventCard';

const SCREEN_WIDTH = Dimensions.get('window').width;

const GET_MY_EVENTS = gql`
  query GetMyEvents($userId: ID!) {
    events(userId: $userId) {
      id
      title
      description
      banner
      dateTime
      location {
        lat
        lng
        address
      }
      status
      type
      eventType
      budget {
        min
        max
      }
      category
      subcategories
      applicationsCount
      confirmedArtist {
        fullName
        profilePicture
      }
    }
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

export const MyEventsScreen: React.FC<any> = ({ navigation }) => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past' | 'draft'>('upcoming');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { currentUser } = useAuthStore();
  const userId = currentUser?.id || 'u1';
  const { events, setEvents, updateEvent } = useEventStore();

  const { data, loading, error, refetch } = useQuery(GET_MY_EVENTS, {
    variables: { userId },
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => data?.events && setEvents(data.events),
  });

  const [cancelEvent] = useMutation(CANCEL_EVENT, {
    onCompleted: (data) => updateEvent(data.cancelEvent.id, { status: data.cancelEvent.status }),
    onError: () => Alert.alert('Error', 'Failed to cancel event'),
  });

  useEffect(() => {
    if (data?.events) setEvents(data.events);
  }, [data, setEvents]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleCreateEvent = () => navigation.navigate('CreateEvent');
  const handleNavigateToEvent = (eventId: string) => navigation.navigate('EventDetails', { eventId });

  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your events...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#F44336" />
        <Text style={styles.errorText}>Failed to load events</Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  const now = new Date();
  const upcomingEvents = events.filter(event =>
    !event.isDraft && (parseISO(event.dateTime) >= now || event.status.toLowerCase() === 'open')
  ).sort((a, b) => parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime());

  const pastEvents = events.filter(event =>
    !event.isDraft && parseISO(event.dateTime) < now && event.status.toLowerCase() !== 'open'
  ).sort((a, b) => parseISO(b.dateTime).getTime() - parseISO(a.dateTime).getTime());

  const draftEvents = events.filter(event => event.isDraft);
  const eventsToShow = selectedTab === 'upcoming' ? upcomingEvents : selectedTab === 'past' ? pastEvents : draftEvents;

  return (
    <SafeAreaView style={{backgroundColor: '#FFF'}} edges={['top']}>
      <View style={[styles.container]}>
        <View style={[styles.header, { backgroundColor: '#FFF' }]}>
          <Text style={styles.screenTitle}>My Events</Text>
        </View>

        <View style={styles.tabContainer}>
          {['upcoming', 'past', 'draft'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.selectedTab]}
              onPress={() => setSelectedTab(tab as 'upcoming' | 'past' | 'draft')}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.selectedTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {eventsToShow.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name={selectedTab === 'draft' ? 'edit-off' : 'event-busy'}
              size={64}
              color="#BDBDBD"
            />
            <Text style={styles.emptyText}>
              {selectedTab === 'upcoming'
                ? "You don't have any upcoming events"
                : selectedTab === 'past'
                  ? "You don't have any past events"
                  : "You don't have any draft events"}
            </Text>
            <Button
              mode="contained"
              onPress={handleCreateEvent}
              style={[styles.emptyCreateButton, { backgroundColor: theme.colors.primary }]}
              icon="plus"
            >
              Create Event
            </Button>
          </View>
        ) : (
          <FlatList
            data={eventsToShow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.eventCardContainer}
                onPress={() => handleNavigateToEvent(item.id)}
                activeOpacity={0.7}
              >
                <>
                  {item.applicationsCount && (
                    <View style={styles.applicationBadge}>
                      <Text style={styles.applicationBadgeText}>
                        {item.applicationsCount} Applications
                      </Text>
                    </View>
                  )}
                  <MyEventCard event={{ ...item }} isHost={true} />
                </>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        <FAB
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          icon="plus"
          onPress={handleCreateEvent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#F5F5F5' },
  header: { paddingBottom: 16, paddingHorizontal: 16 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  selectedTab: { borderBottomWidth: 2, borderBottomColor: '#6200EE' },
  tabText: { fontSize: 16, color: '#666', fontWeight: '500' },
  selectedTabText: { color: '#6200EE', fontWeight: '600' },
  countBadge: { backgroundColor: '#EEE', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 },
  countText: { fontSize: 12, color: '#666', fontWeight: '600' },
  listContainer: { padding: 16, paddingBottom: 80 },
  eventCardContainer: { marginBottom: 16, borderRadius: 8, overflow: 'hidden', backgroundColor: '#FFF', elevation: 2 },
  applicationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF5252',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  applicationBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666', marginTop: 12 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#F44336', marginVertical: 12 },
  retryButton: { marginTop: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, color: '#666', marginTop: 16, marginBottom: 24, textAlign: 'center' },
  emptyCreateButton: { marginTop: 16 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#6200EE' },
});

export default MyEventsScreen;