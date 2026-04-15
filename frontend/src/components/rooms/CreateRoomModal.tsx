import { useState } from "react";
import type { GameMode } from "./RoomCard";

export function CreateRoomModal({
  onClose,
  onSubmit,
  loading = false,
}: {
  onClose: () => void;
  onSubmit: (data: { name: string; maxPlayers: string; mode: GameMode; password: string }) => void;
  loading?: boolean;
}) {
  const [newRoom, setNewRoom] = useState({
    name: "",
    maxPlayers: "10",
    mode: "Classic" as GameMode,
    password: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(newRoom);
  }

  return (
    <div className="rooms-modal-overlay" onClick={onClose}>
      <div className="rooms-modal" onClick={e => e.stopPropagation()}>
        <div className="rooms-modal-header">
          <h2 className="font-display">Create a Room</h2>
          <button className="rooms-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form className="rooms-modal-form" onSubmit={handleSubmit}>
          <div className="rooms-form-field">
            <label className="rooms-form-label">Room Name</label>
            <input
              className="rooms-form-input"
              placeholder="Name your village..."
              value={newRoom.name}
              onChange={e => setNewRoom(r => ({ ...r, name: e.target.value }))}
              required
            />
          </div>
          <div className="rooms-form-row">
            <div className="rooms-form-field">
              <label className="rooms-form-label">Max Players</label>
              <select
                className="rooms-form-input"
                value={newRoom.maxPlayers}
                onChange={e => setNewRoom(r => ({ ...r, maxPlayers: e.target.value }))}
              >
                {[6, 8, 10, 12, 16].map(n => <option key={n} value={n}>{n} players</option>)}
              </select>
            </div>
            <div className="rooms-form-field">
              <label className="rooms-form-label">Game Mode</label>
              <select
                className="rooms-form-input"
                value={newRoom.mode}
                onChange={e => setNewRoom(r => ({ ...r, mode: e.target.value as GameMode }))}
              >
                <option value="Classic">Classic</option>
                <option value="Extended">Extended</option>
                <option value="Speed">Speed</option>
              </select>
            </div>
          </div>
          <div className="rooms-form-field">
            <label className="rooms-form-label">
              Password <span className="rooms-form-optional">(optional — leave blank for public)</span>
            </label>
            <input
              className="rooms-form-input"
              type="password"
              placeholder="Secret passphrase..."
              value={newRoom.password}
              onChange={e => setNewRoom(r => ({ ...r, password: e.target.value }))}
            />
          </div>
          <button type="submit" className="rooms-create-submit" disabled={loading}>
            {loading ? "Creating..." : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Enter the Village
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
