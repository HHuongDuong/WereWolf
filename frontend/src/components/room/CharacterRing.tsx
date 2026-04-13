import { useRoom } from "../../context/RoomContext";

// Role → card SVG mapping
const ROLE_CARD: Record<string, string> = {
  Werewolf: "werewolf.svg",
  Villager:  "villager.svg",
  Seer:      "seer.svg",
  Witch:     "witch.svg",
  Hunter:    "hunter.svg",
  Cupid:     "cupid.svg",
  Guard:     "guard.svg",
};

function roleCard(role?: string) {
  if (role && ROLE_CARD[role]) return `/img/assets/cards/${ROLE_CARD[role]}`;
  return "/img/assets/character.svg";
}

interface SlotPlayer {
  id: string;
  username: string;
  isHost: boolean;
  isReady: boolean;
  isYou?: boolean;
  role?: string;
}

interface EmptySlot {
  id: string;
  isEmpty: true;
}

type Slot = SlotPlayer | EmptySlot;

function CharSlot({
  slot,
  lineClass,
  isHost: isHostUser,
  kickPlayer,
}: {
  slot: Slot;
  lineClass: string;
  isHost: boolean;
  kickPlayer: (id: string) => void;
}) {
  if ("isEmpty" in slot) {
    return (
      <div className={`camp-char camp-char--empty ${lineClass}`}>
        <img
          className="camp-char-img"
          src="/img/assets/character.svg"
          alt=""
          draggable={false}
        />
      </div>
    );
  }

  const p = slot as SlotPlayer;
  return (
    <div
      className={`camp-char ${p.isReady ? "camp-char--ready" : ""} ${p.isYou ? "camp-char--you" : ""} ${lineClass}`}
    >
      {/* Host badge */}
      {p.isHost && (
        <img
          className="camp-char-badge"
          src="/img/icons/badge.svg"
          alt="Host"
          title="Game host"
          draggable={false}
        />
      )}

      {/* Character image */}
      <img
        className="camp-char-img"
        src={roleCard(p.role)}
        alt={p.username}
        draggable={false}
      />

      {/* Name label */}
      <span className="camp-char-name">
        {p.username}
        {p.isYou && <span className="camp-char-you">You</span>}
      </span>

      {/* Kick button — host only, not self */}
      {isHostUser && !p.isYou && (
        <button
          className="camp-char-kick"
          title={`Kick ${p.username}`}
          onClick={() => kickPlayer(p.id)}
        >
          <img src="/img/icons/cross.svg" alt="kick" draggable={false} />
        </button>
      )}
    </div>
  );
}

export function CharacterRing() {
  const { players, room, isHost, kickPlayer } = useRoom();

  const totalSlots = room.maxPlayers;
  const filled: SlotPlayer[] = players as SlotPlayer[];
  const emptyCount = Math.max(0, totalSlots - filled.length);
  const empties: EmptySlot[] = Array.from({ length: emptyCount }, (_, i) => ({
    id: `empty-${i}`,
    isEmpty: true as const,
  }));

  const allSlots: Slot[] = [...filled, ...empties];

  // Distribute across 2 lines: back (smaller) and front (larger)
  // Front row: up to 6 slots; back row: the rest (up to 6)
  const frontCount = Math.min(allSlots.length, 6);
  const backCount  = Math.min(allSlots.length - frontCount, 6);

  const frontSlots = allSlots.slice(0, frontCount);
  const backSlots  = allSlots.slice(frontCount, frontCount + backCount);

  return (
    <>
      {/* Back row — secondLine sizing */}
      {backSlots.length > 0 && (
        <div className="camp-line camp-line--second">
          {backSlots.map(slot => (
            <CharSlot
              key={slot.id}
              slot={slot}
              lineClass=""
              isHost={isHost}
              kickPlayer={kickPlayer}
            />
          ))}
        </div>
      )}

      {/* Front row — firstLine sizing */}
      <div className="camp-line camp-line--first">
        {frontSlots.map(slot => (
          <CharSlot
            key={slot.id}
            slot={slot}
            lineClass=""
            isHost={isHost}
            kickPlayer={kickPlayer}
          />
        ))}
      </div>
    </>
  );
}
