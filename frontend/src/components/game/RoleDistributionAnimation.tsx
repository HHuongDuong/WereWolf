"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Role } from "@/shared/types/game";
import { RoleBadge } from "./RoleBadge";

interface RoleDistributionAnimationProps {
  isVisible: boolean;
  playerRole: Role;
  playerName: string;
  onComplete?: () => void;
}

export function RoleDistributionAnimation({
  isVisible,
  playerRole,
  playerName,
  onComplete,
}: RoleDistributionAnimationProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <div className="fixed inset-0 z-[310] bg-black/95 flex items-center justify-center">
          <div className="text-center max-w-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-12"
            >
              <div className="text-6xl mb-6">🌕</div>
              <p className="text-[#9CA3AF] tracking-[4px] text-sm">THE MOON HAS CHOSEN</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0.6, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 1.2 }}
            >
              <RoleBadge role={playerRole} size="lg" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-10 text-5xl font-bold text-white"
            >
              {playerName}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 text-2xl text-[#C4B5FD]"
            >
              You are the <span className="font-bold">{playerRole}</span>
            </motion.p>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
