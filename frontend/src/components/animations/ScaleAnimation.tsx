"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScaleAnimationProps {
  children: ReactNode;
  trigger?: boolean;
  scale?: number;
  duration?: number;
}

export function ScaleAnimation({
  children,
  trigger = true,
  scale = 1.05,
  duration = 0.4,
}: ScaleAnimationProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  );
}
