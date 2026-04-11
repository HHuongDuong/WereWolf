export function RoomsHero({
  waitingCount,
  inProgressCount,
}: {
  waitingCount: number;
  inProgressCount: number;
}) {
  return (
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
            <span className="rooms-stat-value">{waitingCount}</span>
            <span className="rooms-stat-label">Open Rooms</span>
          </div>
          <div className="rooms-stat-sep" />
          <div className="rooms-stat">
            <span className="rooms-stat-value">{inProgressCount}</span>
            <span className="rooms-stat-label">In Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
}
