import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Avatar, Button, Chip, Modal, Portal, IconButton, useTheme } from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client';
import { useAuthStore } from '../stores/authStore';
import { GET_ARTISTS } from '../graphql/queries';
import { GET_ARTIST_PORTFOLIO } from '../graphql/queries';
import { INVITE_ARTIST, START_CHAT, REPORT_ARTIST } from '../graphql/mutations';
import ReviewModal from '../components/ReviewsModal';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useCategoryStore } from '../stores/categoryStore';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import RatingBox from '../components/RatingBox';
import WebView from 'react-native-webview';

const { width } = Dimensions.get('window');
const PORTFOLIO_ITEM_WIDTH = width / 3;

interface PortfolioItem {
  id: string;
  mediaType: string;
  mediaUrl: string;
  thumbnail: string;
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

const ArtistProfileScreen = ({ route, navigation }: ArtistProfileScreenProps) => {
  const { artistId } = route.params;
  const { currentUser: user } = useAuthStore();
  const { categories } = useCategoryStore();
  const paperTheme = useTheme();
  const styles = createStyles(paperTheme);

  const { data: artistsData, loading: artistsLoading } = useQuery(GET_ARTISTS);
  const { data: portfolioData, loading: portfolioLoading } = useQuery(GET_ARTIST_PORTFOLIO, {
    variables: { id: artistId },
    skip: !artistId,
  });

  const artist = artistsData?.artists?.find((a: Artist) => a.id === artistId);
  const portfolioItems = portfolioData?.portfolio || [];

  const [showReviews, setShowReviews] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<PortfolioItem | null>(null);
  const [activeReviewType, setActiveReviewType] = useState<string | undefined>(undefined);

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

  const renderPortfolioGrid = () => {
    if (!portfolioItems.length) {
      return (
        <View style={styles.emptyPortfolioContainer}>
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
            onPress={() => setSelectedMedia(item)}
          >
            <Image
              source={{ uri: item.thumbnail || item.mediaUrl }}
              style={styles.portfolioThumbnail}
            />
            {item.mediaType === 'VIDEO' && (
              <View style={styles.videoOverlay}>
                <MaterialIcons name="play-circle" size={24} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMediaPreview = () => {
    if (!selectedMedia) return null;

    return (
      <View style={styles.mediaPreview}>
        {selectedMedia.mediaType === 'VIDEO' ? (
          <WebView
            source={{ uri: selectedMedia.mediaUrl }}
            style={styles.mediaVideo}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
          />
        ) : (
          <Image
            source={{ uri: selectedMedia.mediaUrl }}
            style={styles.mediaImage}
            resizeMode="contain"
          />
        )}
        <IconButton
          icon="close"
          size={24}
          onPress={() => setSelectedMedia(null)}
          style={styles.closeButton}
        />
      </View>
    );
  };

  const renderCategories = () => {
    return (
      <View style={styles.categoriesContainer}>
        <View style={styles.categoryRow}>
          <Chip
            key={`category-${profileCategory.name}`}
            style={styles.categoryChip}
            textStyle={styles.chipText}
            compact
          >
            {profileCategory.name}
          </Chip>
          <Chip
            style={styles.artistTypeChip}
            textStyle={styles.chipText}
            compact
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
                style={styles.subCategoryChip}
                textStyle={styles.chipText}
                compact
              >
                {subCategory.name}
              </Chip>
            ) : null;
          })}
        </View>
      </View>
    );
  };

  const renderStatsRow = () => {
    return (
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color={paperTheme.colors.primary} />
            <Text style={styles.ratingText}>{artist.artistRating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.ratingCount}>({artist.artistReviewCount || 0})</Text>
          </View>
          <TouchableOpacity 
            onPress={() => handleShowReviews(true, 'ARTIST')}
            style={styles.viewReviewsButton}
          >
            <Text style={styles.viewReviewsText}>View Reviews</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statBox}>
          <View style={styles.pastBookingsContainer}>
            <MaterialIcons name="event" size={16} color={paperTheme.colors.primary} />
            <Text style={styles.pastBookingsText}>{artist.pastBookings || 0}</Text>
            <Text style={styles.pastBookingsLabel}>Bookings</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
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
              <Text style={styles.location}>{artist.location || 'Location not set'}</Text>
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
          {renderStatsRow()}

          {/* Categories */}
          {renderCategories()}

          {/* Bio */}
          {artist.bio && (
            <View style={styles.bioContainer}>
              <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
                <Text numberOfLines={showFullBio ? undefined : 2} style={styles.bio}>
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
      <Portal>
        <Modal
          visible={!!selectedMedia}
          onDismiss={() => setSelectedMedia(null)}
          contentContainerStyle={styles.mediaModal}
        >
          {renderMediaPreview()}
        </Modal>
      </Portal>

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
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
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
  ratingsContainer: {
    marginTop: 16,
  },
  categoriesRow: {
    marginTop: 16,
  },
  categoriesContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  subCategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: theme.colors.primary,
    height: 32,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  artistTypeChip: {
    backgroundColor: theme.colors.secondary,
    height: 32,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  subCategoryChip: {
    backgroundColor: theme.colors.primary + '20',
    height: 32,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
    lineHeight: 32,
  },
  bioContainer: {
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
  portfolioSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.text,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  portfolioItem: {
    width: PORTFOLIO_ITEM_WIDTH,
    height: PORTFOLIO_ITEM_WIDTH,
    padding: 4,
  },
  portfolioThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
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
  },
  mediaVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    height: PORTFOLIO_ITEM_WIDTH * 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPortfolioContainer: {
    height: PORTFOLIO_ITEM_WIDTH * 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPortfolioText: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.7,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  ratingCount: {
    fontSize: 14,
    color: '#666',
  },
  viewReviewsButton: {
    marginTop: 4,
    alignItems: 'center',
  },
  viewReviewsText: {
    fontSize: 12,
    color: theme.colors.primary,
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
  pastBookingsLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default ArtistProfileScreen;