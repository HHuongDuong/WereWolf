/**
 * ApiContext — Historically for REST, now redirected to WebSocket communication
 * to adhere to the architecture where FE only communicates with the gateway 
 * via WebSockets.
 */

import { createContext, useContext, useMemo } from "react";
import { useWs } from "./WsContext";
import { useGuest } from "./AuthContext";

// ── Context shape ─────────────────────────────────────────────────────────────

interface ApiContextValue {
  rooms: {
    create(): void;
    join(roomCode: string): void;
    leave(roomId: string): void;
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { send } = useWs();
  const { guest } = useGuest();

  const api = useMemo<ApiContextValue>(() => ({
    rooms: {
      create() {
        send({ type: "CREATE_ROOM", guestId: guest.guestId, displayName: guest.displayName });
      },
      join(roomCode) {
        send({ type: "JOIN_ROOM", guestId: guest.guestId, displayName: guest.displayName, roomCode });
      },
      leave(roomId) {
        send({ type: "LEAVE_ROOM", roomId, guestId: guest.guestId });
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [send, guest.guestId, guest.displayName]);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used inside <ApiProvider>");
  return ctx;
}
