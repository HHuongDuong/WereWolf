import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoomsHero } from "../components/rooms/RoomsHero";
import { RoomsToolbar } from "../components/rooms/RoomsToolbar";
import { RoomCard, type Room, type GameMode } from "../components/rooms/RoomCard";
import { CreateRoomModal } from "../components/rooms/CreateRoomModal";

const MOCK_ROOMS: Room[] = [
  { id: "r1", name: "Midnight Hunt",       host: "LunaWolf",    players: 7,  maxPlayers: 12, status: "waiting",     mode: "Classic",  hasPassword: false },
  { id: "r2", name: "Village at Dusk",     host: "SeerMaster",  players: 12, maxPlayers: 12, status: "full",        mode: "Extended", hasPassword: false },
  { id: "r3", name: "Blood Moon Rising",   host: "AlphaHowl",   players: 4,  maxPlayers: 8,  status: "in-progress", mode: "Speed",    hasPassword: true  },
  { id: "r4", name: "Forest of Shadows",   host: "CursedOne",   players: 3,  maxPlayers: 10, status: "waiting",     mode: "Classic",  hasPassword: false },
  { id: "r5", name: "Silver Blade Guild",  host: "HunterX",     players: 9,  maxPlayers: 16, status: "waiting",     mode: "Extended", hasPassword: true  },
  { id: "r6", name: "Howling Pit",         host: "PackLeader",  players: 6,  maxPlayers: 8,  status: "waiting",     mode: "Speed",    hasPassword: false },
];

export function RoomsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "waiting" | "in-progress">("all");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = MOCK_ROOMS.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase())
                     || r.host.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.status === filter;
    return matchSearch && matchFilter;
  });

  function handleCreate(data: { name: string; maxPlayers: string; mode: GameMode; password: string }) {
    // TODO: wire to backend — create room and navigate to it
    void data;
    setShowCreate(false);
    navigate("/rooms/r1");
  }

  return (
    <div className="rooms-page">
      <RoomsHero
        waitingCount={MOCK_ROOMS.filter(r => r.status === "waiting").length}
        inProgressCount={MOCK_ROOMS.filter(r => r.status === "in-progress").length}
      />

      <div className="rooms-main">
        <RoomsToolbar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          onCreateClick={() => setShowCreate(true)}
        />

        {filtered.length === 0 ? (
          <div className="rooms-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><path d="M8 15s1.5-2 4-2 4 2 4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            <p>No rooms found</p>
            <span>Try a different filter or create your own room</span>
          </div>
        ) : (
          <div className="rooms-grid">
            {filtered.map((room, i) => (
              <RoomCard
                key={room.id}
                room={room}
                style={{ "--delay": `${i * 0.05}s` } as React.CSSProperties}
                onJoin={() => navigate(`/rooms/${room.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
