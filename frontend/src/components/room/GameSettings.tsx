import { useState } from "react";
import { useRoom } from "../../context/RoomContext";

export function GameSettings() {
  const { room, isHost } = useRoom();
  const [editingSettings, setEditingSettings] = useState(false);

  return (
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
        {room.settings.length === 0 ? (
          <span className="room-setting-label" style={{ opacity: 0.5 }}>
            No settings configured yet.
          </span>
        ) : room.settings.map(s => (
          <div key={s.label} className="room-setting-row">
            <span className="room-setting-label">{s.label}</span>
            <span className={`room-setting-value ${s.accent ? `accent-${s.accent}` : ""}`}>
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
