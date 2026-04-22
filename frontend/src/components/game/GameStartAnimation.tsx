"use client";

import { motion, AnimatePresence } from "framer-motion";

interface GameStartAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export function GameStartAnimation({ isVisible, onComplete }: GameStartAnimationProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95">
          <div className="relative text-center">
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{
                scale: [0.2, 1.2, 1],
                opacity: [0, 1, 1],
              }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="mx-auto mb-12 text-[180px] drop-shadow-[0_0_80px_#C4B5FD]"
            >
              🌕
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-7xl font-black tracking-[8px] text-white"
            >
              THE NIGHT BEGINS
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6 text-[#9CA3AF] text-xl tracking-widest"
            >
              May the moonlight reveal the truth...
            </motion.p>

            <motion.div
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-8xl"
            >
              🐺
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
