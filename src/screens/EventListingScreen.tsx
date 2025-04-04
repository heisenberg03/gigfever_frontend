import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  RefreshControl,
  Platform,
  StatusBar
} from 'react-native';
import { Searchbar, Chip, IconButton, Menu, Portal, Modal, Button, TextInput } from 'react-native-paper';
import { useQuery } from '@apollo/client';
import { Category, SubCategory, useCategoryStore } from '../stores/categoryStore';
import EventCard from '../components/EventCard';
import { theme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FilterModal from '../components/FilterModal';
import { GET_EVENTS_WITH_FILTERS } from '../graphql/queries';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// Constants
const windowWidth = Dimensions.get('window').width;
const ScrollViewAnimated = Animated.createAnimatedComponent(ScrollView);

const EventListingScreen = () => {
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuthStore();
  const { categories } = useCategoryStore();
  const scrollY = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState<SubCategory[]>([]);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState('All Locations');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [locationMenuVisible, setLocationMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterChips, setShowFilterChips] = useState(false);

  // Dynamic header height to match ArtistListingScreen
  const HEADER_MAX_HEIGHT = Platform.OS === 'android' ?  (selectedCategory ? 270 : 220) :  (selectedCategory ? 300 : 260);
  const HEADER_MIN_HEIGHT = 0;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  // Query variables
  const queryVariables = {
    search: searchQuery || undefined,
    categoryId: selectedCategory?.id || undefined,
    subCategoryIds: selectedSubCategories.length > 0 ? selectedSubCategories.map(sub => sub.id) : undefined,
    location: currentLocation !== 'All Locations' ? currentLocation : undefined,
    minBudget: minBudget ? parseInt(minBudget) : undefined,
    maxBudget: maxBudget ? parseInt(maxBudget) : undefined,
    sortBy: sortBy || undefined,
  };

  // Fetch events
  const { data, loading: eventsLoading, error, refetch } = useQuery(GET_EVENTS_WITH_FILTERS, {
    variables: queryVariables,
    onError: (err) => console.error('Error fetching events:', err),
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });

    // Filter categories and subcategories based on search
    const filteredCategories = categories.filter(cat =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

  useEffect(() => {
    refetch(queryVariables);
  }, [searchQuery, selectedCategory, selectedSubCategories, sortBy, currentLocation, minBudget, maxBudget]);

  // Handlers
  const handleCategorySelect = (category: Category) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
      setSelectedSubCategories([]);
    } else {
      setSelectedCategory(category);
      setSelectedSubCategories([]);
    }
    setShowFilterChips(true);
  };

  const toggleSubCategory = (subCategory: SubCategory) => {
    setSelectedSubCategories(prev =>
      prev.some(sub => sub.id === subCategory.id)
        ? prev.filter(sub => sub.id !== subCategory.id)
        : [...prev, subCategory]
    );
    setShowFilterChips(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedSubCategories([]);
    setSortBy(null);
    setMinBudget('');
    setMaxBudget('');
    setCurrentLocation('All Locations');
    setShowFilterChips(false);
    setCategorySearch('');
  };

  const handleSortSelection = (key: string) => {
    setSortBy(sortBy === key ? null : key);
    setSortMenuVisible(false);
    setShowFilterChips(true);
  };

  const handleLocationSelection = (location: string) => {
    setCurrentLocation(location);
    setLocationMenuVisible(false);
    if (location !== 'All Locations') setShowFilterChips(true);
  };

  const showFilterModal = () => setFilterModalVisible(true);
  const hideFilterModal = () => setFilterModalVisible(false);

  const applyFilters = () => {
    queryVariables.minBudget = minBudget ? parseInt(minBudget) : undefined;
    queryVariables.maxBudget = maxBudget ? parseInt(maxBudget) : undefined;
    refetch(queryVariables);
    hideFilterModal();
    if (minBudget || maxBudget) setShowFilterChips(true);
  };

  // Animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const miniHeaderOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const floatingChipsOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 3, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const floatingChipsTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [-50, 0],
    extrapolate: 'clamp',
  });

  // Data and utilities
  const events = data?.events || [];
  const relevantSubCategories = selectedCategory?.subCategories || [];
  const hasActiveFilters = selectedCategory || selectedSubCategories.length > 0 || currentLocation !== 'All Locations' || sortBy || minBudget || maxBudget;

  const keyExtractor = (item: any) => item.id;
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('EventDetails', { 
      eventId: item.id,
      eventData: item
    })}>
      <EventCard event={item} width={windowWidth - 32} />
    </TouchableOpacity>
  );
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch(queryVariables);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') StatusBar.setBackgroundColor(theme.colors.primary);
  }, []);

  return (
    <>
      {/* Main Header */}
      <Animated.View style={[styles.header, { height: headerHeight, paddingTop: insets.top }]}>
        <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.locationSelector} onPress={() => setLocationMenuVisible(true)}>
              <IconButton icon="map-marker" size={16} iconColor="#FFF" />
              <Text style={styles.locationText}>{currentLocation}</Text>
              <IconButton icon="chevron-down" size={16} iconColor="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <IconButton 
                icon="heart-outline" 
                iconColor="#FFF" 
                size={24} 
                onPress={() => navigation.navigate('FavoriteEvents')} 
                style={styles.actionButton} 
              />
              <IconButton icon="filter-variant" iconColor="#FFF" size={24} onPress={showFilterModal} style={styles.actionButton} />
              <Menu
                visible={sortMenuVisible}
                onDismiss={() => setSortMenuVisible(false)}
                anchor={<IconButton icon="sort" iconColor="#FFF" size={24} onPress={() => setSortMenuVisible(true)} style={styles.actionButton} />}
              >
                <Menu.Item onPress={() => handleSortSelection('dateDesc')} title="Latest First" />
                <Menu.Item onPress={() => handleSortSelection('dateAsc')} title="Earliest First" />
                <Menu.Item onPress={() => handleSortSelection('priceAsc')} title="Price: Low to High" />
                <Menu.Item onPress={() => handleSortSelection('priceDesc')} title="Price: High to Low" />
              </Menu>
            </View>
          </View>
          <Text style={styles.welcomeText}>Find the perfect event</Text>
          <Searchbar
            placeholder="Search events..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={theme.colors.primary}
          />
          <ScrollViewAnimated horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategorySelect(category)}
                style={[styles.categoryButton, selectedCategory?.id === category.id && styles.activeCategoryButton]}
              >
                <Text style={[styles.categoryButtonText, selectedCategory?.id === category.id && styles.activeCategoryButtonText]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollViewAnimated>
          {selectedCategory && relevantSubCategories.length > 0 && (
            <ScrollViewAnimated horizontal showsHorizontalScrollIndicator={false} style={styles.subCategoryScroll}>
              {relevantSubCategories.map(subCategory => (
                <TouchableOpacity
                  key={subCategory.id}
                  onPress={() => toggleSubCategory(subCategory)}
                  style={[styles.categoryButton, selectedSubCategories.some(sub => sub.id === subCategory.id) && styles.activeCategoryButton]}
                >
                  <Text style={[styles.categoryButtonText, selectedSubCategories.some(sub => sub.id === subCategory.id) && styles.activeCategoryButtonText]}>
                    {subCategory.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollViewAnimated>
          )}
        </Animated.View>
      </Animated.View>

      {/* Mini Header */}
      <Animated.View style={[styles.miniHeader, { paddingTop: Platform.OS === 'android' ? 10 : 40, height: 40 }]}>
        <View style={styles.miniHeaderContent}>
          <View style={styles.miniHeaderActions}>
          <IconButton icon="magnify" iconColor={'#FFF'} size={24} onPress={() => scrollY.setValue(0)} />
            <IconButton icon="filter-variant" iconColor={'#FFF'} size={24} onPress={showFilterModal} />
            <IconButton icon="sort" iconColor={'#FFF'} size={24} onPress={() => setSortMenuVisible(true)} />
            {hasActiveFilters && (
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Floating Chips */}
      {showFilterChips && hasActiveFilters && (
        <Animated.View style={[styles.floatingChips, { top: insets.top + 40, opacity: floatingChipsOpacity, transform: [{ translateY: floatingChipsTranslateY }] }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsScroll}>
            {selectedCategory && (
              <Chip selected onClose={() => { setSelectedCategory(null); setSelectedSubCategories([]); }} style={styles.filterChip} textStyle={styles.miniChipText}>
                {selectedCategory.name}
              </Chip>
            )}
            {selectedSubCategories.map(sub => (
              <Chip key={sub.id} selected onClose={() => toggleSubCategory(sub)} style={styles.filterChip} textStyle={styles.miniChipText}>
                {sub.name}
              </Chip>
            ))}
            {currentLocation !== 'All Locations' && (
              <Chip selected onClose={() => setCurrentLocation('All Locations')} style={styles.filterChip} textStyle={styles.miniChipText}>
                {currentLocation}
              </Chip>
            )}
            {sortBy && (
              <Chip selected onClose={() => setSortBy(null)} style={styles.filterChip} textStyle={styles.miniChipText}>
                {sortBy === 'dateAsc' ? 'Earliest First' : sortBy === 'dateDesc' ? 'Latest First' : sortBy === 'priceAsc' ? 'Price: Low to High' : 'Price: High to Low'}
              </Chip>
            )}
            {minBudget && <Chip selected onClose={() => setMinBudget('')} style={styles.filterChip} textStyle={styles.miniChipText}>Min ₹{minBudget}</Chip>}
            {maxBudget && <Chip selected onClose={() => setMaxBudget('')} style={styles.filterChip} textStyle={styles.miniChipText}>Max ₹{maxBudget}</Chip>}
            
          </ScrollView>
        </Animated.View>
      )}

      {/* Event List */}
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={1}
        contentContainerStyle={[styles.eventListContainer, { paddingTop: HEADER_MAX_HEIGHT + (showFilterChips && hasActiveFilters ? 50 : 0) }]}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
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
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.noDataText}>No events found</Text>
            </View>
          )
        }
      />

      {/* Location Menu */}
      <Menu visible={locationMenuVisible} onDismiss={() => setLocationMenuVisible(false)} anchor={{ x: 20, y: insets.top + 60 }} contentStyle={styles.menuContent}>
        {['All Locations', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'].map(location => (
          <Menu.Item
            key={location}
            onPress={() => handleLocationSelection(location)}
            title={location}
            titleStyle={{ fontWeight: currentLocation === location ? 'bold' : 'normal', color: currentLocation === location ? theme.colors.primary : undefined }}
          />
        ))}
      </Menu>

      {/* Filter Modal */}
      <Portal>
        <Modal visible={filterModalVisible} onDismiss={hideFilterModal} contentContainerStyle={styles.modalContainer}>
          <FilterModal
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSubCategories={selectedSubCategories}
            toggleSubCategory={toggleSubCategory}
            minBudget={minBudget}
            setMinBudget={setMinBudget}
            maxBudget={maxBudget}
            setMaxBudget={setMaxBudget}
            onApply={applyFilters}
            onDismiss={hideFilterModal}
            visible={filterModalVisible}
            categorySearch={categorySearch}
            setCategorySearch={setCategorySearch}
            filteredCategories={filteredCategories}
            onClearAll={clearFilters}
          />
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    zIndex: 1000,
    elevation: 4,
    overflow: 'hidden',
  },
  headerContent: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  locationSelector: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { margin: 0 },
  welcomeText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginHorizontal: 16, marginBottom: 16 },
  searchBar: { marginHorizontal: 16, marginBottom: 12, elevation: 0, backgroundColor: '#FFFFFF' },
  searchInput: { fontSize: 14 },
  categoryScroll: { paddingHorizontal: 16, marginBottom: 8, height: 40 },
  subCategoryScroll: { paddingHorizontal: 16, marginBottom: 8, height: 40 },
  categoryButton: { paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  activeCategoryButton: { backgroundColor: '#FFFFFF' },
  categoryButtonText: { color: '#FFFFFF', fontSize: 14 },
  activeCategoryButtonText: { color: theme.colors.primary, fontWeight: '600' },
  miniHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: theme.colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  miniHeaderContent: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, justifyContent: 'center', height: '100%' },
  miniFilterChips: { flex: 1 },
  miniHeaderActions: { flexDirection: 'row' },
  floatingChips: { position: 'absolute', left: 0, right: 0, backgroundColor: 'rgba(255, 255, 255, 0.95)', zIndex: 998, paddingVertical: 6 },
  filterChipsScroll: { paddingHorizontal: 16, alignItems: 'center' },
  filterChip: { marginRight: 8, backgroundColor: '#f5f5f5' },
  miniChipText: { fontSize: 12 },
  clearButton: { justifyContent: 'center', paddingHorizontal: 8 },
  clearButtonText: { color: '#FFF', fontWeight: '600' },
  eventListContainer: { paddingHorizontal: 16, paddingBottom: 16 },
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
  menuContent: { backgroundColor: 'white', borderRadius: 8, marginTop: 38 },
  modalContainer: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 8 },
});

export default EventListingScreen;