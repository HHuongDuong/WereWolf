import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../../../stores/gameStore";

export function GameOverPhase() {
  const winnerFaction = useGameStore(s => s.winnerFaction);
  const players       = useGameStore(s => s.players);
  const reset         = useGameStore(s => s.reset);
  const navigate      = useNavigate();

  const wolvesWin = winnerFaction === "wolves";

  function handleBackToLobby() {
    reset();
    navigate("/rooms");
  }

  return (
    <motion.div
      className="phase-fullscreen game-over-phase"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="game-over-content">
        <motion.div
          className={`game-over-result ${winnerFaction ?? "wolves"}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
        >
          <h1 className="font-display game-over-title">
            {wolvesWin ? "The Wolves Win!" : "Villagers Triumph!"}
          </h1>
          <p className="game-over-subtitle">
            {wolvesWin
              ? "The wolves devoured the village. Darkness reigns."
              : "The wolves are vanquished. Your village is safe... for now."}
          </p>
        </motion.div>

        <motion.div
          className="game-over-players"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {players.map(p => (
            <div
              key={p.id}
              className={`game-over-player ${p.isAlive ? "alive" : "dead"}`}
            >
              <div className="game-over-player-avatar">
                {p.username[0]?.toUpperCase() ?? "?"}
              </div>
              <span className="game-over-player-name">{p.username}</span>
              <span className="game-over-player-status">
                {p.isAlive ? "Survived" : "Eliminated"}
              </span>
              {/* TODO: WS GAME_OVER { roles } reveals actual roles here */}
            </div>
          ))}
        </motion.div>

        <motion.div
          className="game-over-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <button className="game-over-btn primary" onClick={handleBackToLobby}>
            Back to Lobby
          </button>
          <button className="game-over-btn secondary" disabled>
            Play Again
            {/* TODO: emit WS rematch event */}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
