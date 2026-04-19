"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useCountdown } from "@/hooks/useCountdown";

export interface CountdownTimerProps extends React.HTMLAttributes<HTMLDivElement> {
  deadlineTimestamp: number | null;
  label?: string;
}

export function CountdownTimer({ deadlineTimestamp, label = "Thời gian còn lại", className, ...props }: CountdownTimerProps) {
  const remaining = useCountdown(deadlineTimestamp);
  
  // Convert ms to seconds
  const seconds = Math.ceil(remaining / 1000);
  const isDanger = seconds > 0 && seconds <= 10;
  
  if (!deadlineTimestamp || remaining <= 0) {
    return (
      <div className={cn("text-center font-body text-text-muted", className)} {...props}>
        {label}: <span className="font-mono font-bold">Hết giờ</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-1", className)} {...props}>
      <span className="text-xs uppercase tracking-widest text-text-secondary font-display font-bold">
        {label}
      </span>
      <div 
        className={cn(
          "font-mono text-4xl font-bold transition-colors duration-300",
          isDanger ? "text-danger-red animate-pulse drop-shadow-[0_0_8px_rgba(231,76,60,0.8)]" : "text-village-gold drop-shadow-[0_0_5px_rgba(243,156,18,0.5)]"
        )}
      >
        {seconds}s
      </div>
    </div>
  );
}
