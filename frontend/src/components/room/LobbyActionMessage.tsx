import { useState } from "react";
import { useRoom } from "../../context/RoomContext";

export function LobbyActionMessage() {
  const { room, players, isHost, isReady, readyCount, canStart, toggleReady, startGame } = useRoom();
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(room.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="lobby-action-msg">
      {/* Room title */}
      <h2 className="lam-room-name">{room.name}</h2>

      {/* Room code */}
      <button
        className={`lam-code-btn ${copied ? "copied" : ""}`}
        onClick={copyCode}
        title="Copy room code"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        {copied ? "Copied!" : room.code}
      </button>

      {/* Ready progress */}
      <div className="lam-progress">
        <div className="lam-progress-bar">
          <div
            className="lam-progress-fill"
            style={{ width: `${players.length ? (readyCount / players.length) * 100 : 0}%` }}
          />
        </div>
        <span className="lam-progress-label">
          {readyCount} / {players.length} ready
        </span>
      </div>

      {/* Action button */}
      {isHost ? (
        <button
          className={`lam-btn lam-btn--start ${canStart ? "" : "disabled"}`}
          onClick={startGame}
          disabled={!canStart}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M8 5v14l11-7z" />
          </svg>
          Start Game
        </button>
      ) : (
        <button
          className={`lam-btn lam-btn--ready ${isReady ? "active" : ""}`}
          onClick={toggleReady}
        >
          {isReady ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Ready!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              Ready Up
            </>
          )}
        </button>
      )}

      {/* Mode badge */}
      <span className="lam-mode-badge">{room.mode}</span>
    </div>
  );
}
