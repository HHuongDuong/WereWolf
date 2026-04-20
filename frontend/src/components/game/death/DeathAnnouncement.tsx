"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/shared/types/game";
import { RoleBadge } from "../RoleBadge";
import { Typography } from "@/components/ui/Typography";

interface DeathAnnouncementProps {
  isVisible: boolean;
  player: Player;
  onClose: () => void;
}

export function DeathAnnouncement({ isVisible, player, onClose }: DeathAnnouncementProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[180] bg-black/95 backdrop-blur-2xl"
          />

          <div className="fixed inset-0 z-[190] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 60 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -40 }}
              transition={{ type: "spring", damping: 22, stiffness: 180 }}
              className="bg-[#111827] border border-[#DC2626]/60 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
            >
              <div className="p-12 text-center relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#DC2626] to-transparent" />

                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl mb-8"
                >
                  ☠️
                </motion.div>

                <Typography variant="secondary" className="uppercase tracking-[4px] text-sm mb-3 text-[#F87171]">
                  THE VILLAGE HAS LOST
                </Typography>

                <h2 className="text-5xl font-black text-[#E5E7EB] mb-6 tracking-wide line-through decoration-[#DC2626]/70">
                  {player.name}
                </h2>

                <RoleBadge role={player.role} size="lg" />

                <div className="mt-10 text-[#9CA3AF] text-lg">
                  They were <span className="text-[#F87171]">{player.role.toLowerCase()}</span>.
                </div>

                <button
                  onClick={onClose}
                  className="mt-12 px-10 py-4 border border-[#DC2626]/50 hover:bg-[#DC2626]/10 rounded-2xl text-[#F87171] font-semibold tracking-widest transition-all"
                >
                  CONTINUE
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
