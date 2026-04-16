import { useGuest } from "../../context/AuthContext";

export function SocialPanel() {
  const { guest } = useGuest();

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

{/* Friends list */}
      <div className="sp-friends">
        <div className="sp-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <p>Add your friends</p>
          <button className="sp-add-btn">+ Add a friend</button>
        </div>
      </div>
    </div>
  );
}
