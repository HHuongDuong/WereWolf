export enum Role {
  WEREWOLF = "WEREWOLF",
  SEER = "SEER",
  WITCH = "WITCH",
  VILLAGER = "VILLAGER",
  GUARD = "GUARD",
  HUNTER = "HUNTER",
}

export enum GamePhase {
  NIGHT = "NIGHT",
  DAY = "DAY",
  VOTING = "VOTING",
  END = "END",
}

export interface Player {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  isActive?: boolean;
  isRevealed?: boolean;
  isReady?: boolean;
}

export type UserRole = Role;

export interface GameContextType {
  currentPlayerRole: Role;
  phase: GamePhase;
  isAlive: boolean;
  hasActed: boolean;
  isHost?: boolean;
}
