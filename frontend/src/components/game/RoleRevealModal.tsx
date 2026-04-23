"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Role } from "@/shared/types/game";
import { RoleBadge } from "./RoleBadge";
import { Button } from "@/components/ui/Button";

interface RoleRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  playerName: string;
}

const roleColors = {
  [Role.WEREWOLF]: "#DC2626",
  [Role.SEER]: "#3B82F6",
  [Role.WITCH]: "#C084FC",
  [Role.VILLAGER]: "#4ADE80",
  [Role.GUARD]: "#16A34A",
  [Role.HUNTER]: "#F59E0B",
};

export function RoleRevealModal({ isOpen, onClose, role, playerName }: RoleRevealModalProps) {
  const accentColor = roleColors[role];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl"
          />

          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotate: 8 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 180,
                duration: 0.6,
              }}
              className="w-full max-w-md"
            >
              <div
                className="bg-[#111827] border-2 rounded-3xl overflow-hidden shadow-2xl relative"
                style={{ borderColor: accentColor }}
              >
                <div
                  className="absolute -inset-px rounded-3xl pointer-events-none"
                  style={{
                    boxShadow: `0 0 60px 15px ${accentColor}40`,
                  }}
                />

                <div className="p-10 text-center relative">
                  <div className="mx-auto mb-8 text-7xl">🌕</div>

                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="font-accent text-[#9CA3AF] uppercase tracking-[4px] text-sm mb-2">
                      The Moon reveals your fate...
                    </p>
                    <h2 className="font-serif text-4xl font-bold text-white mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                      {playerName}
                    </h2>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="mb-10"
                  >
                    <RoleBadge role={role} size="lg" />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="font-serif text-[#E5E7EB]/80 text-xl leading-relaxed mb-10 drop-shadow-md"
                  >
                    You are <span className="font-bold" style={{ color: accentColor }}>{role}</span>.
                  </motion.p>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={onClose}
                    className="w-full"
                  >
                    Embrace Your Fate
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
