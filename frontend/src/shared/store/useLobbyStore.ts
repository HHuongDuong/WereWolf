import { create } from 'zustand';
import { Room } from '../types/lobby';

interface LobbyState {
  rooms: Room[];
  isLoading: boolean;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
  playerName: string | null;
  setPlayerName: (name: string) => void;
}

// Initial mock data moved from LobbyView
const initialMockRooms: Room[] = [
  {
    id: "1",
    name: "The Howling Table",
    code: "HTAB48",
    hostName: "Ánh Dương",
    hostId: "host-1",
    currentPlayers: 7,
    maxPlayers: 12,
    players: [],
  },
  {
    id: "2",
    name: "Blood Moon Pack",
    code: "BMON72",
    hostName: "Luna",
    hostId: "host-2",
    currentPlayers: 4,
    maxPlayers: 12,
    players: [],
  },
  {
    id: "3",
    name: "Silent Forest",
    code: "SFOR11",
    hostName: "Shadow",
    hostId: "host-3",
    currentPlayers: 12,
    maxPlayers: 12,
    players: [],
  },
  {
    id: "4",
    name: "Witch's Hut",
    code: "WHUT33",
    hostName: "Elara",
    hostId: "host-4",
    currentPlayers: 6,
    maxPlayers: 8,
    players: [],
  },
  {
    id: "5",
    name: "Cursed Village",
    code: "CVIL99",
    hostName: "Victor",
    hostId: "host-5",
    currentPlayers: 9,
    maxPlayers: 16,
    players: [],
  },
];

export const useLobbyStore = create<LobbyState>((set) => ({
  rooms: initialMockRooms,
  isLoading: false,
  playerName: null,
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  removeRoom: (roomId) => set((state) => ({ rooms: state.rooms.filter(r => r.id !== roomId) })),
  setPlayerName: (name) => set({ playerName: name }),
}));
