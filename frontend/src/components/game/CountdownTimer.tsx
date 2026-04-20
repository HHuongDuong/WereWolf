"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  seconds: number;
  onComplete?: () => void;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function CountdownTimer({
  seconds,
  onComplete,
  label = "TIME LEFT",
  size = "md",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const isUrgent = timeLeft <= 10;

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const sizeClasses = {
    sm: "text-4xl",
    md: "text-6xl",
    lg: "text-8xl",
  };

  return (
    <div className="flex flex-col items-center">
      {label && (
        <p className="text-[#9CA3AF] uppercase tracking-[3px] text-sm mb-3 font-medium">
          {label}
        </p>
      )}

      <motion.div
        key={timeLeft}
        initial={{ scale: 0.9, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={`
          font-mono font-bold tracking-tighter text-white
          ${sizeClasses[size]}
          ${isUrgent ? "text-[#DC2626] animate-pulse" : "text-[#C4B5FD]"}
        `}
      >
        {String(timeLeft).padStart(2, "0")}
      </motion.div>

      {isUrgent && (
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="text-[#DC2626] text-sm mt-2 tracking-widest"
        >
          HURRY — THE MOON IS WANING
        </motion.p>
      )}
    </div>
  );
}
