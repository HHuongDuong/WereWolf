import { type Server, type ServerWebSocket, serve } from "bun";
import index from "./index.html";

// ── WS message protocol ────────────────────────────────────────────────────────

export type WsData = {
  roomId: string | null;
  userId: string | null;
};

/** Messages sent from the browser → server */
export type ClientMsg =
  | { type: "PING" }
  | { type: "JOIN_ROOM"; roomId: string; userId: string }
  | { type: "LEAVE_ROOM" }
  | { type: "READY_TOGGLE" }
  | { type: "CHAT"; text: string }
  | { type: "KICK_PLAYER"; playerId: string }
  | { type: "START_GAME" };

/** Messages sent from server → browser */
export type ServerMsg =
  | { type: "PONG" }
  | { type: "ROOM_JOINED"; roomId: string }
  | { type: "ROOM_LEFT" }
  | { type: "PLAYER_READY"; playerId: string; isReady: boolean }
  | { type: "CHAT_MESSAGE"; userId: string; text: string; time: string }
  | { type: "GAME_STARTED" }
  | { type: "PLAYER_KICKED"; playerId: string }
  | { type: "ERROR"; message: string };

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
        data: { roomId: null, userId: null },
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
        send(ws, { type: "ERROR", message: "Invalid JSON" });
        return;
      }

      switch (msg.type) {
        // ── Heartbeat ──────────────────────────────────────────────────────────
        case "PING":
          send(ws, { type: "PONG" });
          break;

        // ── Room lifecycle ─────────────────────────────────────────────────────
        case "JOIN_ROOM": {
          // Leave any existing room first
          if (ws.data.roomId) {
            rooms.get(ws.data.roomId)?.delete(ws);
            ws.unsubscribe(`room:${ws.data.roomId}`);
          }
          ws.data.roomId = msg.roomId;
          ws.data.userId = msg.userId;
          if (!rooms.has(msg.roomId)) rooms.set(msg.roomId, new Set());
          rooms.get(msg.roomId)!.add(ws);
          ws.subscribe(`room:${msg.roomId}`);
          send(ws, { type: "ROOM_JOINED", roomId: msg.roomId });
          console.log(`[WS] ${msg.userId} joined room ${msg.roomId}`);
          break;
        }

        case "LEAVE_ROOM": {
          if (!ws.data.roomId) break;
          rooms.get(ws.data.roomId)?.delete(ws);
          ws.unsubscribe(`room:${ws.data.roomId}`);
          send(ws, { type: "ROOM_LEFT" });
          ws.data.roomId = null;
          break;
        }

        // ── Game lobby ─────────────────────────────────────────────────────────
        case "READY_TOGGLE": {
          if (!ws.data.roomId || !ws.data.userId) {
            send(ws, { type: "ERROR", message: "Not in a room" });
            break;
          }
          // TODO: track per-player ready state server-side
          broadcast(ws.data.roomId, {
            type: "PLAYER_READY",
            playerId: ws.data.userId,
            isReady: true,
          });
          break;
        }

        case "CHAT": {
          if (!ws.data.roomId || !ws.data.userId) {
            send(ws, { type: "ERROR", message: "Not in a room" });
            break;
          }
          if (!msg.text.trim()) break;
          const now = new Date();
          const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
          broadcast(ws.data.roomId, {
            type: "CHAT_MESSAGE",
            userId: ws.data.userId,
            text: msg.text.trim(),
            time,
          });
          break;
        }

        case "KICK_PLAYER": {
          if (!ws.data.roomId) break;
          // Notify and disconnect the kicked player
          const members = rooms.get(ws.data.roomId);
          if (members) {
            for (const m of members) {
              if (m.data.userId === msg.playerId) {
                send(m, { type: "PLAYER_KICKED", playerId: msg.playerId });
                m.data.roomId = null;
                members.delete(m);
              }
            }
          }
          broadcast(ws.data.roomId, {
            type: "PLAYER_KICKED",
            playerId: msg.playerId,
          });
          break;
        }

        case "START_GAME": {
          if (!ws.data.roomId) break;
          broadcast(ws.data.roomId, { type: "GAME_STARTED" });
          console.log(`[WS] game started in room ${ws.data.roomId}`);
          break;
        }
      }
    },

    close(ws) {
      if (ws.data.roomId) {
        rooms.get(ws.data.roomId)?.delete(ws);
        ws.unsubscribe(`room:${ws.data.roomId}`);
        console.log(`[WS] ${ws.data.userId ?? "?"} left room ${ws.data.roomId}`);
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
