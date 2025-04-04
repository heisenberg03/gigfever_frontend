import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Text, Chip, useTheme } from 'react-native-paper';
import { useAuthStore } from '../../stores/authStore';
import ReviewsModal from '../../components/ReviewsModal';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useCategoryStore } from '../../stores/categoryStore';
import * as ImagePicker from 'expo-image-picker';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import RatingBox from '../../components/RatingBox';
import * as Linking from 'expo-linking';
import { gql, useMutation } from '@apollo/client';

// GraphQL Mutation for Linking Social Media
const LINK_SOCIAL_MEDIA = gql`
  mutation LinkSocialMedia($platform: String!, $authCode: String!) {
    linkSocialMedia(platform: $platform, authCode: $authCode) {
      platform
      identifier
    }
  }
`;

interface User {
  id: string;
  phoneNumber: string;
  username: string;
  fullName: string;
  email?: string;
  profilePicture?: string;
  isArtist: boolean;
  bio?: string;
  budget?: number;
  categoryIDs?: string[];
  subCategoryIDs?: string[];
  pastBookings?: number;
  artistRating?: number;
  artistReviewCount?: number;
  hostRating?: number;
  hostReviewCount?: number;
  location?: string;
  artistType?: string;
  youtubeDisplay?: boolean;
  youtubeId?: string;
  instagramDisplay?: boolean;
  instagramUsername?: string;
  facebookDisplay?: boolean;
  facebookId?: string;
  xLinked?: boolean;
  xDisplay?: boolean;
  xUsername?: string;
}

