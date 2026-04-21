import { create } from "zustand";
import { Player, Role } from "@/shared/types/game";
import { Room } from "@/shared/types/lobby";
import { GatewayRoomUpdatedPayload } from "@/shared/types/gateway-room";

interface LobbyState {
  rooms: Room[];
  isLoading: boolean;
  playerName: string | null;
  currentRoomId: string | null;
  lastError: string | null;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
  setPlayerName: (name: string) => void;
  setCurrentRoomId: (roomId: string | null) => void;
  setLastError: (message: string | null) => void;
  setRoomName: (roomId: string, name: string) => void;
  upsertRoomFromGateway: (payload: GatewayRoomUpdatedPayload) => void;
}

function createMockPlayers(count: number, prefix: string): Player[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
    name: `Villager ${index + 1}`,
    role: Role.VILLAGER,
    isAlive: true,
  }));
}

const initialMockRooms: Room[] = [
  {
    id: "1",
    name: "The Howling Table",
    code: "HTAB48",
    hostName: "Anh Duong",
    hostId: "host-1",
    maxPlayers: 12,
    players: createMockPlayers(7, "howling"),
  },
  {
    id: "2",
    name: "Blood Moon Pack",
    code: "BMON72",
    hostName: "Luna",
    hostId: "host-2",
    maxPlayers: 12,
    players: createMockPlayers(4, "blood"),
  },
  {
    id: "3",
    name: "Silent Forest",
    code: "SFOR11",
    hostName: "Shadow",
    hostId: "host-3",
    maxPlayers: 12,
    players: createMockPlayers(12, "silent"),
  },
  {
    id: "4",
    name: "Witch's Hut",
    code: "WHUT33",
    hostName: "Elara",
    hostId: "host-4",
    maxPlayers: 8,
    players: createMockPlayers(6, "witch"),
  },
  {
    id: "5",
    name: "Cursed Village",
    code: "CVIL99",
    hostName: "Victor",
    hostId: "host-5",
    maxPlayers: 16,
    players: createMockPlayers(9, "cursed"),
  },
];

export const useLobbyStore = create<LobbyState>((set) => ({
  rooms: initialMockRooms,
  isLoading: false,
  playerName: null,
  currentRoomId: null,
  lastError: null,
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  removeRoom: (roomId) => set((state) => ({ rooms: state.rooms.filter((room) => room.id !== roomId) })),
  setPlayerName: (name) => set({ playerName: name }),
  setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),
  setLastError: (message) => set({ lastError: message }),
  setRoomName: (roomId, name) =>
    set((state) => ({
      rooms: state.rooms.map((room) => (room.id === roomId ? { ...room, name } : room)),
    })),
  upsertRoomFromGateway: (payload) =>
    set((state) => {
      const hostPlayer = payload.players.find((player) => player.guestId === payload.hostId);
      const existing = state.rooms.find((room) => room.id === payload.roomId);
      const mappedPlayers: Player[] = payload.players.map((player) => ({
        id: player.guestId,
        name: player.displayName,
        role: Role.VILLAGER,
        isAlive: true,
      }));

      const mappedRoom: Room = {
        id: payload.roomId,
        name: existing?.name || `Room ${payload.roomCode}`,
        code: payload.roomCode,
        hostId: payload.hostId,
        hostName: hostPlayer?.displayName || "Host",
        status: payload.status,
        config: payload.config,
        maxPlayers: payload.maxPlayers,
        players: mappedPlayers,
      };

      if (!existing) {
        return { rooms: [mappedRoom, ...state.rooms] };
      }

      return {
        rooms: state.rooms.map((room) => (room.id === payload.roomId ? mappedRoom : room)),
      };
    }),
}));
