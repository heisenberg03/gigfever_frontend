// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EventListingScreen from '../screens/EventListingScreen';
import ArtistListingScreen from '../screens/ArtistListingScreen';
import NotificationScreen from '../screens/NotificationScreen';
import AuthScreen from '../screens/AuthScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import ChatScreen from '../screens/ChatScreen';
import { useAuthStore } from '../stores/authStore';
import { useFetchNotifications } from '../stores/notificationStore';
import { useFetchCategories } from '../stores/categoryStore';
import OTPScreen from '../screens/OTPScreen';
import ArtistProfileScreen from '../screens/ArtistProfileScreen';
import CreateEditEventScreen from '../screens/CreateEditEventScreen';
import { User } from '../types';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { InvitesScreen } from '../screens/profile/InvitesScreen';
import { BookingsScreen } from '../screens/profile/BookingsScreen';
import { MyEventsSection } from '../screens/profile/MyEventsSection';
import { PortfolioScreen } from '../screens/profile/PortfolioScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  AuthStack: undefined;
  Auth: undefined;
  OTPScreen: { phoneNumber: string };
  Main: undefined;
  App: undefined;
  Home: undefined;
  ArtistProfile: { artistId: string };
  ArtistListing: undefined;
  Bookings: undefined;
  Profile: undefined;  Events: undefined;
  EditProfileScreen: { user: User };
  EditPortfolio: undefined;
  EventDetails: { eventId: string };
  ChatConversation: { chatId: number; userName: string, profile_picture: string };
  MyEventsScreen: undefined;
  BookingsScreen: undefined;
  PortfolioScreen: undefined;
  InvitesScreen: undefined;
  Notifications: undefined;
  ManageEventApplications: { eventId: number };
  LocationSelection: undefined;
  ApplyForEvent: { eventId: number };
  BookingInstructions: undefined;
  ManageCategories: undefined;
  Settings: undefined;
  SearchScreen: undefined;
  CreateEditEvent: undefined;
  EventMediaManager: { eventId: number };
  InviteArtist: { artistId: number };
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const MainTabs = () => (
  <ErrorBoundary>
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} /> }}
      />
      <Tab.Screen
        name="Events"
        component={EventListingScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="calendar" size={20} color={color} /> }}
      />
      <Tab.Screen
        name="ArtistListing"
        component={ArtistListingScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="mic" size={20} color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} /> }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="chatbubbles-outline" size={20} color={color} /> }}
      />
    </Tab.Navigator>
  </ErrorBoundary>

);

// Wrapper component to initialize stores after authentication
const MainApp = () => {
    useFetchNotifications();
    useFetchCategories()

  return (
    <ErrorBoundary>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Events" component={EventDetailsScreen} />
        <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
        <Stack.Screen name="CreateEditEvent" component={CreateEditEventScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} />
        <Stack.Screen name="ArtistListing" component={ArtistListingScreen} />
        <Stack.Screen name="PortfolioScreen" component={PortfolioScreen} />
        <Stack.Screen name="BookingsScreen" component={BookingsScreen} />
        <Stack.Screen name="InvitesScreen" component={InvitesScreen} />
        <Stack.Screen name="MyEventsScreen" component={MyEventsSection} />
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </ErrorBoundary>

  );
};

const AuthStack = () => (
  <ErrorBoundary>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
    </Stack.Navigator>
  </ErrorBoundary>

);


export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();
  return (
    <ErrorBoundary>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={MainApp} />
        ) : (
          <Stack.Screen name="AuthStack" component={AuthStack} />
        )}
      </Stack.Navigator>
    </ErrorBoundary>

  );
}