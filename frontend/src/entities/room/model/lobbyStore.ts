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
  markPlayersDead: (roomId: string, playerIds: string[]) => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
  rooms: [],
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
        name: payload.roomCode,
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
  markPlayersDead: (roomId, playerIds) =>
    set((state) => {
      if (playerIds.length === 0) {
        return state;
      }
      const deadSet = new Set(playerIds);
      return {
        rooms: state.rooms.map((room) =>
          room.id !== roomId
            ? room
            : {
                ...room,
                players: room.players.map((player) =>
                  deadSet.has(player.id) ? { ...player, isAlive: false } : player,
                ),
              },
        ),
      };
    }),
}));
