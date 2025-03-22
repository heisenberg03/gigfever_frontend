// src/screens/HomeScreen.tsx
import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Appbar, Card, FAB } from 'react-native-paper';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const HEADER_HEIGHT = 56;

const HomeScreen = ({navigation}: any) => {
  const { currentUser:user } = useAuthStore();
  const { unreadGeneralCount } = useNotificationStore();
  const isArtist = user?.isArtist;
  const scrollY = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(scrollY.value > 50 ? -HEADER_HEIGHT : 0) }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[headerStyle, styles.header]}>
        <Appbar.Header style={{ backgroundColor: '#6B48FF', height: HEADER_HEIGHT }}>
          <Appbar.Content title="Dashboard" titleStyle={{ color: '#fff' }} />
          <Appbar.Action icon="magnify" color="#fff" onPress={() => navigation.navigate('Search')} />
          <Appbar.Action icon="map-marker" color="#fff" onPress={() => console.log('Location TBD')} />
          <View style={{ position: 'relative' }}>
            <Appbar.Action
              icon="bell"
              color="#fff"
              onPress={() => navigation.navigate('Notifications')}
            />
            {unreadGeneralCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: 'red',
                  borderRadius: 8,
                  width: 16,
                  height: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                  {unreadGeneralCount}
                </Text>
              </View>
            )}
          </View>
        </Appbar.Header>
      </Animated.View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onScroll={(e) => (scrollY.value = e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Events')}
          >
            <Text style={styles.buttonText}>My Events</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Invites')}
          >
            <Text style={styles.buttonText}>My Invites</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {!isArtist && (
        <FAB
          style={styles.fab}
          icon="plus"
          color="#fff"
          onPress={() => navigation.navigate('CreateEvent')}
          label="Create Event"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  scroll: { flex: 1, zIndex: 1 },
  content: { paddingTop: HEADER_HEIGHT + 8, paddingBottom: 20, paddingHorizontal: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  button: { padding: 12, backgroundColor: '#6B48FF', borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  buttonText: { color: '#fff', fontSize: 16 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#6B48FF' },
});

export default HomeScreen;