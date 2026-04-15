import { type Server, type ServerWebSocket, serve } from "bun";
import index from "./index.html";

// ── WS message protocol ────────────────────────────────────────────────────────

export type WsData = {
  roomId: string | null;
  guestId: string | null;
};

/** Room config payload (used in CONFIGURE_ROOM and room.started Kafka event) */
export type RoomConfig = {
  guardDuration: number;
  seerDuration: number;
  werewolfDuration: number;
  witchDuration: number;
  discussDuration: number;
  voteDuration: number;
};

/** Messages sent from the browser → server (snake_case doc names → UPPER_SNAKE here) */
export type ClientMsg =
  // | { type: "PING" }                                    // no heartbeat in contract
  | { type: "CREATE_ROOM"; guestId: string; displayName: string }
  | { type: "JOIN_ROOM"; guestId: string; displayName: string; roomCode: string }
  | { type: "CONFIGURE_ROOM"; roomId: string; guestId: string; maxPlayers: number; config: RoomConfig }
  | { type: "LEAVE_ROOM"; roomId: string; guestId: string }
  | { type: "START_GAME"; roomId: string; guestId: string }
  | { type: "NIGHT_ACTION"; roomId: string; actionType: "guard" | "seer" | "werewolf_kill" | "witch"; targetId: string }
  | { type: "CHAT_MESSAGE"; roomId: string; channel: "wolves" | "all"; content: string }
  | { type: "VOTE"; roomId: string; round: number; targetId: string }
  | { type: "RECONNECT"; guestId: string; roomId: string };
  // | { type: "READY_TOGGLE" }                            // not in contract
  // | { type: "KICK_PLAYER"; playerId: string }           // not in contract

/** Messages sent from server → browser */
export type ServerMsg =
  // | { type: "PONG" }                                    // no heartbeat in contract
  | { type: "ROOM_UPDATED"; players: Array<{ guestId: string; displayName: string }>; hostId: string; status: string }
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
  // | { type: "ROOM_JOINED"; roomId: string }             // replaced by ROOM_UPDATED
  // | { type: "ROOM_LEFT" }                               // replaced by ROOM_UPDATED
  // | { type: "PLAYER_READY"; playerId: string; isReady: boolean }  // not in contract
  // | { type: "GAME_STARTED" }                            // not in contract — game start implied by ROLE_ASSIGNED
  // | { type: "PLAYER_KICKED"; playerId: string }         // not in contract

// ── Room registry ──────────────────────────────────────────────────────────────

/** roomId → connected WebSocket clients */
const rooms = new Map<string, Set<ServerWebSocket<WsData>>>();

function send(ws: ServerWebSocket<WsData>, msg: ServerMsg) {
  ws.send(JSON.stringify(msg));
}

function broadcast(
  roomId: string,
  msg: ServerMsg,
  exclude?: ServerWebSocket<WsData>,
) {
  const members = rooms.get(roomId);
  if (!members) return;
  const payload = JSON.stringify(msg);
  for (const ws of members) {
    if (ws !== exclude) ws.send(payload);
  }
}

// ── Server ────────────────────────────────────────────────────────────────────

// `let` + definite-assignment so the /ws route handler can close over `server`
let server!: Server<WsData>;

