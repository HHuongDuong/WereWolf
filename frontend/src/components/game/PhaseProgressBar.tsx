"use client";

import { GamePhase } from "@/shared/types/game";
import { motion } from "framer-motion";

interface PhaseProgressBarProps {
  currentPhase: GamePhase;
  timeLeft: number;
  totalTime: number;
}

const phaseColors = {
  [GamePhase.NIGHT]: "#7C3AED",
  [GamePhase.DAY]: "#F59E0B",
  [GamePhase.VOTING]: "#DC2626",
  [GamePhase.END]: "#16A34A",
};

export function PhaseProgressBar({ currentPhase, timeLeft, totalTime }: PhaseProgressBarProps) {
  const progress = Math.max(0, (timeLeft / totalTime) * 100);
  const isUrgent = progress < 25;
  const color = phaseColors[currentPhase];

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <div className="flex justify-between text-xs text-[#9CA3AF] mb-2 font-medium tracking-widest">
        <span>{currentPhase}</span>
        <span className={isUrgent ? "text-[#DC2626]" : ""}>
          {timeLeft}s
        </span>
      </div>

      <div className="h-2.5 bg-[#1F2937] rounded-full overflow-hidden border border-white/5">
        <motion.div
          className="h-full rounded-full relative"
          style={{ backgroundColor: color }}
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {isUrgent && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="absolute inset-0 bg-white/30"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
