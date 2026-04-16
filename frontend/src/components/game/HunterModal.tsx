import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../stores/gameStore";
import { useWs } from "../../context/WsContext";
import { useRoom } from "../../context/RoomContext";
import { useGuest } from "../../context/AuthContext";

/**
 * Overlay shown when HUNTER_TRIGGER arrives and the local player is the hunter.
 * Allows the hunter to take one player down with them.
 */
export function HunterModal() {
  const players = useGameStore(s => s.players);
  const { on, send } = useWs();
  const { room } = useRoom();
  const { guest } = useGuest();

  const [visible, setVisible] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => {
    return on("HUNTER_TRIGGER", msg => {
      if (msg.hunterId === guest.guestId) {
        setVisible(true);
      }
    });
  }, [on, guest.guestId]);

  const alivePlayers = players.filter(p => p.isAlive && p.guestId !== guest.guestId);

  function handleShoot(targetId: string) {
    if (chosen) return;
    setChosen(targetId);
    // Confirm exact actionType with BE dev — using "guard" as per CLAUDE.md note
    send({ type: "NIGHT_ACTION", roomId: room.id, actionType: "guard", targetId });
    setTimeout(() => setVisible(false), 2000);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="hunter-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="hunter-modal"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220 }}
          >
            <h3 className="font-display hunter-modal-title">You have been eliminated!</h3>
            <p className="hunter-modal-subtitle">As the Hunter, you may take one player with you.</p>

            {!chosen ? (
              <div className="hunter-targets">
                {alivePlayers.map(p => (
                  <button
                    key={p.guestId}
                    className="hunter-target-btn"
                    onClick={() => handleShoot(p.guestId)}
                  >
                    {p.displayName}
                  </button>
                ))}
              </div>
            ) : (
              <p className="hunter-modal-confirm">
                You took {players.find(p => p.guestId === chosen)?.displayName} with you.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
