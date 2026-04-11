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
 *   useEffect(() => on("GAME_STARTED", () => setPhase("day")), [on, setPhase]);
 */

import { create } from "zustand";

// ── Types ──────────────────────────────────────────────────────────────────────

export type GamePhase = "lobby" | "day" | "night" | "voting" | "ended";

export interface GamePlayer {
  id: string;
  username: string;
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

  // ── Actions ──────────────────────────────────────────────────────────────────
  setPhase: (phase: GamePhase) => void;
  nextRound: () => void;
  setMyRole: (role: string) => void;
  setPlayers: (players: GamePlayer[]) => void;
  castVote: (voterId: string, targetId: string) => void;
  clearVotes: () => void;
  eliminatePlayer: (playerId: string) => void;
  reset: () => void;
}

const initialState: Pick<
  GameState,
  "phase" | "round" | "myRole" | "players" | "votes"
> = {
  phase: "lobby",
  round: 0,
  myRole: null,
  players: [],
  votes: {},
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

  eliminatePlayer: (playerId) =>
    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, isAlive: false } : p,
      ),
    })),

  reset: () => set(initialState),
}));
