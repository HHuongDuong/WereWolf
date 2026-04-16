import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { useWs } from "../../context/WsContext";
import { useRoom } from "../../context/RoomContext";

/**
 * Shown inside NightPhase when myRole === "Witch".
 * Listens for WITCH_INFO, then offers Save / Poison / Skip.
 */
export function WitchActionPanel() {
  const players        = useGameStore(s => s.players);
  const nightAction    = useGameStore(s => s.nightAction);
  const nightActionAck = useGameStore(s => s.nightActionAck);
  const setNightAction = useGameStore(s => s.setNightAction);

  const { on, send } = useWs();
  const { room } = useRoom();

  const [killTargetId, setKillTargetId] = useState<string | null>(null);
  const [choice, setChoice] = useState<"save" | "poison" | "skip" | null>(null);
  const [poisonTargetId, setPoisonTargetId] = useState<string | null>(null);

  useEffect(() => {
    return on("witch_info", msg => {
      setKillTargetId(msg.werewolfKillTargetId);
    });
  }, [on]);

  const acted = !!nightAction || nightActionAck || !!choice;
  const killTarget = players.find(p => p.guestId === killTargetId);
  const alivePlayers = players.filter(p => p.isAlive && p.guestId !== killTargetId);

  function handleSave() {
    if (acted || !killTargetId) return;
    setChoice("save");
    setNightAction(killTargetId);
    send({ type: "night_action", actionType: "witch", targetId: killTargetId });
  }

  function handlePoison(targetId: string) {
    if (acted) return;
    setPoisonTargetId(targetId);
    setChoice("poison");
    setNightAction(targetId);
    send({ type: "night_action", actionType: "witch", targetId });
  }

  function handleSkip() {
    if (acted) return;
    setChoice("skip");
    setNightAction("skip");
    // Skipping — send with empty string or a designated "skip" target
    // Confirm exact payload with BE dev; using empty string as placeholder
    send({ type: "night_action", actionType: "witch", targetId: "" });
  }

  if (!killTargetId) {
    return (
      <div className="night-wait">
        <p className="night-wait-text">Waiting for the wolves to act...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="witch-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="night-action-title">The wolves have chosen...</p>

      {killTarget && (
        <div className="witch-kill-target">
          <div className="witch-kill-avatar">
            {killTarget.displayName[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="witch-kill-name">{killTarget.displayName}</span>
          <span className="witch-kill-label">will be killed</span>
        </div>
      )}

      {!choice && (
        <div className="witch-actions">
          <button className="witch-btn save" onClick={handleSave}>
            Save them
          </button>

          <div className="witch-poison-section">
            <p className="witch-section-label">Or poison someone:</p>
            <div className="night-targets">
              {alivePlayers.map(p => (
                <button
                  key={p.guestId}
                  className={`witch-poison-target ${poisonTargetId === p.guestId ? "selected" : ""}`}
                  onClick={() => handlePoison(p.guestId)}
                >
                  {p.displayName}
                </button>
              ))}
            </div>
          </div>

          <button className="witch-btn skip" onClick={handleSkip}>
            Do nothing
          </button>
        </div>
      )}

      {choice === "save" && (
        <p className="night-action-confirm">You saved {killTarget?.displayName}. Rest now.</p>
      )}
      {choice === "poison" && (
        <p className="night-action-confirm">
          You poisoned {players.find(p => p.guestId === poisonTargetId)?.displayName}. Sleep tight.
        </p>
      )}
      {choice === "skip" && (
        <p className="night-action-confirm">You did nothing. The night passes.</p>
      )}
    </motion.div>
  );
}
