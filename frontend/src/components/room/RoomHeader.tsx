import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../../context/RoomContext";

export function RoomHeader() {
  const navigate = useNavigate();
  const { room } = useRoom();
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(room.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="room-page-header">
      <button className="room-back-btn" onClick={() => navigate("/rooms")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Rooms
      </button>

      <div className="room-page-title-wrap">
        <h1 className="room-page-title font-display">Game Room</h1>
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
  );
}
