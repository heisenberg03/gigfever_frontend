import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Text, Chip, useTheme } from 'react-native-paper';
import { useAuthStore } from '../../stores/authStore';
import ReviewsModal from '../../components/ReviewsModal';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useCategoryStore } from '../../stores/categoryStore';
import * as ImagePicker from 'expo-image-picker';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import RatingBox from '../../components/RatingBox';

const ProfileScreen = ({ navigation }: any) => {
  const { currentUser, toggleArtistMode } = useAuthStore();
  const [showReviewsVisible, setShowReviewsVisible] = useState(false);
  const { categories } = useCategoryStore();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [showFullBio, setShowFullBio] = useState(false);
  const [showArtistModeDialog, setShowArtistModeDialog] = useState(false);
  const [pendingArtistMode, setPendingArtistMode] = useState(false);
  const [activeReviewType, setActiveReviewType] = useState<string | undefined>(undefined);
  console.log(currentUser, categories)
  const profileCategory = categories.find((cat) => cat.id === currentUser?.categoryIDs[0]) || { name: 'Not selected', subCategories: [] };
  if (!currentUser) return null;

  const handleNavigate = (screen: string) => {
    navigation.navigate(screen as never);
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      // Here you would normally upload the image to your server
      // For now, we'll just update the local state
      // Handle image upload logic here
      console.log('Selected image URI:', result.assets[0].uri);
    }
  };

  const cardData = [
    { title: 'My Portfolio', subtitle: 'Manage your portfolio', screen: 'PortfolioScreen', icon: 'images' },
    { title: 'My Bookings', subtitle: 'View your bookings', screen: 'BookingsScreen', icon: 'calendar-check' },
    { title: 'Invites', subtitle: 'Check your invites', screen: 'InvitesScreen', icon: 'envelope-open-text' },
    { title: 'My Events', subtitle: 'Manage your events', screen: 'MyEventsScreen', icon: 'calendar-alt' },
    { title: 'Settings', subtitle: 'Account settings', screen: 'Settings', icon: 'cog' },
  ];

  // Filter cardData based on artist mode
  const filteredCardData = cardData.filter(item => {
    if (!currentUser.isArtist) {
      return !['My Portfolio', 'My Bookings', 'Invites'].includes(item.title);
    }
    return true;
  });

  const handleArtistModeToggle = (newValue: boolean) => {
    setPendingArtistMode(newValue);
    setShowArtistModeDialog(true);
  };

  const handleConfirmArtistMode = () => {
    toggleArtistMode(pendingArtistMode);
    setShowArtistModeDialog(false);
    if (!currentUser.isArtist)
      navigation.navigate('EditProfileScreen');
  };

  const getArtistModeDialogContent = () => {
    if (pendingArtistMode) {
      return {
        title: 'Turn On Artist Mode?',
        message: 'Turning on Artist Mode will list you as an available artist for booking requests. We recommend completing your profile with relevant details to increase your visibility.',
        confirmText: 'Turn On',
        showEditOption: true
      };
    }
    return {
      title: 'Turn Off Artist Mode?',
      message: 'After turning off Artist Mode, you will no longer appear in artist listings or be available for bookings.',
      confirmText: 'Turn Off',
      showEditOption: false
    };
  };

  const setShowReviews = (show: boolean, type?: string) => {
    setActiveReviewType(type);
    setShowReviewsVisible(show);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header Actions - Show preview only in artist mode */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleNavigate('EditProfileScreen')}
          >
            <MaterialIcons name="edit" size={24} color={theme.colors.primary} />
          </TouchableOpacity>

        </View>

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.imageContainer}>
              <TouchableOpacity onPress={handleImagePick}>
                {currentUser?.profilePicture ? (
                  <Image
                    source={{ uri: currentUser.profilePicture }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <MaterialIcons name="add-a-photo" size={40} color={theme.colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
              {currentUser.isArtist && (
                <TouchableOpacity
                  style={styles.previewProfileButton}
                  onPress={() => navigation.navigate('PreviewProfile')}
                >
                  <FontAwesome5 name="eye" size={20} color={theme.colors.primary} />
                  <Text style={styles.previewText}>Preview</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{currentUser.fullName}</Text>
              <Text style={styles.username}>@{currentUser.username}</Text>
              <Text style={styles.location}>{currentUser.location || 'Location not set'}</Text>

              {/* Show ratings only in artist mode */}
              <View style={styles.ratingsContainer}>
                {currentUser.isArtist && (
                  <RatingBox
                    type="Artist"
                    rating={currentUser.artistRating}
                    count={currentUser.artistReviewCount}
                    icon="mic"
                    onPress={(type) => setShowReviews(true, type)}
                  />
                )}
                <RatingBox
                  type="Host"
                  rating={currentUser.hostRating}
                  count={currentUser.hostReviewCount}
                  icon="event"
                  onPress={(type) => setShowReviews(true, type)}
                />
              </View>
            </View>

          </View>

          <View style={styles.infoContainer}>
            {/* Bio with Read More */}
            {currentUser.isArtist && currentUser.bio && (
              <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
                <Text numberOfLines={showFullBio ? undefined : 2} style={styles.bio}>
                  {currentUser.bio}
                </Text>
                {currentUser.bio.length > 100 && (
                  <Text style={[styles.readMore, { color: theme.colors.primary }]}>
                    {showFullBio ? 'Show less' : 'Read more'}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {/* Show artist-specific info only in artist mode */}

            <>
              <View style={styles.quickInfoRow}>
                <View style={styles.quickInfoItem}>
                  <MaterialIcons name="phone" size={16} color={theme.colors.primary} />
                  <Text style={styles.quickInfoText}>
                    {currentUser.phone}
                  </Text>
                </View>
                {currentUser.email && (
                  <View style={styles.quickInfoItem}>
                    <MaterialIcons name="email" size={16} color={theme.colors.primary} />
                    <Text style={styles.quickInfoText}>{currentUser.email}</Text>
                  </View>
                )}
                {currentUser.isArtist && currentUser.budget && (
                  <View style={styles.quickInfoItem}>
                    <MaterialIcons name="currency-rupee" size={16} color={theme.colors.primary} />
                    <Text style={styles.quickInfoText}>
                      {currentUser.budget}/hr
                    </Text>
                  </View>
                )}

              </View>

              {/* Categories and Subcategories */}
              {currentUser.isArtist && <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesRow}
              >
                <Chip
                  key={`category-${profileCategory.name}`}
                  style={styles.categoryChip}
                  textStyle={styles.chipText}
                >
                  {profileCategory.name}
                </Chip>
                {currentUser.subCategoryIDs.map((subId) => {
                  const subCategory = profileCategory.subCategories.find(
                    (cat) => cat.id === subId
                  );
                  return subCategory ? (
                    <Chip
                      key={`subcategory-${subId}`}
                      style={styles.subCategoryChip}
                      textStyle={styles.chipText}
                    >
                      {subCategory.name}
                    </Chip>
                  ) : null;
                })}
              </ScrollView>}
            </>
          </View>



          {/* Card Grid */}
          <View style={styles.cardContainer}>
            {filteredCardData.map((item, index) => (
              <TouchableOpacity
                key={`card-${item.screen}-${index}`}
                onPress={() => handleNavigate(item.screen)}
                style={styles.cardWrapper}
              >
                <View style={styles.card}>
                  <FontAwesome5
                    name={item.icon}
                    size={32}
                    color={theme.colors.primary}
                    style={styles.cardIcon}
                  />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Subtle Artist Mode Toggle */}
          <TouchableOpacity
            style={styles.artistModeToggle}
            onPress={() => handleArtistModeToggle(!currentUser.isArtist)}
          >
            <MaterialIcons
              name={currentUser.isArtist ? "mic" : "mic-off"}
              size={20}
              color={currentUser.isArtist ? theme.colors.primary : '#666'}
            />
            <Text style={[
              styles.artistModeText,
              { color: currentUser.isArtist ? theme.colors.primary : '#666' }
            ]}>
              Artist Mode {currentUser.isArtist ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>
        </View>

        <ReviewsModal
          visible={showReviewsVisible}
          onClose={() => setShowReviews(false)}
          userId={currentUser.id}
          initialTab={activeReviewType}
          showTabs={!activeReviewType} // Only show tabs if no specific type is selected
          availableTypes={
            currentUser.isArtist 
              ? ['ARTIST', 'HOST'] 
              : ['HOST']
          }
        />
        <ConfirmationDialog
          visible={showArtistModeDialog}
          onDismiss={() => setShowArtistModeDialog(false)}
          onConfirm={handleConfirmArtistMode}
          title={getArtistModeDialogContent().title}
          message={getArtistModeDialogContent().message}
          confirmText={getArtistModeDialogContent().confirmText}
          showEditOption={getArtistModeDialogContent().showEditOption}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
const createStyles = (theme: any) => StyleSheet.create({
  actionButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewProfileButton: {
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderColor: '#eee',
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#eee',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 16,
    gap: 2,
  },
  previewText: {
    color: '#666',
    fontSize: 14,
  },
  ratingsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  ratingBox: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
  },
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
  },
  headerActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 16,
    zIndex: 1,
  },
  headerButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  editButton: {
    padding: 8,
  },
  header: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  headerInfo: {
    flex: 1,
    paddingVertical: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  location: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  infoContainer: {
    marginTop: 16,
  },
  bio: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  readMore: {
    fontSize: 12,
    marginTop: 4,
  },
  quickInfoRow: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  quickInfoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  categoriesRow: {
    marginTop: 12,
  },
  categoryChip: {
    backgroundColor: theme.colors.primary,
    marginRight: 8,
  },
  subCategoryChip: {
    backgroundColor: theme.colors.primary + '40',
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  artistModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    gap: 8,
  },
  artistModeText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProfileScreen;
