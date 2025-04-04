import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Card, Chip, Avatar } from 'react-native-paper';
import { format, parseISO } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { Location } from '../types';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    banner?: string;
    dateTime: string;
    status: string;
    type?: string;
    budget?: { min: number; max: number };
    location: Location;
    confirmedArtist?: {
      fullName: string;
      profilePicture?: string;
    };
    applicationsCount?: number;
  };
  isHost: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isHost }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return { bg: '#E8F5E9', text: '#2E7D32' }; // Green
      case 'confirmed':
        return { bg: '#E3F2FD', text: '#1565C0' }; // Blue
      case 'completed':
        return { bg: '#E1F5FE', text: '#0277BD' }; // Light Blue
      case 'cancelled':
        return { bg: '#FFEBEE', text: '#C62828' }; // Red
      case 'draft':
        return { bg: '#F5F5F5', text: '#616161' }; // Grey
      default:
        return { bg: '#F5F5F5', text: '#616161' };
    }
  };

  const statusColors = getStatusColor(event.status);
console.log('EventCard', event);
  return (
    <Card style={styles.card} elevation={0}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.banner || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4' }}
          style={styles.image}
          resizeMode="cover"
        />
        {event.applicationsCount && (
          <View style={styles.applicationBadge}>
            <MaterialCommunityIcons name="account-clock" size={14} color="#FFF" />
            <Text style={styles.applicationBadgeText}>
              {event.applicationsCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: statusColors.bg }]}
            textStyle={[styles.statusText, { color: statusColors.text }]}
          >
            {event.status}
          </Chip>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.detailsRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#666" />
            <Text style={styles.details}>
              {format(parseISO(event.dateTime), 'MMM d, yyyy • h:mm a')}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={16} color="#666" />
            <Text style={styles.details} numberOfLines={1}>
              {event.location.address}
            </Text>
          </View>

          {event.budget && (
            <View style={styles.detailsRow}>
              <MaterialCommunityIcons name="currency-inr" size={16} color="#666" />
              <Text style={styles.details}>
                ₹{event.budget.min.toLocaleString()} - {event.budget.max.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {event.status.toLowerCase() === 'confirmed' && event.confirmedArtist && (
          <View style={styles.artistContainer}>
            <Avatar.Image
              size={28}
              source={{ uri: event.confirmedArtist?.profilePicture }}
              style={styles.artistAvatar}
            />
            <View style={styles.artistInfo}>
              <Text style={styles.artistLabel}>Selected Artist</Text>
              <Text style={styles.artistName}>{event.confirmedArtist.fullName}</Text>
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
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 12,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusChip: {
    paddingHorizontal: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoContainer: {
    gap: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  details: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  artistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  artistAvatar: {
    backgroundColor: '#F5F5F5',
  },
  artistInfo: {
    flex: 1,
  },
  artistLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  artistName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  applicationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  applicationBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default EventCard;