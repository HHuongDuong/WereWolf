import { useState, useEffect } from 'react';

export function useCountdown(deadlineTimestamp: number | null) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!deadlineTimestamp) return;
    const tick = () => setRemaining(Math.max(0, deadlineTimestamp - Date.now()));
    tick(); // Initial setup
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [deadlineTimestamp]);

  return remaining; // Returns remaining milliseconds
}
