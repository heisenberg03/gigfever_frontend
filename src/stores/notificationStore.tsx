import { create } from 'zustand';
import { useQuery } from '@apollo/client';
import { GET_NOTIFICATIONS } from '../graphql/queries';
import { useAuthStore } from './authStore';
import React from 'react';

type Notification = {
  id: string;
  message: string;
  timestamp: string;
  type: string;
  relatedId: string;
  read: boolean;
};

interface NotificationState {
  generalNotifications: Notification[];
  messageNotifications: Notification[];
  unreadGeneralCount: number;
  unreadMessageCount: number;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (notificationId: string) => void;
  fetchNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  generalNotifications: [],
  messageNotifications: [],
  unreadGeneralCount: 0,
  unreadMessageCount: 0,

  setNotifications: (notifications) =>
    set(() => {
      const messageNotifs = notifications.filter(n => n.type === 'MESSAGE');
      const generalNotifs = notifications.filter(n => n.type !== 'MESSAGE');
      
      return {
        messageNotifications: messageNotifs,
        generalNotifications: generalNotifs,
        unreadMessageCount: messageNotifs.filter(n => !n.read).length,
        unreadGeneralCount: generalNotifs.filter(n => !n.read).length,
      };
    }),

  markAsRead: (notificationId) =>
    set((state) => {
      const updatedMessageNotifs = state.messageNotifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      const updatedGeneralNotifs = state.generalNotifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );

      return {
        messageNotifications: updatedMessageNotifs,
        generalNotifications: updatedGeneralNotifs,
        unreadMessageCount: updatedMessageNotifs.filter(n => !n.read).length,
        unreadGeneralCount: updatedGeneralNotifs.filter(n => !n.read).length,
      };
    }),

  fetchNotifications: () => {
    const { currentUser:user } = useAuthStore();
    if (!user) return;

    const { data, error } = useQuery(GET_NOTIFICATIONS, {
      variables: { userId: user.id },
      skip: !user,
    });

    if (error) {
      console.log('Notification Fetch Error:', error.message);
      return;
    }

    if (data?.notifications) {
      get().setNotifications(data.notifications.map((n) => ({ ...n, read: false })));
    }
  },
}));

export const useFetchNotifications = () => {
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
};