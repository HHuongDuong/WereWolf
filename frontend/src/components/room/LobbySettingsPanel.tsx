import { useState } from "react";
import type { CSSProperties } from "react";
import { useRoom } from "../../context/RoomContext";

function avatarHue(username: string) {
  return username.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
}
function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

interface RoleCard {
  name: string;
  short: string;
  color: string;
  count: number;
  min: number;
  max: number;
}

const DEFAULT_PRIMARY: RoleCard[] = [
  { name: "Werewolf", short: "WW", color: "#c43a3a", count: 2, min: 1, max: 6 },
  { name: "Villager", short: "VI", color: "#3d8bc4", count: 6, min: 2, max: 12 },
];

const DEFAULT_SPECIAL: RoleCard[] = [
  { name: "Seer",    short: "SE", color: "#5b5ef7", count: 1, min: 0, max: 1 },
  { name: "Witch",   short: "WI", color: "#7a3b63", count: 0, min: 0, max: 1 },
  { name: "Hunter",  short: "HU", color: "#d4943a", count: 1, min: 0, max: 1 },
  { name: "Cupid",   short: "CU", color: "#e07080", count: 0, min: 0, max: 1 },
  { name: "Guard",   short: "GU", color: "#3d8bc4", count: 0, min: 0, max: 1 },
  { name: "Elder",   short: "EL", color: "#92bb00", count: 0, min: 0, max: 1 },
];

export function LobbySettingsPanel() {
  const { room, players, isHost } = useRoom();
  const host = players.find(p => p.isHost);

  const [maxPlayers, setMaxPlayers] = useState(room.maxPlayers);
  const [composition, setComposition] = useState(50);
  const [primary, setPrimary] = useState<RoleCard[]>(DEFAULT_PRIMARY);
  const [special, setSpecial] = useState<RoleCard[]>(DEFAULT_SPECIAL);

  function adjustRole(
    list: RoleCard[],
    setList: React.Dispatch<React.SetStateAction<RoleCard[]>>,
    name: string,
    delta: number,
  ) {
    if (!isHost) return;
    setList(l =>
      l.map(r =>
        r.name === name
          ? { ...r, count: Math.max(r.min, Math.min(r.max, r.count + delta)) }
          : r,
      ),
    );
  }

  const compositionLabel =
    composition < 35 ? "Wolfpack" : composition > 65 ? "Village" : "Balanced";

  return (
    <div className="lobby-settings-panel">
      {/* Header — host info */}
      <div className="lsp-header">
        <div
          className="lsp-host-avatar"
          style={{ "--hue": avatarHue(host?.username ?? "H") } as CSSProperties}
        >
          {initials(host?.username ?? "HO")}
        </div>
        <div className="lsp-host-info">
          <span className="lsp-host-name">{host?.username ?? "Host"}</span>
          <div className="lsp-host-badges">
            <span className="lsp-badge lsp-badge--host">Host</span>
            <span className="lsp-badge lsp-badge--count">{players.length} players</span>
          </div>
        </div>
      </div>

      <div className="lsp-body">
        {/* Number of players */}
        <div className="lsp-section">
          <span className="lsp-section-title">Number of players</span>
          <div className="lsp-stepper">
            <button
              className="lsp-stepper-arrow"
              onClick={() => isHost && setMaxPlayers(n => Math.max(5, n - 1))}
              disabled={maxPlayers <= 5 || !isHost}
            >‹</button>
            {[-1, 0, 1].map(offset => {
              const n = maxPlayers + offset;
              if (n < 5 || n > 18) return <div key={offset} className="lsp-stepper-spacer" />;
              return (
                <button
                  key={offset}
                  className={`lsp-stepper-num ${offset === 0 ? "active" : ""}`}
                  onClick={() => isHost && setMaxPlayers(n)}
                >
                  {n}
                </button>
              );
            })}
            <button
              className="lsp-stepper-arrow"
              onClick={() => isHost && setMaxPlayers(n => Math.min(18, n + 1))}
              disabled={maxPlayers >= 18 || !isHost}
            >›</button>
          </div>
        </div>

        {/* Composition */}
        <div className="lsp-section">
          <div className="lsp-section-head">
            <span className="lsp-section-title">Composition</span>
            <span className="lsp-composition-label">{compositionLabel}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={composition}
            onChange={e => isHost && setComposition(+e.target.value)}
            className="lsp-slider"
            disabled={!isHost}
          />
        </div>

        {/* Primary roles */}
        <div className="lsp-section">
          <span className="lsp-section-title">Primary roles</span>
          <div className="lsp-roles-grid">
            {primary.map(role => (
              <div key={role.name} className="lsp-role-card">
                <div className="lsp-role-portrait" style={{ background: role.color }}>
                  {role.short}
                  <span className="lsp-role-count-badge">{role.count}</span>
                </div>
                <span className="lsp-role-name">{role.name}</span>
                {isHost && (
                  <div className="lsp-role-btns">
                    <button
                      onClick={() => adjustRole(primary, setPrimary, role.name, -1)}
                      disabled={role.count <= role.min}
                    >−</button>
                    <button
                      onClick={() => adjustRole(primary, setPrimary, role.name, +1)}
                      disabled={role.count >= role.max}
                    >+</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Special roles */}
        <div className="lsp-section">
          <span className="lsp-section-title">Special roles</span>
          <div className="lsp-roles-grid">
            {special.map(role => (
              <div
                key={role.name}
                className={`lsp-role-card ${role.count === 0 ? "lsp-role-card--off" : ""}`}
              >
                <div className="lsp-role-portrait" style={{ background: role.count > 0 ? role.color : undefined }}>
                  {role.short}
                  {role.count > 0 && (
                    <span className="lsp-role-count-badge">{role.count}</span>
                  )}
                </div>
                <span className="lsp-role-name">{role.name}</span>
                {isHost && (
                  <div className="lsp-role-btns">
                    <button
                      onClick={() => adjustRole(special, setSpecial, role.name, -1)}
                      disabled={role.count <= role.min}
                    >−</button>
                    <button
                      onClick={() => adjustRole(special, setSpecial, role.name, +1)}
                      disabled={role.count >= role.max}
                    >+</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
