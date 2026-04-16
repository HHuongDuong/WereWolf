import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayHeader } from "../components/play/PlayHeader";
import { StartGameCard } from "../components/play/StartGameCard";
import { GameListItem } from "../components/play/GameListItem";
import { AvatarPreview } from "../components/play/AvatarPreview";
import { SocialPanel } from "../components/play/SocialPanel";
import { useWs } from "../context/WsContext";
import { useGuest } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { Room, GameMode } from "../components/rooms/RoomCard";

const ROOMS: Room[] = [];

export function RoomsPage() {
  const navigate = useNavigate();
  const { send, on } = useWs();
  const { guest } = useGuest();
  const { toast } = useToast();
  const [tab, setTab] = useState<"public" | "private">("public");
  const [creating, setCreating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleRooms = ROOMS.filter(r =>
    tab === "private" ? r.hasPassword : !r.hasPassword
  );

  function handlePlay() {
    // disabled — no room auto-join yet
  }

  function handleCreate(data?: { name: string; maxPlayers: string; mode: GameMode; password: string }) {
    void data;
    if (creating) return;
    setCreating(true);

    function cleanup() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      unsubRoom();
      unsubErr();
      setCreating(false);
    }

    // Navigate on first ROOM_UPDATED after CREATE_ROOM
    const unsubRoom = on("ROOM_UPDATED", (msg) => {
      cleanup();
      navigate(`/rooms/${msg.roomId}`);
    });

    // Surface gateway validation / service errors immediately
    const unsubErr = on("ERROR", (msg) => {
      cleanup();
      toast(`${msg.code}: ${msg.message}`, "error");
    });

    // Timeout fallback — likely Kafka not running if we get here
    timeoutRef.current = setTimeout(() => {
      cleanup();
      toast("No response from gateway. Check that Kafka and gateway_service are running.", "error");
    }, 8000);

    send({
      type: "CREATE_ROOM",
      guestId: guest.guestId,
      displayName: guest.displayName,
    });
  }

  return (
    <>
    <PlayHeader />
    <section className="play-page" style={{ backgroundImage: "url('/img/assets/scene_elements/scene_night.svg')", backgroundPosition: "50% 80%", backgroundSize: "cover" }}>
      {/* Scene gradient overlay */}
      <div className="play-gradient" />

      {/* ── Left panel ── */}
      <aside className="play-left">
        <StartGameCard
          tab={tab}
          onTabChange={setTab}
          onPlay={handlePlay}
          onCreateClick={() => handleCreate()}
        />

        <div className="play-list-header">
          <span className="play-list-title">Join a game</span>
        </div>

        <div className="play-list">
          {visibleRooms.length === 0 ? (
            <>
              {[0, 1, 2, 3].map(i => (
                <GameListItem key={i} room={{} as Room} onJoin={() => {}} skeleton />
              ))}
            </>
          ) : (
            visibleRooms.map(room => (
              <GameListItem
                key={room.id}
                room={room}
                onJoin={() => navigate(`/rooms/${room.id}`)}
              />
            ))
          )}
        </div>

        {/* Moon Pass drop banner */}
        <div className="play-drop-banner">
          <div className="pdb-overflow">
            <img src="/img/assets/moon.svg" alt="" className="pdb-moon" />
          </div>
          <div className="pdb-border" />
          <div className="pdb-left">
            <img src="/img/assets/skin-top1.svg" alt="Skin" className="pdb-skin" />
            <img src="/img/assets/skin-top2.svg" alt="Skin" className="pdb-skin" />
          </div>
          <div className="pdb-right">
            <div className="pdb-countdown">
              <span className="pdb-timer-text">18 days</span>
            </div>
            <a className="pdb-cta" href="/shop">
              <span>Moon Pass</span>
            </a>
          </div>
        </div>
      </aside>

      {/* ── Center: avatar scene ── */}
      <main className="play-center">
        <AvatarPreview />
      </main>

      {/* ── Right: social panel ── */}
      <aside className="play-right">
        <SocialPanel />
      </aside>

    </section>
    </>
  );
}
