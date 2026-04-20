"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PulseEffectProps {
  children: ReactNode;
  intensity?: "subtle" | "medium" | "strong";
  color?: string;
}

export function PulseEffect({
  children,
  intensity = "subtle",
  color = "#7C3AED",
}: PulseEffectProps) {
  const intensityMap = {
    subtle: 1.8,
    medium: 1.4,
    strong: 1.1,
  };

  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 15px ${color}30`,
          `0 0 35px ${color}60`,
          `0 0 15px ${color}30`,
        ],
      }}
      transition={{
        duration: intensityMap[intensity],
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
