"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlowEffectProps {
  children: ReactNode;
  color?: string;
  intensity?: number;
}

export function GlowEffect({
  children,
  color = "#7C3AED",
  intensity = 40,
}: GlowEffectProps) {
  return (
    <motion.div
      animate={{
        filter: [
          `drop-shadow(0 0 ${intensity}px ${color})`,
          `drop-shadow(0 0 ${intensity + 20}px ${color})`,
          `drop-shadow(0 0 ${intensity}px ${color})`,
        ],
      }}
      transition={{ duration: 2.5, repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}
