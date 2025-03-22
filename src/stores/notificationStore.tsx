import { create } from 'zustand';
import { GET_NOTIFICATIONS } from '../graphql/queries';
import { useAuthStore } from './authStore';
import React from 'react';
import { useQuery } from '@apollo/client';

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
  fetchNotifications: (notifications: Notification[]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  generalNotifications: [],
  messageNotifications: [],
  unreadGeneralCount: 0,
  unreadMessageCount: 0,

  setNotifications: (notifications) =>
    set(() => {
      const messageNotifs = notifications.filter((n) => n.type === 'MESSAGE');
      const generalNotifs = notifications.filter((n) => n.type !== 'MESSAGE');

      return {
        messageNotifications: messageNotifs,
        generalNotifications: generalNotifs,
        unreadMessageCount: messageNotifs.filter((n) => !n.read).length,
        unreadGeneralCount: generalNotifs.filter((n) => !n.read).length,
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
        unreadMessageCount: updatedMessageNotifs.filter((n) => !n.read).length,
        unreadGeneralCount: updatedGeneralNotifs.filter((n) => !n.read).length,
      };
    }),

  fetchNotifications: (notifications) => {
    set(() => {
      const messageNotifs = notifications.filter((n) => n.type === 'MESSAGE');
      const generalNotifs = notifications.filter((n) => n.type !== 'MESSAGE');

      return {
        messageNotifications: messageNotifs,
        generalNotifications: generalNotifs,
        unreadMessageCount: messageNotifs.filter((n) => !n.read).length,
        unreadGeneralCount: generalNotifs.filter((n) => !n.read).length,
      };
    });
  },
}));

export const useFetchNotifications = () => {
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const { currentUser: user } = useAuthStore();

  const { data, error } = useQuery(GET_NOTIFICATIONS, {
    variables: { userId: user?.id },
    skip: !user,
  });

  React.useEffect(() => {
    if (error) {
      console.log('Notification Fetch Error:', error.message);
      return;
    }

    if (data?.notifications) {
      fetchNotifications(data.notifications);
    }
  }, [data, error, fetchNotifications]);
};