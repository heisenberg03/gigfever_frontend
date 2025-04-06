import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, Card, Text, Badge, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { useNotificationStore } from '../stores/notificationStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

const NotificationScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { generalNotifications, markAsRead } = useNotificationStore();

  const handleNotificationPress = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.relatedId) {
      switch (notification.type) {
        case 'EVENT':
          navigation.navigate('EventDetails', { eventId: notification.relatedId });
          break;
        case 'BOOKING':
          navigation.navigate('Bookings');
          break;
        case 'INVITE':
          navigation.navigate('InvitesScreen');
          break;
        default:
          break;
      }
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <Card 
      style={[
        styles.notificationCard,
        !item.read && styles.unreadCard
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={getNotificationIcon(item.type)}
            size={24}
            color={theme.colors.primary}
          />
          {!item.read && (
            <Badge
              size={8}
              style={styles.unreadBadge}
            />
          )}
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.timestamp}>
            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'EVENT':
        return 'calendar-clock';
      case 'BOOKING':
        return 'book-account';
      case 'INVITE':
        return 'email-outline';
      default:
        return 'bell-outline';
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Notifications" />
      </Appbar.Header>
      
      <FlatList
        data={generalNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="bell-off-outline"
              size={48}
              color="#999"
            />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    marginBottom: 8,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#f8f9ff',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
  },
  notificationContent: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
});

export default NotificationScreen;