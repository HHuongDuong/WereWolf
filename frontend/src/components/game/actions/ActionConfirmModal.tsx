"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Player } from "@/shared/types/game";

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionType: "kill" | "protect" | "poison";
  target?: Player;
}

export function ActionConfirmModal({ isOpen, onClose, onConfirm, actionType, target }: ActionConfirmModalProps) {
  const isDangerous = actionType === "kill" || actionType === "poison";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="bg-[#111827] border border-red-500/40 rounded-3xl max-w-md w-full p-10"
          >
            <div className="text-center">
              <div className="text-6xl mb-6">
                {isDangerous ? "☠️" : "🛡️"}
              </div>

              <h3 className="text-2xl font-bold mb-6">
                {isDangerous ? "This action cannot be undone" : "Confirm Protection"}
              </h3>

              {target && (
                <p className="text-xl mb-8">
                  Target: <span className="font-semibold text-[#E5E7EB]">{target.name}</span>
                </p>
              )}

              <div className="flex gap-4">
                <Button variant="secondary" onClick={onClose} className="flex-1">
                  CANCEL
                </Button>
                <Button
                  variant={isDangerous ? "danger" : "primary"}
                  onClick={onConfirm}
                  className="flex-1"
                >
                  YES, PROCEED
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
