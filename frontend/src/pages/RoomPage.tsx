import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RoomProvider, useRoom, type Player } from "../context/RoomContext";

// ── Entry point (wraps the page in its context) ───────────────────────────────

export function RoomPage() {
  const { id = "unknown" } = useParams();
  return (
    <RoomProvider roomId={id}>
      <RoomPageInner />
    </RoomProvider>
  );
}

// ── Inner page (consumes context) ─────────────────────────────────────────────

function RoomPageInner() {
  const navigate = useNavigate();
  const {
    room,
    players,
    chat,
    isHost,
    isReady,
    readyCount,
    canStart,
    toggleReady,
    sendMessage,
    kickPlayer,
    startGame,
  } = useRoom();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [msg,  setMsg]  = useState("");
  const [copied, setCopied] = useState(false);
  const [editingSettings, setEditingSettings] = useState(false);

  const emptySlots = Math.max(0, room.maxPlayers - players.length);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(msg);
    setMsg("");
  }

  function copyCode() {
    navigator.clipboard.writeText(room.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="room-page">
      {/* ── Page Header ── */}
      <div className="room-page-header">
        <button className="room-back-btn" onClick={() => navigate("/rooms")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Rooms
        </button>

        <div className="room-page-title-wrap">
          <h1 className="room-page-title font-display">{room.name}</h1>
          <span className="room-page-mode-badge">{room.mode}</span>
        </div>

        <div className="room-code-block">
          <span className="room-code-label">Room code</span>
          <button className={`room-code-btn ${copied ? "copied" : ""}`} onClick={copyCode}>
            <span className="room-code-value">{room.code}</span>
            {copied ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="room-page-body">

        {/* ── Left: Players ── */}
        <div className="room-players-section">
          <div className="room-section-head">
            <span className="room-section-title">Players</span>
            <span className="room-player-tally">
              {players.length}<span className="room-player-tally-max">/{room.maxPlayers}</span>
            </span>
          </div>

          <div className="room-players-grid">
            {players.map(p => (
              <PlayerSlot
                key={p.id}
                player={p}
                canKick={isHost && !p.isYou && !p.isHost}
                onKick={() => kickPlayer(p.id)}
              />
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <div key={`empty-${i}`} className="player-slot empty">
                <div className="player-slot-avatar empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </div>
                <span className="player-slot-name">Waiting...</span>
                <div className="player-slot-badge empty">—</div>
              </div>
            ))}
          </div>

          {/* Ready / Start bar */}
          <div className="room-actions">
            <div className="room-ready-progress">
              <div className="room-ready-progress-head">
                <span className="room-ready-label">Players ready</span>
                <span className="room-ready-count">{readyCount}/{players.length}</span>
              </div>
              <div className="room-ready-track">
                <div
                  className="room-ready-fill"
                  style={{ width: `${(readyCount / players.length) * 100}%` }}
                />
              </div>
            </div>

            {isHost ? (
              <button
                className={`room-action-btn start ${canStart ? "active" : ""}`}
                disabled={!canStart}
                onClick={startGame}
              >
                {canStart ? (
                  <>
                    Start Game
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </>
                ) : (
                  `Waiting for ${players.length - readyCount - 1} more…`
                )}
              </button>
            ) : (
              <button
                className={`room-action-btn ready ${isReady ? "active" : ""}`}
                onClick={toggleReady}
              >
                {isReady ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                    Ready!
                  </>
                ) : "Ready Up"}
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Settings + Chat ── */}
        <div className="room-right-panel">

          {/* Settings card */}
          <div className="room-settings-card">
            <div className="room-section-head">
              <span className="room-section-title">Game Settings</span>
              {isHost && (
                <button
                  className="room-settings-edit-btn"
                  onClick={() => setEditingSettings(v => !v)}
                >
                  {editingSettings ? "Done" : "Edit"}
                </button>
              )}
            </div>
            <div className="room-settings-list">
              {room.settings.map(s => (
                <div key={s.label} className="room-setting-row">
                  <span className="room-setting-label">{s.label}</span>
                  <span className={`room-setting-value ${s.accent ? `accent-${s.accent}` : ""}`}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat card */}
          <div className="room-chat-card">
            <div className="room-section-head">
              <span className="room-section-title">Lobby Chat</span>
              <span className="room-chat-online">{players.length} here</span>
            </div>

            <div className="room-chat-messages">
              {chat.map(m => (
                <div
                  key={m.id}
                  className={`room-chat-msg ${m.user === (players.find(p => p.isYou)?.username ?? "You") ? "own" : ""}`}
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

        </div>
      </div>
    </div>
  );
}

// ── Player Slot sub-component ─────────────────────────────────────────────────

function PlayerSlot({
  player,
  canKick,
  onKick,
}: {
  player: Player;
  canKick: boolean;
  onKick: () => void;
}) {
  const hue      = player.username.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const initials = player.username.slice(0, 2).toUpperCase();

  return (
    <div className={`player-slot ${player.isYou ? "you" : ""} ${player.isReady ? "ready" : ""}`}>
      {player.isHost && (
        <div className="player-slot-crown" title="Room Host">
          <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
            <path d="M2 19h20v2H2zM3 13l4-8 5 5 5-5 4 8H3z"/>
          </svg>
        </div>
      )}

      <div
        className="player-slot-avatar"
        style={{ "--hue": hue } as React.CSSProperties}
      >
        {initials}
      </div>

      <span className="player-slot-name" title={player.username}>
        {player.username}
        {player.isYou && <span className="player-slot-you-tag">You</span>}
      </span>

      <div className={`player-slot-badge ${player.isReady ? "ready" : "waiting"}`}>
        {player.isReady ? "Ready" : "Waiting"}
      </div>

      {canKick && (
        <button className="player-slot-kick" title="Kick player" onClick={onKick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      )}
    </div>
  );
}
