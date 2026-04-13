import { useRef, useEffect, useState } from "react";
import { useRoom } from "../../context/RoomContext";

interface Props {
  lobbyOpen: boolean;
  rightPanel: "settings" | "chat";
  onTogglePanel: () => void;
}

export function LobbyChatPanel({ lobbyOpen, rightPanel, onTogglePanel }: Props) {
  const { room, chat, players, sendMessage } = useRoom();
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
      {/* Panel header — matches reference Header_chatHeader */}
      <div className="rp-header">
        <div className="rp-header-left">
          {/* Waiting state pill */}
          <div className="rp-state">
            <div className="rp-state-icon">
              <img src="/img/icons/time.svg" alt="" draggable={false} />
            </div>
            <span className="rp-state-name">Waiting</span>
            <span className="rp-state-count">
              {players.length}<span>/{room.maxPlayers}</span>
            </span>
          </div>

          {/* Toggle button — only visible after lobby opened */}
          {lobbyOpen && (
            <button className="rp-toggle-btn" onClick={onTogglePanel}>
              {rightPanel === "chat" ? (
                <>
                  <img src="/img/icons/book.svg" alt="" draggable={false} />
                  <span>Game rules</span>
                </>
              ) : (
                <>
                  <img src="/img/icons/messages.svg" alt="" draggable={false} />
                  <span>Messages</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Settings icon */}
        <button className="rp-settings-btn" title="Settings">
          <img src="/img/icons/settings.svg" alt="Settings" draggable={false} />
        </button>
      </div>

      {/* Content card — rounded, dark background */}
      <div className="lcp-body">
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
      </div>

      {/* Input row — outside the card, below it */}
      <form className="lcp-input-row" onSubmit={handleSend}>
        <input
          className="lcp-input"
          placeholder="Type a message…"
          value={msg}
          onChange={e => setMsg(e.target.value)}
          maxLength={200}
        />
        <button type="submit" className="lcp-send-btn" disabled={!msg.trim()}>
          <img src="/img/icons/send.svg" alt="Send" draggable={false} />
        </button>
      </form>
    </div>
  );
}
