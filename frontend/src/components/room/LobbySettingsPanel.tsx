import { useState, useCallback } from "react";
import { useRoom } from "../../context/RoomContext";
import type { PhaseConfig } from "../../context/RoomContext";

interface PanelProps {
  lobbyOpen: boolean;
  rightPanel: "settings" | "chat";
  onTogglePanel: () => void;
}

interface RoleCard {
  name: string;
  card: string;      // SVG file name in /img/assets/cards/
  count: number;
  min: number;
  max: number;
}

const DEFAULT_PRIMARY: RoleCard[] = [
  { name: "Werewolf", card: "werewolf.svg", count: 2, min: 1, max: 6 },
  { name: "Villager",  card: "villager.svg",  count: 6, min: 2, max: 12 },
];

interface DurationRow {
  key: keyof PhaseConfig;
  label: string;
  min: number;
  max: number;
  step: number;
}

const DURATION_ROWS: DurationRow[] = [
  { key: "werewolfDuration", label: "Werewolf phase",  min: 15, max: 120, step: 15 },
  { key: "seerDuration",     label: "Seer phase",      min: 15, max: 120, step: 15 },
  { key: "witchDuration",    label: "Witch phase",     min: 15, max: 120, step: 15 },
  { key: "guardDuration",    label: "Guard phase",     min: 15, max: 120, step: 15 },
  { key: "discussDuration",  label: "Discussion",      min: 30, max: 180, step: 15 },
  { key: "voteDuration",     label: "Voting",          min: 15, max: 120, step: 15 },
];

const DEFAULT_DURATIONS: Required<PhaseConfig> = {
  werewolfDuration: 45,
  seerDuration:     30,
  witchDuration:    30,
  guardDuration:    30,
  discussDuration:  60,
  voteDuration:     30,
};

const DEFAULT_SPECIAL: RoleCard[] = [
  { name: "Seer",    card: "seer.svg",    count: 1, min: 0, max: 1 },
  { name: "Witch",   card: "witch.svg",   count: 0, min: 0, max: 1 },
  { name: "Hunter",  card: "hunter.svg",  count: 1, min: 0, max: 1 },
  { name: "Cupid",   card: "cupid.svg",   count: 0, min: 0, max: 1 },
  { name: "Guard",   card: "guard.svg",   count: 0, min: 0, max: 1 },
  { name: "Mentalist", card: "mentalist.svg", count: 0, min: 0, max: 1 },
];

export function LobbySettingsPanel({ lobbyOpen, rightPanel, onTogglePanel }: PanelProps) {
  const { room, players, isHost, configureRoom } = useRoom();

  const [maxPlayers, setMaxPlayers] = useState(8);
  const [composition, setComposition] = useState(50);
  const [durations, setDurations] = useState<Required<PhaseConfig>>(DEFAULT_DURATIONS);
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

  const adjustMaxPlayers = useCallback((next: number) => {
    if (!isHost) return;
    setMaxPlayers(next);
    configureRoom(next);
  }, [isHost, configureRoom]);

  const adjustDuration = useCallback((key: keyof PhaseConfig, delta: number) => {
    if (!isHost) return;
    setDurations(prev => {
      const row = DURATION_ROWS.find(r => r.key === key)!;
      const next = Math.max(row.min, Math.min(row.max, prev[key] + delta));
      const updated = { ...prev, [key]: next };
      configureRoom(undefined, { [key]: next });
      return updated;
    });
  }, [isHost, configureRoom]);

  const compositionLabel =
    composition < 35 ? "Wolfpack" : composition > 65 ? "Village" : "Balanced";

  return (
    <div className="lobby-settings-panel">
      {/* Panel header — same structure as LobbyChatPanel */}
      <div className="rp-header">
        <div className="rp-header-left">
          <div className="rp-state">
            <div className="rp-state-icon">
              <img src="/img/icons/time.svg" alt="" draggable={false} />
            </div>
            <span className="rp-state-name">Waiting</span>
            <span className="rp-state-count">
              {players.length}<span>/{maxPlayers}</span>
            </span>
          </div>
          {lobbyOpen && (
            <button className="rp-toggle-btn" onClick={onTogglePanel}>
              {rightPanel === "settings" ? (
                <>
                  <img src="/img/icons/messages.svg" alt="" draggable={false} />
                  <span>Messages</span>
                </>
              ) : (
                <>
                  <img src="/img/icons/book.svg" alt="" draggable={false} />
                  <span>Game rules</span>
                </>
              )}
            </button>
          )}
        </div>
        <button className="rp-settings-btn" title="Settings">
          <img src="/img/icons/settings.svg" alt="Settings" draggable={false} />
        </button>
      </div>

      <div className="lsp-body">
        {/* Number of players */}
        <div className="lsp-section">
          <span className="lsp-section-title">Number of players</span>
          <div className="lsp-stepper">
            <button
              className="lsp-stepper-arrow"
              onClick={() => adjustMaxPlayers(Math.max(5, maxPlayers - 1))}
              disabled={maxPlayers <= 5 || !isHost}
            >‹</button>
            {[-1, 0, 1].map(offset => {
              const n = maxPlayers + offset;
              if (n < 5 || n > 18) return <div key={offset} className="lsp-stepper-spacer" />;
              return (
                <button
                  key={offset}
                  className={`lsp-stepper-num ${offset === 0 ? "active" : ""}`}
                  onClick={() => adjustMaxPlayers(n)}
                >
                  {n}
                </button>
              );
            })}
            <button
              className="lsp-stepper-arrow"
              onClick={() => adjustMaxPlayers(Math.min(18, maxPlayers + 1))}
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
                <div className="lsp-role-portrait">
                  <img
                    src={`/img/assets/cards/${role.card}`}
                    alt={role.name}
                    draggable={false}
                  />
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
                <div className="lsp-role-portrait">
                  <img
                    src={`/img/assets/cards/${role.card}`}
                    alt={role.name}
                    draggable={false}
                  />
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
        {/* Phase durations */}
        <div className="lsp-section">
          <span className="lsp-section-title">Phase durations</span>
          <div className="lsp-duration-list">
            {DURATION_ROWS.map(row => (
              <div key={row.key} className="lsp-duration-row">
                <span className="lsp-duration-label">{row.label}</span>
                <div className="lsp-duration-ctrl">
                  <button
                    className="lsp-dur-btn"
                    onClick={() => adjustDuration(row.key, -row.step)}
                    disabled={durations[row.key] <= row.min || !isHost}
                  >−</button>
                  <span className="lsp-dur-val">{durations[row.key]}s</span>
                  <button
                    className="lsp-dur-btn"
                    onClick={() => adjustDuration(row.key, +row.step)}
                    disabled={durations[row.key] >= row.max || !isHost}
                  >+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
