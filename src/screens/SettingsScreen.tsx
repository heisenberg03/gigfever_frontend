import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, SafeAreaView } from 'react-native';
import { Text, Switch, useTheme, Button, List, Dialog, Portal } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/authStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

interface NotificationSettings {
  bookingRequests: boolean;
  messages: boolean;
  reminders: boolean;
  updates: boolean;
}

export const SettingsScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const systemColorScheme = useColorScheme();
  const { logout, currentUser } = useAuthStore();
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    bookingRequests: true,
    messages: true,
    reminders: true,
    updates: false,
  });
  const [themeMode, setThemeMode] = useState('system');
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('notificationSettings');
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedNotifications) {
        setNotificationSettings(JSON.parse(savedNotifications));
      }
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateNotificationSetting = async (key: keyof NotificationSettings) => {
    const newSettings = {
      ...notificationSettings,
      [key]: !notificationSettings[key],
    };
    setNotificationSettings(newSettings);
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const handleThemeChange = async (value: string) => {
    setThemeMode(value);
    setThemeModalVisible(false);
    try {
      await AsyncStorage.setItem('themeMode', value);
    } catch (error) {
      console.error('Error saving theme setting:', error);
    }
  };

  const handleDeleteAccount = () => {
    // Implement account deletion logic here
    setDeleteAccountVisible(false);
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView  edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Theme"
          description={themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
          left={props => <List.Icon {...props} icon="brightness-6" />}
          onPress={() => setThemeModalVisible(true)}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Notifications</List.Subheader>
        {Object.entries(notificationSettings).map(([key, value]) => (
          <List.Item
            key={key}
            title={key.split(/(?=[A-Z])/).join(' ')}
            left={props => <List.Icon {...props} icon="bell-outline" />}
            right={() => (
              <Switch
                value={value}
                onValueChange={() => updateNotificationSetting(key as keyof NotificationSettings)}
                color={theme.colors.primary}
              />
            )}
          />
        ))}
      </List.Section>

      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Logout"
          left={props => <List.Icon {...props} icon="logout" color={theme.colors.primary} />}
          onPress={logout}
        />
        <List.Item
          title="Delete Account"
          left={props => <List.Icon {...props} icon="delete" color="#FF4444" />}
          onPress={() => setDeleteAccountVisible(true)}
          titleStyle={{ color: '#FF4444' }}
        />
      </List.Section>

      <Portal>
        <Dialog visible={deleteAccountVisible} onDismiss={() => setDeleteAccountVisible(false)}>
          <Dialog.Title>Delete Account</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete your account? This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteAccountVisible(false)}>Cancel</Button>
            <Button textColor="#FF4444" onPress={handleDeleteAccount}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={themeModalVisible} onDismiss={() => setThemeModalVisible(false)}>
          <Dialog.Title>Choose Theme</Dialog.Title>
          <Dialog.Content>
            <List.Item
              title="Light"
              left={props => (
                <List.Icon
                  {...props}
                  icon={themeMode === 'light' ? 'radiobox-marked' : 'radiobox-blank'}
                />
              )}
              onPress={() => handleThemeChange('light')}
            />
            <List.Item
              title="Dark"
              left={props => (
                <List.Icon
                  {...props}
                  icon={themeMode === 'dark' ? 'radiobox-marked' : 'radiobox-blank'}
                />
              )}
              onPress={() => handleThemeChange('dark')}
            />
            <List.Item
              title="System Default"
              left={props => (
                <List.Icon
                  {...props}
                  icon={themeMode === 'system' ? 'radiobox-marked' : 'radiobox-blank'}
                />
              )}
              onPress={() => handleThemeChange('system')}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setThemeModalVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
});

export default SettingsScreen;