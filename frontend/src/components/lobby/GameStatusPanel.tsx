"use client";

import { StartGameButton } from "./StartGameButton";

interface GameStatusPanelProps {
  isHost: boolean;
  canStart: boolean;
  currentPlayers: number;
  maxPlayers: number;
  onStart: () => void;
}

export function GameStatusPanel({
  isHost,
  canStart,
  currentPlayers,
  maxPlayers,
  onStart,
}: GameStatusPanelProps) {
  return (
    <div className="village-panel">
      <div className="panel-overlay texture-scales" />
      <div className="panel-overlay bg-gradient-to-b from-[#5A1208]/8 via-transparent to-[#0A1A2B]/15" />

      <h2 className="relative z-10 village-title">THE VILLAGE SQUARE</h2>

      <div className="relative z-10 moon-text">🌕 THE BLOOD MOON RISES SOON...</div>

      <p className="relative z-10 player-info">
        PLAYERS GATHERED:
        <span>
          {currentPlayers} / {maxPlayers}
        </span>
      </p>

      <div className="relative z-10 w-full max-w-md action-area">
        {isHost ? (
          <StartGameButton onClick={onStart} disabled={!canStart} className="start-button">
            IGNITE THE GATHERING
          </StartGameButton>
        ) : (
          <div className="waiting-box">Waiting for the village elder to begin the ritual...</div>
        )}
      </div>
    </div>
  );
}
