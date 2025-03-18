// src/stores/notificationStore.ts
import { create } from 'zustand';
import { useQuery } from '@apollo/client';
import { GET_NOTIFICATIONS } from '../graphql/queries';
import { useAuthStore } from './authStore';
import React from 'react';

// Define the store interface
interface NotificationState {
  notifications: Array<{
    id: string;
    message: string;
    timestamp: string;
    type: string;
    relatedId: string;
    read: boolean;
  }>;
  unreadCount: number;
  setNotifications: (notifications: NotificationState['notifications']) => void;
  markAsRead: (notificationId: string) => void;
  fetchNotifications: () => void;
}

// Create the store
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set((state) => {
      const unread = notifications.filter((n) => !n.read).length;
      return { notifications, unreadCount: unread };
    }),
  markAsRead: (notificationId) =>
    set((state) => {
      const updatedNotifications = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      const unread = updatedNotifications.filter((n) => !n.read).length;
      return { notifications: updatedNotifications, unreadCount: unread };
    }),
  fetchNotifications: () => {
    const { user } = useAuthStore();
    if (!user) return; // Skip if no user is authenticated

    const { data, error } = useQuery(GET_NOTIFICATIONS, {
      variables: { userId: user.id },
      skip: !user, // Only fetch if user is authenticated
    });

    if (error) {
      console.log('Notification Fetch Error:', error.message);
      return;
    }

    if (data?.notifications) {
      get().setNotifications(data.notifications.map((n) => ({ ...n, read: false }))); // Initialize as unread
    }
  },
}));

// Custom hook to fetch notifications (used in AppNavigator)
export const useFetchNotifications = () => {
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
};