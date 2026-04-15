import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../../stores/gameStore";
import { useGuest } from "../../../context/AuthContext";
import { useWs } from "../../../context/WsContext";
import { useRoom } from "../../../context/RoomContext";
import { GameHUD } from "../GameHUD";

export function VotingPhase() {
  const players           = useGameStore(s => s.players);
  const votes             = useGameStore(s => s.votes);
  const round             = useGameStore(s => s.round);
  const castVote          = useGameStore(s => s.castVote);

  const { guest } = useGuest();
  const { send } = useWs();
  const { room } = useRoom();
  const myId = guest.guestId;

  const [voteLocked, setVoteLocked] = useState(false);

  const alivePlayers = players.filter(p => p.isAlive);
  const myVote = votes[myId];

  // Vote tally: targetId → count
  const tally = alivePlayers.reduce<Record<string, number>>((acc, p) => {
    acc[p.guestId] = Object.values(votes).filter(v => v === p.guestId).length;
    return acc;
  }, {});

  function handleVote(targetId: string) {
    if (voteLocked || targetId === myId || myVote) return;
    castVote(myId, targetId);
    setVoteLocked(true);
    send({ type: "VOTE", roomId: room.id, round, targetId });
  }

  return (
    <motion.div
      className="phase-fullscreen voting-phase"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GameHUD />
      <div className="voting-content">
        <h2 className="font-display voting-title">Cast Your Vote</h2>
        <p className="voting-subtitle">Who do you suspect is a werewolf?</p>

        <div className="voting-players">
          {alivePlayers.map(p => {
            const count = tally[p.guestId] ?? 0;
            const pct   = alivePlayers.length > 0 ? count / alivePlayers.length : 0;
            const isMe  = p.guestId === myId;

            return (
              <button
                key={p.guestId}
                className={[
                  "vote-target",
                  myVote === p.guestId ? "selected" : "",
                  voteLocked ? "locked" : "",
                  isMe ? "self" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={voteLocked || isMe}
                onClick={() => handleVote(p.guestId)}
              >
                <div
                  className="vote-target-bar"
                  style={{ width: `${pct * 100}%` }}
                />
                <div className="vote-target-avatar">
                  {p.displayName[0]?.toUpperCase() ?? "?"}
                </div>
                <span className="vote-target-name">
                  {p.displayName}
                  {isMe && <span className="vote-target-you"> (you)</span>}
                </span>
                <span className="vote-target-count">{count}</span>
              </button>
            );
          })}
        </div>

        {voteLocked && (
          <p className="night-action-confirm" style={{ marginTop: 16 }}>
            Vote locked in. Waiting for others...
          </p>
        )}
      </div>

      {import.meta.env.DEV && (
        <div className="dev-skip-bar">
          <button className="dev-skip-btn" onClick={() => {
            const first = alivePlayers[0];
            if (first) handleVote(first.guestId);
          }}>
            DEV: Vote First Player
          </button>
        </div>
      )}
    </motion.div>
  );
}
