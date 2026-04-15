/**
 * RoomContext — active room / game-lobby state.
 *
 * Lifted out of RoomPage so that future features (WebSocket events,
 * in-game overlay, spectator view) can share the same live state without
 * prop-drilling.
 *
 * Wrap individual room routes with <RoomProvider roomId={id}>.
 * Replace the stub implementations with real API/WS calls once the backend
 * is ready — the hook interface stays the same.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useGuest } from "./AuthContext";
import { useGameStore } from "../stores/gameStore";

// ── Types ─────────────────────────────────────────────────────────────────────

export type GameMode   = "Classic" | "Extended" | "Speed";
export type RoomStatus = "waiting" | "in-progress" | "finished";

export interface Player {
  id: string;
  username: string;
  isHost: boolean;
  isReady: boolean;
  isYou?: boolean;
}

export interface ChatMsg {
  id: number;
  user: string;
  text: string;
  time: string;
}

export interface SettingRow {
  label: string;
  value: string;
  accent?: "blue" | "red" | "gold" | "dim";
}

export interface RoomInfo {
  id: string;
  name: string;
  code: string;
  mode: GameMode;
  maxPlayers: number;
  status: RoomStatus;
  settings: SettingRow[];
}

interface RoomContextValue {
  room: RoomInfo;
  players: Player[];
  chat: ChatMsg[];
  myPlayer: Player | undefined;
  isHost: boolean;
  isReady: boolean;
  readyCount: number;
  canStart: boolean;

  toggleReady(): void;
  sendMessage(text: string): void;
  kickPlayer(id: string): void;
  startGame(): void;
  updateSettings(settings: SettingRow[]): void;
}

// ── Stub data (replace with API/WS feeds) ─────────────────────────────────────

const MOCK_SETTINGS: SettingRow[] = [
  { label: "Mode",        value: "Classic"  },
  { label: "Max Players", value: "12"       },
  { label: "Day Phase",   value: "3 min"    },
  { label: "Night Phase", value: "90 sec"   },
  { label: "Werewolves",  value: "2"        },
  { label: "Seer",        value: "Enabled",  accent: "blue" },
  { label: "Witch",       value: "Disabled", accent: "dim"  },
  { label: "Hunter",      value: "Enabled",  accent: "blue" },
];

const MOCK_PLAYERS: Player[] = [
  { id: "1",       username: "LunaWolf",     isHost: false, isReady: true  },
  { id: "2",       username: "SeerMaster",   isHost: false, isReady: true  },
  { id: "3",       username: "VillageElder", isHost: false, isReady: true  },
  { id: "4",       username: "HunterX",      isHost: false, isReady: true  },
  { id: "5",       username: "CursedOne",    isHost: false, isReady: true  },
  { id: "guest_dev", username: "You",        isHost: true,  isReady: false, isYou: true },
];

const MOCK_CHAT: ChatMsg[] = [
  { id: 1, user: "LunaWolf",   text: "Welcome to the village! Waiting for more players...", time: "12:30" },
  { id: 2, user: "SeerMaster", text: "Ready when you are!",                                 time: "12:31" },
  { id: 3, user: "HunterX",    text: "Who's the wolf this time? 👀",                        time: "12:31" },
];

// ── Provider ──────────────────────────────────────────────────────────────────

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomProvider({
  roomId,
  children,
}: {
  roomId: string;
  children: React.ReactNode;
}) {
  const { guest } = useGuest();
  const { setPhase, setMyRole, setPlayers: setGamePlayers, nextRound } = useGameStore();

  const [room, setRoom] = useState<RoomInfo>({
    id: roomId,
    name: "Midnight Hunt",
    code: "WOLF-4821",
    mode: "Classic",
    maxPlayers: 12,
    status: "waiting",
    settings: MOCK_SETTINGS,
  });

  const [players, setPlayers] = useState<Player[]>(() =>
    MOCK_PLAYERS.map(p =>
      p.isYou ? { ...p, username: guest.displayName, id: guest.guestId } : p,
    ),
  );

  const [chat, setChat] = useState<ChatMsg[]>(MOCK_CHAT);

  // Sync player name if guest displayName changes
  useEffect(() => {
    setPlayers(ps =>
      ps.map(p => (p.isYou ? { ...p, username: guest.displayName, id: guest.guestId } : p)),
    );
  }, [guest.guestId, guest.displayName]);

  const msgCounter = useRef(Date.now());

  const myPlayer   = players.find(p => p.isYou);
  const isHost     = myPlayer?.isHost ?? false;
  const isReady    = myPlayer?.isReady ?? false;
  const readyCount = players.filter(p => p.isReady).length;
  const canStart   = isHost && readyCount >= players.length - 1;

  const toggleReady = useCallback(() => {
    setPlayers(ps => ps.map(p => (p.isYou ? { ...p, isReady: !p.isReady } : p)));
    // TODO: emit WS event — { type: "READY_TOGGLE" }
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const now  = new Date();
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
      setChat(c => [
        ...c,
        { id: msgCounter.current++, user: guest.displayName, text: text.trim(), time },
      ]);
      // TODO: emit WS event — { type: "CHAT", text }
    },
    [guest.displayName],
  );

  const kickPlayer = useCallback((id: string) => {
    setPlayers(ps => ps.filter(p => p.id !== id));
    // TODO: call API — DELETE /api/rooms/:roomId/players/:id
  }, []);

  const startGame = useCallback(() => {
    if (!canStart) return;
    setRoom(r => ({ ...r, status: "in-progress" }));

    // Seed the game store with the current lobby players
    setGamePlayers(players.map(p => ({ id: p.id, username: p.username, isAlive: true })));

    // TODO: WS ROLE_DEALT event sends the actual assigned role — mock for now
    setMyRole("Werewolf");

    // Advance to role reveal; after 5 s, night begins
    setPhase("role_reveal");
    // TODO: emit WS { type: "START_GAME" } before transitioning
    setTimeout(() => {
      nextRound();
      setPhase("night");
      // TODO: replace setTimeout with WS NIGHT_STARTED event
    }, 5000);
  }, [canStart, players, setPhase, setMyRole, setGamePlayers, nextRound]);

  const updateSettings = useCallback((settings: SettingRow[]) => {
    setRoom(r => ({ ...r, settings }));
    // TODO: call API — PATCH /api/rooms/:roomId/settings
  }, []);

  return (
    <RoomContext.Provider
      value={{
        room,
        players,
        chat,
        myPlayer,
        isHost,
        isReady,
        readyCount,
        canStart,
        toggleReady,
        sendMessage,
        kickPlayer,
        startGame,
        updateSettings,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used inside <RoomProvider>");
  return ctx;
}
