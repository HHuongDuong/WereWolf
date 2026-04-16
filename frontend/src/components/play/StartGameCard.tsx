interface StartGameCardProps {
  tab: "public" | "private";
  onTabChange: (tab: "public" | "private") => void;
  onPlay: () => void;
  onCreateClick: () => void;
}

export function StartGameCard({ tab, onTabChange, onPlay, onCreateClick }: StartGameCardProps) {
  return (
    <div className="start-game-card">
      {/* Background logo watermark */}
      <div className="sgc-bg">
        <img src="/img/assets/logo-gradient.svg" alt="" className="sgc-logo-bg" />
      </div>

      {/* Floating action buttons — positioned above the card top edge */}
      <div className="sgc-actions">
        <button className="sgc-play-btn" onClick={onPlay} disabled>
          <img src="/img/icons/play-button.svg" alt="Play" className="sgc-btn-icon" />
          <span>Play</span>
        </button>
        <button className="sgc-create-btn" onClick={onCreateClick}>
          <img src="/img/icons/create-game.svg" alt="Create new game" className="sgc-btn-icon" />
          <span className="sgc-create-text">Create</span>
        </button>
      </div>

      {/* Public / Private switch */}
      <div className={`sgc-switch ${tab === "public" ? "is-first" : "is-second"}`}>
        <div className="sgc-switch-bg" />
        <div
          className={`sgc-tab ${tab === "public" ? "active" : ""}`}
          onClick={() => onTabChange("public")}
        >
          Public
        </div>
        <div
          className={`sgc-tab ${tab === "private" ? "active" : ""}`}
          onClick={() => onTabChange("private")}
        >
          Private
        </div>
      </div>
    </div>
  );
}
