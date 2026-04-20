"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ActionResultToastProps {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
}

export function ActionResultToast({ message, type, isVisible, onClose }: ActionResultToastProps) {
  const colors = {
    success: "border-[#16A34A] bg-[#16A34A]/10",
    error: "border-[#DC2626] bg-[#DC2626]/10",
    info: "border-[#7C3AED] bg-[#7C3AED]/10",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl border ${colors[type]} shadow-2xl z-[300]`}
        >
          <p className="text-[#E5E7EB] font-medium">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
