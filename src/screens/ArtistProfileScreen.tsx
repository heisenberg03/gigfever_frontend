import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { Avatar, Button, Chip, Modal, Portal, IconButton, useTheme, Surface } from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ARTISTS } from '../graphql/queries';
import { GET_ARTIST_PORTFOLIO } from '../graphql/queries';
import { INVITE_ARTIST, START_CHAT, REPORT_ARTIST } from '../graphql/mutations';
import ReviewModal from '../components/ReviewsModal';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useCategoryStore } from '../stores/categoryStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import YoutubeIframe from 'react-native-youtube-iframe';

const { width, height } = Dimensions.get('window');
// Calculate safe area for media player
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
const PLAYER_PADDING = 20;

interface PortfolioItem {
  id: string;
  mediaType: string;
  mediaUrl: string;
  thumbnail: string;
  source?: 'youtube' | 'instagram';
}

interface Artist {
  id: string;
  fullName: string;
  username: string;
  profilePicture: string;
  location?: string;
  bio?: string;
  artistRating?: number;
  artistReviewCount?: number;
  categoryIDs: string[];
  subCategoryIDs: string[];
  artistType?: string;
  budget?: number;
  pastBookings?: number;
}

interface ArtistProfileScreenProps {
  route: {
    params: {
      artistId: string;
    };
  };
  navigation: any;
}

// Colors for consistent chip styling
const COLORS = {
  category: {
    bg: '#4C68FF',
    text: '#FFFFFF',
  },
  artistType: {
    bg: '#FFB448',
    text: '#FFFFFF',
  },
  subCategory: {
    bg: '#E6F2FF',
    text: '#0066CC',
  }
};


