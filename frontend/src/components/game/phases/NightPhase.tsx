import { motion } from "framer-motion";
import { useGameStore } from "../../../stores/gameStore";
import { PlayerCard } from "../shared/PlayerCard";
import { useGuest } from "../../../context/AuthContext";
import { useWs } from "../../../context/WsContext";
import { useRoom } from "../../../context/RoomContext";
import { WitchActionPanel } from "../WitchActionPanel";

export function NightPhase() {
  const myRole         = useGameStore(s => s.myRole);
  const players        = useGameStore(s => s.players);
  const nightAction    = useGameStore(s => s.nightAction);
  const nightActionAck = useGameStore(s => s.nightActionAck);
  const seerResult     = useGameStore(s => s.seerResult);
  const setNightAction = useGameStore(s => s.setNightAction);
  const setPhase       = useGameStore(s => s.setPhase);

  const { guest } = useGuest();
  const { send } = useWs();
  const { room } = useRoom();

  const myId = guest.guestId;
  const alivePlayers = players.filter(p => p.isAlive && p.guestId !== myId);

  function handleWolfTarget(targetId: string) {
    if (nightAction) return; // already acted
    setNightAction(targetId);
    send({ type: "night_action", actionType: "werewolf_kill", targetId });
  }

  function handleSeerInvestigate(targetId: string) {
    if (nightAction) return;
    setNightAction(targetId);
    send({ type: "night_action", actionType: "seer", targetId });
  }

  function handleGuardProtect(targetId: string) {
    if (nightAction) return;
    setNightAction(targetId);
    send({ type: "night_action", actionType: "guard", targetId });
  }

  const acted = !!nightAction || nightActionAck;

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
                  key={p.guestId}
                  player={p}
                  isSelected={nightAction === p.guestId}
                  actionLabel={nightAction === p.guestId ? "Marked" : "Mark"}
                  actionDisabled={acted && nightAction !== p.guestId}
                  onClick={() => handleWolfTarget(p.guestId)}
                />
              ))}
            </div>
            {acted && (
              <p className="night-action-confirm">Target locked. Wait for dawn...</p>
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
                    key={p.guestId}
                    player={p}
                    isSelected={nightAction === p.guestId}
                    actionLabel="Inspect"
                    actionDisabled={acted}
                    onClick={() => handleSeerInvestigate(p.guestId)}
                  />
                ))}
              </div>
            ) : (
              <div className="seer-result-reveal">
                <p className="night-action-confirm">
                  {players.find(p => p.guestId === nightAction)?.displayName} is a...
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

        {myRole === "Guard" && (
          <div>
            <p className="night-action-title">Protect a player</p>
            <div className="night-targets">
              {alivePlayers.map(p => (
                <PlayerCard
                  key={p.guestId}
                  player={p}
                  isSelected={nightAction === p.guestId}
                  actionLabel={nightAction === p.guestId ? "Protected" : "Protect"}
                  actionDisabled={acted && nightAction !== p.guestId}
                  onClick={() => handleGuardProtect(p.guestId)}
                />
              ))}
            </div>
            {acted && (
              <p className="night-action-confirm">Protection set. Sleep tight...</p>
            )}
          </div>
        )}

        {myRole === "Witch" && <WitchActionPanel />}

        {myRole !== "Werewolf" && myRole !== "Seer" && myRole !== "Guard" && myRole !== "Witch" && (
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
