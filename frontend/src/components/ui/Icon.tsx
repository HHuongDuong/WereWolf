import { ReactNode } from "react";

interface IconProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  color?: "purple" | "red" | "white";
}

export function Icon({ children, size = "md", glow = false, color = "white" }: IconProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  const colorClasses = {
    purple: "text-[#7C3AED]",
    red: "text-[#DC2626]",
    white: "text-[#E5E7EB]",
  };

  const glowClass = glow ? "drop-shadow-[0_0_12px_currentColor]" : "";

  return (
    <span className={`${sizeClasses[size]} ${colorClasses[color]} ${glowClass} transition-all`}>
      {children}
    </span>
  );
}
