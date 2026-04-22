"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const typeStyles = {
  success: {
    bg: "bg-[#16A34A]/10 border-[#4ADE80]",
    icon: "🌿",
    glow: "shadow-green-500/30",
  },
  error: {
    bg: "bg-[#DC2626]/10 border-[#F87171]",
    icon: "☠️",
    glow: "shadow-red-500/40",
  },
  warning: {
    bg: "bg-[#F59E0B]/10 border-[#FCD34D]",
    icon: "⚠️",
    glow: "shadow-amber-500/30",
  },
  info: {
    bg: "bg-[#7C3AED]/10 border-[#C4B5FD]",
    icon: "🌕",
    glow: "shadow-purple-500/40",
  },
};

export function Toast({ message, type = "info", duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const style = typeStyles[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`
            fixed bottom-6 right-6 z-[100] min-w-[300px] max-w-sm
            ${style.bg} border rounded-3xl p-5 shadow-2xl ${style.glow}
          `}
        >
          <div className="flex gap-4 items-start">
            <div className="text-3xl">{style.icon}</div>
            <div className="flex-1">
              <p className="text-[#E5E7EB] leading-snug">{message}</p>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="text-[#9CA3AF] hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
