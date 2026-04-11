import { useState, useEffect } from "react";

interface Player {
  rank: number;
  username: string;
  elo: number;
  premium: boolean;
  avatarColor: string;
}

const players: Player[] = [
  { rank: 1, username: "Peregrint",   elo: 1245, premium: true,  avatarColor: "#4f7dff" },
  { rank: 2, username: "Bulletheart", elo: 1139, premium: false, avatarColor: "#c43a3a" },
  { rank: 3, username: "Ultralex",    elo: 997,  premium: true,  avatarColor: "#d4943a" },
  { rank: 4, username: "Ainz",        elo: 836,  premium: false, avatarColor: "#7c4dff" },
  { rank: 5, username: "Valand",      elo: 824,  premium: true,  avatarColor: "#3d8bc4" },
  { rank: 6, username: "Santithur",   elo: 782,  premium: false, avatarColor: "#4caf50" },
];

const rankClass: Record<number, string> = {
  1: "gold",
  2: "silver",
  3: "bronze",
};

// Target: 21 days 3h 49m 12s from a fixed reference
function getCountdownParts(): { days: number; hours: number; minutes: number; seconds: number } {
  const now = Date.now();
  // next full moon anchor — just count down from a static future time
  const target = new Date("2026-05-02T22:00:00Z").getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

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

        <div className="leaderboard-box">
          {/* Countdown */}
          <div className="countdown-bar">
            <img src="/img/icons/hourglass.svg" alt="" className="countdown-icon" />
            <span className="countdown-label">Next full moon in</span>
            <span className="countdown-value">
              {days}:{pad(hours)}:{pad(minutes)}:{pad(seconds)}
            </span>
          </div>

          {/* Table header */}
          <div className="lb-table-header">
            <span>Rank</span>
            <span>Player</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <img src="/img/icons/leaderboard-icon.svg" alt="" className="lb-icon-header" />
              Laurels
            </span>
          </div>

          {/* Rows */}
          {players.map((p) => (
            <div key={p.username} className="lb-row">
              <span className={`lb-rank ${rankClass[p.rank] ?? ""}`}>
                {p.rank}
              </span>

              <div className="lb-player">
                <div className="lb-avatar">
                  <div
                    className="lb-avatar-placeholder"
                    style={{ background: p.avatarColor + "33", color: p.avatarColor }}
                  >
                    {p.username[0]}
                  </div>
                </div>
                <span className="lb-username">{p.username}</span>
                {p.premium && <span className="lb-premium-badge">PRO</span>}
              </div>

              <div className="lb-elo">
                {p.elo}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
