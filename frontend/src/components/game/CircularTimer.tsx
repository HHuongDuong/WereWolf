"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CircularTimerProps {
  seconds: number;
  maxSeconds: number;
  onComplete?: () => void;
  label?: string;
}

export function CircularTimer({
  seconds,
  maxSeconds,
  onComplete,
  label = "NIGHT TIME",
}: CircularTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const progress = (timeLeft / maxSeconds) * 100;
  const isUrgent = timeLeft <= 15;

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

  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="260" height="260" className="transform -rotate-90">
        <circle
          cx="130"
          cy="130"
          r="110"
          fill="none"
          stroke="#1F2937"
          strokeWidth="18"
        />

        <motion.circle
          cx="130"
          cy="130"
          r="110"
          fill="none"
          stroke={isUrgent ? "#DC2626" : "#7C3AED"}
          strokeWidth="18"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={isUrgent ? "drop-shadow-[0_0_20px_#DC2626]" : "drop-shadow-[0_0_20px_#7C3AED]"}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          key={timeLeft}
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          className={`font-mono text-6xl font-bold tracking-tighter ${isUrgent ? "text-[#DC2626]" : "text-[#E5E7EB]"}`}
        >
          {String(timeLeft).padStart(2, "0")}
        </motion.div>
        <p className="text-[#9CA3AF] text-sm tracking-widest mt-1">{label}</p>
      </div>

      {isUrgent && (
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute w-[260px] h-[260px] border-4 border-[#DC2626] rounded-full"
        />
      )}
    </div>
  );
}
