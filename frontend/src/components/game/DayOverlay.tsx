"use client";

import { motion } from "framer-motion";

export function DayOverlay() {
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        className="absolute inset-0 bg-gradient-to-b from-[#F3E8FF]/20 via-transparent to-[#111827]/60"
      />

      <div className="absolute inset-0 bg-[linear-gradient(transparent,#FCD34D10_50%,transparent)]" />

      <motion.div
        animate={{
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute top-20 left-1/3 w-[600px] h-[600px] bg-[#FDE68C] rounded-full blur-[180px] opacity-10"
      />
    </div>
  );
}
