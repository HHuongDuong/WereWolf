"use client";

import { motion } from "framer-motion";
import { WinnerBanner } from "./WinnerBanner";
import { StatsBoard } from "./StatsBoard";
import { Button } from "@/components/ui/Button";
import { Player } from "@/shared/types/game";

interface GameEndScreenProps {
  winner: "VILLAGE" | "WEREWOLVES";
  players: Player[];
  onReturnToVillage: () => void;
  onLeaveVillage: () => void;
}

export function GameEndScreen({ winner, players, onReturnToVillage, onLeaveVillage }: GameEndScreenProps) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <WinnerBanner winner={winner} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <StatsBoard players={players} winner={winner} />
        </motion.div>

        <div className="flex justify-center gap-6 mt-16">
          <Button
            variant="secondary"
            size="lg"
            onClick={onReturnToVillage}
            className="font-serif tracking-widest bg-white/10 hover:bg-white/20 border border-white/30 px-8 py-4"
          >
            RETURN TO VILLAGE
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={onLeaveVillage}
            className="font-serif tracking-widest text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 px-8 py-4"
          >
            LEAVE VILLAGE
          </Button>
        </div>
      </div>
    </div>
  );
}
