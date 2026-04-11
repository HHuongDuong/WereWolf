/**
 * WsContext — manages a single WebSocket connection to the Bun server.
 *
 * Usage:
 *   const { status, send, on } = useWs();
 *
 *   // Subscribe to a server event (returns an unsubscribe fn)
 *   useEffect(() => on("CHAT_MESSAGE", (msg) => console.log(msg)), [on]);
 *
 *   // Send a client message
 *   send({ type: "JOIN_ROOM", roomId: "abc", userId: "me" });
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

// ── Message types (mirror src/index.ts) ────────────────────────────────────────

export type WsStatus = "connecting" | "connected" | "disconnected";

export type ServerMsg =
  | { type: "PONG" }
  | { type: "ROOM_JOINED"; roomId: string }
  | { type: "ROOM_LEFT" }
  | { type: "PLAYER_READY"; playerId: string; isReady: boolean }
  | { type: "CHAT_MESSAGE"; userId: string; text: string; time: string }
  | { type: "GAME_STARTED" }
  | { type: "PLAYER_KICKED"; playerId: string }
  | { type: "ERROR"; message: string }
  // ── In-game events ──────────────────────────────────────────────────────────
  | { type: "ROLE_DEALT"; role: string; players: Array<{ id: string; username: string; isAlive: boolean }> }
  | { type: "NIGHT_STARTED"; round: number }
  | { type: "DAY_STARTED"; round: number }
  | { type: "VOTE_PHASE" }
  | { type: "VOTE_RESULT"; eliminatedId: string; eliminatedRole: string }
  | { type: "SEER_RESULT"; targetId: string; result: "wolf" | "villager" }
  | { type: "GAME_OVER"; winner: "wolves" | "villagers"; roles: Record<string, string> };

export type ClientMsg =
  | { type: "PING" }
  | { type: "JOIN_ROOM"; roomId: string; userId: string }
  | { type: "LEAVE_ROOM" }
  | { type: "READY_TOGGLE" }
  | { type: "CHAT"; text: string }
  | { type: "KICK_PLAYER"; playerId: string }
  | { type: "START_GAME" }
  // ── In-game actions ─────────────────────────────────────────────────────────
  | { type: "WOLF_TARGET"; targetId: string }
  | { type: "SEER_INVESTIGATE"; targetId: string }
  | { type: "WITCH_SAVE"; targetId: string }
  | { type: "WITCH_POISON"; targetId: string }
  | { type: "HUNTER_SHOOT"; targetId: string }
  | { type: "CAST_VOTE"; targetId: string };

// ── Internal subscriber map ────────────────────────────────────────────────────

type MsgHandler<T extends ServerMsg = ServerMsg> = (msg: T) => void;
// biome-ignore lint: safe any for indexed subscriber map
type SubscriberMap = { [K in ServerMsg["type"]]?: MsgHandler<any>[] };

// ── Context interface ──────────────────────────────────────────────────────────

interface WsContextValue {
  /** Current connection state */
  status: WsStatus;
  /** Send a typed message to the server */
  send: (msg: ClientMsg) => void;
  /**
   * Subscribe to a server message type.
   * Returns an unsubscribe function — call it in a `useEffect` cleanup.
   */
  on: <T extends ServerMsg["type"]>(
    type: T,
    handler: MsgHandler<Extract<ServerMsg, { type: T }>>,
  ) => () => void;
}

// ── Provider ──────────────────────────────────────────────────────────────────

const WsContext = createContext<WsContextValue | null>(null);

const WS_URL =
  typeof window !== "undefined"
    ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`
    : "";

const RECONNECT_DELAY_MS = 3_000;

export function WsProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<WsStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const subsRef = useRef<SubscriberMap>({});
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dispatch an inbound server message to all subscribers for that type
  const dispatch = useCallback((msg: ServerMsg) => {
    const handlers = subsRef.current[msg.type];
    if (handlers) {
      for (const h of handlers) h(msg);
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };

    ws.onmessage = (e: MessageEvent<string>) => {
      try {
        dispatch(JSON.parse(e.data) as ServerMsg);
      } catch {
        console.error("[WS] failed to parse:", e.data);
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      reconnectRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    ws.onerror = () => {
      ws.close(); // triggers onclose → reconnect
    };
  }, [dispatch]);

  useEffect(() => {
    connect();
    return () => {
      reconnectRef.current && clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((msg: ClientMsg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      console.warn("[WS] dropped (not connected):", msg.type);
    }
  }, []);

  const on = useCallback(
    <T extends ServerMsg["type"]>(
      type: T,
      handler: MsgHandler<Extract<ServerMsg, { type: T }>>,
    ) => {
      const subs = subsRef.current;
      if (!subs[type]) subs[type] = [];
      // biome-ignore lint: safe cast
      (subs[type] as MsgHandler<any>[]).push(handler);
      return () => {
        // biome-ignore lint: safe cast
        subs[type] = (subs[type] as MsgHandler<any>[]).filter(
          (h) => h !== handler,
        ) as MsgHandler<any>[];
      };
    },
    [],
  );

  return (
    <WsContext.Provider value={{ status, send, on }}>
      {children}
    </WsContext.Provider>
  );
}

export function useWs() {
  const ctx = useContext(WsContext);
  if (!ctx) throw new Error("useWs must be used inside <WsProvider>");
  return ctx;
}
