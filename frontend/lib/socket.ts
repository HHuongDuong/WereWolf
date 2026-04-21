class SocketManager {
  private socket: WebSocket | null = null;
  private url: string;
  private handlers = new Map<string, Function[]>();
  private isConnecting = false;
  private shouldReconnect = true;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second
  private sessionData: { guestId?: string; roomId?: string } = {};

  constructor() {
    this.url = process.env.NEXT_PUBLIC_GATEWAY_WS_URL || "ws://localhost:3001";
  }

  // Store session data for reconnection
  setSessionData(guestId: string, roomId: string) {
    this.sessionData = { guestId, roomId };
  }

  clearSessionData() {
    this.sessionData = {};
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) return;
    
    this.isConnecting = true;
    this.shouldReconnect = true;
    
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("[WS] Connected");
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      
      // If we have session data, attempt to reconnect to room
      if (this.sessionData.guestId && this.sessionData.roomId) {
        console.log("[WS] Attempting to reconnect to room:", this.sessionData);
        this.emit('RECONNECT', this.sessionData);
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const { event: eventName, data } = JSON.parse(event.data);
        console.log(`[WS] Received: ${eventName}`, data);
        
        const eventHandlers = this.handlers.get(eventName) || [];
        eventHandlers.forEach((cb) => cb(data));
      } catch (err) {
        console.error("[WS] Message parse error:", err);
      }
    };

    this.socket.onclose = () => {
      console.log("[WS] Disconnected");
      this.isConnecting = false;
      this.socket = null;
      
      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => this.connect(), delay);
      } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("[WS] Max reconnect attempts reached");
        this.clearSessionData();
      }
    };

    this.socket.onerror = (err) => {
      console.error("[WS] Error:", err);
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    this.clearSessionData();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  emit(event: string, data: any = {}) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log(`[WS] Emit: ${event}`, data);
      this.socket.send(JSON.stringify({ event, data }));
    } else {
      console.warn(`[WS] Cannot emit ${event}, socket is not open`);
    }
  }

  on(event: string, callback: Function) {
    const existing = this.handlers.get(event) || [];
    this.handlers.set(event, [...existing, callback]);
  }

  off(event: string, callback: Function) {
    const existing = this.handlers.get(event);
    if (existing) {
      this.handlers.set(event, existing.filter((cb) => cb !== callback));
    }
  }
}

export const socketManger = new SocketManager();