server = serve<WsData>({
  routes: {
    // Static assets
    "/": index,
    "/*": index,

    "/img/*": async (req: Request) => {
      const url = new URL(req.url);
      const file = Bun.file(`./public${url.pathname}`);
      if (await file.exists()) return new Response(file);
      return new Response("Not found", { status: 404 });
    },

    // REST stub
    "/api/hello": {
      GET() {
        return Response.json({ message: "Hello, world!" });
      },
    },

    // WebSocket upgrade endpoint
    "/ws": (req: Request) => {
      const upgraded = server.upgrade(req, {
        data: { roomId: null, guestId: null },
      });
      if (upgraded) return; // Bun takes over; no Response needed
      return new Response("WebSocket upgrade failed", { status: 500 });
    },
  },

  websocket: {
    open(ws) {
      console.log("[WS] client connected");
    },

    message(ws, raw) {
      let msg: ClientMsg;
      try {
        msg = JSON.parse(
          typeof raw === "string" ? raw : raw.toString(),
        ) as ClientMsg;
      } catch {
        send(ws, { type: "ERROR", code: "INVALID_JSON", message: "Invalid JSON" });
        return;
      }

      switch (msg.type) {
        // ── Room lifecycle ─────────────────────────────────────────────────────
        case "CREATE_ROOM": {
          // TODO: call room_service POST /rooms, then broadcast ROOM_UPDATED
          console.log(`[WS] ${msg.guestId} wants to create room`);
          break;
        }

        case "JOIN_ROOM": {
          if (ws.data.roomId) {
            rooms.get(ws.data.roomId)?.delete(ws);
            ws.unsubscribe(`room:${ws.data.roomId}`);
          }
          ws.data.guestId = msg.guestId;
          // TODO: resolve roomId from roomCode via room_service
          // ws.data.roomId = resolvedRoomId;
          console.log(`[WS] ${msg.guestId} joining room ${msg.roomCode}`);
          break;
        }

        case "CONFIGURE_ROOM": {
          // TODO: call room_service PATCH /rooms/:id, then broadcast ROOM_UPDATED
          console.log(`[WS] ${msg.guestId} configuring room ${msg.roomId}`);
          break;
        }

        case "LEAVE_ROOM": {
          if (!ws.data.roomId) break;
          rooms.get(ws.data.roomId)?.delete(ws);
          ws.unsubscribe(`room:${ws.data.roomId}`);
          ws.data.roomId = null;
          // TODO: broadcast ROOM_UPDATED to remaining members
          break;
        }

        case "START_GAME": {
          if (!ws.data.roomId) break;
          // TODO: call room_service POST /rooms/:id/start → emits room.started Kafka event
          console.log(`[WS] ${msg.guestId} starting game in room ${ws.data.roomId}`);
          break;
        }

        // ── In-game actions ────────────────────────────────────────────────────
        case "NIGHT_ACTION": {
          // TODO: forward to gameplay_service; reply with NIGHT_ACTION_ACK
          console.log(`[WS] night action ${msg.actionType} → ${msg.targetId}`);
          break;
        }

        case "CHAT_MESSAGE": {
          if (!ws.data.roomId || !ws.data.guestId) {
            send(ws, { type: "ERROR", code: "NOT_IN_ROOM", message: "Not in a room" });
            break;
          }
          if (!msg.content.trim()) break;
          // TODO: validate channel access via chat_service
          broadcast(ws.data.roomId, {
            type: "CHAT_MESSAGE",
            senderName: ws.data.guestId,
            channel: msg.channel,
            content: msg.content.trim(),
            sentAt: new Date().toISOString(),
          });
          break;
        }

        case "VOTE": {
          // TODO: forward to vote_service
          console.log(`[WS] vote from ${ws.data.guestId} → ${msg.targetId} (round ${msg.round})`);
          break;
        }

        case "RECONNECT": {
          // TODO: restore session from room_service, re-subscribe to room topic
          console.log(`[WS] reconnect: ${msg.guestId} → room ${msg.roomId}`);
          break;
        }

        // | "READY_TOGGLE" — not in contract
        // | "KICK_PLAYER"  — not in contract
      }
    },

    close(ws) {
      if (ws.data.roomId) {
        rooms.get(ws.data.roomId)?.delete(ws);
        ws.unsubscribe(`room:${ws.data.roomId}`);
        console.log(`[WS] ${ws.data.guestId ?? "?"} left room ${ws.data.roomId}`);
        // TODO: broadcast PLAYER_DISCONNECTED with reconnectDeadline = Date.now() + 60_000
      } else {
        console.log("[WS] client disconnected");
      }
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
