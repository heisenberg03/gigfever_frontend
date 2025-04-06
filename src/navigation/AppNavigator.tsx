// src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useAuthStore } from '../stores/authStore';
import { useFetchNotifications } from '../stores/notificationStore';
import { SubCategory, useFetchCategories } from '../stores/categoryStore';

// Screen imports
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EventListingScreen from '../screens/EventListingScreen';
import ArtistListingScreen from '../screens/ArtistListingScreen';
import NotificationScreen from '../screens/NotificationScreen';
import AuthScreen from '../screens/AuthScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import OTPScreen from '../screens/OTPScreen';
import ArtistProfileScreen from '../screens/ArtistProfileScreen';
import CreateEditEventScreen from '../screens/CreateEditEventScreen';
import { InvitesScreen } from '../screens/profile/InvitesScreen';
import { BookingsScreen } from '../screens/profile/BookingsScreen';
import { MyEventsScreen } from '../screens/profile/MyEventsScreen';
import { PortfolioScreen } from '../screens/profile/PortfolioScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FavoriteEventsScreen from '../screens/FavoriteEventsScreen';
import FavoriteArtistsScreen from '../screens/FavoriteArtistsScreen';
import ChatListScreen from '../screens/ChatListScreen';
import { User } from '../types';
import ChatScreen from '../screens/ChatScreen';
import CategoryDetailsScreen from '../screens/CategoryDetailsScreen';

// Navigation Types
export type RootStackParamList = {
  AuthStack: undefined;
  Auth: undefined;
  OTPScreen: { phoneNumber: string };
  Main: undefined;
  App: undefined;
  Home: undefined;
  ArtistProfile: { artistId: string };
  Artists: undefined;
  Bookings: undefined;
  Profile: undefined;
  Events: undefined;
  EditProfileScreen: { user: User };
  EditPortfolio: undefined;
  EventDetails: { eventId: string; eventData?: any };
  Chats: undefined;
  ChatScreen: {userId: string,  chatId: string; userName: string; profilePicture: string };
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
  EditEvent: { eventId: string };
  EventMediaManager: { eventId: number };
  InviteArtist: { artistId: number };
  FavoriteEvents: undefined;
  FavoriteArtists: undefined;
  CategoryDetails: {
    categoryId: string;
    categoryName: string;
    subCategories: Array<{
      id: string;
      name: string;
      image: string;
    }>;
  };
  SubCategoryDetails: {
    subCategoryId: string;
    subCategoryName: string;
  };
};

// Navigation Instances
const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Common Screen Options
const commonScreenOptions = {
  headerShown: false,
};



// Tab Navigation Configuration
const tabScreenOptions = {
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.outline,
  tabBarStyle: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.outline,
  },
};

const MainTabs = () => (
  <ErrorBoundary>
    <Tab.Navigator screenOptions={commonScreenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventListingScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Artists"
        component={ArtistListingScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="mic" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  </ErrorBoundary>
);

// Main App Stack
const MainApp = () => {
  useFetchNotifications();
  useFetchCategories();

  return (
    <ErrorBoundary>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="Events" component={EventDetailsScreen} />
        <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
        <Stack.Screen name="CreateEditEvent" component={CreateEditEventScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} />
        <Stack.Screen name="Artists" component={ArtistListingScreen} />
        <Stack.Screen name="PortfolioScreen" component={PortfolioScreen} />
        <Stack.Screen name="BookingsScreen" component={BookingsScreen} />
        <Stack.Screen name="InvitesScreen" component={InvitesScreen} />
        <Stack.Screen name="MyEventsScreen" component={MyEventsScreen} />
        <Stack.Screen name="EditProfileScreen"component={EditProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="FavoriteEvents" component={FavoriteEventsScreen} />
        <Stack.Screen name="CategoryDetails" component={CategoryDetailsScreen} />
        <Stack.Screen name="FavoriteArtists" component={FavoriteArtistsScreen} />
      </Stack.Navigator>
    </ErrorBoundary>
  );
};

// Auth Stack
const AuthStack = () => (
  <ErrorBoundary>
    <Stack.Navigator screenOptions={commonScreenOptions}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
    </Stack.Navigator>
  </ErrorBoundary>
);

// Root Navigator
export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();
  useFetchCategories();
  useFetchNotifications();

  return (
    <ErrorBoundary>
      <Stack.Navigator screenOptions={commonScreenOptions}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={MainApp} />
        ) : (
          <Stack.Screen name="AuthStack" component={AuthStack} />
        )}
      </Stack.Navigator>
    </ErrorBoundary>
  );
}