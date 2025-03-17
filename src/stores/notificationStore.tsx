import { create } from 'zustand';
import { gql, useQuery } from '@apollo/client';
import React from 'react';
export const GET_NOTIFICATIONS = gql`query { notifications { id message timestamp type relatedId } }`;

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  type: 'general' | 'chat';
  relatedId?: string; // e.g., eventId or chatId for navigation
}

interface NotificationState {
  generalUnreadCount: number;
  chatUnreadCount: number;
  notifications: Notification[];
  incrementGeneral: () => void;
  incrementChat: () => void;
  addNotification: (notification: Notification) => void;
  clearUnread: (type: 'general' | 'chat') => void;
}

export const useFetchNotifications = () => {
  const { data } = useQuery(GET_NOTIFICATIONS, { fetchPolicy: 'cache-first' });
  const addNotification = useNotificationStore((state) => state.addNotification);
  React.useEffect(() => {
    if (data) {
      data.notifications.forEach((n) => addNotification(n));
    }
  }, [data, addNotification]);
};


export const useNotificationStore = create<NotificationState>((set) => ({
  generalUnreadCount: 0,
  chatUnreadCount: 0,
  notifications: [],
  incrementGeneral: () => set((state) => ({ generalUnreadCount: state.generalUnreadCount + 1 })),
  incrementChat: () => set((state) => ({ chatUnreadCount: state.chatUnreadCount + 1 })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
      ...(notification.type === 'general' ? { generalUnreadCount: state.generalUnreadCount + 1 } : {}),
      ...(notification.type === 'chat' ? { chatUnreadCount: state.chatUnreadCount + 1 } : {}),
    })),
  clearUnread: (type) =>
    set((state) => ({
      ...(type === 'general' ? { generalUnreadCount: 0 } : {}),
      ...(type === 'chat' ? { chatUnreadCount: 0 } : {}),
    })),
}));