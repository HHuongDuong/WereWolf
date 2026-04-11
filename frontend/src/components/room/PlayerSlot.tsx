import type { Player } from "../../context/RoomContext";

export function PlayerSlot({
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
