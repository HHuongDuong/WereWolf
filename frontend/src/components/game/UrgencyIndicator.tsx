"use client";

import { motion } from "framer-motion";

interface UrgencyIndicatorProps {
  isUrgent: boolean;
  message?: string;
}

export function UrgencyIndicator({ isUrgent, message = "TIME IS RUNNING OUT" }: UrgencyIndicatorProps) {
  if (!isUrgent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0.6, 1, 0.6],
        y: [0, -4, 0],
      }}
      transition={{ duration: 1.2, repeat: Infinity }}
      className="inline-flex items-center gap-3 px-6 py-2 bg-[#DC2626]/10 border border-[#DC2626]/40 rounded-2xl"
    >
      <div className="w-3 h-3 bg-[#DC2626] rounded-full animate-ping" />
      <span className="text-[#F87171] font-medium tracking-widest text-sm">
        {message}
      </span>
    </motion.div>
  );
}
