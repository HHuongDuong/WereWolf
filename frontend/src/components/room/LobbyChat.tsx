import { useRef, useEffect, useState } from "react";
import { useRoom } from "../../context/RoomContext";

export function LobbyChat() {
  const { chat, players, sendMessage } = useRoom();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(msg);
    setMsg("");
  }

  const myUsername = players.find(p => p.isYou)?.username ?? "You";

  return (
    <div className="room-chat-card">
      <div className="room-section-head">
        <span className="room-section-title">Lobby Chat</span>
        <span className="room-chat-online">{players.length} here</span>
      </div>

      <div className="room-chat-messages">
        {chat.map(m => (
          <div
            key={m.id}
            className={`room-chat-msg ${m.user === myUsername ? "own" : ""}`}
          >
            <span className="room-chat-user">{m.user}</span>
            <span className="room-chat-text">{m.text}</span>
            <span className="room-chat-time">{m.time}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form className="room-chat-form" onSubmit={handleSend}>
        <input
          className="room-chat-input"
          placeholder="Say something..."
          value={msg}
          onChange={e => setMsg(e.target.value)}
          maxLength={200}
        />
        <button type="submit" className="room-chat-send" disabled={!msg.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
