export type RoomStatus = 'idle' | 'waiting' | 'in_game' | 'finished';

export interface Player {
  guestId: string;
  displayName: string;
  isDisconnected?: boolean;
}

export interface ChatMessage {
  senderName: string;
  channel: string;
  content: string;
  sentAt: number;
}

export interface GameState {
  // Identity
  myGuestId: string | null;
  myRole: string | null;
  
  // Room Info
  roomId: string | null;
  roomCode: string | null;
  hostId: string | null;
  roomStatus: RoomStatus;
  players: Player[];
  maxPlayers: number;
  config: Record<string, number>;
  
  // Game Phase
  phase: 'night' | 'day' | 'vote' | null;
  round: number;
  deadlineTimestamp: number | null;
  deadPlayers: string[];
  eliminatedId: string | null;
  
  // Extra (For Night Actions / Special Events)
  werewolfKillTargetId: string | null; // For Witch info
  isHunterTriggered: boolean; // True when user is a dieing hunter
  seerResult: { targetId: string; isWerewolf: boolean } | null; // For Seer result
  witchPotions: { hasSavePotion: boolean; hasKillPotion: boolean } | null; // For Witch potions
  
  // End Game
  winnerTeam: 'villagers' | 'werewolves' | 'draw' | null;
  finalRoles: Record<string, string> | null;
  
  // Chat
  chat: {
    wolves: ChatMessage[];
    all: ChatMessage[];
  };

  // Toast System
  toast: { message: string; type: "error" | "info" } | null;
}

const initialState: GameState = {
  myGuestId: null,
  myRole: null,
  roomId: null,
  roomCode: null,
  hostId: null,
  roomStatus: 'idle',
  players: [],
  maxPlayers: 8,
  config: {},
  phase: null,
  round: 0,
  deadlineTimestamp: null,
  deadPlayers: [],
  eliminatedId: null,
  werewolfKillTargetId: null,
  isHunterTriggered: false,
  seerResult: null,
  witchPotions: null,
  winnerTeam: null,
  finalRoles: null,
  chat: { wolves: [], all: [] },
  toast: null,
};

import { create } from 'zustand';

interface GameStore extends GameState {
  setMyGuestId: (id: string) => void;
  setRole: (role: string) => void;
  setRoomState: (state: Partial<GameState>) => void;
  updateChat: (channel: 'wolves' | 'all', msg: ChatMessage) => void;
  setToast: (message: string, type?: "error" | "info" | "success") => void;
  clearToast: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  
  setMyGuestId: (id) => set({ myGuestId: id }),
  setRole: (role) => set({ myRole: role }),
  setRoomState: (state) => set((s) => ({ ...s, ...state })),
  updateChat: (channel, msg) => {
    console.log('[gameStore] updateChat called:', { channel, msg });
    set((s) => ({
      chat: {
        ...s.chat,
        [channel]: [...s.chat[channel], msg]
      }
    }));
  },
  setToast: (message, type = "error") => set({ toast: { message, type } as any }),
  clearToast: () => set({ toast: null }),
  reset: () => set({ ...initialState, myGuestId: useGameStore.getState().myGuestId }) // Keep guestId on reset
}));
