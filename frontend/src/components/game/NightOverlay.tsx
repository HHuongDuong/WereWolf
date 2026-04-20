"use client";

import { motion } from "framer-motion";

export function NightOverlay() {
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A]/90 via-[#1E2937]/70 to-[#0B0F1A]"
      />

      <div className="absolute inset-0 bg-[radial-gradient(#E5E7EB_0.8px,transparent_1px)] bg-[length:40px_40px] opacity-10" />

      <motion.div
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-12 right-12 w-96 h-96 bg-[#C4B5FD] rounded-full blur-[120px] opacity-20"
      />

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[180px] opacity-10">
        🐺
      </div>
    </div>
  );
}
