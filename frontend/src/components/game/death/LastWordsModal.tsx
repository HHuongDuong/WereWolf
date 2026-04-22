"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface LastWordsModalProps {
  isOpen: boolean;
  playerName: string;
  onSubmit: (message: string) => void;
  onClose: () => void;
}

export function LastWordsModal({ isOpen, playerName, onSubmit, onClose }: LastWordsModalProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    onSubmit(message.trim() || "...");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="bg-[#111827] border border-[#DC2626]/30 rounded-3xl max-w-md w-full mx-4 p-10"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🪦</div>
              <h2 className="text-3xl font-bold text-[#E5E7EB]">Last Words</h2>
              <p className="text-[#9CA3AF] mt-2">
                {playerName}, speak your final message to the village...
              </p>
            </div>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="They will pay for this... or perhaps a final clue?"
              className="min-h-[140px] mb-8"
            />

            <div className="flex gap-4">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Skip
              </Button>
              <Button
                variant="danger"
                onClick={handleSubmit}
                className="flex-1"
              >
                SPEAK YOUR LAST WORDS
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
