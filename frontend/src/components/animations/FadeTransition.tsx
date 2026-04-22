"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface FadeTransitionProps {
  children: ReactNode;
  isVisible: boolean;
  duration?: number;
}

export function FadeTransition({ children, isVisible, duration = 0.4 }: FadeTransitionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
