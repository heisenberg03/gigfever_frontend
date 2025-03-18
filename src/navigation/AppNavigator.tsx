// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EventListingScreen from '../screens/EventListingScreen';
import ArtistListingScreen from '../screens/ArtistListingScreen';
import NotificationScreen from '../screens/NotificationScreen';
import AuthScreen from '../screens/AuthScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useSubCategoryStore } from '../stores/subCategoryStore';
import { gql, useQuery } from '@apollo/client';
import { GET_NOTIFICATIONS } from '../graphql/queries';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => (
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
      name="Artists"
      component={ArtistListingScreen}
      options={{ tabBarIcon: ({ color }) => <Ionicons name="mic" size={20} color={color} /> }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} /> }}
    />
    <Tab.Screen
      name="Notifications"
      component={NotificationScreen}
      options={{ tabBarIcon: ({ color }) => <Ionicons name="notifications" size={20} color={color} /> }}
    />
  </Tab.Navigator>
);

// Wrapper component to initialize stores after authentication
const MainApp = () => {
  const { user } = useAuthStore();
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const setCategories = useCategoryStore((state) => state.setCategories);
  const setSubCategories = useSubCategoryStore((state) => state.setSubCategories);

  // Fetch notifications (user-specific)
  const { data: notificationsData, error: notificationsError } = useQuery(GET_NOTIFICATIONS, {
    variables: { userId: user?.id }, // Pass user ID to query
    skip: !user, // Skip if user is not authenticated
  });

  useEffect(() => {
    if (notificationsData?.notifications) {
      setNotifications(notificationsData.notifications);
    }
    if (notificationsError) {
      console.log('Notifications Error:', notificationsError);
    }
  }, [notificationsData, notificationsError, setNotifications]);

  // Fetch categories and subcategories (global, no user dependency)
  const { data: categoriesData } = useQuery(gql`query { categories { id name } }`, { skip: !user });
  const { data: subCategoriesData } = useQuery(gql`query { subCategories { id name } }`, { skip: !user });

  useEffect(() => {
    if (categoriesData?.categories) {
      setCategories(categoriesData.categories);
    }
    if (subCategoriesData?.subCategories) {
      setSubCategories(subCategoriesData.subCategories);
    }
  }, [categoriesData, subCategoriesData, setCategories, setSubCategories]);

  return (
    <>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </>
  );
};

export default function AppNavigator() {
  const { user } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? <Stack.Screen name="MainApp" component={MainApp} /> : <Stack.Screen name="Auth" component={AuthScreen} />}
    </Stack.Navigator>
  );
}