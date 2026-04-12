import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../../context/RoomContext";

export function LobbyChatPanel() {
  const { room, chat, players, sendMessage } = useRoom();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState("");

  const myUsername = players.find(p => p.isYou)?.username ?? "You";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!msg.trim()) return;
    sendMessage(msg.trim());
    setMsg("");
  }

  return (
    <div className="lobby-chat-panel">
      {/* Header */}
      <div className="lcp-header">
        <div className="lcp-header-left">
          <button className="lcp-back-btn" onClick={() => navigate("/rooms")} title="Leave room">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="lcp-room-info">
            <span className="lcp-room-name">{room.name}</span>
            <span className="lcp-online">{players.length} online</span>
          </div>
        </div>
        <div className="lcp-state-badge">
          <span className="lcp-state-dot" />
          <span>Lobby</span>
        </div>
      </div>

      {/* Messages */}
      <div className="lcp-messages">
        {chat.map(m => (
          <div
            key={m.id}
            className={`lcp-msg ${m.user === myUsername ? "lcp-msg--own" : ""}`}
          >
            <div className="lcp-msg-head">
              <span className="lcp-msg-user">{m.user}</span>
              <span className="lcp-msg-time">{m.time}</span>
            </div>
            <div className="lcp-msg-body">{m.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="lcp-input-row" onSubmit={handleSend}>
        <input
          className="lcp-input"
          placeholder="Type a message…"
          value={msg}
          onChange={e => setMsg(e.target.value)}
          maxLength={200}
        />
        <button type="submit" className="lcp-send-btn" disabled={!msg.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
