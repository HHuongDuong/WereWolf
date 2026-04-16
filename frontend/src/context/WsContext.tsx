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
  | { type: "ROOM_UPDATED"; roomId: string; roomCode: string; hostId: string; status: "waiting" | "in_game" | "finished"; players: Array<{ guestId: string; displayName: string }>; maxPlayers: number; config: any }
  | { type: "ROOM_CANCELLED"; roomId: string }
  | { type: "role_assigned"; role: string }
  | { type: "phase_changed"; phase: "night" | "day"; round: number; deadlineTimestamp: number; metadata: { deadIds: string[]; eliminatedId: string | null } }
  | { type: "night_action_ack"; actionType: string; success: boolean; reason?: string }
  | { type: "seer_result"; targetId: string; role: string }
  | { type: "witch_info"; werewolfKillTargetId: string }
  | { type: "hunter_trigger"; hunterId: string }
  | { type: "chat_message"; senderName: string; channel: "wolves" | "all"; content: string; sentAt: string }
  | { type: "vote_started"; round: number; durationSec: number; candidates: string[] }
  | { type: "vote_result"; round: number; counts: Record<string, number>; eliminatedId: string | null; tied: boolean }
  | { type: "game_ended"; winner: "werewolf" | "villager"; roles: Record<string, string> }
  | { type: "player_disconnected"; guestId: string; reconnectDeadline: number }
  | { type: "player_reconnected"; guestId: string }
  | { type: "ERROR"; code: string; message: string };

export type ClientMsg =
  | { type: "CREATE_ROOM"; guestId: string; displayName: string }
  | { type: "JOIN_ROOM"; guestId: string; displayName: string; roomCode: string }
  | { type: "CONFIGURE_ROOM"; guestId: string; maxPlayers?: number; config?: any }
  | { type: "LEAVE_ROOM"; roomId: string; guestId: string }
  | { type: "CANCEL_ROOM"; guestId: string }
  | { type: "START_GAME"; guestId: string }
  | { type: "night_action"; actionType: "guard" | "seer" | "werewolf_kill" | "witch"; targetId: string }
  | { type: "chat_message"; channel: "wolves" | "all"; content: string }
  | { type: "vote"; round: number; targetId: string }
  | { type: "reconnect"; guestId: string; roomId: string };
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

const WS_URL = import.meta.env?.VITE_GATEWAY_WS_URL ?? "ws://localhost:3001";

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