const ProfileScreen = ({ navigation }: any) => {
  const { currentUser, toggleArtistMode, updateProfile } = useAuthStore();
  const [showReviewsVisible, setShowReviewsVisible] = useState(false);
  const { categories } = useCategoryStore();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [showFullBio, setShowFullBio] = useState(false);
  const [showArtistModeDialog, setShowArtistModeDialog] = useState(false);
  const [pendingArtistMode, setPendingArtistMode] = useState(false);
  const [activeReviewType, setActiveReviewType] = useState<string | undefined>(undefined);

  const profileCategory = categories.find((cat) => cat.id === currentUser?.categoryIDs?.[0]) || { name: 'Not selected', subCategories: [] };
  if (!currentUser) return null;

  const [linkSocialMedia] = useMutation(LINK_SOCIAL_MEDIA, {
    onCompleted: (data) => {
      updateProfile({
        [`${data.linkSocialMedia.platform}Linked`]: true,
        [`${data.linkSocialMedia.platform}Id`]:
          data.linkSocialMedia.platform === 'youtube' ? data.linkSocialMedia.identifier : undefined,
        [`${data.linkSocialMedia.platform}Username`]:
          data.linkSocialMedia.platform !== 'youtube' ? data.linkSocialMedia.identifier : undefined,
      });
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to link social media: ' + error.message);
    },
  });

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
      console.log('Selected image URI:', result.assets[0].uri);
    }
  };

  const handleLinkSocialMedia = async (platform: string) => {
    try {
      await linkSocialMedia({ variables: { platform, authCode: 'mock-auth-code' } });
      Alert.alert('Success', `${platform} linked! Go to Edit Profile to manage visibility.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to link social media');
    }
  };

  const cardData = [
    { title: 'Portfolio', subtitle: 'Manage your portfolio', screen: 'PortfolioScreen', icon: 'images' },
    { title: 'Bookings', subtitle: 'View your bookings', screen: 'BookingsScreen', icon: 'calendar-check' },
    { title: 'Events', subtitle: 'Manage your hosted events', screen: 'MyEventsScreen', icon: 'calendar-alt' },
    { title: 'Settings', subtitle: 'Account settings', screen: 'Settings', icon: 'cog' },
  ];

  const filteredCardData = cardData.filter((item) =>
    currentUser.isArtist ? true : !['Portfolio', 'Bookings', 'Invites'].includes(item.title)
  );

  const handleArtistModeToggle = (newValue: boolean) => {
    setPendingArtistMode(newValue);
    setShowArtistModeDialog(true);
  };

  const handleConfirmArtistMode = () => {
    toggleArtistMode(pendingArtistMode);
    setShowArtistModeDialog(false);
    if (!currentUser.isArtist) navigation.navigate('EditProfileScreen');
  };

  const getArtistModeDialogContent = () => {
    if (pendingArtistMode) {
      return {
        title: 'Turn On Artist Mode?',
        message: 'Turning on Artist Mode will list you as an available artist for booking requests. We recommend completing your profile with relevant details to increase your visibility.',
        confirmText: 'Turn On',
        showEditOption: true,
      };
    }
    return {
      title: 'Turn Off Artist Mode?',
      message: 'After turning off Artist Mode, you will no longer appear in artist listings or be available for bookings.',
      confirmText: 'Turn Off',
      showEditOption: false,
    };
  };

  const setShowReviews = (show: boolean, type?: string) => {
    setActiveReviewType(type);
    setShowReviewsVisible(show);
  };

  const getSocialUrl = (platform: string, identifier?: string) => {
    const baseUrls = {
      youtube: 'https://youtube.com/channel/',
      instagram: 'https://instagram.com/',
      facebook: 'https://facebook.com/',
      x: 'https://x.com/',
    };
    return identifier ? `${baseUrls[platform]}${identifier}` : null;
  };

  const SocialMediaIcon = ({
    platform,
    linked,
    display,
    identifier,
    onLink,
  }: {
    platform: string;
    linked?: boolean;
    display?: boolean;
    identifier?: string;
    onLink: () => void;
  }) => {
    const iconName = platform === 'youtube' ? 'youtube' : platform === 'instagram' ? 'instagram' : platform === 'facebook' ? 'facebook' : 'twitter';
    const color = linked ? theme.colors.primary : '#666';

    return (
      <TouchableOpacity
        onPress={linked && identifier && display ? () => Linking.openURL(getSocialUrl(platform, identifier)!) : onLink}
        style={styles.socialIcon}
      >
        <FontAwesome5 name={iconName} size={24} color={color} />
        <Text style={[styles.socialText, { color }]}>{linked ? (display ? 'Linked' : 'Private') : 'Link'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'left', 'right']}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleNavigate('EditProfileScreen')}>
            <MaterialIcons name="edit" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.imageContainer}>
              <TouchableOpacity onPress={handleImagePick}>
                {currentUser?.profilePicture ? (
                  <Image style={styles.profileImage} source={{ uri: currentUser.profilePicture }} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <MaterialIcons name="account-circle" size={40} color="#666" />
                  </View>
                )}
              </TouchableOpacity>
              {currentUser.isArtist && (
                <TouchableOpacity style={styles.previewProfileButton} onPress={() => navigation.navigate('PreviewProfile')}>
                  <FontAwesome5 name="eye" size={20} color={theme.colors.primary} />
                  <Text style={styles.previewText}>Preview</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{currentUser.fullName}</Text>
              <Text style={styles.username}>@{currentUser.username}</Text>
              <Text style={styles.location}>{currentUser.location || 'Location not set'}</Text>
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

            <View style={styles.quickInfoRow}>
              <View style={styles.quickInfoItem}>
                <MaterialIcons name="phone" size={16} color={theme.colors.primary} />
                <Text style={styles.quickInfoText}>{currentUser.phone}</Text>
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
                  <Text style={styles.quickInfoText}>{currentUser.budget}/hr</Text>
                </View>
              )}
            </View>

            {currentUser.isArtist && (
              <View style={styles.categoriesContainer}>
                <View style={styles.categoriesRow}>
                  {currentUser.artistType && (
                    <Chip key={`artist-type-${currentUser.artistType}`} style={styles.artistTypeChip} textStyle={styles.artistTypeText}>
                      {currentUser.artistType}
                    </Chip>
                  )}
                  <Chip key={`category-${profileCategory.name}`} style={styles.categoryChip} textStyle={styles.categoryText}>
                    {profileCategory.name}
                  </Chip>
                  {currentUser.subCategoryIDs?.map((subId) => {
                    const subCategory = profileCategory.subCategories.find((cat) => cat.id === subId);
                    return subCategory ? (
                      <Chip key={`subcategory-${subId}`} style={styles.subCategoryChip} textStyle={styles.subCategoryText}>
                        {subCategory.name}
                      </Chip>
                    ) : null;
                  })}
                </View>
              </View>
            )}

            {(
              <View style={styles.socialMediaContainer}>
                <Text style={styles.socialMediaTitle}>Social Media</Text>
                <Text style={styles.socialMediaPrompt}>
                  Link your accounts to boost credibility and add portfolio items!
                </Text>
                <View style={styles.socialMediaIcons}>
                  <SocialMediaIcon
                    platform="youtube"
                    linked={!!currentUser.youtubeId}
                    display={currentUser.youtubeDisplay}
                    identifier={currentUser.youtubeId}
                    onLink={() => handleLinkSocialMedia('youtube')}
                  />
                  <SocialMediaIcon
                    platform="instagram"
                    linked={!!currentUser.instagramUsername}
                    display={currentUser.instagramDisplay}
                    identifier={currentUser.instagramUsername}
                    onLink={() => handleLinkSocialMedia('instagram')}
                  />
                  <SocialMediaIcon
                    platform="facebook"
                    linked={!!currentUser.facebookId}
                    display={currentUser.facebookDisplay}
                    identifier={currentUser.facebookId}
                    onLink={() => handleLinkSocialMedia('facebook')}
                  />
                  <SocialMediaIcon
                    platform="x"
                    linked={!!currentUser.xUsername}
                    display={currentUser.xDisplay}
                    identifier={currentUser.xUsername}
                    onLink={() => handleLinkSocialMedia('x')}
                  />
                </View>
              </View>
            )}
          </View>

          <View style={styles.cardContainer}>
            {filteredCardData.map((item, index) => (
              <TouchableOpacity
                key={`card-${item.screen}-${index}`}
                onPress={() => handleNavigate(item.screen)}
                style={styles.cardWrapper}
              >
                <View style={styles.card}>
                  <FontAwesome5 name={item.icon} size={32} color={theme.colors.primary} style={styles.cardIcon} />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.artistModeToggle}
            onPress={() => handleArtistModeToggle(!currentUser.isArtist)}
          >
            <MaterialIcons
              name={currentUser.isArtist ? 'mic' : 'mic-off'}
              size={20}
              color={currentUser.isArtist ? theme.colors.primary : '#666'}
            />
            <Text
              style={[
                styles.artistModeText,
                { color: currentUser.isArtist ? theme.colors.primary : '#666' },
              ]}
            >
              Artist Mode {currentUser.isArtist ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>
        </View>

        <ReviewsModal
          visible={showReviewsVisible}
          onClose={() => setShowReviews(false)}
          userId={currentUser.id}
          initialTab={activeReviewType}
          showTabs={!activeReviewType}
          availableTypes={currentUser.isArtist ? ['ARTIST', 'HOST'] : ['HOST']}
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

const createStyles = (theme: any) =>
  StyleSheet.create({
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
    headerActions: {
      position: 'absolute',
      top: 16,
      right: 16,
      flexDirection: 'row',
      gap: 16,
      zIndex: 1,
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
    profileImagePlaceholder: {
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
    categoriesContainer: {
      marginTop: 12,
      marginBottom: 8,
    },
    categoriesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      rowGap: 8,
    },
    categoryChip: {
      backgroundColor: '#4C68FF',
      margin: 0,
    },
    subCategoryChip: {
      backgroundColor: theme.colors.primary + '15',
      margin: 0,
    },
    artistTypeChip: {
      backgroundColor: '#FFB448',
      margin: 0,
    },
    categoryText: {
      fontSize: 12,
      color: '#FFFFFF',
    },
    subCategoryText: {
      fontSize: 12,
      color: theme.colors.primary,
    },
    artistTypeText: {
      fontSize: 12,
      color: '#FFFFFF',
    },
    cardContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding: 16,
      gap: 16,
    },
    cardWrapper: {
      width: '47%',
      aspectRatio: 1,
    },
    card: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 8,
      backgroundColor: '#fff',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    cardIcon: {
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 4,
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
      marginBottom: 32,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
      gap: 8,
    },
    artistModeText: {
      fontSize: 14,
      fontWeight: '500',
    },
    socialMediaContainer: {
      marginTop: 16,
    },
    socialMediaTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      color: '#333',
    },
    socialMediaPrompt: {
      fontSize: 12,
      color: '#666',
      marginBottom: 8,
    },
    socialMediaIcons: {
      flexDirection: 'row',
      gap: 20,
    },
    socialIcon: {
      alignItems: 'center',
    },
    socialText: {
      fontSize: 12,
      marginTop: 4,
    },
  });

export default ProfileScreen;