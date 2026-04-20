"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  side?: "left" | "right";
  children: ReactNode;
}

export function Drawer({ isOpen, onClose, title, side = "right", children }: DrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ x: side === "right" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "right" ? "100%" : "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`
              fixed top-0 bottom-0 z-50 w-full max-w-md
              bg-[#111827] border-l border-[#7C3AED]/30 shadow-2xl
              ${side === "right" ? "right-0" : "left-0"}
            `}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              {title && (
                <h3 className="text-xl font-bold tracking-wide text-[#E5E7EB]">
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className="text-3xl text-[#9CA3AF] hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto h-[calc(100%-73px)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
