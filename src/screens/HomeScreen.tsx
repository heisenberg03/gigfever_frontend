import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Appbar, Searchbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { GET_TOP_ARTISTS, GET_TOP_EVENTS } from '../graphql/queries';
import ArtistCard from '../components/ArtistCard';
import EventCard from '../components/EventCard';
import { theme } from '../theme';
import { useCategoryStore } from '../stores/categoryStore';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import Animated, { 
  useAnimatedScrollHandler, 
  useSharedValue, 
  useAnimatedStyle,
  interpolate,
  Extrapolate 
} from 'react-native-reanimated';

const HEADER_MAX_HEIGHT = Platform.OS === 'ios' ? 235 : 185;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 120 : 95;

interface Category {
  id: string;
  name: string;
  image: string;
  subCategories: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
  image: string;
}

interface Artist {
  id: string;
  fullName: string;
  artistType?: string;
  location?: string;
  artistRating?: number;
  artistReviewCount?: number;
  budget?: number;
  categoryIDs?: string[];
  subCategoryIDs?: string[];
  profilePicture?: string;
  username?: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  banner?: string;
  dateTime: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: string;
  eventType: string;
  budget?: {
    min: number;
    max: number;
  };
  category?: string;
  subcategories?: string[];
  host: {
    id: string;
    displayName: string;
    profilePicture?: string;
    rating?: number;
    reviewsCount?: number;
    pastEventsCount?: number;
  };
  applicantsCount?: number;
  isFavorite?: boolean;
  userApplicationStatus?: string;
  createdAt?: string;
}

export const HomeScreen: React.FC = ({ navigation }: any) => {
  const { currentUser } = useAuthStore();
  const { unreadGeneralCount } = useNotificationStore();
  const { categories } = useCategoryStore();
  const theme = useTheme();
  const scrollY = useSharedValue(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentLocation, setCurrentLocation] = React.useState('Mumbai');

  const { data: artistsData, loading: artistsLoading } = useQuery(GET_TOP_ARTISTS);
  const { data: eventsData, loading: eventsLoading } = useQuery(GET_TOP_EVENTS);

  const topArtists = artistsData?.artists || [];
  const topEvents = eventsData?.events || [];

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const headerHeight = interpolate(
      scrollY.value,
      [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP
    );

    const searchOpacity = interpolate(
      scrollY.value,
      [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      [1, 0],
      Extrapolate.CLAMP
    );

    const welcomeOpacity = interpolate(
      scrollY.value,
      [0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) / 2],
      [1, 0],
      Extrapolate.CLAMP
    );

    const searchIconOpacity = interpolate(
      scrollY.value,
      [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      height: headerHeight,
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
            [0, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  const searchContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      [1, 0],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      [0, -50],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const searchIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Search query:', query);
  };

  const handleLocationPress = () => {
    // TODO: Implement location selection
    console.log('Location pressed');
  };

  const handleFastActionPress = (action: string) => {
    switch (action) {
      case 'myEvents':
        navigation.navigate('MyEvents');
        break;
      case 'invite':
        navigation.navigate('InviteArtists');
        break;
      case 'myBookings':
        navigation.navigate('MyBookings');
        break;
      default:
        break;
    }
  };

  const handleSeeAllArtists = () => {
    navigation.navigate('Artists');
  };

  const handleSeeAllEvents = () => {
    navigation.navigate('Events');
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('CategoryDetails', {
      categoryId: category.id,
      categoryName: category.name,
      subCategories: category.subCategories || []
    });
  };

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(theme.colors.primary);
  }, []);


  return (
    <>
      {/* Sticky Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Appbar.Header style={styles.appbar}>
          <View style={styles.locationContainer}>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={handleLocationPress}
            >
              <MaterialIcons name="location-on" size={20} color="#FFF" />
              <Text style={styles.locationText}>{currentLocation}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerActions}>
            <Animated.View style={searchIconStyle}>
              <Appbar.Action
                icon="magnify"
                size={24}
                iconColor="#FFF"
                onPress={() => navigation.navigate('Search')}
                style={styles.headerAction}
              />
            </Animated.View>
            <Appbar.Action
              icon="bell"
              size={24}
              iconColor="#FFF"
              onPress={() => navigation.navigate('Notifications')}
              style={styles.headerAction}
            />
          </View>
        </Appbar.Header>

        <Animated.View style={[styles.headerContent, searchContainerStyle]}>
          <Text style={styles.welcomeText}>Discover your Interests</Text>
          <Searchbar
            placeholder="Search interests"
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
          />
        </Animated.View>
      </Animated.View>

      

      <Animated.ScrollView
        style={styles.content}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent} // Add this line
      >
        {/* Fast Action Buttons */}
      <View style={styles.fastActionsContainer}>
        <TouchableOpacity
          style={[styles.fastActionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleFastActionPress('myEvents')}
        >
          <MaterialIcons name="event" size={20} color="#fff" />
          <Text style={styles.fastActionText}>My Events</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fastActionButton, { backgroundColor: theme.colors.secondary }]}
          onPress={() => handleFastActionPress('invite')}
        >
          <MaterialIcons name="person-add" size={20} color="#fff" />
          <Text style={styles.fastActionText}>Invite Artist</Text>
        </TouchableOpacity>

        {currentUser?.isArtist && (
          <TouchableOpacity
            style={[styles.fastActionButton, { backgroundColor: theme.colors.tertiary }]}
            onPress={() => handleFastActionPress('myBookings')}
          >
            <MaterialIcons name="book" size={20} color="#fff" />
            <Text style={styles.fastActionText}>My Bookings</Text>
          </TouchableOpacity>
        )}
      </View>

        {/* Top Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categories.map((category: Category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category)}
                style={styles.categoryCard}
              >
                <Image source={{ uri: category.image }} style={styles.categoryImage} />
                <View style={styles.categoryOverlay}>
                  <Text style={styles.categoryText}>{category.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Top Artists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Artists</Text>
            <TouchableOpacity onPress={handleSeeAllArtists}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {artistsLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : topArtists.length > 0 ? (
            <ScrollView
              horizontal
              style={styles.categoryScroll}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.artistScrollContent}
            >
              {topArtists.map((artist: Artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  width={Dimensions.get('window').width / 2 - 24}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>No artists available</Text>
          )}
        </View>

        {/* Top Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={handleSeeAllEvents}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {eventsLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : topEvents.length > 0 ? (
            <ScrollView
            style={styles.categoryScroll}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventScrollContent}
            >
              {topEvents.map((event: Event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  width={Dimensions.get('window').width - 32}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>No events available</Text>
          )}
        </View>
      </Animated.ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    marginHorizontal: 4,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  locationContainer: {
    marginLeft: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginHorizontal: 4,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  fastActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  fastActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    elevation: 2,
  },
  fastActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT + 16,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'android' ? 90 : 32, // Increased padding for Android
  },
  section: {
    paddingVertical: 16, // Reduced vertical padding
    marginBottom: 8,     // Added margin bottom
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  categoryScroll: {
    marginLeft: -16,
    marginRight: -16,
  },
  categoryScrollContent: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  categoryCard: {
    width: 120,
    height: 160,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  artistScrollContent: {
    gap: 8,
  },
  eventScrollContent: {
    gap: 12,
    padding: 16,
    paddingBottom: 16, // Added extra padding for Android
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
  welcomeText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginHorizontal: 16, marginBottom: 16 },

});

export default HomeScreen;