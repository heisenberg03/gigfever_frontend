class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000; // Start with 1 second
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private listeners: { [key: string]: ((data: any) => void)[] } = {};

  constructor() {
    this.connect();
  }

  // Connect to WebSocket
  public connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    // Replace with your actual WebSocket URL (same as GraphQL server)
    this.ws = new WebSocket('ws://localhost:4000/graphql');

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0; // Reset attempts on successful connection
      this.startHeartbeat(); // Start heartbeat to keep connection alive
      this.emit('connection', { status: 'connected' });
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.stopHeartbeat();
      this.emit('connection', { status: 'disconnected' });
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.ws?.close(); // Force close to trigger reconnect
    };
  }

  // Reconnection logic
  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached. Giving up.');
      return;
    }

    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts); // Exponential backoff
    console.log(`Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts + 1})`);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  // Heartbeat to keep connection alive and detect issues
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Handle incoming messages
  private handleMessage(data: any) {
    const { type, ...payload } = data;
    switch (type) {
      case 'newInvite':
      case 'chatMessage':
      case 'newBooking':
      case 'newApplication':
        this.emit(type, payload.data);
        break;
      case 'pong':
        console.log('Heartbeat pong received');
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  }

  // Event listener system
  public on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public off(event: string, callback: (data: any) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners[event];
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }

  // Send message (e.g., for chat)
  public send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected. Queuing message not implemented.');
      // Optional: Add message queuing for offline scenarios
    }
  }

  // Cleanup (e.g., on logout)
  public disconnect() {
    this.stopHeartbeat();
    this.ws?.close(1000, 'User logged out');
    this.ws = null;
    this.reconnectAttempts = 0;
  }

  // Check connection status
  public isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();