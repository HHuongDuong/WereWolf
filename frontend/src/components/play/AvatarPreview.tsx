import { useAuth } from "../../context/AuthContext";

export function AvatarPreview() {
  const { user } = useAuth();
  const username = user?.username ?? "Guest";

  return (
    <div className="avatar-preview-box">
      {/* User tag: level + name + settings — sits at top */}
      <div className="ap-user-tag-row">
        <div className="ap-user-tag">
          <div className="ap-level-badge">1</div>
          <p className="ap-username">{username}</p>
        </div>
        <button className="ap-settings-btn" title="Settings">
          <img src="/img/icons/settings.svg" alt="Settings" className="ap-settings-icon" />
        </button>
      </div>

      {/* Character skin */}
      <img
        src="/img/assets/skin-top1.svg"
        alt="Skin"
        className="ap-skin-render"
        draggable={false}
      />

      {/* Platform under character */}
      <div className="ap-platform" style={{ backgroundImage: "url('/img/assets/plateform.svg')" }} />

      {/* Elo box */}
      <a className="ap-elo-box" href="/leaderboard" title="Laurels">
        <img src="/img/assets/eloBg.svg" alt="" className="ap-elo-bg" />
        <img src="/img/icons/leaderboard-icon.svg" alt="" className="ap-elo-icon" />
        <p className="ap-elo-num">0</p>
      </a>
    </div>
  );
}
