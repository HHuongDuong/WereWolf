import { AnimatePresence } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { RoleRevealPhase }  from "./phases/RoleRevealPhase";
import { NightPhase }       from "./phases/NightPhase";
import { DayPhase }         from "./phases/DayPhase";
import { VotingPhase }      from "./phases/VotingPhase";
import { EliminationPhase } from "./phases/EliminationPhase";
import { GameOverPhase }    from "./phases/GameOverPhase";

// TODO: Wire WS events here once backend is ready:
// const { on } = useWs();
// useEffect(() => on("ROLE_DEALT", msg => { setMyRole(msg.role); setPlayers(msg.players); }), [on]);
// useEffect(() => on("NIGHT_STARTED", msg => { nextRound(); setPhase("night"); }), [on]);
// useEffect(() => on("DAY_STARTED", () => setPhase("day")), [on]);
// useEffect(() => on("VOTE_PHASE", () => setPhase("voting")), [on]);
// useEffect(() => on("VOTE_RESULT", msg => { eliminatePlayer(msg.eliminatedId); setEliminatedPlayer(msg.eliminatedId); setPhase("elimination"); }), [on]);
// useEffect(() => on("GAME_OVER", msg => { setWinner(msg.winner); setPhase("ended"); }), [on]);

export function GameView() {
  const phase = useGameStore(s => s.phase);

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
    </div>
  );
}
