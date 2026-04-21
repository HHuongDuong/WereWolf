import { create } from "zustand";
import { GamePhase, Role } from "@/shared/types/game";

interface GameState {
  currentPlayerRole: Role;
  phase: GamePhase;
  isAlive: boolean;
  hasActed: boolean;
  setPhase: (phase: GamePhase) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentPlayerRole: Role.VILLAGER,
  phase: GamePhase.NIGHT,
  isAlive: true,
  hasActed: false,
  setPhase: (phase) => set({ phase }),
}));
