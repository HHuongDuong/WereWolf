"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ShakeEffectProps {
  children: ReactNode;
  trigger: boolean;
  intensity?: number;
}

export function ShakeEffect({ children, trigger, intensity = 8 }: ShakeEffectProps) {
  return (
    <motion.div
      animate={trigger ? { x: [0, intensity, -intensity, intensity, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
