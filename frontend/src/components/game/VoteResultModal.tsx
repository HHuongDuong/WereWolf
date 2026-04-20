"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/shared/types/game";
import { RoleBadge } from "./RoleBadge";
import { Button } from "@/components/ui/Button";

interface VoteResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  eliminatedPlayer?: Player;
  voteCounts: Record<string, number>;
  isTie?: boolean;
}

export function VoteResultModal({
  isOpen,
  onClose,
  eliminatedPlayer,
  voteCounts,
  isTie = false,
}: VoteResultModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            className="bg-[#111827] border border-[#DC2626]/40 rounded-3xl max-w-lg w-full mx-4 overflow-hidden"
          >
            <div className="p-10 text-center">
              <div className="text-6xl mb-6">☠️</div>

              <h2 className="text-4xl font-black tracking-widest text-[#F87171] mb-2">
                EXECUTED
              </h2>

              {eliminatedPlayer && (
                <div className="mt-8">
                  <div className="text-5xl mb-4">{eliminatedPlayer.name}</div>
                  <RoleBadge role={eliminatedPlayer.role} size="lg" />
                </div>
              )}

              {isTie && (
                <div className="mt-6 text-amber-400 text-xl font-medium">
                  The vote was tied... The village hesitates.
                </div>
              )}

              <div className="mt-12">
                <Button variant="danger" onClick={onClose} size="lg">
                  Continue to Night
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
