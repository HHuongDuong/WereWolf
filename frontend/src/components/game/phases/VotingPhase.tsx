import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../../stores/gameStore";
import { useGuest } from "../../../context/AuthContext";
import { GameHUD } from "../GameHUD";

export function VotingPhase() {
  const players           = useGameStore(s => s.players);
  const votes             = useGameStore(s => s.votes);
  const castVote          = useGameStore(s => s.castVote);
  const eliminatePlayer   = useGameStore(s => s.eliminatePlayer);
  const setEliminatedPlayer = useGameStore(s => s.setEliminatedPlayer);
  const setPhase          = useGameStore(s => s.setPhase);
  const clearVotes        = useGameStore(s => s.clearVotes);

  const { guest } = useGuest();
  const myId = guest.guestId;

  const [voteLocked, setVoteLocked] = useState(false);

  const alivePlayers = players.filter(p => p.isAlive);
  const myVote = votes[myId];

  // Vote tally: targetId → count
  const tally = alivePlayers.reduce<Record<string, number>>((acc, p) => {
    acc[p.id] = Object.values(votes).filter(v => v === p.id).length;
    return acc;
  }, {});

  function handleVote(targetId: string) {
    if (voteLocked || targetId === myId) return;
    castVote(myId, targetId);
    // TODO: emit WS { type: "CAST_VOTE", targetId }
  }

  function confirmVote() {
    if (!myVote || voteLocked) return;
    setVoteLocked(true);
    // TODO: WS VOTE_RESULT event drives elimination — mock locally for now
    setTimeout(resolveVote, 1500);
  }

  function resolveVote() {
    // Find player with most votes
    const sorted = alivePlayers
      .map(p => ({ id: p.id, count: tally[p.id] ?? 0 }))
      .sort((a, b) => b.count - a.count);

    const topId = sorted[0]?.id;
    if (topId) {
      eliminatePlayer(topId);
      setEliminatedPlayer(topId);
    }
    clearVotes();
    setPhase("elimination");
    // TODO: driven by WS VOTE_RESULT { eliminatedId, eliminatedRole }
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
            const count = tally[p.id] ?? 0;
            const pct   = alivePlayers.length > 0 ? count / alivePlayers.length : 0;
            const isMe  = p.id === myId;

            return (
              <button
                key={p.id}
                className={[
                  "vote-target",
                  myVote === p.id ? "selected" : "",
                  voteLocked ? "locked" : "",
                  isMe ? "self" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={voteLocked || isMe}
                onClick={() => handleVote(p.id)}
              >
                <div
                  className="vote-target-bar"
                  style={{ width: `${pct * 100}%` }}
                />
                <div className="vote-target-avatar">
                  {p.username[0]?.toUpperCase() ?? "?"}
                </div>
                <span className="vote-target-name">
                  {p.username}
                  {isMe && <span className="vote-target-you"> (you)</span>}
                </span>
                <span className="vote-target-count">{count}</span>
              </button>
            );
          })}
        </div>

        <button
          className={`voting-confirm-btn ${myVote && !voteLocked ? "active" : ""}`}
          disabled={!myVote || voteLocked}
          onClick={confirmVote}
        >
          {voteLocked ? "Vote Locked In" : "Confirm Vote"}
        </button>
      </div>

      {import.meta.env.DEV && (
        <div className="dev-skip-bar">
          <button className="dev-skip-btn" onClick={() => {
            const first = alivePlayers[0];
            setEliminatedPlayer(first?.id ?? null);
            if (first) eliminatePlayer(first.id);
            clearVotes();
            setPhase("elimination");
          }}>
            DEV: Force Eliminate
          </button>
        </div>
      )}
    </motion.div>
  );
}
