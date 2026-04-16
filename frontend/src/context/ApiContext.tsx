/**
 * ApiContext — REST calls to room_service via fetch.
 *
 * Base URL: VITE_API_URL env var (default: /api).
 * guestId and displayName are injected automatically from GuestContext.
 */

import { createContext, useContext, useMemo } from "react";
import { useGuest } from "./AuthContext";

// ── Types ────────────────────────────────────────────────────────────────────

export type RoomStatus = "waiting" | "in_game" | "finished";

export interface Room {
  roomId: string;
  roomCode: string;
  hostId: string;
  playerCount: number;
  maxPlayers: number;
  status: RoomStatus;
}

// ── Context shape ─────────────────────────────────────────────────────────────

interface ApiContextValue {
  rooms: {
    list(): Promise<Room[]>;
    get(roomId: string): Promise<Room>;
    create(): Promise<Room>;
    join(roomCode: string): Promise<Room>;
    leave(roomId: string): Promise<void>;
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

const BASE_URL = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? "/api";

// ── Provider ──────────────────────────────────────────────────────────────────

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { guest } = useGuest();

  function headers(): HeadersInit {
    return { "Content-Type": "application/json" };
  }

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { ...headers(), ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  const api = useMemo<ApiContextValue>(() => ({
    rooms: {
      list() {
        return request<Room[]>("/rooms");
      },

      get(roomId) {
        return request<Room>(`/rooms/${roomId}`);
      },

      create() {
        return request<Room>("/rooms", {
          method: "POST",
          body: JSON.stringify({ guestId: guest.guestId, displayName: guest.displayName }),
        });
      },

      join(roomCode) {
        return request<Room>("/rooms/join", {
          method: "POST",
          body: JSON.stringify({ guestId: guest.guestId, displayName: guest.displayName, roomCode }),
        });
      },

      async leave(roomId) {
        await request<void>(`/rooms/${roomId}/players/${guest.guestId}`, {
          method: "DELETE",
        });
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [guest.guestId, guest.displayName]);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used inside <ApiProvider>");
  return ctx;
}
