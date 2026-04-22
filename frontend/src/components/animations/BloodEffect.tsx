"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BloodEffectProps {
  isActive: boolean;
  children: ReactNode;
}

export function BloodEffect({ isActive, children }: BloodEffectProps) {
  return (
    <div className="relative">
      {children}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.25, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-[#991B1B]/40 to-transparent pointer-events-none"
        />
      )}
    </div>
  );
}
