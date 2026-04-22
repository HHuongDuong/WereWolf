"use client";

import { GamePhase } from "@/shared/types/game";
import { motion } from "framer-motion";

const phases: { phase: GamePhase; label: string; icon: string }[] = [
  { phase: GamePhase.NIGHT, label: "Night", icon: "🌑" },
  { phase: GamePhase.DAY, label: "Day", icon: "☀️" },
  { phase: GamePhase.VOTING, label: "Voting", icon: "⚖️" },
];

interface GameTimelineProps {
  currentPhase: GamePhase;
  day: number;
}

export function GameTimeline({ currentPhase, day }: GameTimelineProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-[#374151] -translate-y-1/2" />

        <div
          className="absolute top-1/2 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7C3AED] via-[#F59E0B] to-[#DC2626] -translate-y-1/2"
          style={{
            width: currentPhase === GamePhase.NIGHT ? "33%" :
              currentPhase === GamePhase.DAY ? "66%" : "100%",
          }}
        />

        {phases.map((item, index) => {
          const isActive = item.phase === currentPhase;
          const isPast =
            (currentPhase === GamePhase.DAY && item.phase === GamePhase.NIGHT) ||
            (currentPhase === GamePhase.VOTING && (item.phase === GamePhase.NIGHT || item.phase === GamePhase.DAY));

          return (
            <motion.div
              key={index}
              initial={{ scale: 0.8 }}
              animate={{
                scale: isActive ? 1.15 : 1,
                y: isActive ? -8 : 0,
              }}
              className="flex flex-col items-center z-10"
            >
              <div
                className={`
                  w-14 h-14 flex items-center justify-center text-3xl rounded-2xl border-2 transition-all
                  ${isActive
                    ? "border-[#7C3AED] bg-[#111827] shadow-[0_0_25px_#7C3AED]"
                    : isPast
                      ? "border-[#4B5563] bg-[#1F2937]"
                      : "border-[#374151] bg-[#111827]"
                  }
                `}
              >
                {item.icon}
              </div>
              <p className={`mt-3 text-sm font-medium tracking-widest ${isActive ? "text-[#E5E7EB]" : "text-[#9CA3AF]"}`}>
                {item.label}
              </p>
              {isActive && (
                <div className="text-[#7C3AED] text-xs mt-1">DAY {day}</div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
