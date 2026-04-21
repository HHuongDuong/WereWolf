import { create } from "zustand";
import { GamePhase, GameStartSequenceStep, Role } from "@/shared/types/game";

interface GameState {
  roomId: string | null;
  currentPlayerRole: Role | null;
  assignedRole: Role | null;
  phase: GamePhase;
  round: number;
  deadlineTimestamp: number | null;
  isAlive: boolean;
  hasActed: boolean;
  startSequenceStep: GameStartSequenceStep;
  revealConfirmed: boolean;
  shouldShowPhaseTransition: boolean;
  previousPhase: GamePhase | null;
  bootstrapGame: (roomId: string) => void;
  startSequence: () => void;
  setSequenceStep: (step: GameStartSequenceStep) => void;
  setAssignedRole: (role: Role) => void;
  confirmReveal: () => void;
  setPhase: (phase: GamePhase) => void;
  applyPhaseChanged: (payload: {
    roomId: string;
    phase: GamePhase;
    round: number;
    deadlineTimestamp: number;
  }) => void;
  completePhaseTransition: () => void;
  resetGame: () => void;
}

const initialState = {
  roomId: null,
  currentPlayerRole: null,
  assignedRole: null,
  phase: GamePhase.NIGHT,
  round: 1,
  deadlineTimestamp: null,
  isAlive: true,
  hasActed: false,
  startSequenceStep: "idle" as GameStartSequenceStep,
  revealConfirmed: false,
  shouldShowPhaseTransition: false,
  previousPhase: null as GamePhase | null,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  bootstrapGame: (roomId) => set((state) => ({ ...state, roomId })),
  startSequence: () => set({ startSequenceStep: "starting" }),
  setSequenceStep: (step) => set({ startSequenceStep: step }),
  setAssignedRole: (role) =>
    set({
      assignedRole: role,
      currentPlayerRole: role,
    }),
  confirmReveal: () => set({ revealConfirmed: true, startSequenceStep: "readyForPhase" }),
  setPhase: (phase) => set({ phase }),
  applyPhaseChanged: (payload) =>
    set((state) => ({
      roomId: payload.roomId,
      previousPhase: state.phase,
      phase: payload.phase,
      round: payload.round,
      deadlineTimestamp: payload.deadlineTimestamp,
      shouldShowPhaseTransition: state.startSequenceStep === "readyForPhase" && state.phase !== payload.phase,
    })),
  completePhaseTransition: () => set({ shouldShowPhaseTransition: false }),
  resetGame: () => set(initialState),
}));
