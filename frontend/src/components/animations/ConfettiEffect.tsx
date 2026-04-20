"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  trigger: boolean;
  type?: "victory" | "werewolf";
}

export function ConfettiEffect({ trigger, type = "victory" }: ConfettiEffectProps) {
  useEffect(() => {
    if (!trigger) return;

    const colors = type === "victory"
      ? ["#7C3AED", "#C4B5FD", "#4ADE80"]
      : ["#DC2626", "#F87171", "#991B1B"];

    confetti({
      particleCount: type === "victory" ? 220 : 140,
      spread: 80,
      origin: { y: 0.6 },
      colors,
    });
  }, [trigger, type]);

  return null;
}
