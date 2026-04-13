import { motion } from "framer-motion";
import { useGameStore } from "../../../stores/gameStore";
import { PlayerCard } from "../shared/PlayerCard";
import { useAuth } from "../../../context/AuthContext";

export function NightPhase() {
  const myRole      = useGameStore(s => s.myRole);
  const players     = useGameStore(s => s.players);
  const nightAction = useGameStore(s => s.nightAction);
  const seerResult  = useGameStore(s => s.seerResult);
  const setNightAction = useGameStore(s => s.setNightAction);
  const setSeerResult  = useGameStore(s => s.setSeerResult);
  const setPhase    = useGameStore(s => s.setPhase);
  const { user }    = useAuth();

  const myId        = user?.id ?? "dev-001";
  const alivePlayers = players.filter(p => p.isAlive && p.id !== myId);

  function handleWolfTarget(targetId: string) {
    setNightAction(targetId);
    // TODO: emit WS { type: "WOLF_TARGET", targetId }
  }

  function handleSeerInvestigate(targetId: string) {
    setNightAction(targetId);
    // Mock result — TODO: replace with WS SEER_RESULT event
    setSeerResult(Math.random() > 0.4 ? "villager" : "wolf");
    // TODO: emit WS { type: "SEER_INVESTIGATE", targetId }
  }

  return (
    <motion.div
      className="phase-fullscreen night-phase"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="night-overlay" />
      <div className="night-content">
        <div className="night-header">
          <div className="night-moon">🌕</div>
          <h2 className="font-display">Night Falls</h2>
        </div>

        {myRole === "Werewolf" && (
          <div>
            <p className="night-action-title">Choose your victim</p>
            <div className="night-targets">
              {alivePlayers.map(p => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  isSelected={nightAction === p.id}
                  actionLabel={nightAction === p.id ? "Marked" : "Mark"}
                  actionDisabled={!!nightAction && nightAction !== p.id}
                  onClick={() => handleWolfTarget(p.id)}
                />
              ))}
            </div>
            {nightAction && (
              <p className="night-action-confirm">
                Target locked. Wait for dawn...
              </p>
            )}
          </div>
        )}

        {myRole === "Seer" && (
          <div>
            <p className="night-action-title">Investigate a player</p>
            {!seerResult ? (
              <div className="night-targets">
                {alivePlayers.map(p => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    isSelected={nightAction === p.id}
                    actionLabel="Inspect"
                    actionDisabled={!!nightAction}
                    onClick={() => handleSeerInvestigate(p.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="seer-result-reveal">
                <p className="night-action-confirm">
                  {players.find(p => p.id === nightAction)?.username} is a...
                </p>
                <div className={`seer-result ${seerResult}`}>
                  {seerResult === "wolf" ? "🐺 Werewolf!" : "🏘️ Villager"}
                </div>
                <p className="night-action-confirm" style={{ marginTop: 12 }}>
                  Keep this secret until morning.
                </p>
              </div>
            )}
          </div>
        )}

        {myRole !== "Werewolf" && myRole !== "Seer" && (
          <div className="night-wait">
            <p className="night-wait-text">The village sleeps...</p>
            <p className="night-wait-sub">Wait for dawn to break.</p>
          </div>
        )}
      </div>

      {/* DEV: skip to day */}
      {import.meta.env.DEV && (
        <div className="dev-skip-bar">
          <button className="dev-skip-btn" onClick={() => setPhase("day")}>
            DEV: Skip to Day
          </button>
        </div>
      )}
    </motion.div>
  );
}
