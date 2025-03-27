import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';
import { Searchbar, Chip, IconButton, Badge, Menu, Portal, Modal, Button, TextInput } from 'react-native-paper';
import { useQuery, gql } from '@apollo/client';
import { Category, SubCategory, useCategoryStore, useFetchCategories } from '../stores/categoryStore';
import ArtistCard from '../components/ArtistCard';
import { UserProfile } from '../stores/authStore';
import { theme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FilterModal from '../components/FilterModal';

// GraphQL query for fetching artists with comprehensive filtering
const GET_ARTISTS = gql`
  query GetArtists(
    $search: String
    $categoryId: ID
    $subCategoryIds: [ID!]
    $location: String
    $minBudget: Int
    $maxBudget: Int
    $minRating: Float
    $sortBy: String
  ) {
    artists(
      search: $search
      categoryId: $categoryId
      subCategoryIds: $subCategoryIds
      location: $location
      minBudget: $minBudget
      maxBudget: $maxBudget
      minRating: $minRating
      sortBy: $sortBy
    ) {
      id
      fullName
      username
      artistType
      location
      artistRating
      artistReviewCount
      budget
      categoryIDs
      subCategoryIDs
      profilePicture
    }
  }
`;

const ArtistListingScreen = () => {
  const insets = useSafeAreaInsets();
  const { categories } = useCategoryStore();
  if(categories.length === 0) useFetchCategories();
  // Animation and scroll state
  const scrollY = useRef(new Animated.Value(0)).current;

  // Location menu state
  const [locationMenuVisible, setLocationMenuVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Mumbai');

  // Sort menu state
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState<SubCategory[]>([]);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');

  const HEADER_MAX_HEIGHT = selectedCategory?260:220; // Reduced from 220
  const HEADER_MIN_HEIGHT = 60; // Reduced from 80
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  // Query variables
  const queryVariables: {
    search?: string;
    categoryId?: string;
    subCategoryIds?: string[];
    location?: string;
    sortBy?: string;
    minBudget?: number;
    maxBudget?: number;
  } = {
    search: searchQuery || undefined,
    categoryId: selectedCategory?.id || undefined,
    subCategoryIds: selectedSubCategories.length > 0 ? selectedSubCategories.map(sub => sub.id) : undefined,
    location: currentLocation || undefined,
    sortBy: sortBy || undefined,
    minBudget: undefined,
    maxBudget: undefined,
  };

  // Fetch artists query
  const {
    data,
    loading: artistsLoading,
    error,
    refetch
  } = useQuery(GET_ARTISTS, {
    variables: queryVariables,
    onError: (error) => {
      console.error('Error fetching artists:', error);
      // Show error toast or message
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network'
  });

  // Refetch when filters change
  useEffect(() => {
    refetch(queryVariables);
  }, [searchQuery, selectedCategory, selectedSubCategories, sortBy, currentLocation]);

  // Get subcategories for selected category
  const getRelevantSubCategories = () => {
    if (!selectedCategory) return [];
    const category = categories.find(c => c.id === selectedCategory.id);
    return category ? category.subCategories : [];
  };

  // Handle subcategory selection
  const toggleSubCategory = (subCategory: SubCategory) => {
    setSelectedSubCategories(prev =>
      prev.includes(subCategory)
        ? prev.filter(sub => sub.id !== subCategory.id)
        : [...prev, subCategory]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedSubCategories([]);
    setSortBy(null);
  };

  // Handle sort selection
  const handleSortSelection = (key: string) => {
    setSortBy(sortBy === key ? null : key);
    setSortMenuVisible(false);
  };

  // Handle location selection
  const handleLocationSelection = (location: string) => {
    setCurrentLocation(location);
    setLocationMenuVisible(false);
  };

  // Filter modal handlers
  const showFilterModal = () => setFilterModalVisible(true);
  const hideFilterModal = () => setFilterModalVisible(false);

  const applyFilters = () => {
    // Update query variables with budget
    queryVariables.minBudget = minBudget ? parseInt(minBudget) : undefined;
    queryVariables.maxBudget = maxBudget ? parseInt(maxBudget) : undefined;
    refetch(queryVariables);
    hideFilterModal();
  };

  // Filter categories and subcategories based on search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );


  // Animation values
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


  const artists: UserProfile[] = data?.artists || [];
  const relevantSubCategories = getRelevantSubCategories();
console.log(artists)
  // Generate a key for each item in the grid
  const keyExtractor = (item: UserProfile) => item.id;

  // Render each item in the grid
  const renderItem = ({ item }: { item: UserProfile }) => (
    <ArtistCard
      artist={{
        ...item,
        location: item.location || 'No location',
        artistRating: item.artistRating || 0,
        artistReviewCount: item.artistReviewCount || 0,
        budget: item.budget || 0,
        categoryIDs: item.categoryIDs || [],
        subCategoryIDs: item.subCategoryIDs || []
      }}
    />
  );

  return (
    <>
      {/* Main Header - Collapsible */}
      <Animated.View
        style={[
          styles.header,
          {
            height: headerHeight,
            paddingTop: insets.top
          }
        ]}
      >
        <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.locationSelector}
              onPress={() => setLocationMenuVisible(true)}
            >
              <IconButton icon="map-marker" size={16} iconColor="#FFF" />
              <Text style={styles.locationText}>{currentLocation}</Text>
              <IconButton icon="chevron-down" size={16} iconColor="#FFF" />
            </TouchableOpacity>

            <View style={styles.headerActions}>
              <IconButton
                icon="heart-outline"
                iconColor="#FFF"
                size={24}
                onPress={() => { }}
                style={styles.actionButton}
              />
              <IconButton
                icon="filter-variant"
                iconColor="#FFF"
                size={24}
                onPress={showFilterModal}
                style={styles.actionButton}
              />
              <Menu
                visible={sortMenuVisible}
                onDismiss={() => setSortMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="sort"
                    iconColor="#FFF"
                    size={24}
                    onPress={() => setSortMenuVisible(true)}
                    style={styles.actionButton}
                  />
                }
              >
                <Menu.Item onPress={() => handleSortSelection('top_rated')} title="Top Rated" />
                <Menu.Item onPress={() => handleSortSelection('popularity')} title="Most Popular" />
                <Menu.Item onPress={() => handleSortSelection('most_booked')} title="Most Booked" />
              </Menu>
            </View>
          </View>

          {/* Search Bar */}
          <Searchbar
            placeholder="Search artists"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={theme.colors.primary}
          />

          {/* Location Menu */}
          <Menu
            visible={locationMenuVisible}
            onDismiss={() => setLocationMenuVisible(false)}
            anchor={{ x: 20, y: 90 }}
          >
            <Menu.Item onPress={() => handleLocationSelection('Mumbai')} title="Mumbai" />
            <Menu.Item onPress={() => handleLocationSelection('Delhi')} title="Delhi" />
            <Menu.Item onPress={() => handleLocationSelection('Bangalore')} title="Bangalore" />
            <Menu.Item onPress={() => handleLocationSelection('Chennai')} title="Chennai" />
          </Menu>

          {/* Category Filters */}
          <ScrollViewAnimated
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(
                  selectedCategory?.id === category.id ? null : category
                )}
                style={[
                  styles.categoryButton,
                  selectedCategory?.id === category.id && styles.activeCategoryButton
                ]}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory?.id === category.id && styles.activeCategoryButtonText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollViewAnimated>

          {/* Subcategory Filters - Only shown when category is selected */}
          {selectedCategory && relevantSubCategories.length > 0 && (
            <ScrollViewAnimated
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {relevantSubCategories.map(subCategory => (
                <TouchableOpacity
                  key={subCategory.id}
                  onPress={() => toggleSubCategory(subCategory)}
                  style={[
                    styles.categoryButton,
                    selectedSubCategories.includes(subCategory) && styles.activeCategoryButton
                  ]}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedSubCategories.includes(subCategory) && styles.activeCategoryButtonText
                  ]}>
                    {subCategory.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollViewAnimated>
          )}
        </Animated.View>
      </Animated.View>

      {/* Mini Header - Appears when scrolling */}
      <Animated.View
        style={[
          styles.miniHeader,{height: HEADER_MIN_HEIGHT},
          {
            top: insets.top,
            opacity: miniHeaderOpacity,
            transform: [{
              translateY: miniHeaderOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [-HEADER_MIN_HEIGHT / 2, 0],
              })
            }]
          }
        ]}
      >
        <View style={styles.miniHeaderContent}>
          <IconButton
            icon="magnify"
            iconColor={theme.colors.primary}
            size={24}
            onPress={() => scrollY.setValue(0)}
          />

          <ScrollViewAnimated
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.miniFilterChips}
          >
            {selectedCategory && (
              <Chip
                onClose={() => setSelectedCategory(null)}
                style={styles.filterChip}
                textStyle={styles.miniChipText}
              >
                {selectedCategory?.name}
              </Chip>
            )}
            {selectedSubCategories.map(sub => {
              return (
                <Chip
                  key={sub.id}
                  onClose={() => toggleSubCategory(sub)}
                  style={styles.filterChip}
                  textStyle={styles.miniChipText}
                >
                  {sub?.name}
                </Chip>
              );
            })}
          </ScrollViewAnimated>

          <View style={styles.miniHeaderActions}>
            <IconButton
              icon="filter-variant"
              iconColor={theme.colors.primary}
              size={20}
              onPress={showFilterModal}
            />
            <IconButton
              icon="sort"
              iconColor={theme.colors.primary}
              size={20}
              onPress={() => setSortMenuVisible(true)}
            />
          </View>
        </View>
      </Animated.View>

      {/* Artist Grid */}
      <FlatList
        data={artists}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={[
          styles.artistListContainer,
          { paddingTop: HEADER_MAX_HEIGHT + insets.top }
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          artistsLoading ? (
            <Text style={styles.loadingText}>Loading artists...</Text>
          ) : (
            <Text style={styles.noDataText}>No artists found</Text>
          )
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onDismiss={hideFilterModal}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubCategories={selectedSubCategories}
        toggleSubCategory={toggleSubCategory}
        categorySearch={categorySearch}
        setCategorySearch={setCategorySearch}
        filteredCategories={filteredCategories}
        minBudget={minBudget}
        setMinBudget={setMinBudget}
        maxBudget={maxBudget}
        setMaxBudget={setMaxBudget}
        onApply={applyFilters}
        onClearAll={clearFilters}
      />
    </>
  );
};

// Use Animated version of ScrollView
const ScrollViewAnimated = Animated.createAnimatedComponent(Animated.ScrollView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    overflow: 'hidden',
    zIndex: 1000,
  },
  headerContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
  },
  searchbar: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    marginBottom: 8,
    height: 40, // Fixed height for category scroll
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeCategoryButton: {
    backgroundColor: '#FFFFFF',
  },
  categoryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  activeCategoryButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  miniHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  miniHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    height: '100%',
  },
  miniFilterChips: {
    flex: 1,
    flexDirection: 'row',
  },
  miniHeaderActions: {
    flexDirection: 'row',
  },
  filterChipsScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  miniChipText: {
    fontSize: 12,
  },
  clearButton: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  clearButtonText: {
    color: '#6B48FF',
    fontWeight: '600',
  },
  artistListContainer: {
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  modalSearchbar: {
    marginBottom: 8,
  },
  filterOptionsContainer: {
    maxHeight: 150,
  },
  filterOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#f5f5f5',
  },
  selectedFilterOption: {
    backgroundColor: theme.colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  budgetInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
});

export default ArtistListingScreen;