import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../../stores/gameStore";
import { useRoom } from "../../../context/RoomContext";
import { useGuest } from "../../../context/AuthContext";
import { GameHUD } from "../GameHUD";
import { PhaseTimer } from "../shared/PhaseTimer";
import { PlayerCard } from "../shared/PlayerCard";

const DAY_TOTAL = 180;

export function DayPhase() {
  const players           = useGameStore(s => s.players);
  const deadlineTimestamp = useGameStore(s => s.deadlineTimestamp);
  const setPhase          = useGameStore(s => s.setPhase);

  const { chat, sendMessage } = useRoom();
  const { guest } = useGuest();
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const myId = guest.guestId;

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const val = inputRef.current?.value.trim();
    if (!val) return;
    sendMessage(val);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <motion.div
      className="phase-fullscreen day-phase"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GameHUD />
      <div className="day-layout">
        {/* Alive players sidebar */}
        <aside className="day-players-sidebar">
          <p className="day-sidebar-label">Players</p>
          {players.map(p => (
            <PlayerCard key={p.guestId} player={p} isYou={p.guestId === myId} />
          ))}
        </aside>

        {/* Main: timer + chat */}
        <main className="day-main">
          <div className="day-timer-row">
            <span className="day-timer-label">Discussion ends in</span>
            <PhaseTimer deadlineTimestamp={deadlineTimestamp} totalSeconds={DAY_TOTAL} />
          </div>

          <div className="day-chat">
            <div className="day-chat-messages">
              {chat.map(msg => (
                <div
                  key={msg.id}
                  className={`day-chat-msg ${msg.user === guest.displayName ? "own" : ""}`}
                >
                  <span className="day-chat-user">{msg.user}</span>
                  <span className="day-chat-text">{msg.text}</span>
                  <span className="day-chat-time">{msg.time}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form className="day-chat-form" onSubmit={handleSend}>
              <input
                ref={inputRef}
                className="day-chat-input"
                placeholder="Speak your mind..."
                autoComplete="off"
              />
              <button className="day-chat-send" type="submit">Send</button>
            </form>
          </div>
        </main>
      </div>

      {import.meta.env.DEV && (
        <div className="dev-skip-bar">
          <button className="dev-skip-btn" onClick={() => setPhase("voting")}>
            DEV: Skip to Vote
          </button>
        </div>
      )}
    </motion.div>
  );
}
