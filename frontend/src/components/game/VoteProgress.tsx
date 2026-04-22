"use client";

import { motion } from "framer-motion";

interface VoteProgressProps {
  totalVotes: number;
  requiredVotes: number;
}

export function VoteProgress({ totalVotes, requiredVotes }: VoteProgressProps) {
  const progress = Math.min((totalVotes / requiredVotes) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs tracking-widest text-[#9CA3AF] mb-3">
        <span>VOTES CAST</span>
        <span>{totalVotes} / {requiredVotes}</span>
      </div>
      <div className="h-3 bg-[#1F2937] rounded-2xl overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-[#7C3AED] to-[#DC2626]"
        />
      </div>
    </div>
  );
}
