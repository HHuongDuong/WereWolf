import { Crown } from "lucide-react";

interface HostBadgeProps {
  isHost: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function HostBadge({ isHost, size = "md", className = "" }: HostBadgeProps) {
  if (!isHost) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-[#7C3AED]/10 border border-[#7C3AED]/50 rounded-xl ${className}`}>
      <Crown className={`text-[#C4B5FD] ${size === "sm" ? "w-4 h-4" : "w-5 h-5"}`} />
      <span className="text-xs font-bold tracking-widest text-[#C4B5FD]">HOST</span>
    </div>
  );
}
