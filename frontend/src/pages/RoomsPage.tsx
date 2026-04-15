import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayHeader } from "../components/play/PlayHeader";
import { StartGameCard } from "../components/play/StartGameCard";
import { GameListItem } from "../components/play/GameListItem";
import { AvatarPreview } from "../components/play/AvatarPreview";
import { SocialPanel } from "../components/play/SocialPanel";
import { CreateRoomModal } from "../components/rooms/CreateRoomModal";
import type { Room, GameMode } from "../components/rooms/RoomCard";

const MOCK_ROOMS: Room[] = [
  { id: "r1", name: "Midnight Hunt",       host: "LunaWolf",    players: 7,  maxPlayers: 12, status: "waiting",     mode: "Classic",  hasPassword: false },
  { id: "r2", name: "Village at Dusk",     host: "SeerMaster",  players: 12, maxPlayers: 12, status: "full",        mode: "Extended", hasPassword: false },
  { id: "r3", name: "Blood Moon Rising",   host: "AlphaHowl",   players: 4,  maxPlayers: 8,  status: "in-progress", mode: "Speed",    hasPassword: true  },
  { id: "r4", name: "Forest of Shadows",   host: "CursedOne",   players: 3,  maxPlayers: 10, status: "waiting",     mode: "Classic",  hasPassword: false },
  { id: "r5", name: "Silver Blade Guild",  host: "HunterX",     players: 9,  maxPlayers: 16, status: "waiting",     mode: "Extended", hasPassword: true  },
  { id: "r6", name: "Howling Pit",         host: "PackLeader",  players: 6,  maxPlayers: 8,  status: "waiting",     mode: "Speed",    hasPassword: false },
  { id: "r7", name: "Witch's Cauldron",    host: "WitchKraft",  players: 5,  maxPlayers: 10, status: "waiting",     mode: "Classic",  hasPassword: false },
  { id: "r8", name: "Dark Forest Run",     host: "ShadowPaw",   players: 2,  maxPlayers: 8,  status: "waiting",     mode: "Speed",    hasPassword: false },
];

export function RoomsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"public" | "private">("public");
  const [showCreate, setShowCreate] = useState(false);

  const visibleRooms = MOCK_ROOMS.filter(r =>
    tab === "private" ? r.hasPassword : !r.hasPassword
  );

  function handlePlay() {
    const open = MOCK_ROOMS.find(r => r.status === "waiting");
    if (open) navigate(`/rooms/${open.id}`);
  }

  function handleCreate(data: { name: string; maxPlayers: string; mode: GameMode; password: string }) {
    void data;
    setShowCreate(false);
    navigate("/rooms/r1");
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
          onCreateClick={() => setShowCreate(true)}
        />

        <div className="play-list-header">
          <span className="play-list-title">Join a game</span>
        </div>

        <div className="play-list">
          {visibleRooms.length === 0 ? (
            <>
              {[0, 1, 2, 3].map(i => (
                <GameListItem key={i} room={MOCK_ROOMS[0]!} onJoin={() => {}} skeleton />
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

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}
    </section>
    </>
  );
}
