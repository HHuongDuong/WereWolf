/**
 * gameStore — global in-game state managed by Zustand.
 *
 * This lives outside React's component tree so any component can read/write
 * without prop drilling or context nesting.
 *
 * Wire WS events into this store from WsContext subscribers, e.g.:
 *
 *   const { on } = useWs();
 *   const { setPhase, eliminatePlayer } = useGameStore();
 *
 *   useEffect(() => on("ROLE_ASSIGNED", msg => setMyRole(msg.role)), [on, setMyRole]);
 */

import { create } from "zustand";

// ── Types ──────────────────────────────────────────────────────────────────────

export type GamePhase =
  | "lobby"
  | "role_reveal"
  | "night"
  | "day"
  | "voting"
  | "elimination"
  | "ended";

export interface GamePlayer {
  guestId: string;
  displayName: string;
  isAlive: boolean;
}

// ── Store ──────────────────────────────────────────────────────────────────────

interface GameState {
  /** Current game phase */
  phase: GamePhase;
  /** Current round number (increments each day/night cycle) */
  round: number;
  /** The local player's assigned role (populated when the server deals roles) */
  myRole: string | null;
  /** All players in the active game */
  players: GamePlayer[];
  /** Current vote tally: voterId → targetId */
  votes: Record<string, string>;
  /** Player eliminated in the last vote (shown on elimination screen) */
  eliminatedPlayerId: string | null;
  /** Winning faction — populated when phase = "ended" */
  winnerFaction: "wolves" | "villagers" | null;
  /** Unix ms deadline for the current phase timer (replaces dayTimeLeft) */
  deadlineTimestamp: number | null;
  /** Target selected by the current player during night phase */
  nightAction: string | null;
  /** Result revealed to the Seer after investigating a player */
  seerResult: "wolf" | "villager" | null;
  /** True after NIGHT_ACTION_ACK received with success=true */
  nightActionAck: boolean;
  /** guestId → role, populated from GAME_ENDED */
  revealedRoles: Record<string, string>;

  // ── Actions ──────────────────────────────────────────────────────────────────
  setPhase: (phase: GamePhase) => void;
  nextRound: () => void;
  setMyRole: (role: string) => void;
  setPlayers: (players: GamePlayer[]) => void;
  castVote: (voterId: string, targetId: string) => void;
  clearVotes: () => void;
  eliminatePlayer: (guestId: string) => void;
  setEliminatedPlayer: (id: string | null) => void;
  setWinner: (faction: "wolves" | "villagers" | null) => void;
  setDeadline: (timestamp: number | null) => void;
  setNightAction: (targetId: string | null) => void;
  setSeerResult: (result: "wolf" | "villager" | null) => void;
  setNightActionAck: (ack: boolean) => void;
  setRevealedRoles: (roles: Record<string, string>) => void;
  reset: () => void;
}

const initialState: Pick<
  GameState,
  | "phase" | "round" | "myRole" | "players" | "votes"
  | "eliminatedPlayerId" | "winnerFaction" | "deadlineTimestamp"
  | "nightAction" | "seerResult" | "nightActionAck" | "revealedRoles"
> = {
  phase: "lobby",
  round: 0,
  myRole: null,
  players: [],
  votes: {},
  eliminatedPlayerId: null,
  winnerFaction: null,
  deadlineTimestamp: null,
  nightAction: null,
  seerResult: null,
  nightActionAck: false,
  revealedRoles: {},
};

export const useGameStore = create<GameState>()((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  nextRound: () => set((s) => ({ round: s.round + 1 })),

  setMyRole: (role) => set({ myRole: role }),

  setPlayers: (players) => set({ players }),

  castVote: (voterId, targetId) =>
    set((s) => ({ votes: { ...s.votes, [voterId]: targetId } })),

  clearVotes: () => set({ votes: {} }),

  eliminatePlayer: (guestId) =>
    set((s) => ({
      players: s.players.map((p) =>
        p.guestId === guestId ? { ...p, isAlive: false } : p,
      ),
    })),

  setEliminatedPlayer: (id) => set({ eliminatedPlayerId: id }),

  setWinner: (faction) => set({ winnerFaction: faction }),

  setDeadline: (timestamp) => set({ deadlineTimestamp: timestamp }),

  setNightAction: (targetId) => set({ nightAction: targetId }),

  setSeerResult: (result) => set({ seerResult: result }),

  setNightActionAck: (ack) => set({ nightActionAck: ack }),

  setRevealedRoles: (roles) => set({ revealedRoles: roles }),

  reset: () => set(initialState),
}));
