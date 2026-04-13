import { useState } from "react";
import { useGuest } from "../../context/AuthContext";

const MOCK_FRIENDS = [
  { id: "f1", username: "LunaWolf",   online: true,  status: "In a game" },
  { id: "f2", username: "SeerMaster", online: true,  status: "Online"    },
  { id: "f3", username: "AlphaHowl",  online: false, status: "Offline"   },
];

export function SocialPanel() {
  const { guest } = useGuest();
  const [search, setSearch] = useState("");

  const filtered = MOCK_FRIENDS.filter(f =>
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="social-panel">
      {/* Profile section */}
      <div className="sp-profile">
        <div className="sp-avatar-wrap">
          <div className="sp-avatar">
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#252445"/>
              <circle cx="20" cy="15" r="7" fill="#5b5ef7" opacity="0.8"/>
              <path d="M6 36c0-7.7 6.3-14 14-14s14 6.3 14 14" fill="#5b5ef7" opacity="0.6"/>
            </svg>
          </div>
          <div className="sp-online-dot" />
        </div>
        <div className="sp-profile-info">
          <p className="sp-username">{guest.displayName}</p>
          <span className="sp-status">Online</span>
        </div>
      </div>

      {/* Search */}
      <div className="sp-search-wrap">
        <svg className="sp-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className="sp-search"
          type="text"
          placeholder="Find a friend"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Friends list */}
      <div className="sp-friends">
        {filtered.length === 0 && search === "" ? (
          <div className="sp-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p>Add your friends</p>
            <button className="sp-add-btn">+ Add a friend</button>
          </div>
        ) : (
          <>
            {filtered.map(f => (
              <div key={f.id} className={`sp-friend ${f.online ? "online" : "offline"}`}>
                <div className="sp-friend-avatar">
                  <svg viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="16" fill="#252445"/>
                    <circle cx="16" cy="12" r="5.5" fill="#5b5ef7" opacity="0.7"/>
                    <path d="M5 30c0-6.1 4.9-11 11-11s11 4.9 11 11" fill="#5b5ef7" opacity="0.5"/>
                  </svg>
                  <span className={`sp-friend-dot ${f.online ? "online" : ""}`} />
                </div>
                <div className="sp-friend-info">
                  <p className="sp-friend-name">{f.username}</p>
                  <span className="sp-friend-status">{f.status}</span>
                </div>
                {f.online && (
                  <button className="sp-friend-invite" title="Invite">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button className="sp-add-btn sp-add-inline">+ Add a friend</button>
          </>
        )}
      </div>
    </div>
  );
}
