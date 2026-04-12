import { useRoom } from "../../context/RoomContext";

function avatarHue(username: string) {
  return username.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
}

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

export function CharacterRing() {
  const { players, room, isHost, kickPlayer } = useRoom();

  // Build slots: real players + empty padding up to maxPlayers
  const slots = [
    ...players,
    ...Array.from({ length: Math.max(0, room.maxPlayers - players.length) }, (_, i) => ({
      id: `empty-${i}`,
      username: "",
      isHost: false,
      isReady: false,
      isEmpty: true,
    })),
  ];

  return (
    <div className="character-ring">
      {slots.map((slot) => {
        if ("isEmpty" in slot && slot.isEmpty) {
          return (
            <div key={slot.id} className="char-slot char-slot--empty">
              <div className="char-avatar char-avatar--empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <span className="char-name char-name--empty">Waiting…</span>
            </div>
          );
        }

        const p = slot as typeof players[0];
        const hue = avatarHue(p.username);

        return (
          <div
            key={p.id}
            className={`char-slot ${p.isReady ? "char-slot--ready" : ""} ${p.isYou ? "char-slot--you" : ""}`}
          >
            {/* Crown */}
            {p.isHost && (
              <div className="char-crown" title="Host">
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                  <path d="M2 19h20v2H2zM3 13l4-8 5 5 5-5 4 8H3z" />
                </svg>
              </div>
            )}

            {/* Avatar circle */}
            <div
              className="char-avatar"
              style={{ "--hue": hue } as React.CSSProperties}
            >
              {initials(p.username)}
              {p.isReady && <div className="char-ready-ring" />}
            </div>

            {/* Name */}
            <span className="char-name">
              {p.username}
              {p.isYou && <span className="char-you-tag">You</span>}
            </span>

            {/* Kick button (host only, not on self) */}
            {isHost && !p.isYou && (
              <button
                className="char-kick"
                title={`Kick ${p.username}`}
                onClick={() => kickPlayer(p.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
