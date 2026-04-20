"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface SlideTransitionProps {
  children: ReactNode;
  isVisible: boolean;
  direction?: "up" | "down" | "left" | "right";
}

export function SlideTransition({
  children,
  isVisible,
  direction = "up",
}: SlideTransitionProps) {
  const variants = {
    up: { y: 30, opacity: 0 },
    down: { y: -30, opacity: 0 },
    left: { x: 40, opacity: 0 },
    right: { x: -40, opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={variants[direction]}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={variants[direction]}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
