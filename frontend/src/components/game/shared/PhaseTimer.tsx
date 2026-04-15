import { useEffect, useState } from "react";

interface PhaseTimerProps {
  /** Unix ms deadline from the server */
  deadlineTimestamp: number | null;
  /** Total duration in seconds (for the progress bar) */
  totalSeconds: number;
  warningAt?: number;
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function PhaseTimer({ deadlineTimestamp, totalSeconds, warningAt = 30 }: PhaseTimerProps) {
  const [seconds, setSeconds] = useState<number>(() =>
    deadlineTimestamp == null ? 0 : Math.max(0, Math.ceil((deadlineTimestamp - Date.now()) / 1000)),
  );

  useEffect(() => {
    if (deadlineTimestamp == null) {
      setSeconds(0);
      return;
    }
    const tick = () =>
      setSeconds(Math.max(0, Math.ceil((deadlineTimestamp - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [deadlineTimestamp]);

  const pct = Math.max(0, Math.min(1, seconds / Math.max(1, totalSeconds)));
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
