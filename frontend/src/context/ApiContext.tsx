/**
 * ApiContext — centralised API gateway stub.
 *
 * All fetch calls should go through this context so that:
 *   - Guest ID is injected automatically from GuestContext
 *   - The base URL is configured in one place
 *   - Error handling is uniform
 *
 * Replace the `// TODO` bodies with real fetch/WebSocket calls when the
 * backend is ready. The hook signatures intentionally match what the pages
 * already expect so wiring up is a one-file change.
 */

import { createContext, useContext, useMemo } from "react";
import { useGuest } from "./AuthContext";

// ── Types ────────────────────────────────────────────────────────────────────

export type RoomStatus = "waiting" | "in-progress" | "full";
export type GameMode   = "Classic" | "Extended" | "Speed";

export interface Room {
  id: string;
  name: string;
  host: string;
  players: number;
  maxPlayers: number;
  status: RoomStatus;
  mode: GameMode;
  hasPassword: boolean;
}

export interface CreateRoomPayload {
  name: string;
  maxPlayers: number;
  mode: GameMode;
  password?: string;
}

// ── Context shape ─────────────────────────────────────────────────────────────

interface ApiContextValue {
  /** Room / lobby endpoints */
  rooms: {
    list(): Promise<Room[]>;
    create(payload: CreateRoomPayload): Promise<Room>;
    join(id: string, password?: string): Promise<void>;
    leave(id: string): Promise<void>;
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

const BASE_URL = import.meta.env?.VITE_API_URL ?? "/api";

function stub(name: string): never {
  throw new Error(`[Api] ${name} — not yet wired to backend`);
}

// ── Provider ──────────────────────────────────────────────────────────────────

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { guest } = useGuest();

  /** Builds fetch options with JSON headers + guest identity header. */
  function headers(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "X-Guest-Id": guest.guestId,
    };
  }

  /** Thin wrapper: throws on non-2xx, returns parsed JSON. */
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
      async list() {
        // TODO: wire to backend — GET /api/rooms
        stub("rooms.list");
      },
      async create(payload) {
        // TODO: wire to backend — POST /api/rooms
        void payload;
        stub("rooms.create");
      },
      async join(id, password) {
        // TODO: wire to backend — POST /api/rooms/:id/join
        void id; void password;
        stub("rooms.join");
      },
      async leave(id) {
        // TODO: wire to backend — POST /api/rooms/:id/leave
        void id;
        stub("rooms.leave");
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [guest.guestId]);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used inside <ApiProvider>");
  return ctx;
}
