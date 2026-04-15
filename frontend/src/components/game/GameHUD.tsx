import { useGameStore } from "../../stores/gameStore";

const PHASE_LABELS: Record<string, string> = {
  day:    "Discussion",
  voting: "Voting",
};

export function GameHUD() {
  const phase = useGameStore(s => s.phase);
  const round = useGameStore(s => s.round);

  return (
    <div className="game-hud">
      <span className="hud-round font-display">Round {round}</span>
      <div className={`hud-phase-badge phase-${phase}`}>
        {PHASE_LABELS[phase] ?? phase}
      </div>
    </div>
  );
}
