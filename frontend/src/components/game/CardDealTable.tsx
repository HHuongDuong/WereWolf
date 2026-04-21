"use client";

import { motion } from "framer-motion";

interface CardDealTableProps {
  isVisible: boolean;
  seatCount?: number;
  backCardSrc: string;
}

export function CardDealTable({ isVisible, seatCount = 8, backCardSrc }: CardDealTableProps) {
  if (!isVisible) return null;

  const cards = Array.from({ length: seatCount }, (_, idx) => idx);

  return (
    <div className="fixed inset-0 z-[305] bg-black/85 flex items-center justify-center">
      <div className="relative w-[min(90vw,900px)] h-[min(70vh,560px)]">
        <div className="absolute inset-0 rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(168,192,214,0.12),rgba(7,10,14,0.9))]" />

        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.35em] text-gray-300 uppercase">
          Dealing Role Cards
        </div>

        {cards.map((cardIndex) => {
          const angle = (360 / seatCount) * cardIndex;
          const radiusX = 300;
          const radiusY = 180;
          const x = Math.cos((angle * Math.PI) / 180) * radiusX;
          const y = Math.sin((angle * Math.PI) / 180) * radiusY;
          return (
            <motion.img
              key={cardIndex}
              src={backCardSrc}
              alt="Role card back"
              initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
              animate={{ x, y, scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 * cardIndex, duration: 0.45, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 w-24 h-36 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
            />
          );
        })}
      </div>
    </div>
  );
}
