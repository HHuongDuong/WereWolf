import type { Room } from "../rooms/RoomCard";

/* Role → color mapping matching the real Wolfy CSS */
const ROLE_COLORS: Record<string, { bg: string; label: string }> = {
  wolf:    { bg: "#8b181a", label: "Wolf"     },
  village: { bg: "#124e8a", label: "Villager" },
  solo:    { bg: "#7a3b63", label: "Solo"     },
  seer:    { bg: "#124e8a", label: "Seer"     },
  special: { bg: "#7a3b63", label: "Special"  },
};

const ROLE_PRESETS: Record<string, { type: keyof typeof ROLE_COLORS }[]> = {
  Classic:  [{ type: "wolf" }, { type: "seer"    }, { type: "special" }, { type: "village" }],
  Extended: [{ type: "wolf" }, { type: "wolf"    }, { type: "special" }, { type: "seer"    }],
  Speed:    [{ type: "wolf" }, { type: "village" }, { type: "special" }, { type: "village" }],
};

interface GameListItemProps {
  room: Room;
  onJoin: () => void;
  skeleton?: boolean;
}

function slotStatus(players: number, max: number): "empty" | "half" | "full" {
  if (players === 0) return "empty";
  if (players >= max) return "full";
  return "half";
}

export function GameListItem({ room, onJoin, skeleton }: GameListItemProps) {
  if (skeleton) {
    return (
      <div className="game-list-item gli-skeleton">
        <div className="gli-creator-avatar gli-sk-avatar" />
        <div className="gli-properties">
          <div className="gli-sk-name" />
          <div className="gli-roles">
            {[0, 1, 2, 3].map(i => <span key={i} className="gli-role gli-sk-role" />)}
          </div>
        </div>
        <div className="gli-slots">
          <div className="gli-sk-pill" />
        </div>
      </div>
    );
  }

  const canJoin = room.status === "waiting";
  const roles = ROLE_PRESETS[room.mode] ?? ROLE_PRESETS.Classic!;
  const pill = slotStatus(room.players, room.maxPlayers);

  return (
    <div
      className={`game-list-item ${canJoin ? "clickable" : ""} ${room.status}`}
      onClick={canJoin ? onJoin : undefined}
      role={canJoin ? "button" : undefined}
    >
      {/* Left: creator avatar circle */}
      <div className="gli-creator-avatar">
        <svg viewBox="0 0 68 68" fill="none" width="68" height="68">
          <circle cx="34" cy="34" r="34" fill="#0e0e14" />
          <circle cx="34" cy="26" r="11" fill="#5e53d5" opacity="0.7" />
          <path d="M10 62c0-13.3 10.7-24 24-24s24 10.7 24 24" fill="#5e53d5" opacity="0.5" />
        </svg>
      </div>

      {/* Center: game name + role dots */}
      <div className="gli-properties">
        <p className="gli-name">{room.name}</p>
        <div className="gli-roles">
          {roles.map((r, i) => {
            const col = ROLE_COLORS[r.type] ?? ROLE_COLORS.village!;
            return (
              <span
                key={i}
                className="gli-role"
                style={{ background: col.bg }}
                title={col.label}
              />
            );
          })}
        </div>
      </div>

      {/* Right: slot count pill */}
      <div className="gli-slots">
        <div className={`gli-slots-pill ${pill}`}>
          <span className="gli-nb">{room.players}</span>
          <span className="gli-sep">/</span>
          <span className="gli-total">{room.maxPlayers}</span>
        </div>
      </div>
    </div>
  );
}
