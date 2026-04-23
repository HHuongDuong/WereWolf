import { create } from "zustand";
import { GamePhase, GameStartSequenceStep, Role } from "@/shared/types/game";

export type WitchPotionsState = {
  healUsed: boolean;
  poisonUsed: boolean;
};

export type ChatMessage = {
  senderName: string;
  channel: string;
  content: string;
  sentAt: number;
};

interface GameState {
  roomId: string | null;
  currentPlayerRole: Role | null;
  assignedRole: Role | null;
  phase: GamePhase;
  round: number;
  deadlineTimestamp: number | null;
  isAlive: boolean;
  hasActed: boolean;
  witchPotions: WitchPotionsState;
  hunterTriggered: boolean;
  lastNightActionKey: string | null;
  currentNightRole: Role | null;
  startSequenceStep: GameStartSequenceStep;
  revealConfirmed: boolean;
  shouldShowPhaseTransition: boolean;
  previousPhase: GamePhase | null;
  seerReveal: { targetId: string; revealedRole: Role.VILLAGER | Role.WEREWOLF } | null;
  fellowWolves: string[];
  lastPhaseDeadIds: string[];
  lastPhaseEliminatedId: string | null;
  lastProtectedPlayerId: string | null;
  chatMessages: ChatMessage[];
  setLastProtectedPlayerId: (id: string | null) => void;
  setFellowWolves: (fellowWolves: string[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  bootstrapGame: (roomId: string) => void;
  startSequence: () => void;
  setSequenceStep: (step: GameStartSequenceStep) => void;
  setAssignedRole: (role: Role, fellowWolves?: string[]) => void;
  confirmReveal: () => void;
  setPhase: (phase: GamePhase) => void;
  setIsAlive: (value: boolean) => void;
  setHasActed: (value: boolean) => void;
  setWitchPotions: (patch: Partial<WitchPotionsState>) => void;
  setHunterTriggered: (value: boolean) => void;
  setLastNightActionKey: (value: string | null) => void;
  setCurrentNightRole: (value: Role | null) => void;
  setSeerReveal: (value: { targetId: string; revealedRole: Role.VILLAGER | Role.WEREWOLF } | null) => void;
  applyPhaseChanged: (payload: {
    roomId: string;
    phase: GamePhase;
    round: number;
    deadlineTimestamp: number;
    currentNightRole?: Role | null;
    deadIds?: string[];
    eliminatedId?: string | null;
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
  witchPotions: { healUsed: false, poisonUsed: false } as WitchPotionsState,
  hunterTriggered: false,
  lastNightActionKey: null as string | null,
  currentNightRole: null as Role | null,
  startSequenceStep: "idle" as GameStartSequenceStep,
  revealConfirmed: false,
  shouldShowPhaseTransition: false,
  previousPhase: null as GamePhase | null,
  seerReveal: null as { targetId: string; revealedRole: Role.VILLAGER | Role.WEREWOLF } | null,
  fellowWolves: [] as string[],
  lastPhaseDeadIds: [] as string[],
  lastPhaseEliminatedId: null as string | null,
  lastProtectedPlayerId: null as string | null,
  chatMessages: [] as ChatMessage[],
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  setLastProtectedPlayerId: (id) => set({ lastProtectedPlayerId: id }),
  setFellowWolves: (fellowWolves) => set({ fellowWolves }),
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  bootstrapGame: (roomId) => set((state) => ({ ...state, roomId })),
  startSequence: () => set({ startSequenceStep: "starting" }),
  setSequenceStep: (step) => set({ startSequenceStep: step }),
  setAssignedRole: (role, fellowWolves = []) =>
    set({
      assignedRole: role,
      currentPlayerRole: role,
      isAlive: true,
      hasActed: false,
      hunterTriggered: false,
      lastNightActionKey: null,
      witchPotions: role === Role.WITCH ? { healUsed: false, poisonUsed: false } : { healUsed: false, poisonUsed: false },
      fellowWolves,
    }),
  confirmReveal: () => set({ revealConfirmed: true, startSequenceStep: "readyForPhase" }),
  setPhase: (phase) => set({ phase }),
  setIsAlive: (value) => set({ isAlive: value }),
  setHasActed: (value) => set({ hasActed: value }),
  setWitchPotions: (patch) => set((state) => ({ witchPotions: { ...state.witchPotions, ...patch } })),
  setHunterTriggered: (value) => set({ hunterTriggered: value }),
  setLastNightActionKey: (value) => set({ lastNightActionKey: value }),
  setCurrentNightRole: (value) => set({ currentNightRole: value }),
  setSeerReveal: (value) => set({ seerReveal: value }),
  applyPhaseChanged: (payload) =>
    set((state) => ({
      roomId: payload.roomId,
      previousPhase: state.phase,
      phase: payload.phase,
      round: payload.round,
      deadlineTimestamp: payload.deadlineTimestamp,
      hasActed: false,
      lastNightActionKey: null,
      currentNightRole: payload.currentNightRole ?? null,
      seerReveal: payload.phase === state.phase ? state.seerReveal : null,
      shouldShowPhaseTransition: state.startSequenceStep === "readyForPhase" && state.phase !== payload.phase,
      lastPhaseDeadIds: payload.deadIds ?? [],
      lastPhaseEliminatedId: payload.eliminatedId ?? null,
    })),
  completePhaseTransition: () => set({ shouldShowPhaseTransition: false }),
  resetGame: () => set(initialState),
}));
