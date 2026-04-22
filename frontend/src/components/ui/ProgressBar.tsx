"use client";

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  urgentThreshold?: number;
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  urgentThreshold = 80,
}: ProgressBarProps) {
  const isUrgent = value >= urgentThreshold;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#9CA3AF] tracking-wide">{label}</span>
          {showPercentage && (
            <span className={`font-mono ${isUrgent ? "text-[#DC2626]" : "text-[#7C3AED]"}`}>
              {Math.round(value)}%
            </span>
          )}
        </div>
      )}

      <div className="h-3 bg-[#1F2937] rounded-2xl overflow-hidden border border-white/5 relative">
        <div
          className={`
            h-full rounded-2xl transition-all duration-300 relative
            ${isUrgent
              ? "bg-gradient-to-r from-[#DC2626] to-[#F87171] shadow-[0_0_15px_#DC2626]"
              : "bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] shadow-[0_0_15px_#7C3AED]"
            }
          `}
          style={{ width: `${value}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
        </div>
      </div>
    </div>
  );
}
