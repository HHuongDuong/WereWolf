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
  guestId: string;
  displayName: string;
  isHost: boolean;
  isYou?: boolean;
  role?: string;
}

interface EmptySlot {
  guestId: string;
  isEmpty: true;
}

type Slot = SlotPlayer | EmptySlot;

function CharSlot({
  slot,
  lineClass,
}: {
  slot: Slot;
  lineClass: string;
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
      className={`camp-char ${p.isYou ? "camp-char--you" : ""} ${lineClass}`}
    >
      {p.isHost && (
        <img
          className="camp-char-badge"
          src="/img/icons/badge.svg"
          alt="Host"
          title="Game host"
          draggable={false}
        />
      )}

      <img
        className="camp-char-img"
        src={roleCard(p.role)}
        alt={p.displayName}
        draggable={false}
      />

      <span className="camp-char-name">
        {p.displayName}
        {p.isYou && <span className="camp-char-you">You</span>}
      </span>
    </div>
  );
}

export function CharacterRing() {
  const { players, room } = useRoom();

  const totalSlots = room.maxPlayers;
  const filled: SlotPlayer[] = players as SlotPlayer[];
  const emptyCount = Math.max(0, totalSlots - filled.length);
  const empties: EmptySlot[] = Array.from({ length: emptyCount }, (_, i) => ({
    guestId: `empty-${i}`,
    isEmpty: true as const,
  }));

  const allSlots: Slot[] = [...filled, ...empties];

  const frontCount = Math.min(allSlots.length, 6);
  const backCount  = Math.min(allSlots.length - frontCount, 6);

  const frontSlots = allSlots.slice(0, frontCount);
  const backSlots  = allSlots.slice(frontCount, frontCount + backCount);

  return (
    <>
      {backSlots.length > 0 && (
        <div className="camp-line camp-line--second">
          {backSlots.map(slot => (
            <CharSlot
              key={slot.guestId}
              slot={slot}
              lineClass=""
            />
          ))}
        </div>
      )}

      <div className="camp-line camp-line--first">
        {frontSlots.map(slot => (
          <CharSlot
            key={slot.guestId}
            slot={slot}
            lineClass=""
          />
        ))}
      </div>
    </>
  );
}
