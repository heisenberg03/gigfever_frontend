// src/stores/notificationStore.ts
import { create } from 'zustand';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { GET_NOTIFICATIONS } from '../graphql/queries';
import { useAuthStore } from './authStore';

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
  addMessageNotification: (message: any) => void;
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

  addMessageNotification: (message) =>
    set((state) => {
      const newNotification = {
        id: message.id,
        message: message.content,
        timestamp: message.timestamp,
        type: 'MESSAGE',
        relatedId: message.senderId,
        read: false,
      };
      return {
        messageNotifications: [...state.messageNotifications, newNotification],
        unreadMessageCount: state.unreadMessageCount + 1,
      };
    }),
}));

export const useFetchNotifications = () => {
  const fetchNotifications = useNotificationStore((state) => state.setNotifications);
  const { currentUser } = useAuthStore();

  const { data, error } = useQuery(GET_NOTIFICATIONS, {
    variables: { userId: currentUser?.id },
    skip: !currentUser,
  });

  useEffect(() => {
    if (error) {
      console.log('Notification Fetch Error:', error.message);
      return;
    }
    console.log('Notification Data:', data);
    if (data?.notifications) {
      fetchNotifications(data.notifications);
    }
  }, [data, error, fetchNotifications]);
};