class SocketManager {
  private socket: WebSocket | null = null;
  private url: string;
  private handlers = new Map<string, Function[]>();
  private isConnecting = false;
  private shouldReconnect = true;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_GATEWAY_WS_URL || "ws://localhost:3001";
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) return;
    
    this.isConnecting = true;
    this.shouldReconnect = true;
    
    // In production, we might want to attach roomId/guestId in URL query params if required
    // But currently backend seems to expect connection first, then handles state.
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("[WS] Connected");
      this.isConnecting = false;
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
      if (this.shouldReconnect) {
        setTimeout(() => this.connect(), 3000);
      }
    };

    this.socket.onerror = (err) => {
      console.error("[WS] Error:", err);
    };
  }

  disconnect() {
    this.shouldReconnect = false;
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
