// src/services/websocketService.ts
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';

const WEBSOCKET_URL = 'ws://your-server-url'; // Replace with your WebSocket server URL

interface WebSocketService {
  socket: WebSocket | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
}

export const useWebSocket = (): WebSocketService => {
  const { currentUser } = useAuthStore();
  const socketRef = useRef<WebSocket | null>(null);

  const connect = () => {
    if (!currentUser) return;
    socketRef.current = new WebSocket(`${WEBSOCKET_URL}?userId=${currentUser.id}`);
    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
    };
    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  const sendMessage = (message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [currentUser]);

  return { socket: socketRef.current, connect, disconnect, sendMessage };
};