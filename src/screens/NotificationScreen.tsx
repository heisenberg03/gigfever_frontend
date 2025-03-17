import React from 'react';
import { View, FlatList } from 'react-native';
import { Appbar, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useNotificationStore } from '../stores/notificationStore';

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { notifications, clearUnread } = useNotificationStore();

  React.useEffect(() => {
    clearUnread('general'); // Clear unread count when screen is viewed
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Notifications" />
      </Appbar.Header>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <Card
            style={{ margin: 8 }}
            onPress={() => item.relatedId && navigation.navigate(item.type === 'chat' ? 'Chat' : 'EventDetails', { [item.type === 'chat' ? 'receiverId' : 'eventId']: item.relatedId })}
          >
            <Card.Content>
              <Text>{item.message}</Text>
              <Text>{new Date(item.timestamp).toLocaleString()}</Text>
            </Card.Content>
          </Card>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default NotificationScreen;