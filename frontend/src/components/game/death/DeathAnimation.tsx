"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/shared/types/game";
import { PlayerAvatar } from "../PlayerAvatar";

interface DeathAnimationProps {
  player: Player;
  isVisible: boolean;
  onComplete?: () => void;
}

export function DeathAnimation({ player, isVisible, onComplete }: DeathAnimationProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0.3] }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#991B1B] blur-[120px] scale-150"
            />

            <motion.div
              initial={{ scale: 1, filter: "grayscale(0%)" }}
              animate={{
                scale: [1, 1.08, 0.92],
                filter: "grayscale(100%)",
              }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="relative"
            >
              <PlayerAvatar
                name={player.name}
                isAlive={false}
                size="xl"
              />
            </motion.div>

            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "180px" }}
              transition={{ delay: 0.6, duration: 1.2 }}
              className="absolute -bottom-6 left-1/2 w-0.5 bg-gradient-to-b from-[#DC2626] to-transparent"
            />
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "140px" }}
              transition={{ delay: 0.9, duration: 1 }}
              className="absolute -bottom-6 left-[42%] w-0.5 bg-gradient-to-b from-[#DC2626] to-transparent"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
