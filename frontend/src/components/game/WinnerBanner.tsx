"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface WinnerBannerProps {
  winner: "VILLAGE" | "WEREWOLVES";
  onContinue?: () => void;
}

export function WinnerBanner({ winner, onContinue }: WinnerBannerProps) {
  const isVillageWin = winner === "VILLAGE";

  useEffect(() => {
    if (isVillageWin) {
      confetti({
        particleCount: 180,
        spread: 80,
        origin: { y: 0.6 },
      });
    } else {
      confetti({
        particleCount: 120,
        spread: 70,
        colors: ["#DC2626", "#991B1B"],
        origin: { y: 0.6 },
      });
    }
  }, [isVillageWin]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -60 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="inline-block mb-8 text-8xl"
      >
        {isVillageWin ? "🌟" : "🐺"}
      </motion.div>

      <h1 className={`text-7xl font-black tracking-widest mb-4 ${isVillageWin ? "text-[#4ADE80]" : "text-[#F87171]"}`}>
        {isVillageWin ? "THE VILLAGE SURVIVES" : "THE WOLVES REIGN"}
      </h1>

      <p className="text-2xl text-[#E5E7EB]/80">
        {isVillageWin
          ? "The monsters have been driven out."
          : "The night has claimed its victory."}
      </p>

      {onContinue && (
        <button
          onClick={onContinue}
          className="mt-12 px-14 py-5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-2xl text-lg font-semibold tracking-widest transition-all"
        >
          RETURN TO LOBBY
        </button>
      )}
    </motion.div>
  );
}
