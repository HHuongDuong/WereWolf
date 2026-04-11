import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../../stores/gameStore";
import { RoleIcon } from "../shared/RoleIcon";

// Mock roles for eliminated player reveal
// TODO: WS VOTE_RESULT { eliminatedRole } sends the actual role
const MOCK_ROLE_POOL = ["Villager", "Villager", "Seer", "Hunter", "Werewolf"];

function pickMockRole(playerId: string): string {
  let h = 0;
  for (let i = 0; i < playerId.length; i++) h = (h * 31 + playerId.charCodeAt(i)) & 0xffff;
  return MOCK_ROLE_POOL[h % MOCK_ROLE_POOL.length] ?? "Villager";
}

export function EliminationPhase() {
  const players             = useGameStore(s => s.players);
  const eliminatedPlayerId  = useGameStore(s => s.eliminatedPlayerId);
  const setPhase            = useGameStore(s => s.setPhase);
  const setWinner           = useGameStore(s => s.setWinner);
  const nextRound           = useGameStore(s => s.nextRound);
  const setDayTimeLeft      = useGameStore(s => s.setDayTimeLeft);
  const setNightAction      = useGameStore(s => s.setNightAction);
  const setSeerResult       = useGameStore(s => s.setSeerResult);

  const eliminated = players.find(p => p.id === eliminatedPlayerId);
  const eliminatedRole = eliminated ? pickMockRole(eliminated.id) : "Villager";

  useEffect(() => {
    const t = setTimeout(() => {
      const alive = players.filter(p => p.isAlive);
      // Naive win-check: count "Werewolf"-role players by mock assignment
      const wolfCount = alive.filter(p => pickMockRole(p.id) === "Werewolf").length;
      const villagerCount = alive.length - wolfCount;

      if (wolfCount === 0) {
        setWinner("villagers");
        setPhase("ended");
      } else if (wolfCount >= villagerCount) {
        setWinner("wolves");
        setPhase("ended");
      } else {
        // Continue to next night
        setDayTimeLeft(180);
        setNightAction(null);
        setSeerResult(null);
        nextRound();
        setPhase("night");
        // TODO: driven by WS NIGHT_STARTED event
      }
    }, 5000);
    return () => clearTimeout(t);
  }, [players, setPhase, setWinner, nextRound, setDayTimeLeft, setNightAction, setSeerResult]);

  return (
    <motion.div
      className="phase-fullscreen elimination-phase"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="elimination-content">
        <h2 className="font-display elimination-headline">The Village Has Spoken</h2>

        {eliminated ? (
          <div className="elimination-player-reveal">
            <motion.div
              className="elimination-avatar"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              {eliminated.username[0]?.toUpperCase() ?? "?"}
            </motion.div>
            <motion.p
              className="elimination-name"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {eliminated.username}
            </motion.p>
            <motion.div
              className="elimination-role-reveal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <span className="elimination-was">was</span>
              <div className={`role-reveal-badge role-${eliminatedRole.toLowerCase()} compact`}>
                <RoleIcon role={eliminatedRole} size={20} />
                <span>{eliminatedRole}</span>
              </div>
            </motion.div>
          </div>
        ) : (
          <p className="elimination-tie">The vote was tied — no one was eliminated.</p>
        )}

        <motion.p
          className="elimination-next-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          Night falls again...
        </motion.p>
      </div>
    </motion.div>
  );
}
