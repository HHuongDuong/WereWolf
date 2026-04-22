"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function DarknessEffect({ children, isActive }: { children: ReactNode; isActive: boolean }) {
  return (
    <div className="relative overflow-hidden">
      {children}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          className="absolute inset-0 bg-[#0B0F1A] mix-blend-multiply pointer-events-none"
        />
      )}
    </div>
  );
}
