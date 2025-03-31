import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  RefreshControl,
  Platform,
  StatusBar
} from 'react-native';
import { useQuery } from '@apollo/client';
import EventCard from '../components/EventCard';
import { theme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GET_FAVORITE_EVENTS } from '../graphql/queries';

const windowWidth = Dimensions.get('window').width;

const FavoriteEventsScreen = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch favorite events
  const { data, loading: eventsLoading, error, refetch } = useQuery(GET_FAVORITE_EVENTS, {
    onError: (err) => console.error('Error fetching favorite events:', err),
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const events = data?.events || [];

  const keyExtractor = (item: any) => item.id;
  const renderItem = ({ item }: { item: any }) => <EventCard event={item} width={windowWidth - 32} />;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(theme.colors.primary);
    }
  }, []);
  

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorite Events</Text>
      </View>

      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={1}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            progressBackgroundColor="#ffffff"
          />
        }
        ListEmptyComponent={
          eventsLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.loadingText}>Loading favorites...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.noDataText}>No favorite events yet</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,

  },
  header: {
    backgroundColor: 'theme.colors.primary',
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default FavoriteEventsScreen; 