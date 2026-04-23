"use client";

import { GamePhase } from "@/shared/types/game";
import { motion, AnimatePresence } from "framer-motion";

interface PhaseTransitionOverlayProps {
  fromPhase: GamePhase;
  toPhase: GamePhase;
  isVisible: boolean;
  onComplete?: () => void;
}

export function PhaseTransitionOverlay({
  fromPhase,
  toPhase,
  isVisible,
  onComplete,
}: PhaseTransitionOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[200] pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 40 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: 0.8, ease: "easeOut" },
              }}
              exit={{
                opacity: 0,
                scale: 1.2,
                y: -60,
                transition: { duration: 0.6 },
              }}
              onAnimationComplete={() => {
                if (onComplete) setTimeout(onComplete, 1200);
              }}
              className="text-center"
            >
              <div className="text-8xl mb-6">🌕</div>

              <div className="text-[#E5E7EB] text-6xl font-black tracking-widest mb-4">
                {toPhase}
              </div>

              <div className="text-[#9CA3AF] text-2xl tracking-[4px] uppercase">
                Transitioning from {fromPhase}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
