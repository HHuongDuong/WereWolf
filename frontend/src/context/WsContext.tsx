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
 *   send({ type: "JOIN_ROOM", guestId: "guest_abc", displayName: "Alice", roomCode: "A3K9Z1" });
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
  | { type: "ROOM_UPDATED"; roomId: string; roomCode: string; players: Array<{ guestId: string; displayName: string }>; hostId: string; status: string }
  | { type: "ROOM_CANCELLED"; roomId: string }
  | { type: "ROLE_ASSIGNED"; role: string }
  | { type: "PHASE_CHANGED"; phase: "night" | "day"; round: number; deadlineTimestamp: number; metadata: { deadIds: string[]; eliminatedId: string | null } }
  | { type: "NIGHT_ACTION_ACK"; actionType: string; success: boolean; reason?: string }
  | { type: "SEER_RESULT"; targetId: string; role: string }
  | { type: "WITCH_INFO"; werewolfKillTargetId: string }
  | { type: "HUNTER_TRIGGER"; hunterId: string }
  | { type: "CHAT_MESSAGE"; senderName: string; channel: "wolves" | "all"; content: string; sentAt: string }
  | { type: "VOTE_STARTED"; round: number; durationSec: number; candidates: string[] }
  | { type: "VOTE_RESULT"; round: number; counts: Record<string, number>; eliminatedId: string | null; tied: boolean }
  | { type: "GAME_ENDED"; winner: "werewolf" | "villager"; roles: Record<string, string> }
  | { type: "PLAYER_DISCONNECTED"; guestId: string; reconnectDeadline: number }
  | { type: "PLAYER_RECONNECTED"; guestId: string }
  | { type: "ERROR"; code: string; message: string };
  // | { type: "PONG" }                    // no heartbeat in contract
  // | { type: "ROOM_JOINED" }             // replaced by ROOM_UPDATED
  // | { type: "ROOM_LEFT" }               // replaced by ROOM_UPDATED
  // | { type: "PLAYER_READY" }            // not in contract
  // | { type: "GAME_STARTED" }            // not in contract — implied by ROLE_ASSIGNED
  // | { type: "PLAYER_KICKED" }           // not in contract
  // | { type: "ROLE_DEALT" }              // renamed → ROLE_ASSIGNED
  // | { type: "NIGHT_STARTED" }           // replaced by PHASE_CHANGED (phase: "night")
  // | { type: "DAY_STARTED" }             // replaced by PHASE_CHANGED (phase: "day")
  // | { type: "VOTE_PHASE" }              // replaced by VOTE_STARTED
  // | { type: "GAME_OVER" }               // renamed → GAME_ENDED

export type ClientMsg =
  | { type: "CREATE_ROOM"; guestId: string; displayName: string; maxPlayers: number }
  | { type: "JOIN_ROOM"; guestId: string; displayName: string; roomCode: string }
  | { type: "CONFIGURE_ROOM"; roomId: string; guestId: string; maxPlayers: number; config: import("../index").RoomConfig }
  | { type: "LEAVE_ROOM"; roomId: string; guestId: string }
  | { type: "START_GAME"; roomId: string; guestId: string }
  | { type: "NIGHT_ACTION"; roomId: string; actionType: "guard" | "seer" | "werewolf_kill" | "witch"; targetId: string }
  | { type: "CHAT_MESSAGE"; roomId: string; channel: "wolves" | "all"; content: string }
  | { type: "VOTE"; roomId: string; round: number; targetId: string }
  | { type: "RECONNECT"; guestId: string; roomId: string };
  // | { type: "PING" }                    // no heartbeat in contract
  // | { type: "READY_TOGGLE" }            // not in contract
  // | { type: "KICK_PLAYER" }             // not in contract
  // | { type: "WOLF_TARGET" }             // replaced by NIGHT_ACTION (actionType: "werewolf_kill")
  // | { type: "SEER_INVESTIGATE" }        // replaced by NIGHT_ACTION (actionType: "seer")
  // | { type: "WITCH_SAVE" / "WITCH_POISON" } // replaced by NIGHT_ACTION (actionType: "witch")
  // | { type: "HUNTER_SHOOT" }            // replaced by NIGHT_ACTION (actionType: "guard")
  // | { type: "CAST_VOTE" }               // renamed → VOTE

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

const WS_URL = (import.meta as { env?: { VITE_GATEWAY_WS_URL?: string } }).env?.VITE_GATEWAY_WS_URL ?? "ws://localhost:3001";

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
        const { event, data } = JSON.parse(e.data) as { event: string; data: Record<string, unknown> };
        dispatch({ type: event, ...data } as ServerMsg);
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
      const { type, ...data } = msg;
      wsRef.current.send(JSON.stringify({ event: type, data }));
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
