import { useState, useEffect } from "react";

interface Player {
  rank: number;
  username: string;
  elo: number;
  premium: boolean;
  avatar: string;
}

const players: Player[] = [
  { rank: 1, username: "Peregrint",   elo: 1245, premium: true,  avatar: "/img/assets/skin-top1-profile.png" },
  { rank: 2, username: "Bulletheart", elo: 1139, premium: false, avatar: "/img/assets/skin-top2-profile.png" },
  { rank: 3, username: "Ultralex",    elo: 997,  premium: true,  avatar: "/img/assets/skin-top3-profile.png" },
  { rank: 4, username: "Ainz",        elo: 836,  premium: false, avatar: "/img/assets/skin-ainz.png" },
  { rank: 5, username: "Valand",      elo: 824,  premium: true,  avatar: "/img/assets/skin-valand.png" },
  { rank: 6, username: "Santithur",   elo: 782,  premium: false, avatar: "/img/assets/skin-santithur.png" },
];

function getCountdownParts() {
  const now = Date.now();
  const target = new Date("2026-05-02T22:00:00Z").getTime();
  const diff = Math.max(0, target - now);
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export function Leaderboard() {
  const [countdown, setCountdown] = useState(getCountdownParts());

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdownParts()), 1000);
    return () => clearInterval(id);
  }, []);

  const { days, hours, minutes, seconds } = countdown;

  return (
    <section className="leaderboard">
      <div className="leaderboard-inner">
        <div className="leaderboard-header">
          <h2>Progress in the ranking</h2>
          <p>Show that you are the best before the next full moon.</p>
        </div>

        <div className="leaderboard-content">
          {/* Podium */}
          <div className="lb-podium-container">
            <div className="lb-podium">
              <img className="lb-podium-svg" src="/img/assets/podium.svg" alt="Podium" />
              <img className="lb-character lb-second" src="/img/assets/skin-top2.svg" alt="Character" />
              <img className="lb-character lb-first"  src="/img/assets/skin-top1.svg" alt="Character" />
              <img className="lb-character lb-third"  src="/img/assets/skin-top3.svg" alt="Character" />
            </div>
          </div>

          {/* Rankings box */}
          <div className="leaderboard-box">
            {/* Countdown pill */}
            <div className="countdown-bar">
              <img src="/img/icons/hourglass.svg" alt="" className="countdown-icon" />
              <span className="countdown-value">
                {days}j {pad(hours)}:{pad(minutes)}:<span>{pad(seconds)}</span>
              </span>
            </div>

            {/* Table header */}
            <div className="lb-table-header">
              <div className="lb-col-rank">Rank</div>
              <div className="lb-col-player">Player</div>
              <div className="lb-col-elo">Laurels</div>
            </div>

            {/* Rows */}
            <div className="lb-scrollable">
              {players.map(p => (
                <div key={p.username} className="lb-row">
                  <div className="lb-col-rank lb-rank-num">{p.rank}</div>

                  <div className="lb-col-player lb-player">
                    <div className={`lb-avatar-container${p.premium ? " lb-premium" : ""}`}>
                      <img className="lb-avatar" src={p.avatar} alt={p.username} draggable={false} />
                    </div>
                    <span className="lb-username">{p.username}</span>
                    {p.premium && <span className="lb-premium-badge">PRO</span>}
                  </div>

                  <div className="lb-col-elo lb-elo">
                    <img src="/img/icons/leaderboard-icon.svg" alt="" className="lb-elo-icon" />
                    <span className="lb-elo-num">{p.elo}</span>
                  </div>
                </div>
              ))}
              <div className="lb-gradient" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
