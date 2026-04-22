"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SpotlightEffectProps {
  children: ReactNode;
  active?: boolean;
}

export function SpotlightEffect({ children, active = true }: SpotlightEffectProps) {
  return (
    <div className="relative">
      {children}
      {active && (
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,#C4B5FD20_10%,transparent_70%)]"
          animate={{
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      )}
    </div>
  );
}