// YouTube video ID extraction from URL
const getYoutubeVideoId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const ArtistProfileScreen = ({ route, navigation }: ArtistProfileScreenProps) => {
  const { artistId } = route.params;
  const { categories } = useCategoryStore();
  const paperTheme = useTheme();
  const styles = createStyles(paperTheme);

  const { data: artistsData, loading: artistsLoading } = useQuery(GET_ARTISTS);
  const { data: portfolioData, loading: portfolioLoading } = useQuery(GET_ARTIST_PORTFOLIO, {
    variables: { id: artistId },
    skip: !artistId,
    fetchPolicy: 'cache-and-network',
  });

  const artist = artistsData?.artists?.find((a: Artist) => a.id === artistId);
  const portfolioItems = portfolioData?.portfolio || [];

  const [showReviews, setShowReviews] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<PortfolioItem | null>(null);
  const [activeReviewType, setActiveReviewType] = useState<string | undefined>(undefined);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [videoError, setVideoError] = useState(false);
  

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
    }
    if (state === 'playing') {
      setLoadingMedia(false);
    }
  }, []);

  const [inviteArtist] = useMutation(INVITE_ARTIST);
  const [startChat] = useMutation(START_CHAT, {
    onCompleted: () => {
      navigation.navigate('Chat', { receiverId: artistId });
    },
  });
  const [reportArtist] = useMutation(REPORT_ARTIST);

  if (artistsLoading || portfolioLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Artist not found</Text>
      </View>
    );
  }

  const profileCategory = categories.find((cat) => cat.id === artist.categoryIDs[0]) || { name: 'Not selected', subCategories: [] };

  const handleShowReviews = (show: boolean, type?: string) => {
    setActiveReviewType(type);
    setShowReviews(show);
  };

  const isInstaUrl = (url: string) => {
    return url.includes('instagram.com');
  };

  const isYoutubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const renderPortfolioGrid = () => {
    if (portfolioLoading) {
      return (
        <View style={styles.portfolioLoadingContainer}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      );
    }

    if (!portfolioItems.length) {
      return (
        <View style={styles.emptyPortfolioContainer}>
          <MaterialIcons name="photo-library" size={48} color={paperTheme.colors.primary} />
          <Text style={styles.emptyPortfolioText}>No portfolio items yet</Text>
        </View>
      );
    }

    return (
      <View style={styles.portfolioGrid}>
        {portfolioItems.map((item: PortfolioItem) => (
          <TouchableOpacity
            key={item.id}
            style={styles.portfolioItem}
            onPress={() => {
              setLoadingMedia(true);
              setSelectedMedia(item);
            }}
          >
            <Image
              source={{ uri: item.thumbnail || item.mediaUrl }}
              style={styles.portfolioThumbnail}
            />
            {item.mediaType === 'VIDEO' && (
              <View style={styles.videoOverlay}>
                {item.source === 'instagram' ? (
                  <Ionicons name="logo-instagram" size={24} color="#fff" />
                ) : (
                  <MaterialIcons name="play-circle-outline" size={36} color="#fff" />
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMediaPreview = () => {
    if (!selectedMedia) return null;

    const isInstagram = selectedMedia.source === 'instagram' || isInstaUrl(selectedMedia.mediaUrl);
    const isYoutube = selectedMedia.source === 'youtube' || isYoutubeUrl(selectedMedia.mediaUrl);
    const videoId = isYoutube ? getYoutubeVideoId(selectedMedia.mediaUrl) : null;

    // Calculate appropriate player dimensions
    const playerHeight = isYoutube ? height - STATUS_BAR_HEIGHT - (PLAYER_PADDING * 2) : height;
    const playerWidth = width;

    return (
      <View style={styles.mediaPreview}>
        {loadingMedia && (
          <View style={styles.webviewLoader}>
            <ActivityIndicator size="large" color={paperTheme.colors.primary} />
          </View>
        )}

        {selectedMedia.mediaType === 'VIDEO' ? (
          isYoutube && videoId ? (
            <View style={[styles.youtubeContainer, Platform.OS === 'android' && { paddingTop: STATUS_BAR_HEIGHT + PLAYER_PADDING }]}>
              <YoutubeIframe
                height={playerHeight * 0.6}
                width={playerWidth}
                videoId={videoId}
                play={true}
                onChangeState={onStateChange}
                onReady={() => setLoadingMedia(false)}
                onError={(e) => {
                  console.log('YouTube Error:', e);
                  setVideoError(true);
                  setLoadingMedia(false);
                }}
                initialPlayerParams={{
                  controls: true,
                  modestbranding: true,
                  rel: false
                }}
              />
            </View>
          ) : isInstagram ? (
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: selectedMedia.mediaUrl }}
                style={styles.video}
                resizeMode="contain"
                controls={true}
                repeat={true}
                onLoadStart={() => setLoadingMedia(true)}
                onLoad={() => setLoadingMedia(false)}
                onError={(e) => {
                  console.log('Video Error:', e);
                  setVideoError(true);
                  setLoadingMedia(false);
                }}
                fullscreen={Platform.OS === 'ios'}
                playInBackground={false}
                ignoreSilentSwitch="ignore"
                poster={selectedMedia.thumbnail}
              />
            </View>
          ) : (
            <View style={styles.unsupportedMedia}>
              {videoError ? (
                <>
                  <MaterialIcons name="error-outline" size={48} color="#fff" />
                  <Text style={styles.unsupportedMediaText}>Unable to play this video</Text>
                </>
              ) : (
                <Video
                  source={{ uri: selectedMedia.mediaUrl }}
                  style={styles.video}
                  resizeMode="contain"
                  controls={true}
                  repeat={true}
                  onLoadStart={() => setLoadingMedia(true)}
                  onLoad={() => setLoadingMedia(false)}
                  onError={(e) => {
                    console.log('Video Error:', e);
                    setVideoError(true);
                    setLoadingMedia(false);
                  }}
                  fullscreen={Platform.OS === 'ios'}
                  playInBackground={false}
                  ignoreSilentSwitch="ignore"
                  poster={selectedMedia.thumbnail}
                />
              )}
            </View>
          )
        ) : (
          <Image
            source={{ uri: selectedMedia.mediaUrl }}
            style={styles.mediaImage}
            resizeMode="contain"
            onLoadStart={() => setLoadingMedia(true)}
            onLoadEnd={() => setLoadingMedia(false)}
            onError={() => {
              setVideoError(true);
              setLoadingMedia(false);
            }}
          />
        )}
      </View>
    );
  };

  const renderCategories = () => {
    return (
      <View style={styles.categoriesContainer}>
        <View style={styles.categoryRow}>
          <Chip
            key={`category-${profileCategory.name}`}
            style={[styles.categoryChip, { backgroundColor: COLORS.category.bg }]}
            textStyle={[styles.chipText, { color: COLORS.category.text }]}
          >
            {profileCategory.name}
          </Chip>
          <Chip
            style={[styles.artistTypeChip, { backgroundColor: COLORS.artistType.bg }]}
            textStyle={[styles.chipText, { color: COLORS.artistType.text }]}
          >
            {artist.artistType?.toUpperCase()}
          </Chip>
        </View>
        <View style={styles.subCategoriesContainer}>
          {artist.subCategoryIDs.map((subId: string) => {
            const subCategory = profileCategory.subCategories.find(
              (cat) => cat.id === subId
            );
            return subCategory ? (
              <Chip
                key={`subcategory-${subId}`}
                style={[styles.subCategoryChip, { backgroundColor: COLORS.subCategory.bg }]}
                textStyle={[styles.subCategoryChipText, { color: COLORS.subCategory.text }]}
              >
                {subCategory.name}
              </Chip>
            ) : null;
          })}
        </View>
      </View>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView style={styles.scrollView}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.imageContainer}>
                <Avatar.Image
                  size={100}
                  source={{ uri: artist.profilePicture }}
                  style={styles.profileImage}
                />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{artist.fullName}</Text>
                <Text style={styles.username}>@{artist.username}</Text>
                <Text style={styles.location}>
                  <MaterialIcons name="location-on" size={14} color="#999" />
                  {artist.location || 'Location not set'}
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Button
                mode="contained"
                onPress={() => inviteArtist({ variables: { artistId, eventId: 'mock' } })}
                style={styles.actionButton}
                icon="calendar-plus"
              >
                Invite
              </Button>
              <Button
                mode="contained"
                onPress={() => startChat({ variables: { receiverId: artistId } })}
                style={styles.actionButton}
                icon="chat"
              >
                Chat
              </Button>
              <IconButton
                icon="flag"
                iconColor={paperTheme.colors.error}
                size={24}
                onPress={() => reportArtist({ variables: { artistId, reason: 'Inappropriate' } })}
              />
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.ratingContainer}>
                  <MaterialIcons name="star" size={16} color="#000000" />
                  <Text style={styles.ratingText}>{artist.artistRating?.toFixed(1) || '0.0'}</Text>
                </View>
                <Text style={styles.statLabel}>({artist.artistReviewCount || 0} reviews)</Text>
                <TouchableOpacity
                  onPress={() => handleShowReviews(true, 'ARTIST')}
                  style={styles.viewReviewsButton}
                >
                  <Text style={styles.viewReviewsText}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.pastBookingsContainer}>
                  <MaterialIcons name="event" size={16} color={paperTheme.colors.primary} />
                  <Text style={styles.pastBookingsText}>{artist.pastBookings || 0}</Text>
                </View>
                <Text style={styles.statLabel}>Bookings</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.budgetContainer}>
                  <Text style={styles.statLabel}>Minimum Budget</Text>
                  <Text style={styles.budgetText}>₹{artist.budget || 0}/hr</Text>
                </View>
              </View>
            </View>

            {/* Categories */}
            {renderCategories()}

            {/* Bio */}
            {artist.bio && (
              <View style={styles.bioContainer}>
                <Text style={styles.sectionTitle}>About</Text>
                <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
                  <Text numberOfLines={showFullBio ? undefined : 3} style={styles.bio}>
                    {artist.bio}
                  </Text>
                  {artist.bio.length > 100 && (
                    <Text style={[styles.readMore, { color: paperTheme.colors.primary }]}>
                      {showFullBio ? 'Show less' : 'Read more'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Portfolio Section */}
          <View style={styles.portfolioSection}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            {renderPortfolioGrid()}
          </View>
        </ScrollView>

        {/* Portfolio Preview Modal */}
        {selectedMedia && (
          <View style={styles.fullscreenOverlay}>
            {renderMediaPreview()}

            <TouchableOpacity
              style={[
                styles.closeButtonContainer, 
                selectedMedia.mediaType === 'VIDEO' && 
                (selectedMedia.source === 'youtube' || isYoutubeUrl(selectedMedia.mediaUrl)) && 
                Platform.OS === 'android' ? 
                { bottom: 40, top: 50, right: 20 } : 
                { top: Platform.OS === 'ios' ? 50 : 30, right: 20 }
              ]}
              onPress={() => {
                setSelectedMedia(null);
                setLoadingMedia(false);
                setVideoError(false);
              }}
            >
              <MaterialIcons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Reviews Modal */}
        <ReviewModal
          visible={showReviews}
          onClose={() => handleShowReviews(false)}
          userId={artistId}
          initialTab={activeReviewType}
          showTabs={!activeReviewType}
          availableTypes={['ARTIST']}
        />
      </SafeAreaView>
    </>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageContainer: {
    marginRight: 16,
  },
  profileImage: {
    backgroundColor: '#f0f0f0',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  location: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  categoriesContainer: {
    marginTop: 16,
    paddingHorizontal: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subCategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    backgroundColor: '#4C68FF',
    marginRight: 8,
    marginBottom: 8,
    height: 36,
  },
  artistTypeChip: {
    backgroundColor: '#FFB448',
    marginRight: 8,
    marginBottom: 8,
    height: 36,
  },
  subCategoryChip: {
    backgroundColor: theme.colors.primary + '15', // Primary color with 15% opacity
    marginRight: 8,
    marginBottom: 8,
    height: 36,
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    alignItems: 'center',
  },
  subCategoryChipText: {
    fontSize: 12,
    color: theme.colors.primary,
    textAlign: 'center',
    alignItems: 'center',
  },
  bioContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.text,
  },
  bio: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  readMore: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  portfolioSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  portfolioItem: {
    width: (width - 32) / 3,  // Account for padding
    height: (width - 32) / 3,
    padding: 2,
  },
  portfolioThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaModal: {
    backgroundColor: '#000',
    margin: 0,
    padding: 0,
    flex: 1,
  },
  mediaPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    width: width,
    height: height,
  },
  mediaVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  closeButtonContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
  },
  portfolioLoadingContainer: {
    height: (width - 32) / 3 * 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPortfolioContainer: {
    height: (width - 32) / 3 * 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  emptyPortfolioText: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  viewReviewsButton: {
    marginTop: 4,
    alignItems: 'center',
  },
  viewReviewsText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ddd',
  },
  pastBookingsContainer: {
    alignItems: 'center',
    gap: 2,
  },
  pastBookingsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  budgetContainer: {
    alignItems: 'center',
    gap: 2,
  },
  budgetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  webviewLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 5,
  },
  unsupportedMedia: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  unsupportedMediaText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  youtubeContainer: {
    width: width,
    height: height,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: width,
    height: height,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  fullscreenOverlay: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
  },
  
});

export default ArtistProfileScreen;