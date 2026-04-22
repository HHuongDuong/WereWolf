"use client";

import { GamePhase } from "@/shared/types/game";
import { motion } from "framer-motion";

const phaseConfig = {
  [GamePhase.NIGHT]: {
    label: "NIGHT",
    subtitle: "The wolves are hunting...",
    color: "#7C3AED",
    bg: "bg-[#0B0F1A]",
    glow: "shadow-purple-500/50",
  },
  [GamePhase.DAY]: {
    label: "DAY",
    subtitle: "The village gathers...",
    color: "#F59E0B",
    bg: "bg-[#1F2937]",
    glow: "shadow-amber-500/40",
  },
  [GamePhase.VOTING]: {
    label: "VOTING",
    subtitle: "Choose who to eliminate",
    color: "#DC2626",
    bg: "bg-[#111827]",
    glow: "shadow-red-500/50",
  },
  [GamePhase.END]: {
    label: "GAME OVER",
    subtitle: "",
    color: "#16A34A",
    bg: "bg-[#0B0F1A]",
    glow: "shadow-green-500/40",
  },
};

interface PhaseBannerProps {
  phase: GamePhase;
  day: number;
}

export function PhaseBanner({ phase, day }: PhaseBannerProps) {
  const config = phaseConfig[phase];

  return (
    <motion.div
      key={phase}
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`w-full py-8 ${config.bg} border-b border-white/10`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`
            inline-block px-12 py-4 rounded-3xl text-5xl font-black tracking-[6px] uppercase
            text-white shadow-2xl ${config.glow}
          `}
          style={{ backgroundColor: config.color }}
        >
          {config.label}
        </motion.div>

        <div className="mt-4 text-[#9CA3AF] text-lg font-medium">
          DAY {day}
        </div>

        {config.subtitle && (
          <p className="mt-2 text-[#E5E7EB]/80 text-xl tracking-wide">
            {config.subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
