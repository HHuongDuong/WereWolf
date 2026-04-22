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

export type GameStartSequenceStep =
  | "idle"
  | "starting"
  | "dealing"
  | "roleReveal"
  | "readyForPhase";

export interface Player {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  isActive?: boolean;
  isRevealed?: boolean;
}

export type UserRole = Role;

export interface GameContextType {
  currentPlayerRole: Role;
  phase: GamePhase;
  isAlive: boolean;
  hasActed: boolean;
  isHost?: boolean;
}

export interface PhaseChangedMetadata {
  deadIds?: string[];
  eliminatedId?: string;
}

export interface PhaseChangedPayload {
  roomId: string;
  phase: GamePhase;
  round: number;
  deadlineTimestamp: number;
  metadata?: PhaseChangedMetadata;
}
