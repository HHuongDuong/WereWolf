import type { GamePlayer } from "../../../stores/gameStore";

interface PlayerCardProps {
  player: GamePlayer;
  isYou?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
}

function avatarHue(username: string): number {
  let h = 0;
  for (let i = 0; i < username.length; i++) h = (h * 31 + username.charCodeAt(i)) & 0xffff;
  return h % 360;
}

export function PlayerCard({
  player,
  isYou,
  isSelected,
  onClick,
  actionLabel,
  actionDisabled,
}: PlayerCardProps) {
  const hue = avatarHue(player.username);
  const initial = player.username[0]?.toUpperCase() ?? "?";

  return (
    <div
      className={[
        "game-player-card",
        player.isAlive ? "" : "dead",
        isSelected ? "selected" : "",
        onClick ? "clickable" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={!player.isAlive || actionDisabled ? undefined : onClick}
    >
      <div
        className="game-player-avatar"
        style={{ background: `hsl(${hue},55%,35%)` }}
      >
        {initial}
      </div>
      <div className="game-player-info">
        <span className="game-player-card-name">{player.username}</span>
        {isYou && <span className="game-player-card-you">You</span>}
      </div>
      {!player.isAlive && (
        <span className="game-player-card-status">Eliminated</span>
      )}
      {actionLabel && player.isAlive && (
        <button
          className={`game-player-action-btn ${isSelected ? "selected" : ""}`}
          disabled={actionDisabled}
          onClick={e => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
