/**
 * RoomContext — active room / game-lobby state.
 *
 * Wraps individual room routes with <RoomProvider roomCode={code}>.
 * On mount: fetches room info via REST, then emits JOIN_ROOM via WS.
 * Subscribes to ROOM_UPDATED for live player/status updates.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGuest } from "./AuthContext";
import { useWs } from "./WsContext";
import { useApi } from "./ApiContext";
import { useGameStore } from "../stores/gameStore";

// ── Types ─────────────────────────────────────────────────────────────────────

export type RoomStatus = "waiting" | "in_game" | "finished";

export interface Player {
  guestId: string;
  displayName: string;
  isHost: boolean;
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

export interface PhaseConfig {
  guardDuration?: number;
  seerDuration?: number;
  werewolfDuration?: number;
  witchDuration?: number;
  discussDuration?: number;
  voteDuration?: number;
}

export interface RoomInfo {
  id: string;
  code: string;
  hostId: string;
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
  canStart: boolean;

  sendMessage(text: string): void;
  startGame(): void;
  leaveRoom(): void;
  updateSettings(settings: SettingRow[]): void;
  configureRoom(maxPlayers?: number, config?: PhaseConfig): void;
}

// ── Provider ──────────────────────────────────────────────────────────────────

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomProvider({
  roomCode,
  children,
}: {
  roomCode: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const locationState = state as { isCreator?: boolean; initialRoom?: { roomId: string; roomCode: string; hostId: string; status: string; players: Array<{ guestId: string; displayName: string }> } } | null;
  const isCreator = locationState?.isCreator ?? false;
  const initialRoom = locationState?.initialRoom;
  const { guest } = useGuest();
  const { send, on } = useWs();
  const api = useApi();
  const { setPhase, setMyRole, setPlayers: setGamePlayers, nextRound } = useGameStore();

  const [room, setRoom] = useState<RoomInfo>({
    id: initialRoom?.roomId ?? "",
    code: initialRoom?.roomCode ?? roomCode,
    hostId: initialRoom?.hostId ?? "",
    maxPlayers: 8,
    status: (initialRoom?.status as RoomStatus) ?? "waiting",
    settings: [],
  });

  const [players, setPlayers] = useState<Player[]>(
    initialRoom?.players.map(p => ({
      guestId: p.guestId,
      displayName: p.displayName,
      isHost: p.guestId === initialRoom.hostId,
      isYou: p.guestId === guest.guestId,
    })) ?? []
  );
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const msgCounter = useRef(Date.now());

  // Guests send JOIN_ROOM; the host already has a session from CREATE_ROOM.
  useEffect(() => {
    if (isCreator) return;
    send({
      type: "JOIN_ROOM",
      guestId: guest.guestId,
      displayName: guest.displayName,
      roomCode,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  // Subscribe to ROOM_UPDATED — populate players and room state
  useEffect(() => {
    return on("ROOM_UPDATED", (msg) => {
      console.log("[RoomContext] ROOM_UPDATED received:", msg);
      const newPlayers: Player[] = msg.players.map(p => ({
        guestId: p.guestId,
        displayName: p.displayName,
        isHost: p.guestId === msg.hostId,
        isYou: p.guestId === guest.guestId,
      }));
      console.log("[RoomContext] newPlayers:", newPlayers);
      setPlayers(newPlayers);
      setRoom(r => ({
        ...r,
        id: msg.roomId,
        code: msg.roomCode,
        hostId: msg.hostId,
        status: msg.status as RoomStatus,
      }));
    });
  }, [on, guest.guestId]);

  // Subscribe to ROOM_CANCELLED — navigate away
  useEffect(() => {
    return on("ROOM_CANCELLED", () => {
      navigate("/rooms");
    });
  }, [on, navigate]);

  const myPlayer   = players.find(p => p.isYou);
  const isHost     = myPlayer?.isHost ?? false;
  const canStart   = isHost && players.length >= 6;

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const now  = new Date();
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
      // Local echo — chat_service not yet wired to gateway
      // TODO: replace with send({ type: "CHAT_MESSAGE", roomId, channel: "all", content: text.trim() })
      setChat(c => [
        ...c,
        { id: msgCounter.current++, user: guest.displayName, text: text.trim(), time },
      ]);
    },
    [guest.displayName],
  );

  const startGame = useCallback(() => {
    if (!canStart) return;
    send({ type: "START_GAME", guestId: guest.guestId });
    // Local phase transition — will be replaced by ROLE_ASSIGNED / PHASE_CHANGED WS events
    setGamePlayers(players.map(p => ({ guestId: p.guestId, displayName: p.displayName, isAlive: true })));
    setMyRole("Werewolf");
    setPhase("role_reveal");
    setTimeout(() => {
      nextRound();
      setPhase("night");
    }, 5000);
  }, [canStart, send, room.id, guest.guestId, players, setPhase, setMyRole, setGamePlayers, nextRound]);

  const leaveRoom = useCallback(() => {
    send({ type: "LEAVE_ROOM", roomId: room.id, guestId: guest.guestId });
    navigate("/rooms");
  }, [send, room.id, guest.guestId, navigate]);

  const updateSettings = useCallback((settings: SettingRow[]) => {
    setRoom(r => ({ ...r, settings }));
  }, []);

  const configureRoom = useCallback((maxPlayers?: number, config?: PhaseConfig) => {
    send({ type: "CONFIGURE_ROOM", guestId: guest.guestId, ...(maxPlayers !== undefined && { maxPlayers }), ...(config !== undefined && { config }) });
    if (maxPlayers !== undefined) setRoom(r => ({ ...r, maxPlayers }));
  }, [send, guest.guestId]);

  return (
    <RoomContext.Provider
      value={{
        room,
        players,
        chat,
        myPlayer,
        isHost,
        canStart,
        sendMessage,
        startGame,
        leaveRoom,
        updateSettings,
        configureRoom,
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
