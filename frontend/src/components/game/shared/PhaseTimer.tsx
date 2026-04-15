interface PhaseTimerProps {
  seconds: number;
  totalSeconds: number;
  warningAt?: number;
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function PhaseTimer({ seconds, totalSeconds, warningAt = 30 }: PhaseTimerProps) {
  const pct = Math.max(0, Math.min(1, seconds / totalSeconds));
  const warning = seconds <= warningAt;

  return (
    <div className="phase-timer">
      <span className={`phase-timer-label ${warning ? "warning" : ""}`}>
        {fmt(seconds)}
      </span>
      <div className="phase-timer-track">
        <div
          className={`phase-timer-fill ${warning ? "warning" : ""}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}
