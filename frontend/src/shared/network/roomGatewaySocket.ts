import { GatewayIncomingEvent } from "@/shared/types/gateway-room";

type IncomingHandler = (event: GatewayIncomingEvent) => void;

interface OutgoingMessage {
  event: string;
  data: Record<string, unknown>;
}

export class RoomGatewaySocket {
  private socket: WebSocket | null = null;
  private readonly handlers = new Set<IncomingHandler>();
  private readonly queue: OutgoingMessage[] = [];

  constructor(private readonly url: string) {}

  connect() {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      return;
    }

    this.socket = new WebSocket(this.url);

    this.socket.addEventListener("open", () => {
      while (this.queue.length > 0) {
        const message = this.queue.shift();
        if (message) this.sendRaw(message);
      }
    });

    this.socket.addEventListener("message", (event) => {
      try {
        const parsed = JSON.parse(String(event.data)) as GatewayIncomingEvent;
        if (!parsed?.event) return;
        this.handlers.forEach((handler) => handler(parsed));
      } catch {
        // Ignore non-JSON events from gateway.
      }
    });
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.close();
    this.socket = null;
  }

  onEvent(handler: IncomingHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  send(event: string, data: Record<string, unknown>) {
    const message = { event, data };
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.queue.push(message);
      return;
    }

    this.sendRaw(message);
  }

  private sendRaw(message: OutgoingMessage) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(message));
  }
}

let singleton: RoomGatewaySocket | null = null;

export function getRoomGatewaySocket() {
  if (!singleton) {
    const url = process.env.NEXT_PUBLIC_GATEWAY_WS_URL || "ws://localhost:3001";
    singleton = new RoomGatewaySocket(url);
  }
  return singleton;
}
