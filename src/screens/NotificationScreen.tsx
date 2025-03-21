import React from 'react';
import { View, FlatList, Text } from 'react-native';
import { Appbar, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { useNotificationStore } from '../stores/notificationStore';
import { RootStackParamList } from '../navigation/AppNavigator';

const NotificationScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { generalNotifications: notifications, markAsRead } = useNotificationStore();

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
            onPress={() => { item.relatedId && markAsRead(item.id) && navigation.navigate('EventDetails', { eventId: item.relatedId })}}
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