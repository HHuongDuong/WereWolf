export type RoomStatus = "waiting" | "in-progress" | "full";
export type GameMode = "Classic" | "Extended" | "Speed";

export interface Room {
  id: string;
  name: string;
  host: string;
  players: number;
  maxPlayers: number;
  status: RoomStatus;
  mode: GameMode;
  hasPassword: boolean;
}

export function RoomCard({
  room,
  onJoin,
  style,
}: {
  room: Room;
  onJoin: () => void;
  style?: React.CSSProperties;
}) {
  const fill = room.players / room.maxPlayers;
  const canJoin = room.status === "waiting";

  return (
    <div className={`room-card ${room.status}`} style={style}>
      <div className="room-card-top">
        <div className="room-card-info">
          <div className="room-card-name">
            {room.hasPassword && (
              <svg className="room-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            )}
            {room.name}
          </div>
          <div className="room-card-host">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            {room.host}
          </div>
        </div>
        <span className={`room-status-badge room-status-${room.status}`}>
          {room.status === "waiting" ? "OPEN" : room.status === "full" ? "FULL" : "LIVE"}
        </span>
      </div>

      <div className="room-card-mid">
        <span className={`room-mode-badge room-mode-${room.mode.toLowerCase()}`}>{room.mode}</span>
      </div>

      <div className="room-card-bottom">
        <div className="room-players-info">
          <div className="room-players-bar-track">
            <div
              className="room-players-bar-fill"
              style={{ "--fill": `${fill * 100}%` } as React.CSSProperties}
            />
          </div>
          <span className="room-players-count">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {room.players}/{room.maxPlayers}
          </span>
        </div>
        <button
          className={`room-join-btn ${canJoin ? "" : "disabled"}`}
          onClick={canJoin ? onJoin : undefined}
          disabled={!canJoin}
        >
          {canJoin ? "Join" : room.status === "full" ? "Full" : "Live"}
        </button>
      </div>
    </div>
  );
}
