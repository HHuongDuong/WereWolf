import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { useWs } from "../../context/WsContext";
import { useRoom } from "../../context/RoomContext";
import { RoleRevealPhase }  from "./phases/RoleRevealPhase";
import { NightPhase }       from "./phases/NightPhase";
import { DayPhase }         from "./phases/DayPhase";
import { VotingPhase }      from "./phases/VotingPhase";
import { EliminationPhase } from "./phases/EliminationPhase";
import { GameOverPhase }    from "./phases/GameOverPhase";
import { HunterModal }      from "./HunterModal";

export function GameView() {
  const phase = useGameStore(s => s.phase);
  const {
    setPhase,
    setMyRole,
    nextRound,
    setDeadline,
    eliminatePlayer,
    setEliminatedPlayer,
    clearVotes,
    setWinner,
    setSeerResult,
    setNightActionAck,
    setRevealedRoles,
  } = useGameStore();

  const { on } = useWs();
  const { room } = useRoom();

  // ── Inbound WS events ────────────────────────────────────────────────────────

  useEffect(() => on("ROLE_ASSIGNED", msg => {
    setMyRole(msg.role);
    setPhase("role_reveal");
  }), [on, setMyRole, setPhase]);

  useEffect(() => on("PHASE_CHANGED", msg => {
    if (msg.phase === "night") {
      nextRound();
      setDeadline(msg.deadlineTimestamp);
      // Eliminate players who died during the previous night (from metadata)
      for (const deadId of msg.metadata.deadIds ?? []) {
        eliminatePlayer(deadId);
      }
      setPhase("night");
    } else if (msg.phase === "day") {
      setDeadline(msg.deadlineTimestamp);
      setPhase("day");
    }
  }), [on, setPhase, nextRound, setDeadline, eliminatePlayer]);

  useEffect(() => on("VOTE_STARTED", msg => {
    clearVotes();
    setDeadline(Date.now() + msg.durationSec * 1000);
    setPhase("voting");
  }), [on, clearVotes, setDeadline, setPhase]);

  useEffect(() => on("VOTE_RESULT", msg => {
    setEliminatedPlayer(msg.eliminatedId);
    if (msg.eliminatedId) {
      eliminatePlayer(msg.eliminatedId);
    }
    clearVotes();
    setPhase("elimination");
  }), [on, setEliminatedPlayer, eliminatePlayer, clearVotes, setPhase]);

  useEffect(() => on("GAME_ENDED", msg => {
    setRevealedRoles(msg.roles);
    setWinner(msg.winner === "werewolf" ? "wolves" : "villagers");
    setPhase("ended");
  }), [on, setRevealedRoles, setWinner, setPhase]);

  useEffect(() => on("SEER_RESULT", msg => {
    setSeerResult(msg.role === "Werewolf" ? "wolf" : "villager");
  }), [on, setSeerResult]);

  useEffect(() => on("NIGHT_ACTION_ACK", msg => {
    setNightActionAck(msg.success);
  }), [on, setNightActionAck]);

  // room.id used only to scope subscriptions to the current room
  void room;

  return (
    <div className="game-view">
      <AnimatePresence mode="wait">
        {phase === "role_reveal"  && <RoleRevealPhase  key="role_reveal"  />}
        {phase === "night"        && <NightPhase        key="night"        />}
        {phase === "day"          && <DayPhase          key="day"          />}
        {phase === "voting"       && <VotingPhase       key="voting"       />}
        {phase === "elimination"  && <EliminationPhase  key="elimination"  />}
        {phase === "ended"        && <GameOverPhase      key="ended"        />}
      </AnimatePresence>

      {/* Hunter modal is a global overlay — rendered regardless of phase */}
      <HunterModal />
    </div>
  );
}
