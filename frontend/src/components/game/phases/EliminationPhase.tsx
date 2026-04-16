import { motion } from "framer-motion";
import { useGameStore } from "../../../stores/gameStore";
import { RoleIcon } from "../shared/RoleIcon";

export function EliminationPhase() {
  const players            = useGameStore(s => s.players);
  const eliminatedPlayerId = useGameStore(s => s.eliminatedPlayerId);
  const revealedRoles      = useGameStore(s => s.revealedRoles);

  const eliminated = players.find(p => p.guestId === eliminatedPlayerId);
  // Role is revealed by VOTE_RESULT → stored in revealedRoles, fallback to "Villager"
  const eliminatedRole = (eliminatedPlayerId && revealedRoles[eliminatedPlayerId]) || "Villager";

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
              {eliminated.displayName[0]?.toUpperCase() ?? "?"}
            </motion.div>
            <motion.p
              className="elimination-name"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {eliminated.displayName}
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
