import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Text,
  Alert,
} from 'react-native';
import { Appbar, Avatar, IconButton, Menu, Portal, Modal, Button } from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client';
import { format } from 'date-fns';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useWebSocket } from '../services/websocketService';
import { GET_CHAT_MESSAGES, GET_USER_PROFILE, MARK_AS_READ } from '../graphql/queries';
import { theme } from '../theme';
import { StatusBar } from 'react-native';

const ChatScreen = ({navigation, route}: {navigation: any, route: any}) => {
  const { userId, userName, profilePicture } = route.params;
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuthStore();
  const { markAsRead } = useNotificationStore();
  const { socket, sendMessage: sendWebSocketMessage } = useWebSocket();
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const { data: messagesData, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { receiverId: userId },
  });
  const { data: userData } = useQuery(GET_USER_PROFILE, { variables: { userId } });
  const [markAsReadMutation] = useMutation(MARK_AS_READ);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (messagesData?.chatMessages) {
      setMessages(messagesData.chatMessages);
    }
  }, [messagesData]);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const incomingMessage = JSON.parse(event.data);
        if (incomingMessage.type === 'message' && incomingMessage.senderId === userId) {
          setMessages((prev) => [...prev, incomingMessage]);
          markAsReadMutation({ variables: { messageId: incomingMessage.id } });
          markAsRead(incomingMessage.id);
        }
      };
    }
  }, [socket, userId, markAsRead, markAsReadMutation]);

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !currentUser) return;
    const newMessage = {
      type: 'message',
      content: message.trim(),
      receiverId: userId,
      senderId: currentUser.id,
      timestamp: new Date().toISOString(),
      id: `${Date.now()}-${Math.random()}`, // Temporary ID; server should replace
    };
    sendWebSocketMessage(newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isCurrentUser = item.senderId === currentUser?.id;
    return (
      <View style={[styles.messageRow, isCurrentUser ? styles.rightRow : styles.leftRow]}>
        {!isCurrentUser && (
          <Avatar.Image
            source={{ uri: profilePicture || 'https://via.placeholder.com/40' }}
            size={36}
            style={styles.avatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.rightBubble : styles.leftBubble,
          ]}
        >
          <Text style={[styles.messageText, isCurrentUser ? styles.rightMessageText : styles.leftMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.timeText, isCurrentUser ? styles.rightTimeText : styles.leftTimeText]}>
            {format(new Date(item.timestamp), 'h:mm a')}
          </Text>
        </View>
      </View>
    );
  };

  const receiver = userData?.user || { fullName: userName, isOnline: false };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <TouchableOpacity style={styles.profileContainer}>
          <Avatar.Image
            source={{ uri: profilePicture || 'https://via.placeholder.com/40' }}
            size={40}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{receiver.fullName}</Text>
            {receiver.isOnline && (
              <View style={styles.onlineStatusContainer}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={() => setReportModalVisible(true)} title="Report User" />
          <Menu.Item onPress={() => {}} title="Block User" />
        </Menu>
      </Appbar.Header>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesListContent}
        />
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message"
            style={styles.input}
            multiline
            maxLength={1000}
          />
          <IconButton
            icon="send"
            size={24}
            onPress={sendMessage}
            disabled={!message.trim()}
            iconColor={theme.colors.primary}
          />
        </View>
      </KeyboardAvoidingView>

      <Portal>
        <Modal
          visible={reportModalVisible}
          onDismiss={() => setReportModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Report User</Text>
          {["Inappropriate Content", "Harassment", "Spam", "Fake Profile", "Other"].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.reportOption}
              onPress={() => {
                Alert.alert("Reported", "Thank you for your report. We'll review it shortly.");
                setReportModalVisible(false);
              }}
            >
              <Text style={styles.reportOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          <Button mode="outlined" onPress={() => setReportModalVisible(false)} style={styles.cancelReportButton}>
            Cancel
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    backgroundColor: '#FFF', 
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea'
  },
  profileContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, padding: 10 },
  headerTextContainer: { marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  onlineStatusContainer: { flexDirection: 'row', alignItems: 'center' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 4 },
  onlineText: { fontSize: 12, color: '#4CAF50' },
  keyboardAvoidingView: { flex: 1 },
  messagesListContent: { padding: 16 },
  messageRow: { flexDirection: 'row', marginVertical: 4, alignItems: 'flex-end' },
  leftRow: { justifyContent: 'flex-start' },
  rightRow: { justifyContent: 'flex-end' },
  avatar: { marginRight: 8 },
  messageBubble: {
    borderRadius: 20,
    padding: 12,
    maxWidth: '75%',
    marginVertical: 4,
  },
  leftBubble: { backgroundColor: '#E5E5EA' },
  rightBubble: { backgroundColor: theme.colors.primary },
  messageText: { fontSize: 16 },
  leftMessageText: { color: '#000' },
  rightMessageText: { color: '#FFF' },
  timeText: { fontSize: 12, marginTop: 4 },
  leftTimeText: { color: '#666', alignSelf: 'flex-end' },
  rightTimeText: { color: 'rgba(255, 255, 255, 0.7)', alignSelf: 'flex-end' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  reportOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reportOptionText: {
    fontSize: 16,
    color: '#333',
  },
  cancelReportButton: {
    marginTop: 12,
  },
});

export default ChatScreen;