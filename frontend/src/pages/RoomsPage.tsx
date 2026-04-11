import { useState } from "react";
import { useNavigate } from "react-router-dom";

type RoomStatus = "waiting" | "in-progress" | "full";
type GameMode = "Classic" | "Extended" | "Speed";

interface Room {
  id: string;
  name: string;
  host: string;
  players: number;
  maxPlayers: number;
  status: RoomStatus;
  mode: GameMode;
  hasPassword: boolean;
}

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
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<"all" | "waiting" | "in-progress">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom]     = useState({ name: "", maxPlayers: "10", mode: "Classic" as GameMode, password: "" });

  const filtered = MOCK_ROOMS.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase())
                     || r.host.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.status === filter;
    return matchSearch && matchFilter;
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire to backend — create room and navigate to it
    setShowCreate(false);
    navigate("/rooms/r1");
  }

  return (
    <div className="rooms-page">
      {/* ── Hero Banner ── */}
      <div className="rooms-hero">
        <div className="rooms-hero-stars" aria-hidden="true">
          {Array.from({ length: 50 }).map((_, i) => (
            <span key={i} className="rooms-hero-star" style={{
              "--x": `${Math.random() * 100}%`,
              "--y": `${Math.random() * 60}%`,
              "--d": `${(Math.random() * 4 + 1.5).toFixed(2)}s`,
              "--s": `${(Math.random() * 2 + 0.8).toFixed(1)}px`,
            } as React.CSSProperties} />
          ))}
        </div>
        <div className="rooms-hero-trees" aria-hidden="true">
          <svg viewBox="0 0 1280 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 120 L0 80 L15 50 L30 80 L35 60 L50 20 L65 60 L70 45 L85 10 L100 45 L100 75 L115 40 L130 75 L130 120 Z" fill="#0a0917" opacity="0.95"/>
            <path d="M120 120 L120 85 L135 55 L150 85 L155 65 L170 25 L185 65 L190 50 L205 12 L220 50 L220 80 L240 48 L255 80 L265 120 Z" fill="#0a0917" opacity="0.9"/>
            <path d="M240 120 L240 88 L260 58 L280 88 L285 68 L305 28 L325 68 L330 52 L350 14 L370 52 L375 82 L400 50 L420 82 L430 120 Z" fill="#0a0917" opacity="0.95"/>
            <path d="M400 120 L400 90 L430 60 L460 90 L465 70 L495 30 L525 70 L530 54 L560 16 L590 54 L595 84 L620 52 L645 84 L660 120 Z" fill="#0a0917" opacity="0.88"/>
            <path d="M620 120 L620 85 L655 52 L690 85 L695 68 L730 25 L765 68 L770 50 L805 10 L840 50 L845 80 L870 48 L900 80 L915 120 Z" fill="#0a0917" opacity="0.92"/>
            <path d="M880 120 L880 88 L910 56 L940 88 L945 68 L975 28 L1005 68 L1010 52 L1040 14 L1070 52 L1075 82 L1100 50 L1125 82 L1140 120 Z" fill="#0a0917" opacity="0.9"/>
            <path d="M1100 120 L1100 82 L1135 50 L1165 82 L1170 62 L1200 22 L1230 62 L1235 46 L1265 8 L1280 40 L1280 120 Z" fill="#0a0917" opacity="0.95"/>
          </svg>
        </div>
        <div className="rooms-hero-content">
          <h1 className="rooms-hero-title font-display">The Village Square</h1>
          <p className="rooms-hero-subtitle">Choose your fate — join a hunt or start your own</p>
          <div className="rooms-hero-stats">
            <div className="rooms-stat">
              <span className="rooms-stat-value">247</span>
              <span className="rooms-stat-label">Online</span>
            </div>
            <div className="rooms-stat-sep" />
            <div className="rooms-stat">
              <span className="rooms-stat-value">{MOCK_ROOMS.filter(r => r.status === "waiting").length}</span>
              <span className="rooms-stat-label">Open Rooms</span>
            </div>
            <div className="rooms-stat-sep" />
            <div className="rooms-stat">
              <span className="rooms-stat-value">{MOCK_ROOMS.filter(r => r.status === "in-progress").length}</span>
              <span className="rooms-stat-label">In Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="rooms-main">
        {/* Toolbar */}
        <div className="rooms-toolbar">
          <div className="rooms-search-wrap">
            <svg className="rooms-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="rooms-search"
              placeholder="Search rooms or hosts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="rooms-filters">
            {(["all", "waiting", "in-progress"] as const).map(f => (
              <button
                key={f}
                className={`rooms-filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f === "waiting" ? "Open" : "In Progress"}
              </button>
            ))}
          </div>

          <button className="rooms-create-btn" onClick={() => setShowCreate(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Create Room
          </button>
        </div>

        {/* Room grid */}
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

      {/* ── Create Room Modal ── */}
      {showCreate && (
        <div className="rooms-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="rooms-modal" onClick={e => e.stopPropagation()}>
            <div className="rooms-modal-header">
              <h2 className="font-display">Create a Room</h2>
              <button className="rooms-modal-close" onClick={() => setShowCreate(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <form className="rooms-modal-form" onSubmit={handleCreate}>
              <div className="rooms-form-field">
                <label className="rooms-form-label">Room Name</label>
                <input
                  className="rooms-form-input"
                  placeholder="Name your village..."
                  value={newRoom.name}
                  onChange={e => setNewRoom(r => ({ ...r, name: e.target.value }))}
                  required
                />
              </div>
              <div className="rooms-form-row">
                <div className="rooms-form-field">
                  <label className="rooms-form-label">Max Players</label>
                  <select
                    className="rooms-form-input"
                    value={newRoom.maxPlayers}
                    onChange={e => setNewRoom(r => ({ ...r, maxPlayers: e.target.value }))}
                  >
                    {[6, 8, 10, 12, 16].map(n => <option key={n} value={n}>{n} players</option>)}
                  </select>
                </div>
                <div className="rooms-form-field">
                  <label className="rooms-form-label">Game Mode</label>
                  <select
                    className="rooms-form-input"
                    value={newRoom.mode}
                    onChange={e => setNewRoom(r => ({ ...r, mode: e.target.value as GameMode }))}
                  >
                    <option value="Classic">Classic</option>
                    <option value="Extended">Extended</option>
                    <option value="Speed">Speed</option>
                  </select>
                </div>
              </div>
              <div className="rooms-form-field">
                <label className="rooms-form-label">
                  Password <span className="rooms-form-optional">(optional — leave blank for public)</span>
                </label>
                <input
                  className="rooms-form-input"
                  type="password"
                  placeholder="Secret passphrase..."
                  value={newRoom.password}
                  onChange={e => setNewRoom(r => ({ ...r, password: e.target.value }))}
                />
              </div>
              <button type="submit" className="rooms-create-submit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Enter the Village
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RoomCard({
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
