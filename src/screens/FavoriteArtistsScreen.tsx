import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Platform,
  StatusBar
} from 'react-native';
import { useQuery } from '@apollo/client';
import ArtistCard from '../components/ArtistCard';
import { theme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GET_FAVORITE_ARTISTS } from '../graphql/queries';
import Animated from 'react-native-reanimated';

const windowWidth = Dimensions.get('window').width;

export const FavoriteArtistsScreen = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch favorite artists
  const { data, loading: artistsLoading, error, refetch } = useQuery(GET_FAVORITE_ARTISTS, {
    onError: (err) => console.error('Error fetching favorite artists:', err),
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(theme.colors.primary);
    }
  }, []);
  

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

  const artists = data?.artists || [];

  const keyExtractor = (item: any) => item.id;
  const renderItem = ({ item }: { item: any }) => (
    <ArtistCard
      artist={{
        ...item,
        location: item.location || 'No location',
        artistRating: item.artistRating || 0,
        artistReviewCount: item.artistReviewCount || 0,
        budget: item.budget || 0,
        categoryIDs: item.categoryIDs || [],
        subCategoryIDs: item.subCategoryIDs || [],
      }}
    />
  );

  return (
    <Animated.View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorite Artists</Text>
      </View>

      <FlatList
        data={artists}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
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
          artistsLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.loadingText}>Loading favorites...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.noDataText}>No favorite artists yet</Text>
            </View>
          )
        }
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    padding: 8,
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

export default FavoriteArtistsScreen; 