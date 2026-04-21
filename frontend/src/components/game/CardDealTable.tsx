"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameStartSequenceStep, Role } from "@/shared/types/game";
import { backCardImage, roleCardFrontImageByRole } from "@/shared/lib/roleCardAssets";
import { Button } from "@/components/ui/Button";

interface CardDealTableProps {
  step: GameStartSequenceStep;
  role: Role | null;
  playerName: string;
  onConfirm: () => void;
  seatCount?: number;
}

export function CardDealTable({ step, role, playerName, onConfirm, seatCount = 8 }: CardDealTableProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (step === "roleReveal") {
      const timer = setTimeout(() => {
        setIsFlipped(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  if (step !== "dealing" && step !== "roleReveal") return null;

  const cards = Array.from({ length: seatCount }, (_, idx) => idx);
  const playerCardIndex = 0;

  const handleCardClick = () => {
    if (step === "roleReveal" && !isFlipped) {
      setIsFlipped(true);
    }
  };

  const frontCardSrc = role ? roleCardFrontImageByRole[role] : backCardImage;

  return (
    <div className={`fixed inset-0 z-[305] flex items-center justify-center transition-all duration-1000 ${
      step === "roleReveal" ? "bg-black/90 backdrop-blur-md" : "bg-black/85"
    }`}>
      <div className="relative w-[min(90vw,900px)] h-[min(70vh,560px)]" style={{ perspective: "1000px" }}>
        <AnimatePresence>
          {step === "dealing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(168,192,214,0.12),rgba(7,10,14,0.9))]"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {step === "dealing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.35em] text-gray-300 uppercase"
            >
              Dealing Role Cards
            </motion.div>
          )}
        </AnimatePresence>

        {cards.map((cardIndex) => {
          const isPlayerCard = cardIndex === playerCardIndex;
          
          const angle = (360 / seatCount) * cardIndex + 90;
          const radiusX = 300;
          const radiusY = 180;
          const dealX = Math.cos((angle * Math.PI) / 180) * radiusX;
          const dealY = Math.sin((angle * Math.PI) / 180) * radiusY;

          return (
            <motion.div
              key={cardIndex}
              initial={
                step === "dealing"
                  ? { x: 0, y: 0, scale: 0.4, opacity: 0, rotateY: 0 }
                  : false
              }
              animate={
                step === "roleReveal" && isPlayerCard
                  ? {
                      x: 0,
                      y: -40,
                      scale: 2.5,
                      opacity: 1,
                      rotateY: isFlipped ? 180 : 0,
                    }
                  : {
                      x: dealX,
                      y: dealY,
                      scale: 1,
                      opacity: step === "roleReveal" ? 0 : 1,
                      rotateY: 0,
                    }
              }
              transition={
                step === "roleReveal"
                  ? {
                      duration: 0.8,
                      ease: "easeOut",
                    }
                  : {
                      delay: 0.15 * cardIndex,
                      duration: 0.45,
                      ease: "easeOut",
                    }
              }
              className={`absolute top-1/2 left-1/2 w-24 h-36 -translate-x-1/2 -translate-y-1/2 rounded-lg ${isPlayerCard && step === "roleReveal" && !isFlipped ? "cursor-pointer" : ""}`}
              onClick={isPlayerCard ? handleCardClick : undefined}
              style={{ transformStyle: "preserve-3d", zIndex: isPlayerCard ? 10 : 1 }}
            >
              {/* Back of the card */}
              <div 
                className="absolute inset-0 rounded-lg shadow-[0_12px_30px_rgba(0,0,0,0.45)] overflow-hidden border border-white/10"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                <img src={backCardImage} alt="Role card back" className="w-full h-full object-cover" />
              </div>
              
              {/* Front of the card */}
              <div 
                className="absolute inset-0 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20"
                style={{ 
                  backfaceVisibility: "hidden", 
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <img src={frontCardSrc} alt="Role card front" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          );
        })}

        <AnimatePresence>
          {step === "roleReveal" && isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-full"
            >
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-2">{playerName}</h2>
                <p className="text-xl text-gray-300">
                  You are the <span className="font-bold text-white uppercase">{role}</span>
                </p>
              </div>
              <Button onClick={onConfirm} variant="primary" size="lg" className="px-8 mt-2">
                Embrace Your Fate
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
