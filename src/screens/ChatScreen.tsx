import React, { useState } from 'react';
import { View, FlatList, TextInput } from 'react-native';
import { Appbar, Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import { GET_CHAT_MESSAGES } from '../graphql/queries';

const ChatScreen = ({ route }) => {
  const { receiverId } = route.params;
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const { data } = useQuery(GET_CHAT_MESSAGES, { variables: { receiverId } });

  const messages = data?.chatMessages || [];

  const sendMessage = () => {
    // Mock send logic
    console.log(`Sending: ${message} to ${receiverId}`);
    setMessage('');
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Chat" />
      </Appbar.Header>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Card style={{ margin: 8 }}>
            <Card.Content>
              <Text>{item.content}</Text>
              <Text>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            </Card.Content>
          </Card>
        )}
        keyExtractor={(item) => item.id}
      />
      <View style={{ padding: 16, flexDirection: 'row' }}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button mode="contained" onPress={sendMessage}>Send</Button>
      </View>
    </View>
  );
};

export default ChatScreen;