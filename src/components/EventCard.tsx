import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Icon, Badge, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCategoryStore } from '../stores/categoryStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';

interface EventCardProps {
  event: {
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
  };
  width?: number;
  isHost?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, width, isHost = false }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { categories } = useCategoryStore();

  const categoryObj = categories.find(cat => cat.name === event.category);
  const subCategoryNames = event.subcategories?.slice(0, 3) || [];

  const defaultImage = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4';
  const cardWidth = width || (Dimensions.get('window').width - 32);

  const formatDate = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format time
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;

    // Check if date is today, tomorrow, or within a week
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${timeStr}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${timeStr}`;
    } else {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      };
      return `${date.toLocaleDateString('en-US', options)}, ${timeStr}`;
    }
  };

  const getStatusColor = (status: string) => {
    if (isHost) {
      switch (status.toLowerCase()) {
        case 'open':
          return '#4CAF50';
        case 'confirmed':
          return '#2196F3';
        case 'closed':
          return '#FF9800';
        case 'canceled':
          return '#F44336';
        case 'draft':
          return '#9E9E9E';
        default:
          return '#2196F3';
      }
    } else {
      switch (status.toLowerCase()) {
        case 'open':
          return '#4CAF50';
        case 'closed':
          return '#F44336';
        case 'draft':
          return '#9E9E9E';
        default:
          return '#2196F3';
      }
    }
  };

  const getStatusLabel = (status: string, isDraft?: boolean) => {
    if (isDraft) return 'Draft';

    if (isHost) {
      switch (status.toLowerCase()) {
        case 'open':
          return 'Active';
        case 'confirmed':
          return 'Confirmed';
        case 'closed':
          return 'Closed';
        case 'canceled':
          return 'Canceled';
        default:
          return status;
      }
    } else {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleNavigation = () => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  // Parse location to extract venue name
  const getVenueName = (location: string) => {
    // Try to extract venue name if it contains comma or hyphen
    if (location.includes(',')) {
      return location.split(',')[0].trim();
    } else if (location.includes('-')) {
      return location.split('-')[0].trim();
    } else {
      return location;
    }
  };

  const getLocationCity = (location: string) => {
    // Try to extract city if it contains comma
    if (location.includes(',')) {
      return location.split(',').pop()?.trim() || location;
    } else {
      return location;
    }
  };

  // Determine event indicators (new/actively accepting/high demand/closing soon)
  const getEventIndicators = () => {
    const indicators = [];
    const createdDate = event.createdAt ? new Date(event.createdAt) : new Date();
    const now = new Date();
    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

    // New event (created within the last 24 hours)
    if (event.dateTime) {
      const eventDate = new Date(event.dateTime);
      const now = new Date();
      const daysDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff > 0 && daysDiff < 3) {
        indicators.push({ label: 'CLOSING SOON', color: '#FF5722' });
      }
    }
    else if (event.createdAt && daysDiff < 3) {
        indicators.push({ label: 'NEW', color: '#FF9500' });
    }

    // High demand indicator (if there are many applicants)
    else if (event.applicantsCount && event.applicantsCount > 5) {
      indicators.push({ label: 'HIGH DEMAND', color: '#E91E63' });
    }

    // Actively accepting indicator
    else if (event.status.toLowerCase() === 'open' &&
      (!event.applicantsCount || event.applicantsCount < 3)) {
      indicators.push({ label: 'ACTIVELY ACCEPTING', color: '#4CAF50' });
    }

    // Closing soon indicator (if the event date is within a week)


    return indicators;
  };

  const eventIndicators = getEventIndicators();
  const venueName = getVenueName(event.location.address);
  const locationCity = getLocationCity(event.location.address);

  return (
    <Card
      style={[styles.card, { width: cardWidth }]}
      onPress={handleNavigation}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.banner || defaultImage }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.budgetBadge}>
          <Text style={styles.budgetText}>
            ₹{event.budget?.min || 0}{event.budget?.max ? ` - ₹${event.budget.max}` : '+'}
          </Text>
        </View>
        {isHost && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
            <Text style={styles.statusBadgeText}>
              {getStatusLabel(event.status)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.titleText} numberOfLines={1}>
            {event.title}
          </Text>
          {isHost && event.applicantsCount !== undefined && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {event.applicantsCount} Applicants
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconTextRow}>
            <Icon source="calendar" size={14} color={theme.colors.primary} />
            <Text style={styles.infoText}>{formatDate(event.dateTime)}</Text>
          </View>
          {!isHost && eventIndicators.length > 0 && (
            <View style={styles.indicatorsContainer}>
              {eventIndicators.map((indicator, index) => (
                <Badge
                  key={index}
                  style={[styles.indicator, { backgroundColor: indicator.color }]}
                  size={16}
                >
                  {indicator.label}
                </Badge>
              ))}
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconTextRow}>
            <Icon source="map-marker" size={14} color={theme.colors.primary} />
            <Text style={styles.infoText} numberOfLines={1}>
              <Text style={styles.venueName}>{venueName}</Text>
              {!venueName.includes(locationCity) && `, ${locationCity}`}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomSection}>
          <View style={styles.chipsContainer}>
            {/* Event Type Chip */}
            {event.eventType && (
              <View style={[styles.chip, styles.eventTypeChip]}>
                <Text style={[styles.chipText, styles.eventTypeText]} numberOfLines={1}>
                  {event.eventType}
                </Text>
              </View>
            )}

            {/* Category Chip */}
            {categoryObj && (
              <View style={[styles.chip, styles.categoryChip]}>
                <Text style={[styles.chipText, styles.categoryText]} numberOfLines={1}>
                  {categoryObj.name}
                </Text>
              </View>
            )}

            {/* Subcategory Chips */}
            {subCategoryNames.map((subCat, index) => (
              <View key={index} style={[styles.chip, styles.subCategoryChip]}>
                <Text style={[styles.chipText, styles.subCategoryText]} numberOfLines={1}>
                  {subCat}
                </Text>
              </View>
            ))}

            {/* Status Chip */}
            {isHost && (
              <View style={[styles.chip, styles.statusChip, { backgroundColor: getStatusColor(event.status) }]}>
                <Text style={[styles.chipText, styles.statusText]} numberOfLines={1}>
                  {getStatusLabel(event.status)}
                </Text>
              </View>
            )}
          </View>

          {isHost && event.applicantsCount !== undefined && event.applicantsCount > 0 && (
            <View style={styles.applicantsRow}>
              <Icon source="account-multiple" size={14} color={theme.colors.primary} />
              <Text style={styles.applicantsText}>
                {event.applicantsCount} {event.applicantsCount === 1 ? 'applicant' : 'applicants'}
              </Text>
            </View>
          )}
        </View>

        {/* Host Section */}
        {!isHost && event.host && (
          <View style={styles.hostSection}>
            <View style={styles.hostInfo}>
              {event.host.profilePicture && (
                <Avatar.Image
                  size={24}
                  source={{ uri: event.host.profilePicture }}
                />
              )}
              <View style={styles.hostDetails}>
                <Text style={styles.hostName}>Hosted by {event.host.displayName}</Text>
                {event.host.rating !== undefined && (
                  <View style={styles.ratingContainer}>
                    <Icon source="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>{event.host.rating?.toFixed(1)} ({event.host.reviewsCount})</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    marginVertical: 12,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  budgetBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  budgetText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  countBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  indicatorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  indicator: {
    marginLeft: 8,
    fontSize: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  venueName: {
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  chip: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  statusChip: {
    backgroundColor: '#4CAF50',
  },
  eventTypeChip: {
    backgroundColor: '#F3E5F5',
  },
  eventTypeText: {
    color: '#7B1FA2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryChip: {
    backgroundColor: '#E3F2FD',
  },
  categoryText: {
    color: '#1565C0',
  },
  subCategoryChip: {
    backgroundColor: '#FFF3E0',
  },
  subCategoryText: {
    color: '#E65100',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '500',
  },
  statusText: {
    color: '#fff',
  },
  applicantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicantsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  hostSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  hostDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  hostName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default EventCard;