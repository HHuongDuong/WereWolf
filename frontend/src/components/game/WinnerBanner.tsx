"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface WinnerBannerProps {
  winner: "VILLAGE" | "WEREWOLVES";
}

export function WinnerBanner({ winner }: WinnerBannerProps) {
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
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="mx-auto w-full max-w-4xl mb-8 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
      >
        <img
          src={isVillageWin ? "/images/victory-banner/villager_victory_banner.png" : "/images/victory-banner/wolf_victory_banner.png"}
          alt={isVillageWin ? "Villagers Win" : "Werewolves Win"}
          className="w-full h-auto object-contain rounded-xl"
        />
      </motion.div>
    </motion.div>
  );
}
