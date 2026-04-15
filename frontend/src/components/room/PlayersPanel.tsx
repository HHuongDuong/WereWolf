import { useRoom } from "../../context/RoomContext";
import { useGameStore } from "../../stores/gameStore";
import { useGuest } from "../../context/AuthContext";
import { PlayerSlot } from "./PlayerSlot";

export function PlayersPanel() {
  const {
    room,
    players,
    isHost,
    canStart,
    startGame,
    leaveRoom,
  } = useRoom();

  const { setPhase, setMyRole, setPlayers: setGamePlayers, nextRound } = useGameStore();
  const { guest } = useGuest();

  function devForceStart() {
    const mockPlayers = players.length > 0
      ? players.map(p => ({ guestId: p.guestId, displayName: p.displayName, isAlive: true }))
      : [{ guestId: guest.guestId, displayName: guest.displayName, isAlive: true }];
    setGamePlayers(mockPlayers);
    setMyRole("Werewolf");
    setPhase("role_reveal");
    setTimeout(() => { nextRound(); setPhase("night"); }, 5000);
  }

  const emptySlots = Math.max(0, room.maxPlayers - players.length);
  const minPlayers = 6;

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
            key={p.guestId}
            player={p}
            canKick={false}
            onKick={() => {}}
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
              `Need ${Math.max(0, minPlayers - players.length)} more player${minPlayers - players.length === 1 ? "" : "s"}…`
            )}
          </button>
        ) : (
          <button className="room-action-btn" onClick={leaveRoom}>
            Leave Room
          </button>
        )}
      </div>

      {import.meta.env.DEV && (
        <div className="dev-skip-bar">
          <button className="dev-skip-btn" onClick={devForceStart}>
            DEV: Force Start Game
          </button>
        </div>
      )}
    </div>
  );
}
