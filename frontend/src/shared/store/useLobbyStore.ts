import { create } from 'zustand';
import { Room } from '../types/lobby';

interface LobbyState {
  rooms: Room[];
  isLoading: boolean;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
}

// Initial mock data moved from LobbyView
const initialMockRooms: Room[] = [
  {
    id: "1",
    name: "The Howling Table",
    code: "WOLF-4831",
    hostName: "Ánh Dương",
    hostId: "host-1",
    currentPlayers: 7,
    maxPlayers: 12,
    players: [],
  },
  {
    id: "2",
    name: "Blood Moon Pack",
    code: "WOLF-7294",
    hostName: "Luna",
    hostId: "host-2",
    currentPlayers: 4,
    maxPlayers: 12,
    players: [],
  },
];

export const useLobbyStore = create<LobbyState>((set) => ({
  rooms: initialMockRooms,
  isLoading: false,
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  removeRoom: (roomId) => set((state) => ({ rooms: state.rooms.filter(r => r.id !== roomId) })),
}));
