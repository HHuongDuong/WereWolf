import { useRoom } from "../../context/RoomContext";
import { PlayerSlot } from "./PlayerSlot";

export function PlayersPanel() {
  const {
    room,
    players,
    isHost,
    isReady,
    readyCount,
    canStart,
    toggleReady,
    kickPlayer,
    startGame,
  } = useRoom();

  const emptySlots = Math.max(0, room.maxPlayers - players.length);

  return (
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
  );
}
