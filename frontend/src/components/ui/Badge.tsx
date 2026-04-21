import { ReactNode } from "react";

interface BadgeProps {
  role?: string;
  variant?: "default" | "alive" | "dead" | "active" | "warning";
  children: ReactNode;
  className?: string;
}

const roleColors: Record<string, string> = {
  WEREWOLF: "bg-[#991B1B] text-white border-[#EF4444]",
  SEER: "bg-[#1E3A8A] text-white border-[#60A5FA]",
  WITCH: "bg-[#6B21A8] text-white border-[#C084FC]",
  VILLAGER: "bg-[#166534] text-white border-[#4ADE80]",
  GUARD: "bg-[#1E40AF] text-white border-[#93C5FD]",
  HUNTER: "bg-[#854D0E] text-white border-[#FBBF24]",
};

export function Badge({ role, variant = "default", children, className = "" }: BadgeProps) {
  let baseClasses = "inline-flex items-center px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-2xl border";

  if (role) {
    baseClasses += ` ${roleColors[role] || "bg-[#374151] text-[#D1D5DB] border-[#4B5563]"}`;
  } else {
    switch (variant) {
      case "alive":
        baseClasses += " bg-[#16A34A]/10 text-[#4ADE80] border-[#4ADE80]/50";
        break;
      case "dead":
        baseClasses += " bg-[#DC2626]/10 text-[#F87171] border-[#F87171]/50 grayscale";
        break;
      case "active":
        baseClasses += " bg-[#7C3AED]/10 text-[#C4B5FD] border-[#C4B5FD]/50 animate-pulse shadow-purple-500/30";
        break;
      case "warning":
        baseClasses += " bg-[#F59E0B]/10 text-[#FCD34D] border-[#FCD34D]/50";
        break;
      default:
        baseClasses += " bg-[#374151] text-[#D1D5DB] border-[#4B5563]";
    }
  }

  return <span className={`${baseClasses} ${className}`}>{children}</span>;
}
