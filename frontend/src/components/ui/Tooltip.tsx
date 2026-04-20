"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ children, content, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute z-50 pointer-events-none ${positionClasses[position]}`}
          >
            <div
              className="
                bg-[#111827] text-[#E5E7EB] text-sm px-4 py-2
                rounded-2xl border border-[#7C3AED]/30
                shadow-xl whitespace-nowrap
              "
            >
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
