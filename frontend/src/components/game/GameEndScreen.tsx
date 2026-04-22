"use client";

import { motion } from "framer-motion";
import { WinnerBanner } from "./WinnerBanner";
import { StatsBoard } from "./StatsBoard";
import { Button } from "@/components/ui/Button";
import { Player } from "@/shared/types/game";

interface GameEndScreenProps {
  winner: "VILLAGE" | "WEREWOLVES";
  players: Player[];
  onReturnToLobby: () => void;
}

export function GameEndScreen({ winner, players, onReturnToLobby }: GameEndScreenProps) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <WinnerBanner winner={winner} onContinue={onReturnToLobby} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <StatsBoard players={players} winner={winner} />
        </motion.div>

        <div className="flex justify-center mt-16">
          <Button
            variant="secondary"
            size="lg"
            onClick={onReturnToLobby}
          >
            RETURN TO THE LOBBY
          </Button>
        </div>
      </div>
    </div>
  );
}
