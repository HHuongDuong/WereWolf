"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`
                ${sizeClasses[size]} w-full bg-[#111827]
                border border-[#7C3AED]/30 rounded-3xl shadow-2xl
                overflow-hidden
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {(title || onClose) && (
                <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
                  {title && (
                    <h2 className="text-2xl font-bold text-[#E5E7EB] tracking-wide">
                      {title}
                    </h2>
                  )}
                  <button
                    onClick={onClose}
                    className="text-[#9CA3AF] hover:text-white transition-colors text-3xl leading-none"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="p-8">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
